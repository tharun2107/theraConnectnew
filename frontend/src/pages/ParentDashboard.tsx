import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { parentAPI, bookingAPI } from '../lib/api'
import { 
  Users, 
  Calendar, 
  Clock, 
  Star, 
  UserPlus,
  ChevronRight,
  Play,
  Shield
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Avatar, AvatarFallback } from '../components/ui/avatar'
import { StatsCard } from '../components/ui/stats-card'
import { LoadingSpinner } from '../components/ui/loading-spinner'
import { GradientText } from '../components/ui/gradient-text'
import AddChildModal from '../components/AddChildModal'
import BookSessionModal from '../components/BookSessionModal'
import CurrentSessions from '../components/CurrentSessions'
import SessionDetails from '../components/SessionDetails'
import ParentConsentManagement from '../components/ParentConsentManagement'

interface Child {
  id: string
  name: string
  age: number
  address?: string
  condition?: string
  notes?: string
}

interface Booking {
  id: string
  status: string
  createdAt: string
  meetingId?: string
  hostStarted?: boolean
  child: Child
  therapist: {
    name: string
    specialization: string
  }
  timeSlot: {
    startTime: string
    endTime: string
  }
}

const ParentDashboard: React.FC = () => {
  const [showAddChildModal, setShowAddChildModal] = useState(false)
  const [showBookSessionModal, setShowBookSessionModal] = useState(false)
  const navigate = useNavigate()
  const [joiningId, setJoiningId] = useState<string | null>(null)

  const { data: profile, isLoading: profileLoading } = useQuery(
    'parentProfile',
    parentAPI.getProfile,
    { select: (response) => response.data }
  )

  const { data: children = [], isLoading: childrenLoading } = useQuery(
    'parentChildren',
    parentAPI.getChildren,
    { select: (response) => response.data }
  )

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery(
    'parentBookings',
    bookingAPI.getMyBookings,
    { select: (response) => response.data }
  )

  // Calculate stats
  const totalChildren = children.length
  const upcomingSessions = bookings.filter((booking: Booking) => 
    new Date(booking.timeSlot.startTime) > new Date() && booking.status === 'SCHEDULED'
  ).length
  const totalBookings = bookings.length
  const completedSessions = bookings.filter((booking: Booking) => 
    booking.status === 'COMPLETED'
  ).length

  // Get upcoming sessions (all of them) - removed unused variable

  // Handle joining a session
  const handleJoinSession = async (bookingId: string) => {
    console.log('[ParentDashboard] Join clicked', { bookingId })
    try {
      // Get signature for the booking
      console.log('[ParentDashboard] Probing signature (attempt) 1')
      const signatureResponse = await bookingAPI.getSignature(bookingId)
      console.log('[ParentDashboard] signature response', signatureResponse.data)
      
      // Navigate to video call
      console.log('[ParentDashboard] Navigating to video call')
      setJoiningId(bookingId)
      navigate(`/video-call/${bookingId}`)
    } catch (error) {
      console.error('Error joining session:', error)
    }
  }

  const stats = [
    {
      title: 'My Children',
      value: totalChildren,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Upcoming Sessions',
      value: upcomingSessions,
      icon: Calendar,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Total Sessions',
      value: totalBookings,
      icon: Clock,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      title: 'Completed Sessions',
      value: completedSessions,
      icon: Star,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      textColor: 'text-orange-600 dark:text-orange-400'
    }
  ]

  if (profileLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10 dark:from-blue-600/20 dark:via-purple-600/20 dark:to-blue-600/20 rounded-2xl" />
        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome back, <GradientText>{profile?.name || 'Parent'}</GradientText>!
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Your children's therapy journey continues today.
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Button
                onClick={() => setShowAddChildModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Child
              </Button>
              <Button
                onClick={() => setShowBookSessionModal(true)}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Book Session
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
        <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
          <CardHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Play className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
              Current Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <CurrentSessions 
              bookings={bookings} 
              onJoinSession={handleJoinSession}
              userRole="PARENT"
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* My Children */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
          <CardHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Users className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
              My Children
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {childrenLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <span className="ml-2 text-gray-600">Loading children...</span>
              </div>
            ) : children.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-3">👶</div>
                <p className="text-lg font-medium mb-2">No children added yet</p>
                <p className="text-sm mb-4">Add your children to start booking therapy sessions.</p>
                <Button
                  onClick={() => setShowAddChildModal(true)}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Your First Child
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {children.map((child: Child) => (
                  <motion.div
                    key={child.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/children/${child.id}`)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-500 text-white font-semibold">
                          {child.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{child.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Age: {child.age} years</p>
                        {child.condition && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{child.condition}</p>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Past Sessions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
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
                <p className="text-sm">Completed therapy sessions will appear here with feedback and reports.</p>
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
                    console.log('🔍 ParentDashboard - Booking data:', booking)
                    return (
                      <SessionDetails
                        key={booking.id}
                        booking={booking}
                        userRole="PARENT"
                      />
                    )
                  })}
                {completedSessions > 5 && (
                  <div className="text-center pt-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Showing 5 most recent sessions. View all sessions in individual child profiles.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Consent Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
          <CardHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Shield className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
              Consent Management
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage which therapists can access your children's detailed information
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <ParentConsentManagement />
          </CardContent>
        </Card>
      </motion.div>

      {/* Modals */}
      {showAddChildModal && (
        <AddChildModal
          onClose={() => setShowAddChildModal(false)}
          onSuccess={() => {
            setShowAddChildModal(false)
            // Refetch children data
          }}
        />
      )}

      {showBookSessionModal && (
        <BookSessionModal
          onClose={() => setShowBookSessionModal(false)}
          onSuccess={() => {
            setShowBookSessionModal(false)
            // Refetch bookings data
          }}
        />
      )}
    </div>
  )
}

export default ParentDashboard