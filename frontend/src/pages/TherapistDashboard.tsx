import React, { useState } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { therapistAPI, bookingAPI } from '../lib/api'
import { Calendar, Clock, Users, Plus, UserCheck } from 'lucide-react'
import CreateTimeSlotsModal from '../components/CreateTimeSlotsModal'
import RequestLeaveModal from '../components/RequestLeaveModal'

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
  const queryClient = useQueryClient()

  const { data: profile, isLoading: profileLoading } = useQuery(
    'therapistProfile',
    therapistAPI.getProfile,
    {
      select: (response) => response.data,
    }
  )

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery(
    'therapistBookings',
    bookingAPI.getMyBookings,
    {
      select: (response) => response.data,
    }
  )

  const upcomingBookings = bookings.filter((booking: Booking) => 
    new Date(booking.timeSlot.startTime) > new Date()
  ).slice(0, 5)

  const todayBookings = bookings.filter((booking: Booking) => {
    const bookingDate = new Date(booking.timeSlot.startTime)
    const today = new Date()
    return bookingDate.toDateString() === today.toDateString()
  })

  // Fetch my slots for selected date
  const { data: mySlots = [], isLoading: mySlotsLoading, refetch: refetchMySlots } = useQuery(
    ['therapistSlots', selectedSlotsDate],
    () => therapistAPI.getMySlots(selectedSlotsDate),
    { select: (response) => response.data }
  )

  const handleSlotsDateChange = (val: string) => {
    // Normalize to YYYY-MM-DD (input type=date already provides this format)
    setSelectedSlotsDate(val)
  }

  const stats = [
    {
      name: 'Today\'s Sessions',
      value: todayBookings.length,
      icon: Calendar,
      color: 'bg-blue-500',
    },
    {
      name: 'Upcoming Sessions',
      value: upcomingBookings.length,
      icon: Clock,
      color: 'bg-green-500',
    },
    {
      name: 'Total Bookings',
      value: bookings.length,
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      name: 'Leaves Remaining',
      value: profile?.leavesRemainingThisMonth || 0,
      icon: UserCheck,
      color: 'bg-orange-500',
    },
  ]

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Therapist Dashboard</h1>
          <p className="text-gray-600">Manage your schedule and sessions</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCreateSlotsModal(true)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Time Slots</span>
          </button>
          <button
            onClick={() => setShowRequestLeaveModal(true)}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <UserCheck className="h-4 w-4" />
            <span>Request Leave</span>
          </button>
        </div>
      </div>

      {/* Profile Status */}
      {profile?.status !== 'ACTIVE' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
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
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Profile Information</h3>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-gray-900">{profile?.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Specialization</label>
                <p className="text-gray-900">{profile?.specialization}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Experience</label>
                <p className="text-gray-900">{profile?.experience} years</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Base Cost</label>
                <p className="text-gray-900">${profile?.baseCostPerSession}/session</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Rating</label>
                <p className="text-gray-900">{profile?.averageRating.toFixed(1)}/5.0</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Schedule Settings</label>
                <p className="text-gray-900">
                  Start: {profile?.scheduleStartTime} | 
                  Duration: {profile?.slotDurationInMinutes}min | 
                  Max slots: {profile?.maxSlotsPerDay}/day
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Sessions */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Today's Sessions</h3>
          </div>
          <div className="card-content">
            {bookingsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading sessions...</p>
              </div>
            ) : todayBookings.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No sessions today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayBookings.map((booking: Booking) => (
                  <div key={booking.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{booking.child?.name || 'Child details hidden'}</h4>
                        <p className="text-sm text-gray-600">
                          Parent: {booking.parent.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(booking.timeSlot.startTime).toLocaleTimeString()} - {' '}
                          {new Date(booking.timeSlot.endTime).toLocaleTimeString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        booking.status === 'SCHEDULED' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* My Slots for Date */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h3 className="card-title">My Slots</h3>
          <input
            type="date"
            value={selectedSlotsDate}
            onChange={(e) => handleSlotsDateChange(e.target.value)}
            className="input max-w-xs"
          />
        </div>
        <div className="card-content">
          {mySlotsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading slots...</p>
            </div>
          ) : mySlots.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No slots created for this date</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mySlots.map((slot: any) => (
                    <tr key={slot.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${slot.isBooked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                          {slot.isBooked ? 'Booked' : 'Available'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Upcoming Sessions</h3>
        </div>
        <div className="card-content">
          {upcomingBookings.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No upcoming sessions</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Child
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Parent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {upcomingBookings.map((booking: Booking) => (
                    <tr key={booking.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {booking.child?.name || 'Child details hidden'}
                          </div>
                          {booking.child?.age !== undefined && (
                            <div className="text-sm text-gray-500">Age: {booking.child.age}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.parent.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(booking.timeSlot.startTime).toLocaleDateString()} at{' '}
                        {new Date(booking.timeSlot.startTime).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          booking.status === 'SCHEDULED' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
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
