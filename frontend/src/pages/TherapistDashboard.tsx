import React, { useState } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { motion } from 'framer-motion'
import { therapistAPI, bookingAPI } from '../lib/api'
import { 
  Calendar, 
  Clock, 
  Users, 
  Plus, 
  UserCheck, 
  Play, 
  Video, 
  Settings, 
  TrendingUp, 
  Star, 
  DollarSign,
  User,
  Heart,
  ChevronRight,
  Activity,
  Award,
  Target
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
import CreateTimeSlotsModal from '../components/CreateTimeSlotsModal'
import RequestLeaveModal from '../components/RequestLeaveModal'
import CurrentSessions from '../components/CurrentSessions'
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
  const [showRequestLeaveModal, setShowRequestLeaveModal] = useState(false)
  const [selectedSlotsDate, setSelectedSlotsDate] = useState<string>(new Date().toISOString().slice(0,10))
  const [activeTab, setActiveTab] = useState('overview')
  const [joiningId, setJoiningId] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data: profile, isLoading: profileLoading } = useQuery(
    'therapistProfile',
    therapistAPI.getProfile,
    { select: (response) => response.data }
  )

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery(
    'therapistBookings',
    bookingAPI.getMyBookings,
    { select: (response) => response.data }
  )

  // Fetch my slots for selected date
  const { data: mySlots = [], isLoading: mySlotsLoading } = useQuery(
    ['therapistSlots', selectedSlotsDate],
    () => therapistAPI.getMySlots(selectedSlotsDate),
    { select: (response) => response.data }
  )

  const handleSlotsDateChange = (val: string) => {
    setSelectedSlotsDate(val)
  }

  // Handle joining a session as therapist
  const handleJoinSession = async (bookingId: string) => {
    if (joiningId) return
    try {
      console.log('[TherapistDashboard] Start session clicked', { bookingId })
      setJoiningId(bookingId)
      // Ensure meeting exists; backend may return 409 if already created
      try {
        console.log('[TherapistDashboard] Creating Zoom meeting for booking', bookingId)
        await bookingAPI.createZoomMeeting(bookingId)
      } catch (e: any) {
        console.warn('[TherapistDashboard] createZoomMeeting skipped/failed (possibly already exists)', e?.response?.status)
      }
      // Mark host started (idempotent server-side)
      try {
        console.log('[TherapistDashboard] Marking host started for booking', bookingId)
        await bookingAPI.markHostStarted(bookingId)
      } catch (e: any) {
        console.warn('[TherapistDashboard] markHostStarted warning', e?.response?.status)
      }
      console.log('[TherapistDashboard] Navigating to video call')
      navigate(`/video-call/${bookingId}`)
    } finally {
      setJoiningId(null)
    }
  }

  const upcomingBookings = bookings.filter((booking: Booking) => 
    new Date(booking.timeSlot.startTime) > new Date()
  )

  const todayBookings = bookings.filter((booking: Booking) => {
    const bookingDate = new Date(booking.timeSlot.startTime)
    const today = new Date()
    return bookingDate.toDateString() === today.toDateString()
  })

  // Get ALL upcoming sessions (not just 5)
  const allUpcomingBookings = bookings
    .filter((booking: Booking) => 
      new Date(booking.timeSlot.startTime) > new Date() && booking.status === 'SCHEDULED'
    )
    .sort((a: Booking, b: Booking) => 
      new Date(a.timeSlot.startTime).getTime() - new Date(b.timeSlot.startTime).getTime()
    )

  const stats = [
    {
      title: 'Today\'s Sessions',
      value: todayBookings.length,
      change: 'Active now',
      changeType: 'positive' as const,
      icon: Calendar,
      iconColor: 'blue'
    },
    {
      title: 'Upcoming Sessions',
      value: upcomingBookings.length,
      change: 'This week',
      changeType: 'positive' as const,
      icon: Clock,
      iconColor: 'green'
    },
    {
      title: 'Total Bookings',
      value: bookings.length,
      change: 'All time',
      changeType: 'neutral' as const,
      icon: Users,
      iconColor: 'purple'
    },
    {
      title: 'Leaves Remaining',
      value: profile?.leavesRemainingThisMonth || 0,
      change: 'This month',
      changeType: 'neutral' as const,
      icon: UserCheck,
      iconColor: 'orange'
    }
  ]

  if (profileLoading) {
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
    <div className="ml-72 pt-16 min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      <div className="p-8 space-y-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <h1 className="text-5xl font-bold">
            <GradientText gradient="from-purple-600 to-blue-600">
              Welcome back, {profile?.name || 'Therapist'}!
            </GradientText>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage your therapy sessions and schedule with professional tools. Help families connect and heal.
          </p>
          
          <div className="flex justify-center space-x-4 mt-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => setShowCreateSlotsModal(true)}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-full shadow-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Time Slots
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => setShowRequestLeaveModal(true)}
                variant="outline"
                size="lg"
                className="px-8 py-3 rounded-full border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white shadow-lg"
              >
                <UserCheck className="w-5 h-5 mr-2" />
                Request Leave
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Profile Status */}
        {profile?.status !== 'ACTIVE' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <GlowCard className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserCheck className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Account Status: {profile?.status}
                    </h3>
                    <p className="text-sm text-yellow-700">
                      Your account is pending approval. You'll be notified once it's approved.
                    </p>
                  </div>
                </div>
              </CardContent>
            </GlowCard>
          </motion.div>
        )}

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

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex space-x-2 mb-6">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'sessions', label: 'Current Sessions', icon: Play },
              { id: 'schedule', label: 'Schedule', icon: Calendar },
              { id: 'profile', label: 'Profile', icon: User }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-full transition-all duration-300 ${
                    activeTab === tab.id 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </Button>
              )
            })}
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Today's Sessions */}
                <GlowCard>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                      Today's Sessions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {bookingsLoading ? (
                      <div className="text-center py-8">
                        <LoadingSpinner className="mx-auto mb-2" />
                        <p className="text-gray-600">Loading sessions...</p>
                      </div>
                    ) : todayBookings.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Calendar className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No sessions today</h3>
                        <p className="text-gray-600">Your schedule is free today. Create time slots to start booking sessions.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {todayBookings.map((booking: Booking, index) => (
                          <motion.div
                            key={booking.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 hover:shadow-md transition-all duration-300"
                          >
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600">
                                <AvatarFallback className="text-white font-bold">
                                  {booking.child?.name ? booking.child.name.charAt(0).toUpperCase() : 'C'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-semibold text-gray-900">
                                  {booking.child?.name || 'Child details hidden'}
                                </h4>
                                <p className="text-sm text-gray-600">Parent: {booking.parent.name}</p>
                                <p className="text-sm text-gray-500">
                                  {new Date(booking.timeSlot.startTime).toLocaleTimeString()} - {' '}
                                  {new Date(booking.timeSlot.endTime).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={booking.status === 'SCHEDULED' ? "default" : "secondary"}>
                                {booking.status}
                              </Badge>
                              {booking.status === 'SCHEDULED' && (
                                <Button
                                  size="sm"
                                  className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-full px-3 py-1"
                                  onClick={() => handleJoinSession(booking.id)}
                                  disabled={joiningId === booking.id}
                                >
                                  <Video className="w-3 h-3 mr-1" />
                                  {joiningId === booking.id ? 'Starting...' : 'Start'}
                                </Button>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </GlowCard>

                {/* Quick Stats */}
                <GlowCard>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                      Quick Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                            <Star className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Average Rating</p>
                            <p className="text-xs text-gray-600">Based on reviews</p>
                          </div>
                        </div>
                        <span className="text-2xl font-bold text-gray-900">
                          {profile?.averageRating.toFixed(1)}/5.0
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Rate per Session</p>
                            <p className="text-xs text-gray-600">Your pricing</p>
                          </div>
                        </div>
                        <span className="text-2xl font-bold text-gray-900">
                          ${profile?.baseCostPerSession}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                            <Clock className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Session Duration</p>
                            <p className="text-xs text-gray-600">Standard length</p>
                          </div>
                        </div>
                        <span className="text-2xl font-bold text-gray-900">
                          {profile?.slotDurationInMinutes} min
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                            <Target className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Max Daily Slots</p>
                            <p className="text-xs text-gray-600">Capacity limit</p>
                          </div>
                        </div>
                        <span className="text-2xl font-bold text-gray-900">
                          {profile?.maxSlotsPerDay}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </GlowCard>
              </div>
            )}

            {activeTab === 'sessions' && (
              <CurrentSessions 
                bookings={bookings} 
                onJoinSession={handleJoinSession}
                userRole="THERAPIST"
              />
            )}

            {activeTab === 'schedule' && (
              <GlowCard>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-purple-600" />
                    My Schedule
                  </CardTitle>
                  <input
                    type="date"
                    value={selectedSlotsDate}
                    onChange={(e) => handleSlotsDateChange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </CardHeader>
                <CardContent>
                  {mySlotsLoading ? (
                    <div className="text-center py-8">
                      <LoadingSpinner className="mx-auto mb-2" />
                      <p className="text-gray-600">Loading slots...</p>
                    </div>
                  ) : mySlots.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No slots created for this date</h3>
                      <p className="text-gray-600 mb-4">Create time slots to start accepting bookings.</p>
                      <Button
                        onClick={() => setShowCreateSlotsModal(true)}
                        className="bg-gradient-to-r from-purple-600 to-blue-600"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Slots
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-purple-50 to-blue-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {mySlots
                            .filter((slot: any) => slot.isActive || slot.isBooked)
                            .map((slot: any) => (
                            <tr key={slot.id} className="hover:bg-gray-50 transition-colors duration-200">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge variant={slot.isBooked ? "destructive" : "default"}>
                                  {slot.isBooked ? 'Booked' : 'Available'}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </GlowCard>
            )}

            {activeTab === 'profile' && (
              <GlowCard>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2 text-blue-600" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                        <label className="text-sm font-medium text-gray-500">Name</label>
                        <p className="text-gray-900 font-semibold text-lg">{profile?.name}</p>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
                        <label className="text-sm font-medium text-gray-500">Specialization</label>
                        <p className="text-gray-900 font-semibold text-lg">{profile?.specialization}</p>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                        <label className="text-sm font-medium text-gray-500">Experience</label>
                        <p className="text-gray-900 font-semibold text-lg">{profile?.experience} years</p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
                        <label className="text-sm font-medium text-gray-500">Base Cost</label>
                        <p className="text-gray-900 font-semibold text-lg">${profile?.baseCostPerSession}/session</p>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
                        <label className="text-sm font-medium text-gray-500">Rating</label>
                        <p className="text-gray-900 font-semibold text-lg">{profile?.averageRating.toFixed(1)}/5.0</p>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                        <label className="text-sm font-medium text-gray-500">Schedule Settings</label>
                        <p className="text-gray-900 font-semibold text-lg">
                          Start: {profile?.scheduleStartTime} | 
                          Duration: {profile?.slotDurationInMinutes}min | 
                          Max slots: {profile?.maxSlotsPerDay}/day
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </GlowCard>
            )}
          </div>
        </motion.div>

        {/* All Upcoming Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <GlowCard>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-green-600" />
                All Upcoming Sessions
                <Badge variant="secondary" className="ml-2">
                  <AnimatedCounter value={allUpcomingBookings.length} />
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {allUpcomingBookings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No upcoming sessions</h3>
                  <p className="text-gray-600">Create time slots to start accepting bookings from parents.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {allUpcomingBookings.map((booking: Booking, index) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-100 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12 bg-gradient-to-r from-green-500 to-blue-600">
                          <AvatarFallback className="text-white font-bold">
                            {booking.child?.name ? booking.child.name.charAt(0).toUpperCase() : 'C'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {booking.child?.name || 'Child details hidden'}
                          </h4>
                          <p className="text-sm text-gray-600">Parent: {booking.parent.name}</p>
                          {booking.child?.age && (
                            <p className="text-sm text-gray-500">Age: {booking.child.age}</p>
                          )}
                          <p className="text-sm text-gray-500">
                            {new Date(booking.timeSlot.startTime).toLocaleDateString()} at{' '}
                            {new Date(booking.timeSlot.startTime).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={booking.status === 'SCHEDULED' ? "default" : "secondary"}>
                          {booking.status}
                        </Badge>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full"
                          onClick={() => handleJoinSession(booking.id)}
                          disabled={joiningId === booking.id}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          {joiningId === booking.id ? 'Starting...' : 'Start'}
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

      {/* Modals */}
      {showCreateSlotsModal && (
        <CreateTimeSlotsModal
          onClose={() => setShowCreateSlotsModal(false)}
          onSuccess={() => {
            queryClient.invalidateQueries('therapistProfile')
            queryClient.invalidateQueries('therapistSlots')
            setShowCreateSlotsModal(false)
          }}
        />
      )}

      {showRequestLeaveModal && (
        <RequestLeaveModal
          onClose={() => setShowRequestLeaveModal(false)}
          onSuccess={() => {
            queryClient.invalidateQueries('therapistProfile')
            queryClient.invalidateQueries('therapistBookings')
            setShowRequestLeaveModal(false)
          }}
        />
      )}
    </div>
  )
}

export default TherapistDashboard