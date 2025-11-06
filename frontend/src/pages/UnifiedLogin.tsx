import React, { useEffect, useRef, useState } from 'react'
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

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      if (!window.google) {
        try { console.error('[GSI] google object missing after script load') } catch {}
        return
      }
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
      if (!clientId) {
        try { 
          console.error('[GSI] Missing VITE_GOOGLE_CLIENT_ID environment variable')
          console.error('[GSI] Available env vars:', Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')))
          toast.error('Google OAuth not configured. Please contact support.')
        } catch {}
        return
      }
      
      // Enhanced logging for debugging
      try { 
        console.log('[GSI] Initializing with clientId', clientId.slice(0, 8) + '***')
        console.log('[GSI] Client ID length:', clientId.length)
        console.log('[GSI] Current origin:', window.location.origin)
        console.log('[GSI] Is production:', import.meta.env.PROD)
      } catch {}
      
      // Validate Client ID format (should be a long string ending with .apps.googleusercontent.com)
      if (!clientId.includes('.apps.googleusercontent.com') && clientId.length < 20) {
        console.error('[GSI] Invalid Client ID format detected')
        toast.error('Invalid Google OAuth configuration')
        return
      }
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          try {
            setIsLoading(true)
            const { credential } = response
            if (!credential) {
              throw new Error('No credential received from Google')
            }
            try { console.log('[GSI] Received credential of length', credential?.length) } catch {}
            
            let result
            try {
              result = await loginWithGoogle(credential)
            } catch (primaryErr: any) {
              console.error('[GSI] loginWithGoogle via axios failed, attempting fetch fallback', primaryErr)
              try {
                const base = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1')
                const url = base + '/auth/google'
                const fetchRes = await fetch(url, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ idToken: credential }),
                })
                const text = await fetchRes.text()
                console.log('[GSI][fallback] status:', fetchRes.status, 'body:', text)
                if (!fetchRes.ok) {
                  const errorData = JSON.parse(text || '{}')
                  throw new Error(errorData.message || `Fallback fetch failed: ${fetchRes.status}`)
                }
                try { 
                  result = JSON.parse(text) 
                } catch { 
                  throw new Error('Invalid response from server')
                }
              } catch (fallbackErr: any) {
                console.error('[GSI] fetch fallback error', fallbackErr)
                throw new Error(fallbackErr?.message || 'Google sign-in failed. Please check your Google OAuth configuration.')
              }
            }
            toast.success('Signed in successfully!')
            if (result?.needsProfileCompletion) {
              navigate('/parent/profile', { replace: true })
            } else {
              navigate('/', { replace: true })
            }
          } catch (err: any) {
            try { console.error('[GSI][callback][error]', err) } catch {}
            const errorMessage = err?.message || 'Google sign-in failed'
            // Check for specific OAuth errors
            if (errorMessage.includes('invalid_request') || errorMessage.includes('bad_request')) {
              toast.error('OAuth configuration error. Please check Google Cloud Console settings.')
            } else {
              toast.error(errorMessage)
            }
          } finally {
            setIsLoading(false)
          }
        },
        // Add auto_select to improve UX
        auto_select: false,
      })
      if (buttonDivRef.current) {
        window.google.accounts.id.renderButton(buttonDivRef.current, {
          theme: 'outline',
          size: 'large',
          width: 320,
          type: 'standard',
          text: 'continue_with',
          shape: 'pill',
        })
      }
      window.google.accounts.id.prompt()
    }
    document.body.appendChild(script)
    return () => {
      if (script.parentNode) script.parentNode.removeChild(script)
    }
  }, [loginWithGoogle, navigate])

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
