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
    <div className="space-y-6 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Therapist Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage your therapy sessions and track your schedule</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => setShowCreateSlotsModal(true)}
            className="btn btn-primary btn-sm flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" />
            Create Time Slots
          </Button>
          <Button
            onClick={() => setShowRequestLeaveModal(true)}
            variant="outline"
            className="btn btn-outline btn-sm flex items-center"
          >
            <UserCheck className="h-4 w-4 mr-1" />
            Request Leave
          </Button>
        </div>
      </div>

        {/* Profile Status */}
        {profile?.status !== 'ACTIVE' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <GlowCard className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserCheck className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Account Status: {profile?.status}
                    </h3>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
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
                <div className="card bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="card-header p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="card-title text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                      Today's Sessions
                    </h3>
                  </div>
                  <div className="card-content p-6">
                    {bookingsLoading ? (
                      <div className="text-center py-8">
                        <LoadingSpinner className="mx-auto mb-2" />
                        <p className="text-gray-600 dark:text-gray-300">Loading sessions...</p>
                      </div>
                    ) : todayBookings.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Calendar className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No sessions today</h3>
                        <p className="text-gray-600 dark:text-gray-300">Your schedule is free today. Create time slots to start booking sessions.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {todayBookings.map((booking: Booking, index) => (
                          <motion.div
                            key={booking.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex flex-col p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-100 dark:border-blue-800 hover:shadow-md transition-all duration-300"
                          >
                            <div className="flex items-center space-x-3 mb-3">
                              <Avatar className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600">
                                <AvatarFallback className="text-white font-bold text-sm">
                                  {booking.child?.name ? booking.child.name.charAt(0).toUpperCase() : 'C'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                  {booking.child?.name || 'Child details hidden'}
                                </h4>
                                <p className="text-xs text-gray-600 dark:text-gray-300">Parent: {booking.parent.name}</p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Badge variant={booking.status === 'SCHEDULED' ? "default" : "secondary"} className="text-xs">
                                  {booking.status}
                                </Badge>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(booking.timeSlot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {' '}
                                  {new Date(booking.timeSlot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              {booking.status === 'SCHEDULED' && (
                                <Button
                                  size="sm"
                                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-full text-xs py-2"
                                  onClick={() => handleJoinSession(booking.id)}
                                  disabled={joiningId === booking.id}
                                >
                                  <Video className="w-3 h-3 mr-1" />
                                  {joiningId === booking.id ? 'Starting...' : 'Start Session'}
                                </Button>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="card bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="card-header p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="card-title text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                      Quick Stats
                    </h3>
                  </div>
                  <div className="card-content p-6">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                            <Star className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Average Rating</p>
                            <p className="text-xs text-gray-600 dark:text-gray-300">Based on reviews</p>
                          </div>
                        </div>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          {profile?.averageRating.toFixed(1)}/5.0
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Rate per Session</p>
                            <p className="text-xs text-gray-600 dark:text-gray-300">Your pricing</p>
                          </div>
                        </div>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          ${profile?.baseCostPerSession}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                            <Clock className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Session Duration</p>
                            <p className="text-xs text-gray-600 dark:text-gray-300">Standard length</p>
                          </div>
                        </div>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          {profile?.slotDurationInMinutes} min
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                            <Target className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Max Daily Slots</p>
                            <p className="text-xs text-gray-600 dark:text-gray-300">Capacity limit</p>
                          </div>
                        </div>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          {profile?.maxSlotsPerDay}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sessions' && (
              <div className="card bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="card-header p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="card-title text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                    All Upcoming Sessions
                  </h3>
                </div>
                <div className="card-content p-6">
                  <CurrentSessions 
                    bookings={bookings} 
                    onJoinSession={handleJoinSession}
                    userRole="THERAPIST"
                  />
                </div>
              </div>
            )}

            {activeTab === 'schedule' && (
              <GlowCard>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center text-gray-900 dark:text-white">
                    <Clock className="h-5 w-5 mr-2 text-purple-600" />
                    My Schedule
                  </CardTitle>
                  <input
                    type="date"
                    value={selectedSlotsDate}
                    onChange={(e) => handleSlotsDateChange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </CardHeader>
                <CardContent>
                  {mySlotsLoading ? (
                    <div className="text-center py-8">
                      <LoadingSpinner className="mx-auto mb-2" />
                      <p className="text-gray-600 dark:text-gray-300">Loading slots...</p>
                    </div>
                  ) : mySlots.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No slots created for this date</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">Create time slots to start accepting bookings.</p>
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
                        <thead className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Start</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">End</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {mySlots
                            .filter((slot: any) => slot.isActive || slot.isBooked)
                            .map((slot: any) => (
                            <tr key={slot.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
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
                  <CardTitle className="flex items-center text-gray-900 dark:text-white">
                    <User className="h-5 w-5 mr-2 text-blue-600" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
                        <p className="text-gray-900 dark:text-white font-semibold text-lg">{profile?.name}</p>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl">
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Specialization</label>
                        <p className="text-gray-900 dark:text-white font-semibold text-lg">{profile?.specialization}</p>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Experience</label>
                        <p className="text-gray-900 dark:text-white font-semibold text-lg">{profile?.experience} years</p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl">
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Base Cost</label>
                        <p className="text-gray-900 dark:text-white font-semibold text-lg">${profile?.baseCostPerSession}/session</p>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl">
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Rating</label>
                        <p className="text-gray-900 dark:text-white font-semibold text-lg">{profile?.averageRating.toFixed(1)}/5.0</p>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl">
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Schedule Settings</label>
                        <p className="text-gray-900 dark:text-white font-semibold text-lg">
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
              <CardTitle className="flex items-center text-gray-900 dark:text-white">
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
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No upcoming sessions</h3>
                  <p className="text-gray-600 dark:text-gray-300">Create time slots to start accepting bookings from parents.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {allUpcomingBookings.map((booking: Booking, index) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl border border-green-100 dark:border-green-800 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12 bg-gradient-to-r from-green-500 to-blue-600">
                          <AvatarFallback className="text-white font-bold">
                            {booking.child?.name ? booking.child.name.charAt(0).toUpperCase() : 'C'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {booking.child?.name || 'Child details hidden'}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Parent: {booking.parent.name}</p>
                          {booking.child?.age && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">Age: {booking.child.age}</p>
                          )}
                          <p className="text-sm text-gray-500 dark:text-gray-400">
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