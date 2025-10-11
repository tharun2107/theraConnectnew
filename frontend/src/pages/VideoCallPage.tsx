import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { bookingAPI, feedbackAPI } from '../lib/api'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Avatar, AvatarFallback } from '../components/ui/avatar'
import { 
  Users, 
  Grid3X3,
  Maximize2,
  Minimize2
} from 'lucide-react'
import VideoControls from '../components/VideoControls'
import FeedbackForm from '../components/FeedbackForm'
import SessionReportForm from '../components/SessionReportForm'
import { useAuth } from '../hooks/useAuth'
import { cn } from '../lib/utils'


declare global {
  interface Window {
    ZoomMtgEmbedded?: any
  }
}

const VideoCallPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const clientRef = useRef<any>(null)
  const joinStartedRef = useRef<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [joining, setJoining] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [participants] = useState(2)
  const [isHost, setIsHost] = useState(false)
  const [meetingStarted, setMeetingStarted] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  const [callEnded, setCallEnded] = useState(false)
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [showSessionReportForm, setShowSessionReportForm] = useState(false)
  const [sessionDetails, setSessionDetails] = useState<any>(null)

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
        setIsHost(data.signature.includes('role') ? data.signature.split('role')[1] === '1' : false)
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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

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
      } catch (completionError) {
        console.error('❌ Failed to mark session as completed:', completionError)
        // Continue anyway - we'll show the form with fallback data
      }
      
      setCallEnded(true)
      
      // Load session details
      try {
        console.log('📋 Loading session details...')
        const response = await feedbackAPI.getSessionDetails(bookingId!)
        console.log('📋 Session details loaded:', response.data)
        setSessionDetails(response.data.sessionDetails)
      } catch (error) {
        console.error('❌ Failed to load session details:', error)
        // Create fallback session details if API fails
        setSessionDetails({
          child: { name: 'Child' },
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
      setCallEnded(true)
      if (user?.role === 'PARENT') {
        console.log('👨‍👩‍👧‍👦 Error fallback: Showing feedback form for parent')
        setShowFeedbackForm(true)
        setSessionDetails({
          child: { name: 'Child' },
          therapist: { name: 'Therapist' },
          parent: { name: 'Parent' }
        })
      } else if (user?.role === 'THERAPIST') {
        console.log('👩‍⚕️ Error fallback: Showing session report form for therapist')
        setShowSessionReportForm(true)
        setSessionDetails({
          child: { name: 'Child' },
          therapist: { name: 'Therapist' },
          parent: { name: 'Parent' }
        })
      } else {
        navigate(-1)
      }
    }
  }

  const handleShareScreen = () => {
    // Screen sharing functionality would be implemented here
    console.log('Share screen clicked')
  }

  const handleTestFeedback = () => {
    console.log('🧪 Testing feedback form')
    setCallEnded(true)
    setSessionDetails({
      child: { name: 'Test Child' },
      therapist: { name: 'Test Therapist' },
      parent: { name: 'Test Parent' }
    })
    
    if (user?.role === 'PARENT') {
      setShowFeedbackForm(true)
    } else if (user?.role === 'THERAPIST') {
      setShowSessionReportForm(true)
    }
  }

  const handleShowSettings = () => {
    // Settings functionality would be implemented here
    console.log('Show settings clicked')
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

  // Show session report form for therapists
  if (showSessionReportForm) {
    console.log('🎯 Rendering session report form for therapist')
    return (
      <SessionReportForm
        bookingId={bookingId!}
        childName={sessionDetails?.child?.name || 'Child'}
        parentName={sessionDetails?.parent?.name || 'Parent'}
        onSuccess={handleSessionReportSuccess}
        onCancel={handleSessionReportCancel}
      />
    )
  }

  return (
    <div className={cn(
      "min-h-screen bg-gray-900 text-white",
      isFullscreen && "fixed inset-0 z-50"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>TC</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-semibold">TheraConnect Session</h1>
            <p className="text-sm text-gray-400">
              {meetingStarted ? 'Session Active' : 'Connecting...'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Badge variant={meetingStarted ? "default" : "secondary"}>
            {participants} participants
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleTestFeedback}
            className="text-yellow-400 hover:text-yellow-300"
          >
            Test Feedback
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="text-gray-400 hover:text-white"
          >
            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
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
        
        {/* Video Container */}
        <div 
          ref={containerRef} 
          className="w-full h-full"
          style={{ 
            width: '100%', 
            height: '100%',
            background: '#1a1a1a'
          }} 
        />

        {/* Side-by-side Gallery Overlay (when meeting is active) */}
        {meetingStarted && (
          <div className="absolute top-4 right-4 z-20">
            <Button
              variant="secondary"
              size="sm"
              className="bg-black bg-opacity-50 text-white border-gray-600"
            >
              <Grid3X3 className="h-4 w-4 mr-2" />
              Gallery View
            </Button>
          </div>
        )}
      </div>

      {/* Video Controls */}
      <VideoControls
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        isFullscreen={isFullscreen}
        participants={participants}
        isHost={isHost}
        onToggleMute={() => setIsMuted(!isMuted)}
        onToggleVideo={() => setIsVideoOff(!isVideoOff)}
        onToggleFullscreen={toggleFullscreen}
        onEndCall={handleEndCall}
        onShareScreen={handleShareScreen}
        onToggleChat={() => setShowChat(!showChat)}
        onToggleParticipants={() => setShowParticipants(!showParticipants)}
        onShowSettings={handleShowSettings}
      />

      {/* Participant Info */}
      {meetingStarted && (
        <div className="absolute top-4 left-4 z-20">
          <Card className="bg-black bg-opacity-50 border-gray-600">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-green-400" />
                <span className="text-sm">2 participants</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default VideoCallPage
