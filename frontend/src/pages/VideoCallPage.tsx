import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQueryClient } from 'react-query'
import { bookingAPI, feedbackAPI } from '../lib/api'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Avatar, AvatarFallback } from '../components/ui/avatar'
import { 
  Users, 
  Grid3X3
} from 'lucide-react'
import VideoControls from '../components/VideoControls'
import FeedbackForm from '../components/FeedbackForm'
import TherapyNotesModal from '../components/TherapyNotesModal'
import { useAuth } from '../hooks/useAuth'


declare global {
  interface Window {
    ZoomMtgEmbedded?: any
  }
}

const VideoCallPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const clientRef = useRef<any>(null)
  const joinStartedRef = useRef<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [joining, setJoining] = useState(false)
  const [participants] = useState(2)
  const [meetingStarted, setMeetingStarted] = useState(false)
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [showSessionReportForm, setShowSessionReportForm] = useState(false)
  const [sessionDetails, setSessionDetails] = useState<any>(null)
  const [showGuideTooltip, setShowGuideTooltip] = useState(false)

  useEffect(() => {
    if (!bookingId) {
      navigate('/')
      return
    }

    let cancelled = false

    async function ensureZoomModule(): Promise<any> {
      try {
        console.log('[VideoCallPage] importing @zoom/meetingsdk/embedded')
        const mod = await import('@zoom/meetingsdk/embedded')
        return mod?.default || mod
      } catch (e1) {
        console.warn('[VideoCallPage] fallback to @zoomus/websdk/embedded', e1)
        try {
          const mod = await import('@zoomus/websdk/embedded')
          return mod?.default || mod
        } catch (e2) {
          console.error('[VideoCallPage] Both Zoom SDK imports failed', e1, e2)
          throw new Error('Failed to load Zoom SDK. Please check your dependencies.')
        }
      }
    }

    async function join() {
      try {
        setJoining(true)
        console.log('[VideoCallPage] fetching signature for booking', bookingId)
        const { data } = await bookingAPI.getSignature(bookingId!)
        console.log('[VideoCallPage] signature response', data)

        const ZoomMtgEmbedded = await ensureZoomModule()
        if (!clientRef.current) {
          clientRef.current = ZoomMtgEmbedded.createClient()
        }
        const client = clientRef.current
        console.log('[VideoCallPage] initializing client')
        if (!containerRef.current) {
          throw new Error('Video container not ready')
        }
        // Guard against double init under StrictMode
        try {
         await client.init({ zoomAppRoot: containerRef.current, language: 'en-US' })
        //  await client.init({
        //   zoomAppRoot: containerRef.current,
        //   language: 'en-US',
        //   customize: {
        //     video: {
        //       isResizable: false,
        //       viewSizes: {
        //         default: {
        //           width: 1000,    // Set your desired width in px
        //           height: 800    // Set your desired height in px
        //         }
        //       }
        //     }
        //   }
        // })
        
        } catch (e: any) {
          if (e?.reason === 'Duplicated init' || e?.type === 'INVALID_OPERATION') {
            console.warn('[VideoCallPage] init ignored as client already initialized')
          } else {
            throw e
          }
        }
        if (joinStartedRef.current) {
          console.warn('[VideoCallPage] join already in progress/started - skipping duplicate')
          return
        }
        joinStartedRef.current = true
        console.log('[VideoCallPage] joining meeting', data.meetingNumber)
        
        try {
          await client.join({
            signature: data.signature,
            sdkKey: data.sdkKey,
            meetingNumber: data.meetingNumber,
            password: data.password || '',
            userName: 'TheraConnect User',
          })
        } catch (e: any) {
          if (e?.type === 'INVALID_OPERATION' && e?.reason?.toLowerCase().includes('duplicated')) {
            // Treat as success if the SDK thinks we already joined
            console.warn('[VideoCallPage] Duplicate join reported; treating as already joined')
          } else {
            throw e
          }
        }
        
        console.log('[VideoCallPage] join success')
        setMeetingStarted(true)
        
        // Show one-time guide for first-time users
        const hasSeenGuide = localStorage.getItem('zoomGuideShown')
        if (!hasSeenGuide) {
          setTimeout(() => {
            setShowGuideTooltip(true)
            localStorage.setItem('zoomGuideShown', 'true')
            
            // Auto-hide after 8 seconds
            setTimeout(() => {
              setShowGuideTooltip(false)
            }, 8000)
          }, 2000)
        }
      } catch (e: any) {
        console.error('[VideoCallPage] join error', e)
        if (!cancelled) {
          const errorMessage = e?.response?.data?.message || e.message || 'Failed to join meeting'
          console.error('[VideoCallPage] Error details:', {
            error: e,
            response: e?.response?.data,
            bookingId
          })
          setError(errorMessage)
        }
      } finally {
        setJoining(false)
      }
    }

    if (!joinStartedRef.current) {
      join()
    } else {
      console.log('[VideoCallPage] join already started previously')
    }
    return () => {
      cancelled = true
      // Attempt graceful cleanup if user navigates away
      try {
        if (clientRef.current) {
          clientRef.current.leave?.().catch(() => {})
          clientRef.current.destroy?.()
        }
      } catch {}
    }
  }, [bookingId, navigate])


  const handleEndCall = async () => {
    console.log('🎯 handleEndCall called, user role:', user?.role)
    try {
      // Leave the meeting
      if (clientRef.current) {
        console.log('📞 Leaving meeting...')
        try {
          // Try different leave methods based on Zoom SDK version
          if (typeof clientRef.current.leave === 'function') {
            await clientRef.current.leave()
          } else if (typeof clientRef.current.endMeeting === 'function') {
            await clientRef.current.endMeeting()
          } else if (typeof clientRef.current.destroy === 'function') {
            await clientRef.current.destroy()
          } else {
            console.log('⚠️ No leave method found, proceeding without leaving')
          }
        } catch (leaveError) {
          console.log('⚠️ Leave method failed:', leaveError)
          // Continue anyway - don't block the form
        }
      }
      
      // Mark session as completed
      console.log('✅ Marking session as completed...')
      try {
        await bookingAPI.markSessionCompleted(bookingId!)
        console.log('✅ Session marked as completed successfully')
        // Invalidate bookings queries to update all dashboards
        queryClient.invalidateQueries('parentBookings')
        queryClient.invalidateQueries('therapistBookings')
        queryClient.invalidateQueries('recurringBookings')
        queryClient.invalidateQueries('allBookings') // For AdminDashboard/AdminAnalytics
      } catch (completionError) {
        console.error('❌ Failed to mark session as completed:', completionError)
        // Continue anyway - we'll show the form with fallback data
      }
      
      // Load session details with child ID
      try {
        console.log('📋 Loading session details...')
        const response = await feedbackAPI.getSessionDetails(bookingId!)
        console.log('📋 Session details loaded:', response.data)
        setSessionDetails({
          ...response.data.sessionDetails,
          child: {
            ...response.data.sessionDetails?.child,
            id: response.data.sessionDetails?.child?.id || response.data.sessionDetails?.childId || ''
          }
        })
      } catch (error) {
        console.error('❌ Failed to load session details:', error)
        // Create fallback session details if API fails
        setSessionDetails({
          child: { name: 'Child', id: '' },
          therapist: { name: 'Therapist' },
          parent: { name: 'Parent' }
        })
      }
      
      // Show appropriate form based on user role
      console.log('🎭 User role:', user?.role)
      if (user?.role === 'PARENT') {
        console.log('👨‍👩‍👧‍👦 Showing feedback form for parent')
        setShowFeedbackForm(true)
      } else if (user?.role === 'THERAPIST') {
        console.log('👩‍⚕️ Showing session report form for therapist')
        setShowSessionReportForm(true)
      } else {
        console.log('👤 Admin or other role, navigating back')
        // Admin or other roles - just navigate back
        navigate(-1)
      }
    } catch (error) {
      console.error('❌ Error ending call:', error)
      // Even if there's an error, try to show the form
      if (user?.role === 'PARENT') {
        console.log('👨‍👩‍👧‍👦 Error fallback: Showing feedback form for parent')
        setShowFeedbackForm(true)
        setSessionDetails({
          child: { name: 'Child', id: '' },
          therapist: { name: 'Therapist' },
          parent: { name: 'Parent' }
        })
      } else if (user?.role === 'THERAPIST') {
        console.log('👩‍⚕️ Error fallback: Showing therapy notes modal for therapist')
        setShowSessionReportForm(true)
        setSessionDetails({
          child: { name: 'Child', id: '' },
          therapist: { name: 'Therapist' },
          parent: { name: 'Parent' }
        })
      } else {
        navigate(-1)
      }
    }
  }

  const handleTestFeedback = () => {
    console.log('🧪 Testing feedback form')
    setSessionDetails({
      child: { name: 'Test Child', id: 'test-child-id' },
      therapist: { name: 'Test Therapist' },
      parent: { name: 'Test Parent' }
    })
    
    if (user?.role === 'PARENT') {
      setShowFeedbackForm(true)
    } else if (user?.role === 'THERAPIST') {
      setShowSessionReportForm(true)
    }
  }

  const handleFeedbackSuccess = () => {
    setShowFeedbackForm(false)
    navigate(-1)
  }

  const handleSessionReportSuccess = () => {
    setShowSessionReportForm(false)
    navigate(-1)
  }

  const handleFeedbackCancel = () => {
    setShowFeedbackForm(false)
    navigate(-1)
  }

  const handleSessionReportCancel = () => {
    setShowSessionReportForm(false)
    navigate(-1)
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Connection Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => navigate(-1)} className="w-full">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show feedback form for parents
  if (showFeedbackForm) {
    console.log('🎯 Rendering feedback form for parent')
    return (
      <FeedbackForm
        bookingId={bookingId!}
        childName={sessionDetails?.child?.name || 'Child'}
        therapistName={sessionDetails?.therapist?.name || 'Therapist'}
        onSuccess={handleFeedbackSuccess}
        onCancel={handleFeedbackCancel}
      />
    )
  }

  // Show therapy notes modal for therapists
  if (showSessionReportForm) {
    console.log('🎯 Rendering therapy notes modal for therapist')
    return (
      <TherapyNotesModal
        bookingId={bookingId!}
        childId={sessionDetails?.child?.id || ''}
        childName={sessionDetails?.child?.name || 'Child'}
        therapistName={user?.name || sessionDetails?.therapist?.name || 'Therapist'}
        sessionDate={new Date()}
        onClose={handleSessionReportCancel}
        onSuccess={handleSessionReportSuccess}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header - Minimal for better video focus */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 p-2 sm:p-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
          <Avatar className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0">
            <AvatarFallback className="text-xs sm:text-sm">TC</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h1 className="font-semibold text-xs sm:text-sm truncate">TheraConnect Session</h1>
            <p className="text-xs text-gray-400 truncate">
              {meetingStarted ? 'Session Active' : 'Connecting...'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap gap-2">
          <Badge variant={meetingStarted ? "default" : "secondary"} className="text-xs">
            {participants} participants
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleTestFeedback}
            className="text-yellow-400 hover:text-yellow-300 text-xs"
          >
            Test Feedback
          </Button>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="relative flex-1" style={{ height: 'calc(100vh - 200px)' }}>
        {joining && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-lg">Connecting to meeting...</p>
            </div>
          </div>
        )}
        
        {/* One-time Guide Tooltip - Shows once after first login */}
        {showGuideTooltip && meetingStarted && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-blue-600 text-white p-4 rounded-lg shadow-2xl max-w-md animate-fade-in">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Quick Guide:</h3>
                <ul className="text-sm space-y-1">
                  <li>• Resize video by dragging corners</li>
                  <li>• Hover over red button below to end session</li>
                </ul>
              </div>
              <button
                onClick={() => setShowGuideTooltip(false)}
                className="flex-shrink-0 text-white hover:text-gray-200"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
        
        {/* Video Container - Full viewport for better UX */}
        <div 
          ref={containerRef} 
          className="w-full h-full"
          style={{ 
            width: '100%', 
            height: '100%',
            background: '#1a1a1a',
            minHeight: '600px'
          }} 
        />

        {/* Side-by-side Gallery Overlay (when meeting is active) */}
        {meetingStarted && (
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20">
            <Button
              variant="secondary"
              size="sm"
              className="bg-black bg-opacity-50 text-white border-gray-600 text-xs sm:text-sm"
            >
              <Grid3X3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Gallery View</span>
              <span className="sm:hidden">Gallery</span>
            </Button>
          </div>
        )}
      </div>

      {/* Video Controls - Simplified to only show End Call button */}
      <VideoControls
        participants={participants}
        onEndCall={handleEndCall}
      />

      {/* Participant Info */}
        {meetingStarted && (
          <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-20">
            <Card className="bg-black bg-opacity-50 border-gray-600">
              <CardContent className="p-2 sm:p-3">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
                  <span className="text-xs sm:text-sm">2 participants</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
    </div>
  )
}

export default VideoCallPage