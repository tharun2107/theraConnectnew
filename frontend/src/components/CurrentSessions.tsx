import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Video, 
  Clock, 
  Users, 
  Play, 
  Calendar,
  User,
  MapPin,
  Phone,
  MessageCircle
} from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback } from './ui/avatar'
import { GlowCard } from './ui/glow-card'
import { bookingAPI } from '../lib/api'

interface CurrentSessionProps {
  booking: {
    id: string
    status: string
    meetingId?: string
    hostStarted?: boolean
    child?: {
      id: string
      name: string
      age: number
      condition?: string
    }
    parent?: {
      id: string
      name: string
    }
    therapist: {
      id: string
      name: string
      specialization: string
      phone?: string
      email?: string
    }
    timeSlot: {
      startTime: string
      endTime: string
    }
  }
  onJoinSession: (bookingId: string) => void
  userRole?: 'PARENT' | 'THERAPIST'
}

const CurrentSessionCard: React.FC<CurrentSessionProps> = ({ booking, onJoinSession, userRole = 'PARENT' }) => {
  const navigate = useNavigate()
  const [isJoining, setIsJoining] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const isSessionActive = () => {
    const now = new Date()
    
    // Extract UTC hours/minutes from stored slot (slots are stored with literal display times in UTC)
    const slotStartUTC = new Date(booking.timeSlot.startTime)
    const slotEndUTC = new Date(booking.timeSlot.endTime)
    
    // Get UTC hours/minutes (these represent the literal display time)
    const startUTCHours = slotStartUTC.getUTCHours()
    const startUTCMinutes = slotStartUTC.getUTCMinutes()
    const endUTCHours = slotEndUTC.getUTCHours()
    const endUTCMinutes = slotEndUTC.getUTCMinutes()
    
    // Get the date from the slot (year, month, day)
    const slotDate = slotStartUTC
    const year = slotDate.getUTCFullYear()
    const month = slotDate.getUTCMonth()
    const day = slotDate.getUTCDate()
    
    // Create local dates with the UTC hours/minutes (treating them as local time)
    // This ensures 13:00 UTC is treated as 1:00 PM local time
    const startTimeLocal = new Date(year, month, day, startUTCHours, startUTCMinutes, 0, 0)
    const endTimeLocal = new Date(year, month, day, endUTCHours, endUTCMinutes, 0, 0)
    
    // Calculate session window (15 minutes before start to end time)
    const sessionWindowStart = new Date(startTimeLocal.getTime() - 15 * 60 * 1000) // 15 min before
    
    // Session is active if:
    // 1. Current time is within the session window (15 minutes before start to end time)
    // 2. Status is SCHEDULED and host has started (for parents) or can start (for therapists)
    const nowTime = now.getTime()
    const windowStartTime = sessionWindowStart.getTime()
    const endTimeTime = endTimeLocal.getTime()
    
    const isWithinWindow = nowTime >= windowStartTime && nowTime <= endTimeTime
    
    if (userRole === 'THERAPIST') {
      return isWithinWindow && booking.status === 'SCHEDULED'
    } else {
      return isWithinWindow && booking.status === 'SCHEDULED' && booking.hostStarted
    }
  }

  const canJoinSession = () => {
    const now = new Date()
    
    // Extract UTC hours/minutes from stored slot (slots are stored with literal display times in UTC)
    const slotStartUTC = new Date(booking.timeSlot.startTime)
    
    // Get UTC hours/minutes (these represent the literal display time)
    const startUTCHours = slotStartUTC.getUTCHours()
    const startUTCMinutes = slotStartUTC.getUTCMinutes()
    
    // Get the date from the slot (year, month, day)
    const slotDate = slotStartUTC
    const year = slotDate.getUTCFullYear()
    const month = slotDate.getUTCMonth()
    const day = slotDate.getUTCDate()
    
    // Create local date with the UTC hours/minutes (treating them as local time)
    // This ensures 13:00 UTC is treated as 1:00 PM local time
    const startTimeLocal = new Date(year, month, day, startUTCHours, startUTCMinutes, 0, 0)
    
    // Calculate session window (15 minutes before start to end time)
    const sessionWindowStart = new Date(startTimeLocal.getTime() - 15 * 60 * 1000) // 15 min before
    
    // Check if current time is within the session window (using local time)
    const nowTime = now.getTime()
    const windowStartTime = sessionWindowStart.getTime()
    
    return nowTime >= windowStartTime && booking.status === 'SCHEDULED'
  }

  const handleJoinSession = async () => {
    console.log('[CurrentSessionCard] handleJoinSession called', { bookingId: booking.id, userRole, hostStarted: booking.hostStarted })
    
    if (!canJoinSession()) {
      console.log('[CurrentSessionCard] Cannot join session - not within window')
      alert('Session is not available yet. Please wait for the scheduled time.')
      return
    }

    setIsJoining(true)
    try {
      // For parents: check if host has started, but first try to refresh data
      if (userRole === 'PARENT' && !booking.hostStarted) {
        console.log('[CurrentSessionCard] Parent trying to join but host not started, refreshing data...')
        // Try refreshing booking data first
        if (onRefresh) {
          await onRefresh()
          // Wait a bit for the refresh to complete
          await new Promise(resolve => setTimeout(resolve, 500))
          // Check again after refresh - but we can't easily check the updated value here
          // So we'll still show the message, but suggest refreshing
          console.log('[CurrentSessionCard] Data refreshed, but hostStarted may still be false')
        }
        
        // If still not started, show message but allow them to try anyway (backend will check)
        const shouldProceed = window.confirm(
          'The therapist may not have started the session yet. The page data may be outdated.\n\n' +
          'Would you like to try joining anyway? (The system will check if the therapist has started.)'
        )
        if (!shouldProceed) {
          setIsJoining(false)
          return
        }
        // Continue to navigation - backend will verify if host has started
      }

      // Call the onJoinSession callback (this will handle navigation)
      console.log('[CurrentSessionCard] Calling onJoinSession with bookingId:', booking.id)
      await onJoinSession(booking.id)
    } catch (error: any) {
      console.error('[CurrentSessionCard] Error joining session:', error)
      const errorMessage = error?.message || 'Failed to join session. Please try again.'
      alert(errorMessage)
    } finally {
      setIsJoining(false)
    }
  }

  const formatTime = (dateString: string) => {
    // Extract UTC time and display as local time
    // Slots are stored in UTC with literal hours/minutes (e.g., 12:00 UTC means display as 12:00 locally)
    const slotDate = new Date(dateString)
    const utcHours = slotDate.getUTCHours()
    const utcMinutes = slotDate.getUTCMinutes()
    
    // Create a date with UTC hours/minutes to display in local time
    // This ensures 12:00 UTC displays as 12:00 in any timezone
    const displayDate = new Date(2000, 0, 1, utcHours, utcMinutes)
    return displayDate.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const getSessionStatus = () => {
    if (isSessionActive()) {
      return { text: 'Live Now', variant: 'default' as const, color: 'bg-green-500' }
    } else if (canJoinSession()) {
      return { text: 'Ready to Join', variant: 'secondary' as const, color: 'bg-blue-500' }
    } else {
      return { text: 'Scheduled', variant: 'outline' as const, color: 'bg-gray-500' }
    }
  }

  const status = getSessionStatus()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <GlowCard className="overflow-hidden">
        <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <CardTitle className="flex items-center text-base sm:text-lg">
              <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${status.color} mr-2 sm:mr-3 animate-pulse`} />
              Current Session
            </CardTitle>
            <Badge 
              className={`ml-0 sm:ml-2 ${
                status.text === 'Live Now'
                  ? 'bg-green-500 text-white border-green-600 hover:bg-green-600'
                  : status.text === 'Ready to Join'
                  ? 'bg-blue-500 text-white border-blue-600 hover:bg-blue-600'
                  : 'bg-gray-500 text-white border-gray-600 hover:bg-gray-600'
              }`}
            >
              {status.text}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
          {/* Session Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Avatar className="h-12 w-12 sm:h-16 sm:w-16 bg-gradient-to-r from-blue-500 to-purple-600 flex-shrink-0">
              <AvatarFallback className="text-white font-bold text-base sm:text-lg">
                {userRole === 'THERAPIST' 
                  ? (booking.child?.name?.charAt(0).toUpperCase() || 'C')
                  : booking.child?.name?.charAt(0).toUpperCase() || 'C'
                }
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white truncate">
                {userRole === 'THERAPIST' 
                  ? `Session with ${booking.child?.name || 'Child'}`
                  : `${booking.child?.name || 'Child'} with ${booking.therapist.name}`
                }
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                {userRole === 'THERAPIST' 
                  ? `Parent: ${booking.parent?.name || 'Parent'}`
                  : booking.therapist.specialization
                }
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(booking.timeSlot.startTime)}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatTime(booking.timeSlot.startTime)} - {formatTime(booking.timeSlot.endTime)}
                </div>
              </div>
            </div>
          </div>

          {/* Session Details */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:bg-black dark:border dark:border-gray-700 rounded-lg p-3 sm:p-4 border border-blue-100 dark:border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
              <div>
                <span className="font-medium text-gray-700">
                  {userRole === 'THERAPIST' ? 'Child:' : 'Child:'}
                </span>
                <p className="text-gray-600">
                  {booking.child?.name || 'Child details hidden'} 
                  {booking.child?.age && ` (${booking.child.age} years)`}
                </p>
                {booking.child?.condition && (
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {booking.child.condition}
                  </Badge>
                )}
              </div>
              <div>
                <span className="font-medium text-gray-700">
                  {userRole === 'THERAPIST' ? 'Parent:' : 'Therapist:'}
                </span>
                <p className="text-gray-600">
                  {userRole === 'THERAPIST' 
                    ? (booking.parent?.name || 'Parent details hidden')
                    : booking.therapist.name
                  }
                </p>
                {userRole === 'PARENT' && (
                  <p className="text-xs text-gray-500">{booking.therapist.specialization}</p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <Button
              onClick={handleJoinSession}
              disabled={isJoining || !canJoinSession()}
              className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-full py-2 sm:py-3 text-sm sm:text-base"
            >
              {isJoining ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Joining...
                </>
              ) : (
                <>
                  <Video className="h-4 w-4 mr-2" />
                  {isSessionActive() ? 'Join Live Session' : 'Join Session'}
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowDetails(!showDetails)}
              className="rounded-full py-2 sm:py-3 text-sm sm:text-base"
            >
              {showDetails ? 'Less' : 'More'}
            </Button>
          </div>

          {/* Additional Details */}
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center space-x-2 text-sm">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Session ID: {booking.id.slice(-8)}</span>
                </div>
                {booking.meetingId && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Meeting: {booking.meetingId}</span>
                  </div>
                )}
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> You can join the session 15 minutes before the scheduled time. 
                {userRole === 'THERAPIST' 
                  ? ' As the therapist, you can start the session anytime within the window.'
                  : ' Make sure your camera and microphone are working properly.'
                }
              </p>
              </div>
            </motion.div>
          )}
        </CardContent>
      </GlowCard>
    </motion.div>
  )
}

interface CurrentSessionsProps {
  bookings: any[]
  onJoinSession: (bookingId: string) => Promise<void> | void
  userRole?: 'PARENT' | 'THERAPIST'
  onRefresh?: () => void
}

const CurrentSessions: React.FC<CurrentSessionsProps> = ({ bookings, onJoinSession, userRole = 'PARENT', onRefresh }) => {
  console.log('[CurrentSessions] Received bookings:', bookings?.length || 0, 'bookings')
  console.log('[CurrentSessions] Bookings data:', bookings)
  
  // Find current/upcoming sessions that can be joined
  // Slots are stored in UTC with literal hours/minutes (e.g., 13:00 UTC means 1:00 PM display time)
  // We need to extract UTC hours/minutes and create local dates for comparison
  const currentSessions = bookings.filter((booking: any) => {
    if (!booking.timeSlot || !booking.timeSlot.startTime || !booking.timeSlot.endTime) {
      console.warn('[CurrentSessions] Invalid booking data:', booking)
      return false
    }
    
    const now = new Date()
    
    // Extract UTC hours/minutes from stored slot (slots are stored with literal display times in UTC)
    const slotStartUTC = new Date(booking.timeSlot.startTime)
    const slotEndUTC = new Date(booking.timeSlot.endTime)
    
    // Get UTC hours/minutes (these represent the literal display time)
    const startUTCHours = slotStartUTC.getUTCHours()
    const startUTCMinutes = slotStartUTC.getUTCMinutes()
    const endUTCHours = slotEndUTC.getUTCHours()
    const endUTCMinutes = slotEndUTC.getUTCMinutes()
    
    // Get the date from the slot (year, month, day)
    const slotDate = slotStartUTC
    const year = slotDate.getUTCFullYear()
    const month = slotDate.getUTCMonth()
    const day = slotDate.getUTCDate()
    
    // Create local dates with the UTC hours/minutes (treating them as local time)
    // This ensures 13:00 UTC is treated as 1:00 PM local time
    const startTimeLocal = new Date(year, month, day, startUTCHours, startUTCMinutes, 0, 0)
    const endTimeLocal = new Date(year, month, day, endUTCHours, endUTCMinutes, 0, 0)
    
    // Calculate session window (15 minutes before start to end time)
    const sessionWindowStart = new Date(startTimeLocal.getTime() - 15 * 60 * 1000) // 15 min before
    
    // Check if current time is within the session window (using local time)
    const nowTime = now.getTime()
    const windowStartTime = sessionWindowStart.getTime()
    const endTimeTime = endTimeLocal.getTime()
    
    const isWithinWindow = nowTime >= windowStartTime && nowTime <= endTimeTime
    const isScheduled = booking.status === 'SCHEDULED'
    
    // Debug logging for all bookings (not just scheduled)
    console.log('[CurrentSessions] Checking booking:', {
      bookingId: booking.id?.slice(-8),
      status: booking.status,
      now: now.toLocaleString(),
      nowISO: now.toISOString(),
      slotStartUTC: slotStartUTC.toISOString(),
      slotStartLocal: startTimeLocal.toLocaleString(),
      slotEndLocal: endTimeLocal.toLocaleString(),
      windowStart: sessionWindowStart.toLocaleString(),
      windowStartISO: sessionWindowStart.toISOString(),
      isWithinWindow,
      isScheduled,
      willInclude: isWithinWindow && isScheduled,
      timeDiffMinutes: Math.round((nowTime - windowStartTime) / 60000),
      minutesUntilStart: Math.round((startTimeLocal.getTime() - nowTime) / 60000),
      minutesUntilEnd: Math.round((endTimeTime - nowTime) / 60000)
    })
    
    return isWithinWindow && isScheduled
  }).sort((a: any, b: any) => {
    // Sort by local start time (extracting UTC hours/minutes and treating as local)
    const aStartUTC = new Date(a.timeSlot.startTime)
    const bStartUTC = new Date(b.timeSlot.startTime)
    const aStartLocal = new Date(
      aStartUTC.getUTCFullYear(),
      aStartUTC.getUTCMonth(),
      aStartUTC.getUTCDate(),
      aStartUTC.getUTCHours(),
      aStartUTC.getUTCMinutes()
    )
    const bStartLocal = new Date(
      bStartUTC.getUTCFullYear(),
      bStartUTC.getUTCMonth(),
      bStartUTC.getUTCDate(),
      bStartUTC.getUTCHours(),
      bStartUTC.getUTCMinutes()
    )
    return aStartLocal.getTime() - bStartLocal.getTime()
  })

  console.log('[CurrentSessions] Filtered current sessions:', currentSessions.length)
  
  if (currentSessions.length === 0) {
    // Check if there are any bookings at all
    const totalBookings = bookings.length
    const scheduledBookings = bookings.filter((b: any) => b.status === 'SCHEDULED').length
    const upcomingBookings = bookings.filter((b: any) => {
      if (!b.timeSlot?.startTime) return false
      return new Date(b.timeSlot.startTime) > new Date() && b.status === 'SCHEDULED'
    }).length
    
    console.log('[CurrentSessions] No active sessions found:', {
      totalBookings,
      scheduledBookings,
      upcomingBookings,
      now: new Date().toISOString(),
      nowLocal: new Date().toLocaleString()
    })
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <GlowCard>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Active Sessions</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              You don't have any sessions scheduled for today or the next few hours.
            </p>
            {totalBookings > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                You have {scheduledBookings} scheduled session(s) and {upcomingBookings} upcoming session(s).
                <br />
                Check your upcoming sessions below to see when you can join.
              </p>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Check your upcoming sessions below or book a new one.
            </p>
          </CardContent>
        </GlowCard>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      {currentSessions.map((booking: any, index: number) => (
        <motion.div
          key={booking.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <CurrentSessionCard 
            booking={booking} 
            onJoinSession={onJoinSession}
            userRole={userRole}
          />
        </motion.div>
      ))}
    </div>
  )
}

export default CurrentSessions