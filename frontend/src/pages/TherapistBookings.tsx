import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { bookingAPI } from '../lib/api'
import { useNavigate } from 'react-router-dom'
import { 
  Calendar, 
  Clock, 
  Users,
  Play,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import CurrentSessions from '../components/CurrentSessions'
import SessionDetails from '../components/SessionDetails'

interface Booking {
  id: string
  status: string
  createdAt: string
  meetingId?: string
  hostStarted?: boolean
  child?: {
    name: string
    age: number
    condition?: string
  }
  parent: {
    name: string
    email?: string
  }
  timeSlot: {
    startTime: string
    endTime: string
  }
}

const TherapistBookings: React.FC = () => {
  const navigate = useNavigate()
  const [joiningId, setJoiningId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'current' | 'past' | 'completed'>('all')

  const { data: bookings = [], isLoading: bookingsLoading, refetch: refetchBookings } = useQuery(
    'therapistBookings',
    bookingAPI.getMyBookings,
    { 
      select: (response) => {
        console.log('[TherapistBookings] Bookings response:', response)
        return response.data || []
      }
    }
  )

  // Handle joining a session as therapist
  const handleJoinSession = async (bookingId: string) => {
    console.log('[TherapistBookings] Start session clicked', { bookingId })
    try {
      // Create Zoom meeting for the booking
      console.log('[TherapistBookings] Creating Zoom meeting for booking', bookingId)
      const meetingResponse = await bookingAPI.createZoomMeeting(bookingId)
      console.log('[TherapistBookings] Zoom meeting created:', meetingResponse.data)
      
      // Mark host as started
      console.log('[TherapistBookings] Marking host started for booking', bookingId)
      await bookingAPI.markHostStarted(bookingId)
      
      // Navigate to video call
      console.log('[TherapistBookings] Navigating to video call')
      setJoiningId(bookingId)
      navigate(`/video-call/${bookingId}`)
    } catch (error: any) {
      console.error('[TherapistBookings] Error joining session:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to start session. Please try again.'
      alert(errorMessage)
    }
  }

  // Filter bookings based on selected filter
  const filteredBookings = React.useMemo(() => {
    const now = new Date()
    
    switch (filter) {
      case 'upcoming':
        return bookings.filter((booking: Booking) => 
          new Date(booking.timeSlot.startTime) > now && booking.status === 'SCHEDULED'
        )
      case 'current':
        return bookings.filter((booking: Booking) => {
          const startTime = new Date(booking.timeSlot.startTime)
          const timeDiff = (startTime.getTime() - now.getTime()) / 60000 // minutes
          return booking.status === 'SCHEDULED' && timeDiff <= 15 && timeDiff >= -60
        })
      case 'past':
        return bookings.filter((booking: Booking) => 
          new Date(booking.timeSlot.startTime) < now && booking.status !== 'COMPLETED'
        )
      case 'completed':
        return bookings.filter((booking: Booking) => booking.status === 'COMPLETED')
      default:
        return bookings
    }
  }, [bookings, filter])

  // Calculate stats
  const totalBookings = bookings.length
  const upcomingSessions = bookings.filter((booking: Booking) => 
    new Date(booking.timeSlot.startTime) > new Date() && booking.status === 'SCHEDULED'
  ).length
  const completedSessions = bookings.filter((booking: Booking) => 
    booking.status === 'COMPLETED'
  ).length
  const currentSessions = bookings.filter((booking: Booking) => {
    const startTime = new Date(booking.timeSlot.startTime)
    const now = new Date()
    const timeDiff = (startTime.getTime() - now.getTime()) / 60000 // minutes
    return booking.status === 'SCHEDULED' && timeDiff <= 15 && timeDiff >= -60
  }).length

  const stats = [
    {
      title: 'Total Bookings',
      value: totalBookings,
      icon: Calendar,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Upcoming',
      value: upcomingSessions,
      icon: Clock,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Current Sessions',
      value: currentSessions,
      icon: Play,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      title: 'Completed',
      value: completedSessions,
      icon: CheckCircle,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      textColor: 'text-orange-600 dark:text-orange-400'
    }
  ]

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Header */}
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
                My Bookings
              </h1>
              <p className="text-[#4D4D4D] dark:text-gray-300 text-base sm:text-lg">
                View and manage all your therapy sessions
              </p>
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
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="bg-white dark:bg-black shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.title}</p>
                    <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.textColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </motion.div>

      {/* Filter Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex flex-wrap gap-2"
      >
        {[
          { key: 'all', label: 'All Bookings' },
          { key: 'upcoming', label: 'Upcoming' },
          { key: 'current', label: 'Current Sessions' },
          { key: 'past', label: 'Past' },
          { key: 'completed', label: 'Completed' }
        ].map((filterOption) => (
          <Button
            key={filterOption.key}
            variant={filter === filterOption.key ? 'default' : 'outline'}
            onClick={() => setFilter(filterOption.key as any)}
            className={filter === filterOption.key 
              ? 'bg-black hover:bg-[#1A1A1A] text-white dark:bg-black dark:hover:bg-gray-900 dark:text-white' 
              : ''}
          >
            {filterOption.label} ({filterOption.key === 'all' ? bookings.length : filteredBookings.length})
          </Button>
        ))}
      </motion.div>

      {/* Current Sessions */}
      {currentSessions > 0 && (
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
                  <span className="ml-2 text-gray-600 dark:text-gray-300">Loading sessions...</span>
                </div>
              ) : (
                <CurrentSessions 
                  bookings={bookings.filter((booking: Booking) => {
                    const startTime = new Date(booking.timeSlot.startTime)
                    const now = new Date()
                    const timeDiff = (startTime.getTime() - now.getTime()) / 60000
                    return booking.status === 'SCHEDULED' && timeDiff <= 15 && timeDiff >= -60
                  })} 
                  onJoinSession={handleJoinSession}
                  userRole="THERAPIST"
                  onRefresh={refetchBookings}
                />
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Filtered Bookings List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <Card className="bg-white dark:bg-black shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
          <CardHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              {filter === 'all' && <Calendar className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />}
              {filter === 'upcoming' && <Clock className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />}
              {filter === 'current' && <Play className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />}
              {filter === 'past' && <XCircle className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-400" />}
              {filter === 'completed' && <CheckCircle className="h-5 w-5 mr-2 text-orange-600 dark:text-orange-400" />}
              {filter === 'all' && 'All Bookings'}
              {filter === 'upcoming' && 'Upcoming Sessions'}
              {filter === 'current' && 'Current Sessions'}
              {filter === 'past' && 'Past Sessions'}
              {filter === 'completed' && 'Completed Sessions'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {bookingsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-300">Loading bookings...</span>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                <p className="text-lg font-medium mb-2 text-gray-900 dark:text-white">No bookings found</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">No bookings match the selected filter</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings
                  .sort((a: Booking, b: Booking) => {
                    if (filter === 'completed' || filter === 'past') {
                      return new Date(b.timeSlot.startTime).getTime() - new Date(a.timeSlot.startTime).getTime()
                    }
                    return new Date(a.timeSlot.startTime).getTime() - new Date(b.timeSlot.startTime).getTime()
                  })
                  .map((booking: Booking) => (
                    <SessionDetails
                      key={booking.id}
                      booking={booking}
                      userRole="THERAPIST"
                    />
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default TherapistBookings

