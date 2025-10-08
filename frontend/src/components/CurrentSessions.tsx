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
    const startTime = new Date(booking.timeSlot.startTime)
    const endTime = new Date(booking.timeSlot.endTime)
    
    // Session is active if:
    // 1. Current time is within the session window (15 minutes before start to end time)
    // 2. Status is SCHEDULED and host has started (for parents) or can start (for therapists)
    const sessionWindowStart = new Date(startTime.getTime() - 15 * 60 * 1000) // 15 min before
    
    if (userRole === 'THERAPIST') {
      return now >= sessionWindowStart && now <= endTime && booking.status === 'SCHEDULED'
    } else {
      return now >= sessionWindowStart && now <= endTime && 
             booking.status === 'SCHEDULED' && booking.hostStarted
    }
  }

  const canJoinSession = () => {
    const now = new Date()
    const startTime = new Date(booking.timeSlot.startTime)
    const sessionWindowStart = new Date(startTime.getTime() - 15 * 60 * 1000) // 15 min before
    
    return now >= sessionWindowStart && booking.status === 'SCHEDULED'
  }

  const handleJoinSession = async () => {
    if (!canJoinSession()) {
      alert('Session is not available yet. Please wait for the scheduled time.')
      return
    }

    setIsJoining(true)
    try {
      // For parents: check if host has started
      if (userRole === 'PARENT' && !booking.hostStarted) {
        alert('The therapist hasn\'t started the session yet. Please wait for them to join.')
        setIsJoining(false)
        return
      }

      // Navigate to video call page
      onJoinSession(booking.id)
    } catch (error) {
      console.error('Error joining session:', error)
      alert('Failed to join session. Please try again.')
    } finally {
      setIsJoining(false)
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
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
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-lg">
              <div className={`w-3 h-3 rounded-full ${status.color} mr-3 animate-pulse`} />
              Current Session
            </CardTitle>
            <Badge variant={status.variant} className="ml-2">
              {status.text}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Session Info */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-600">
              <AvatarFallback className="text-white font-bold text-lg">
                {userRole === 'THERAPIST' 
                  ? (booking.child?.name?.charAt(0).toUpperCase() || 'C')
                  : booking.child?.name?.charAt(0).toUpperCase() || 'C'
                }
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900">
                {userRole === 'THERAPIST' 
                  ? `Session with ${booking.child?.name || 'Child'}`
                  : `${booking.child?.name || 'Child'} with ${booking.therapist.name}`
                }
              </h3>
              <p className="text-sm text-gray-600">
                {userRole === 'THERAPIST' 
                  ? `Parent: ${booking.parent?.name || 'Parent'}`
                  : booking.therapist.specialization
                }
              </p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
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
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
            <div className="grid grid-cols-2 gap-4 text-sm">
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
          <div className="flex space-x-3">
            <Button
              onClick={handleJoinSession}
              disabled={isJoining || !canJoinSession()}
              className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-full py-3"
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
              className="rounded-full"
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
              className="space-y-3 pt-3 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
  onJoinSession: (bookingId: string) => void
  userRole?: 'PARENT' | 'THERAPIST'
}

const CurrentSessions: React.FC<CurrentSessionsProps> = ({ bookings, onJoinSession, userRole = 'PARENT' }) => {
  // Find current/upcoming sessions that can be joined
  const currentSessions = bookings.filter((booking: any) => {
    const now = new Date()
    const startTime = new Date(booking.timeSlot.startTime)
    const endTime = new Date(booking.timeSlot.endTime)
    const sessionWindowStart = new Date(startTime.getTime() - 15 * 60 * 1000) // 15 min before
    
    return now >= sessionWindowStart && now <= endTime && booking.status === 'SCHEDULED'
  }).sort((a: any, b: any) => 
    new Date(a.timeSlot.startTime).getTime() - new Date(b.timeSlot.startTime).getTime()
  )

  if (currentSessions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <GlowCard>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Sessions</h3>
            <p className="text-gray-600 mb-4">
              You don't have any sessions scheduled for today or the next few hours.
            </p>
            <p className="text-sm text-gray-500">
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