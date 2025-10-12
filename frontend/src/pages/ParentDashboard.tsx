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
  Plus, 
  Heart,
  Video,
  TrendingUp,
  UserPlus,
  ChevronRight,
  Play,
  Zap
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Avatar, AvatarFallback } from '../components/ui/avatar'
import { StatsCard } from '../components/ui/stats-card'
import { FloatingCard } from '../components/ui/floating-card'
import { GlowCard } from '../components/ui/glow-card'
import { LoadingSpinner } from '../components/ui/loading-spinner'
import { GradientText } from '../components/ui/gradient-text'
import { AnimatedCounter } from '../components/ui/animated-counter'
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

  // Get upcoming sessions (all of them)
  const upcomingBookings = bookings
    .filter((booking: Booking) => 
      new Date(booking.timeSlot.startTime) > new Date() && booking.status === 'SCHEDULED'
    )
    .sort((a: Booking, b: Booking) => 
      new Date(a.timeSlot.startTime).getTime() - new Date(b.timeSlot.startTime).getTime()
    )

  // Handle joining a session
  const handleJoinSession = async (bookingId: string) => {
    if (joiningId) return
    console.log('[ParentDashboard] Join clicked', { bookingId })
    setJoiningId(bookingId)
    try {
      // For parents, ensure the meeting and signature are available by probing the signature endpoint.
      // Retry briefly to allow therapist host-start propagation.
      const maxAttempts = 5
      let attempt = 0
      while (attempt < maxAttempts) {
        attempt++
        try {
          console.log('[ParentDashboard] Probing signature (attempt)', attempt)
          await bookingAPI.getSignature(bookingId)
          break
        } catch (e: any) {
          const status = e?.response?.status
          console.warn('[ParentDashboard] Signature not ready', status)
          if (attempt >= maxAttempts) throw e
          await new Promise((res) => setTimeout(res, 800))
        }
      }
      console.log('[ParentDashboard] Navigating to video call')
      navigate(`/video-call/${bookingId}`)
    } finally {
      setJoiningId(null)
    }
  }

  const stats = [
    {
      title: 'Total Children',
      value: totalChildren,
      change: '+2 this month',
      changeType: 'positive' as const,
      icon: Users,
      iconColor: 'blue'
    },
    {
      title: 'Upcoming Sessions',
      value: upcomingSessions,
      change: '3 this week',
      changeType: 'positive' as const,
      icon: Calendar,
      iconColor: 'green'
    },
    {
      title: 'Total Bookings',
      value: totalBookings,
      change: '+5 this month',
      changeType: 'positive' as const,
      icon: Clock,
      iconColor: 'purple'
    },
    {
      title: 'Sessions Completed',
      value: completedSessions,
      change: 'Great progress!',
      changeType: 'positive' as const,
      icon: Star,
      iconColor: 'orange'
    }
  ]

  if (profileLoading || childrenLoading || bookingsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Parent Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage your children and therapy sessions with ease</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => setShowAddChildModal(true)}
            className="btn btn-primary btn-sm flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Child
          </Button>
          <Button
            onClick={() => setShowBookSessionModal(true)}
            variant="outline"
            className="btn btn-outline btn-sm flex items-center"
          >
            <Heart className="h-4 w-4 mr-1" />
            Book Session
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="card bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="card-content p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${
                  stat.iconColor === 'blue' ? 'bg-blue-500' :
                  stat.iconColor === 'green' ? 'bg-green-500' :
                  stat.iconColor === 'purple' ? 'bg-purple-500' :
                  'bg-orange-500'
                }`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Current Sessions */}
      <div className="card bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="card-header p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="card-title text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <Zap className="h-5 w-5 mr-2 text-yellow-500 dark:text-yellow-400" />
            Current Sessions
          </h3>
        </div>
        <div className="card-content p-6">
          <CurrentSessions 
            bookings={bookings} 
            onJoinSession={handleJoinSession}
            userRole="PARENT"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My Children Section */}
        <div className="card bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="card-header p-6 border-b border-gray-200 dark:border-gray-700 flex flex-row items-center justify-between">
            <h3 className="card-title text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
              My Children
            </h3>
            <Button
              onClick={() => setShowAddChildModal(true)}
              size="sm"
              className="rounded-full"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="card-content p-6">
              {children.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserPlus className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No children added yet</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">Add your first child to get started with therapy sessions.</p>
                  <Button
                    onClick={() => setShowAddChildModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Child
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {children.map((child: Child, index) => (
                    <motion.div
                      key={child.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-100 dark:border-blue-800 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600">
                          <AvatarFallback className="text-white font-bold">
                            {child.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{child.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{child.age} years old</p>
                          {child.condition && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              {child.condition}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                          View
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                          Edit
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
          </div>
        </div>

        {/* Upcoming Sessions Section */}
        <div className="card bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="card-header p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="card-title text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
              Upcoming Sessions
              <Badge variant="secondary" className="ml-2">
                <AnimatedCounter value={upcomingBookings.length} />
              </Badge>
            </h3>
          </div>
          <div className="card-content p-6">
              {upcomingBookings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No upcoming sessions</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">Book a session with a therapist to get started.</p>
                  <Button
                    onClick={() => setShowBookSessionModal(true)}
                    className="bg-gradient-to-r from-green-600 to-blue-600"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Book Session
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {upcomingBookings.map((booking: Booking, index) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl border border-green-100 dark:border-green-800 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12 bg-gradient-to-r from-green-500 to-blue-600">
                          <AvatarFallback className="text-white font-bold">
                            {booking.child.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {booking.child.name} with {booking.therapist.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {new Date(booking.timeSlot.startTime).toLocaleDateString()} • {' '}
                            {new Date(booking.timeSlot.startTime).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {booking.therapist.specialization}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {booking.status}
                        </Badge>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full px-4 py-1"
                          onClick={() => handleJoinSession(booking.id)}
                          disabled={joiningId === booking.id}
                        >
                          <Video className="w-4 h-4 mr-1" />
                          {joiningId === booking.id ? 'Joining...' : 'Join'}
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="card-header p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="card-title text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
            Recent Activity
          </h3>
        </div>
        <div className="card-content p-6">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {bookings.slice(0, 5).map((booking: Booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Play className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Session with {booking.therapist.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {booking.child.name} • {new Date(booking.timeSlot.startTime).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={booking.status === 'COMPLETED' ? 'default' : 'secondary'}>
                    {booking.status}
                  </Badge>
                </motion.div>
              ))}
            </div>
        </div>
      </div>

      {/* Past Sessions */}
      <div className="card bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="card-header p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="card-title text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
            Past Sessions
          </h3>
        </div>
        <div className="card-content p-6">
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
        </div>
      </div>

      {/* Consent Management */}
      <div className="card bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="card-header p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="card-title text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
            Consent Management
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage which therapists can access your children's detailed information
          </p>
        </div>
        <div className="card-content p-6">
          <ParentConsentManagement />
        </div>
      </div>

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