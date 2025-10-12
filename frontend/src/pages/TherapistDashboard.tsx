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
  Settings, 
  DollarSign
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { StatsCard } from '../components/ui/stats-card'
import { GlowCard } from '../components/ui/glow-card'
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
  const [showRequestLeaveModal, setShowRequestLeaveModal] = useState(false)
  const [selectedSlotsDate, setSelectedSlotsDate] = useState<string>(new Date().toISOString().slice(0,10))
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
    } catch (error) {
      console.error('Error joining session:', error)
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
  const totalEarnings = bookings
    .filter((booking: Booking) => booking.status === 'COMPLETED')
    .reduce((sum: number) => sum + (profile?.baseCostPerSession || 0), 0)

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
    },
    {
      title: 'Total Earnings',
      value: `$${totalEarnings}`,
      icon: DollarSign,
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
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-purple-600/10 dark:from-purple-600/20 dark:via-blue-600/20 dark:to-purple-600/20 rounded-2xl" />
        <div className="relative p-8">
      <div className="flex items-center justify-between">
        <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome back, <GradientText>{profile?.name || 'Therapist'}</GradientText>!
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Ready to make a difference in your patients' lives today?
              </p>
        </div>
            <div className="hidden md:flex items-center space-x-4">
          <Button
            onClick={() => setShowCreateSlotsModal(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
                <Plus className="h-4 w-4 mr-2" />
            Create Time Slots
          </Button>
          <Button
                variant="outline"
            onClick={() => setShowRequestLeaveModal(true)}
                className="border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-900/20"
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
                    userRole="THERAPIST"
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
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Children you've worked with and their consent status
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <TherapistChildrenView />
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

      {/* Schedule Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
              <GlowCard>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center text-gray-900 dark:text-white">
                    <Clock className="h-5 w-5 mr-2 text-purple-600" />
                    My Schedule
                  </CardTitle>
            <div className="flex items-center space-x-2">
                  <input
                    type="date"
                    value={selectedSlotsDate}
                    onChange={(e) => handleSlotsDateChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <Button
                onClick={() => setShowCreateSlotsModal(true)}
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-1" />
                Create Slots
              </Button>
            </div>
                </CardHeader>
                <CardContent>
                  {mySlotsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                <span className="ml-2 text-gray-600">Loading slots...</span>
                    </div>
                  ) : mySlots.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium mb-2">No slots for this date</p>
                <p className="text-sm">Create time slots to start accepting bookings.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Start</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">End</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {mySlots.map((slot: any) => (
                      <tr key={slot.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={slot.isActive ? "default" : "secondary"}>
                            {slot.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Button
                            size="sm"
                            variant={slot.isActive ? "outline" : "default"}
                            onClick={() => {
                              // Toggle slot status
                              console.log('Toggle slot:', slot.id)
                            }}
                          >
                            {slot.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                        </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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
            setShowRequestLeaveModal(false)
          }}
        />
      )}
    </div>
  )
}

export default TherapistDashboard