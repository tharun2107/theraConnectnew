import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LogIn, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import ThemeToggle from '../components/ThemeToggle'

declare global {
  interface Window {
    google?: any
  }
}

const UnifiedLogin: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { loginWithGoogle } = useAuth()
  const buttonDivRef = useRef<HTMLDivElement | null>(null)
  const navigate = useNavigate()
  const isInitializedRef = useRef(false)
  const isProcessingRef = useRef(false)
  const scriptLoadedRef = useRef(false)

  const handleCredentialResponse = useCallback(async (response: any) => {
    // Prevent multiple simultaneous requests
    if (isProcessingRef.current) {
      console.warn('[GSI] Already processing a credential request, ignoring duplicate')
      return
    }

    try {
      isProcessingRef.current = true
      setIsLoading(true)

      const { credential } = response
      if (!credential) {
        throw new Error('No credential received from Google')
      }

      let result
      try {
        result = await loginWithGoogle(credential)
      } catch (primaryErr: any) {
        // Check if it's a connection error
        if (primaryErr?.message?.includes('Network Error') || 
            primaryErr?.code === 'ERR_NETWORK' ||
            primaryErr?.message?.includes('Failed to fetch')) {
          const base = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1')
          const url = base + '/auth/google'
          
          try {
            const fetchRes = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ idToken: credential }),
            })
            
            if (!fetchRes.ok) {
              const text = await fetchRes.text()
              let errorData
              try {
                errorData = JSON.parse(text)
              } catch {
                errorData = { message: `Server error: ${fetchRes.status}` }
              }
              throw new Error(errorData.message || `Server error: ${fetchRes.status}`)
            }
            
            const text = await fetchRes.text()
            try {
              result = JSON.parse(text)
            } catch {
              throw new Error('Invalid response from server')
            }
          } catch (fetchErr: any) {
            if (fetchErr?.message?.includes('Failed to fetch') || 
                fetchErr?.message?.includes('ERR_CONNECTION_REFUSED')) {
              throw new Error('Cannot connect to server. Please ensure the backend server is running on ' + base)
            }
            throw fetchErr
          }
        } else {
          throw primaryErr
        }
      }

      toast.success('Signed in successfully!')
      if (result?.needsProfileCompletion) {
        navigate('/parent/profile', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    } catch (err: any) {
      console.error('[GSI][callback][error]', err)
      const errorMessage = err?.message || 'Google sign-in failed'
      
      // Provide helpful error messages
      if (errorMessage.includes('Cannot connect to server')) {
        toast.error(errorMessage)
      } else if (errorMessage.includes('invalid_request') || errorMessage.includes('bad_request')) {
        toast.error('OAuth configuration error. Please check Google Cloud Console settings.')
      } else if (errorMessage.includes('origin') || errorMessage.includes('client ID')) {
        toast.error('OAuth origin error. Please add ' + window.location.origin + ' to authorized origins in Google Cloud Console.')
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setIsLoading(false)
      isProcessingRef.current = false
    }
  }, [loginWithGoogle, navigate])

  const initializeGSI = useCallback(() => {
    if (isInitializedRef.current || !window.google) {
      return
    }

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId || clientId === 'your-google-client-id.apps.googleusercontent.com') {
      console.error('[GSI] Missing or invalid VITE_GOOGLE_CLIENT_ID environment variable')
      toast.error('Google OAuth not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file.')
      return
    }
    
    // Validate Client ID format
    if (!clientId.includes('.apps.googleusercontent.com')) {
      console.error('[GSI] Invalid Client ID format detected')
      toast.error('Invalid Google OAuth Client ID format. Must end with .apps.googleusercontent.com')
      return
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      })
      
      isInitializedRef.current = true

      // Render button after a short delay to ensure DOM is ready
      setTimeout(() => {
        if (buttonDivRef.current && window.google?.accounts?.id) {
          try {
            window.google.accounts.id.renderButton(buttonDivRef.current, {
              theme: 'outline',
              size: 'large',
              width: 320,
              type: 'standard',
              text: 'continue_with',
              shape: 'pill',
            })
          } catch (err) {
            console.error('[GSI] Failed to render button:', err)
          }
        }
      }, 100)
    } catch (err) {
      console.error('[GSI] Initialization error:', err)
      toast.error('Failed to initialize Google Sign-In')
    }
  }, [handleCredentialResponse])

  useEffect(() => {
    // Prevent multiple initializations
    if (isInitializedRef.current || scriptLoadedRef.current) {
      return
    }

    // Check if script already exists
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]')
    if (existingScript) {
      scriptLoadedRef.current = true
      // Wait a bit for script to load if it's still loading
      const checkInterval = setInterval(() => {
        if (window.google && !isInitializedRef.current) {
          clearInterval(checkInterval)
          initializeGSI()
        }
      }, 100)
      return () => clearInterval(checkInterval)
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      scriptLoadedRef.current = true
      if (window.google && !isInitializedRef.current) {
        initializeGSI()
      }
    }
    script.onerror = () => {
      console.error('[GSI] Failed to load Google Sign-In script')
      toast.error('Failed to load Google Sign-In. Please check your internet connection.')
    }
    document.body.appendChild(script)

    return () => {
      // Cleanup: remove script if component unmounts
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
      scriptLoadedRef.current = false
    }
  }, [initializeGSI])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="animate-fade-in-up text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-100 via-purple-100 to-green-100 dark:from-blue-900 dark:via-purple-900 dark:to-green-900 mb-6 animate-float">
            <LogIn className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
            Welcome Back
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
            Sign in to access your dashboard
          </p>
          <div className="mt-4">
            <Link
              to="/"
              className="inline-flex items-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Home
            </Link>
          </div>
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="mt-8 space-y-6">
            <div className="flex flex-col items-center">
              <div ref={buttonDivRef} />
              {isLoading && (
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">Signing in…</div>
              )}
            </div>
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              By continuing, you agree to our Terms and Privacy Policy.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UnifiedLogin
