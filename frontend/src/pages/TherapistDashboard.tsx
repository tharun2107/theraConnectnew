import React, { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { motion } from 'framer-motion'
import { therapistAPI, bookingAPI } from '../lib/api'
import { 
  Calendar, 
  Clock, 
  Users, 
  UserCheck, 
  Play, 
  Settings
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { StatsCard } from '../components/ui/stats-card'
import { LoadingSpinner } from '../components/ui/loading-spinner'
import { GradientText } from '../components/ui/gradient-text'
import CreateTimeSlotsModal from '../components/CreateTimeSlotsModal'
import RequestLeaveModal from '../components/RequestLeaveModal'
import CurrentSessions from '../components/CurrentSessions'
import SessionDetails from '../components/SessionDetails'
import TherapistChildrenView from '../components/TherapistChildrenView'
import { useNavigate } from 'react-router-dom'

interface Booking {
  id: string
  status: string
  createdAt: string
  child?: {
    name: string
    age: number
  }
  parent: {
    name: string
  }
  timeSlot: {
    startTime: string
    endTime: string
  }
}

const TherapistDashboard: React.FC = () => {
  const [showCreateSlotsModal, setShowCreateSlotsModal] = useState(false)
  const [isMandatoryModal, setIsMandatoryModal] = useState(false)
  const [showRequestLeaveModal, setShowRequestLeaveModal] = useState(false)
  const [joiningId, setJoiningId] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data: profile, isLoading: profileLoading } = useQuery(
    'therapistProfile',
    therapistAPI.getProfile,
    { select: (response) => response.data }
  )

  // Check if therapist has active slots
  const { data: hasActiveSlotsData, isLoading: checkingSlots, error: checkError } = useQuery(
    'therapistHasActiveSlots',
    therapistAPI.checkHasActiveSlots,
    { 
      select: (response) => response.data,
      enabled: !!profile, // Only check if profile is loaded
      retry: 1,
      onError: (error) => {
        console.error('[TherapistDashboard] Error checking active slots:', error)
      },
      onSuccess: (data) => {
        console.log('[TherapistDashboard] Active slots check result:', data)
      }
    }
  )

  // Automatically show modal if therapist has no active slots
  useEffect(() => {
    console.log('[TherapistDashboard] Effect triggered:', { 
      checkingSlots, 
      hasActiveSlotsData, 
      checkError,
      profile: !!profile 
    })
    
    if (!checkingSlots && hasActiveSlotsData !== undefined) {
      console.log('[TherapistDashboard] Checking if modal should show:', hasActiveSlotsData.hasActiveSlots)
      if (!hasActiveSlotsData.hasActiveSlots) {
        console.log('[TherapistDashboard] Showing mandatory modal')
        setIsMandatoryModal(true)
        setShowCreateSlotsModal(true)
      }
    }
  }, [hasActiveSlotsData, checkingSlots, checkError, profile])

  const { data: bookings = [], isLoading: bookingsLoading, refetch: refetchBookings } = useQuery(
    'therapistBookings',
    bookingAPI.getMyBookings,
    { 
      select: (response) => {
        console.log('[TherapistDashboard] Bookings response:', response)
        return response.data || []
      }
    }
  )
  
  // Debug bookings
  React.useEffect(() => {
    console.log('[TherapistDashboard] Bookings loaded:', bookings?.length || 0, 'bookings')
    if (bookings && bookings.length > 0) {
      console.log('[TherapistDashboard] Sample booking:', bookings[0])
      bookings.forEach((booking: any) => {
        if (booking.status === 'SCHEDULED' && booking.timeSlot) {
          const startTime = new Date(booking.timeSlot.startTime)
          const now = new Date()
          const timeDiff = (startTime.getTime() - now.getTime()) / 60000 // minutes
          console.log('[TherapistDashboard] Scheduled booking:', {
            bookingId: booking.id?.slice(-8),
            startTime: startTime.toISOString(),
            startTimeLocal: startTime.toLocaleString(),
            now: now.toISOString(),
            nowLocal: now.toLocaleString(),
            timeDiffMinutes: Math.round(timeDiff),
            isInWindow: timeDiff >= -15 && timeDiff <= 60 // within 15 min before to 1 hour after
          })
        }
      })
    }
  }, [bookings])

  // Handle joining a session as therapist
  const handleJoinSession = async (bookingId: string) => {
    console.log('[TherapistDashboard] Start session clicked', { bookingId })
    try {
      // Create Zoom meeting for the booking
      console.log('[TherapistDashboard] Creating Zoom meeting for booking', bookingId)
      const meetingResponse = await bookingAPI.createZoomMeeting(bookingId)
      console.log('[TherapistDashboard] Zoom meeting created:', meetingResponse.data)
      
      // Mark host as started
      console.log('[TherapistDashboard] Marking host started for booking', bookingId)
      await bookingAPI.markHostStarted(bookingId)
      
      // Navigate to video call
      console.log('[TherapistDashboard] Navigating to video call')
      setJoiningId(bookingId)
      navigate(`/video-call/${bookingId}`)
    } catch (error: any) {
      console.error('[TherapistDashboard] Error joining session:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to start session. Please try again.'
      alert(errorMessage)
    }
  }

  // Calculate stats
  const totalBookings = bookings.length
  const upcomingSessions = bookings.filter((booking: Booking) => 
      new Date(booking.timeSlot.startTime) > new Date() && booking.status === 'SCHEDULED'
  ).length
  const completedSessions = bookings.filter((booking: Booking) => 
    booking.status === 'COMPLETED'
  ).length
  const stats = [
    {
      title: 'Total Sessions',
      value: totalBookings,
      icon: Calendar,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Upcoming Sessions',
      value: upcomingSessions,
      icon: Clock,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Completed Sessions',
      value: completedSessions,
      icon: UserCheck,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400'
    }
  ]

  if (profileLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[#F9F9F9] dark:bg-black rounded-2xl" />
        <div className="relative p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] dark:text-white mb-2">
                Welcome back, <span className="text-[#1A1A1A] dark:text-white">{profile?.name || 'Therapist'}</span>!
              </h1>
              <p className="text-[#4D4D4D] dark:text-gray-300 text-base sm:text-lg">
                Ready to make a difference in your patients' lives today?
              </p>
        </div>
            <div className="flex sm:hidden md:flex items-center space-x-4 w-full sm:w-auto">
          <Button
                variant="outline"
            onClick={() => setShowRequestLeaveModal(true)}
                className="border-gray-border text-[#1A1A1A] hover:bg-[#F9F9F9]"
          >
                <Settings className="h-4 w-4 mr-2" />
            Request Leave
          </Button>
        </div>
                  </div>
                </div>
          </motion.div>

        {/* Stats Grid */}
        <motion.div
        initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => (
            <StatsCard
              key={stat.title}
              {...stat}
              delay={index * 0.1}
            />
          ))}
        </motion.div>

      {/* Current Sessions */}
        <motion.div
        initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
        <Card className="bg-white dark:bg-black shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
          <CardHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Play className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
              Current Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {bookingsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading sessions...</span>
              </div>
            ) : (
              <CurrentSessions 
                bookings={bookings || []} 
                onJoinSession={handleJoinSession}
                userRole="THERAPIST"
              />
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Upcoming Sessions - Next 2 Days */}
      {(() => {
        const now = new Date()
        const twoDaysLater = new Date(now)
        twoDaysLater.setDate(twoDaysLater.getDate() + 2)
        twoDaysLater.setHours(23, 59, 59, 999)
        
        const nextTwoDaysBookings = bookings.filter((booking: Booking) => {
          const startTime = new Date(booking.timeSlot.startTime)
          return startTime > now && startTime <= twoDaysLater && booking.status === 'SCHEDULED'
        }).sort((a: Booking, b: Booking) => 
          new Date(a.timeSlot.startTime).getTime() - new Date(b.timeSlot.startTime).getTime()
        )
        
        return nextTwoDaysBookings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card className="bg-white dark:bg-black shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
              <CardHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                  Upcoming Sessions (Next 2 Days)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {nextTwoDaysBookings.map((booking: Booking) => (
                    <SessionDetails
                      key={booking.id}
                      booking={booking}
                      userRole="THERAPIST"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })()}

      {/* My Children */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Card className="bg-white dark:bg-black shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
          <CardHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Users className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
              My Children
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Children you've worked with and their consent status
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <TherapistChildrenView />
          </CardContent>
        </Card>
      </motion.div>

      {/* My Slots Section */}
      {!profileLoading && profile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="bg-white dark:bg-black shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
            <CardHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Clock className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
                My Time Slots
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {profile.availableSlotTimes && profile.availableSlotTimes.length > 0
                  ? 'Your available time slots that apply to all future dates. These slots are locked and cannot be changed.'
                  : 'Set up your available time slots to allow parents to book sessions with you.'}
              </p>
            </CardHeader>
            <CardContent className="p-6">
              {profile.availableSlotTimes && profile.availableSlotTimes.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
                  {profile.availableSlotTimes.sort().map((time: string) => {
                    const [hours, minutes] = time.split(':').map(Number)
                    const endHour = (hours + 1) % 24
                    
                    // Use local time for display (treating the time string as local time)
                    const time12h = new Date(2000, 0, 1, hours, minutes).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true 
                    })
                    const endTime12h = new Date(2000, 0, 1, endHour, 0).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true 
                    })
                    
                    return (
                      <motion.div
                        key={time}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="group relative flex flex-col items-center justify-center p-5 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-xl hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-300 hover:shadow-lg dark:hover:shadow-purple-500/10"
                      >
                        <div className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1 text-center">
                          {time12h}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2 text-center">
                          to {endTime12h}
                        </div>
                        <div className="mt-1 px-3 py-1 bg-gray-200 dark:bg-gray-800 rounded-full text-xs text-gray-600 dark:text-gray-400 font-medium">
                          1 Hour
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No Time Slots Configured
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    You haven't set up your available time slots yet. Click the button below to create your time slots. These will apply to all future dates.
                  </p>
                  <Button
                    onClick={() => setShowCreateSlotsModal(true)}
                    className="btn btn-primary"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Create Time Slots
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Past Sessions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <Card className="bg-white dark:bg-black shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
          <CardHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
              Past Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {bookingsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-2 text-gray-600">Loading past sessions...</span>
              </div>
            ) : completedSessions === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-3">📅</div>
                <p className="text-lg font-medium mb-2">No completed sessions yet</p>
                <p className="text-sm">Completed therapy sessions will appear here with session reports and parent feedback.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings
                  .filter((booking: Booking) => booking.status === 'COMPLETED')
                  .sort((a: Booking, b: Booking) => 
                    new Date(b.timeSlot.startTime).getTime() - new Date(a.timeSlot.startTime).getTime()
                  )
                  .slice(0, 5) // Show only the 5 most recent sessions
                  .map((booking: Booking) => {
                    console.log('🔍 TherapistDashboard - Booking data:', booking)
                    return (
                      <SessionDetails
                        key={booking.id}
                        booking={booking}
                        userRole="THERAPIST"
                      />
                    )
                  })}
                {completedSessions > 5 && (
                  <div className="text-center pt-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Showing 5 most recent sessions.
                    </p>
                </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>


      {/* Modals */}
      {showCreateSlotsModal && (
        <CreateTimeSlotsModal
          isMandatory={isMandatoryModal}
          onClose={() => {
            if (!isMandatoryModal && !hasActiveSlotsData?.hasActiveSlots) {
              setShowCreateSlotsModal(false)
            }
          }}
          onSuccess={() => {
            queryClient.invalidateQueries('therapistProfile')
            queryClient.invalidateQueries('therapistHasActiveSlots')
            setShowCreateSlotsModal(false)
            setIsMandatoryModal(false)
          }}
        />
      )}

      {showRequestLeaveModal && (
        <RequestLeaveModal
          onClose={() => setShowRequestLeaveModal(false)}
          onSuccess={() => {
            queryClient.invalidateQueries('therapistProfile')
            setShowRequestLeaveModal(false)
          }}
        />
      )}
    </div>
  )
}

export default TherapistDashboard