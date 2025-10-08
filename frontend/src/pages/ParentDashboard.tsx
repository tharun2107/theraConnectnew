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
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="ml-72 pt-16 min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="p-8 space-y-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <h1 className="text-5xl font-bold">
            <GradientText>Welcome, {profile?.name || 'Parent'}!</GradientText>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage your children and therapy sessions with ease. Track progress and connect with professional therapists.
          </p>
          
          <div className="flex justify-center space-x-4 mt-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => setShowAddChildModal(true)}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full shadow-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Child
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => setShowBookSessionModal(true)}
                variant="outline"
                size="lg"
                className="px-8 py-3 rounded-full border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white shadow-lg"
              >
                <Heart className="w-5 h-5 mr-2" />
                Book Session
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
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

        {/* Current Sessions Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex items-center mb-6">
            <Zap className="w-6 h-6 text-yellow-500 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Current Sessions</h2>
          </div>
          <CurrentSessions 
            bookings={bookings} 
            onJoinSession={handleJoinSession}
            userRole="PARENT"
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Children Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <GlowCard className="h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-600" />
                  My Children
                </CardTitle>
                <Button
                  onClick={() => setShowAddChildModal(true)}
                  size="sm"
                  className="rounded-full"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                {children.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UserPlus className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No children added yet</h3>
                    <p className="text-gray-600 mb-4">Add your first child to get started with therapy sessions.</p>
                    <Button
                      onClick={() => setShowAddChildModal(true)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Child
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {children.map((child: Child, index) => (
                      <motion.div
                        key={child.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600">
                            <AvatarFallback className="text-white font-bold">
                              {child.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold text-gray-900">{child.name}</h4>
                            <p className="text-sm text-gray-600">{child.age} years old</p>
                            {child.condition && (
                              <Badge variant="secondary" className="mt-1 text-xs">
                                {child.condition}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </GlowCard>
          </motion.div>

          {/* Upcoming Sessions Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <GlowCard className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-green-600" />
                  Upcoming Sessions
                  <Badge variant="secondary" className="ml-2">
                    <AnimatedCounter value={upcomingBookings.length} />
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No upcoming sessions</h3>
                    <p className="text-gray-600 mb-4">Book a session with a therapist to get started.</p>
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
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-100 hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12 bg-gradient-to-r from-green-500 to-blue-600">
                            <AvatarFallback className="text-white font-bold">
                              {booking.child.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {booking.child.name} with {booking.therapist.name}
                            </h4>
                            <p className="text-sm text-gray-600">
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
                          <Badge variant="default" className="bg-green-100 text-green-800">
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
              </CardContent>
            </GlowCard>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <GlowCard>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bookings.slice(0, 5).map((booking: Booking, index) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Play className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Session with {booking.therapist.name}
                        </p>
                        <p className="text-sm text-gray-600">
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
            </CardContent>
          </GlowCard>
        </motion.div>
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