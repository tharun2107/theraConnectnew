import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { motion } from 'framer-motion'
import { bookingAPI, parentAPI } from '../lib/api'
import { 
  Calendar, 
  Clock, 
  Repeat,
  Plus,
  X,
  Trash2,
  ChevronRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { LoadingSpinner } from '../components/ui/loading-spinner'
import toast from 'react-hot-toast'

interface RecurringBooking {
  id: string
  isActive: boolean
  createdAt: string
  recurrencePattern: 'DAILY' | 'WEEKLY'
  dayOfWeek?: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY'
  slotTime: string
  startDate: string
  endDate: string
  child: {
    id: string
    name: string
    age: number
  }
  therapist: {
    id: string
    name: string
    specialization: string
  }
  bookings: Array<{
    id: string
    status: string
    timeSlot: {
      startTime: string
      endTime: string
    }
  }>
}

interface CreateRecurringBookingModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const CreateRecurringBookingModal: React.FC<CreateRecurringBookingModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    childId: '',
    therapistId: '',
    slotTime: '',
    recurrencePattern: 'DAILY' as 'DAILY' | 'WEEKLY',
    dayOfWeek: '' as string,
    startDate: '',
    endDate: '',
  })

  const { data: children = [] } = useQuery('parentChildren', parentAPI.getChildren, {
    select: (response) => response.data
  })

  const { data: therapists = [] } = useQuery('activeTherapists', parentAPI.getActiveTherapists, {
    select: (response) => response.data
  })

  const createMutation = useMutation(bookingAPI.createRecurringBooking, {
    onSuccess: () => {
      // Invalidate bookings queries to update all dashboards
      queryClient.invalidateQueries('recurringBookings')
      queryClient.invalidateQueries('parentBookings')
      queryClient.invalidateQueries('therapistBookings')
      queryClient.invalidateQueries('allBookings') // For AdminDashboard/AdminAnalytics
      toast.success('Recurring booking created successfully!')
      onSuccess()
      onClose()
      setFormData({
        childId: '',
        therapistId: '',
        slotTime: '',
        recurrencePattern: 'DAILY',
        dayOfWeek: '',
        startDate: '',
        endDate: '',
      })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create recurring booking')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.childId || !formData.therapistId || !formData.slotTime || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required fields')
      return
    }

    if (formData.recurrencePattern === 'WEEKLY' && !formData.dayOfWeek) {
      toast.error('Please select a day of week for weekly recurring booking')
      return
    }

    createMutation.mutate({
      childId: formData.childId,
      therapistId: formData.therapistId,
      slotTime: formData.slotTime,
      recurrencePattern: formData.recurrencePattern,
      dayOfWeek: formData.recurrencePattern === 'WEEKLY' ? formData.dayOfWeek as any : undefined,
      startDate: formData.startDate,
      endDate: formData.endDate,
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-black dark:border dark:border-gray-700 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Create Recurring Booking</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Child *
              </label>
              <select
                value={formData.childId}
                onChange={(e) => setFormData({ ...formData, childId: e.target.value })}
                className="input"
                required
              >
                <option value="">Select child</option>
                {children.map((child: any) => (
                  <option key={child.id} value={child.id}>{child.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Therapist *
              </label>
              <select
                value={formData.therapistId}
                onChange={(e) => setFormData({ ...formData, therapistId: e.target.value })}
                className="input"
                required
              >
                <option value="">Select therapist</option>
                {therapists.map((therapist: any) => (
                  <option key={therapist.id} value={therapist.id}>
                    {therapist.name} - {therapist.specialization}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Time (HH:mm) *
              </label>
              <input
                type="time"
                value={formData.slotTime}
                onChange={(e) => setFormData({ ...formData, slotTime: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Recurrence Pattern *
              </label>
              <select
                value={formData.recurrencePattern}
                onChange={(e) => setFormData({ ...formData, recurrencePattern: e.target.value as any, dayOfWeek: '' })}
                className="input"
                required
              >
                <option value="DAILY">Daily (Weekdays only)</option>
                <option value="WEEKLY">Weekly</option>
              </select>
            </div>

            {formData.recurrencePattern === 'WEEKLY' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Day of Week *
                </label>
                <select
                  value={formData.dayOfWeek}
                  onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">Select day</option>
                  <option value="MONDAY">Monday</option>
                  <option value="TUESDAY">Tuesday</option>
                  <option value="WEDNESDAY">Wednesday</option>
                  <option value="THURSDAY">Thursday</option>
                  <option value="FRIDAY">Friday</option>
                  <option value="SATURDAY">Saturday</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date *
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                min={formData.startDate || new Date().toISOString().split('T')[0]}
                className="input"
                required
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isLoading}
              className="btn btn-primary flex-1"
            >
              {createMutation.isLoading ? 'Creating...' : 'Create Recurring Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const RecurringBookings: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const queryClient = useQueryClient()

  const { data: recurringBookingsData, isLoading } = useQuery(
    'recurringBookings',
    bookingAPI.getRecurringBookings,
    {
      select: (response) => response.data?.recurringBookings || []
    }
  )

  const cancelMutation = useMutation(bookingAPI.cancelRecurringBooking, {
    onSuccess: () => {
      toast.success('Recurring booking cancelled successfully')
      queryClient.invalidateQueries('recurringBookings')
      queryClient.invalidateQueries('parentBookings')
      queryClient.invalidateQueries('therapistBookings')
      queryClient.invalidateQueries('allBookings') // For AdminDashboard/AdminAnalytics
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel recurring booking')
    },
  })

  const handleCancel = (recurringBookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this recurring booking? All future sessions will be cancelled.')) {
      cancelMutation.mutate(recurringBookingId)
    }
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  const recurringBookings = recurringBookingsData as RecurringBooking[] || []

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
                Recurring Bookings
              </h1>
              <p className="text-[#4D4D4D] dark:text-gray-300 text-base sm:text-lg">
                Manage your recurring therapy sessions
              </p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-black hover:bg-[#1A1A1A] text-white shadow-gentle hover:shadow-calm transition-all duration-300"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Recurring Booking
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Recurring Bookings List */}
      {recurringBookings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-white dark:bg-black shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
            <CardContent className="p-12 text-center">
              <Repeat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No recurring bookings yet
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Create a recurring booking to schedule regular therapy sessions for your child.
              </p>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Recurring Booking
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {recurringBookings.map((booking: RecurringBooking) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-white dark:bg-black shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
                <CardHeader className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {booking.child.name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        with {booking.therapist.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {booking.therapist.specialization}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {booking.isActive ? (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 rounded">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 rounded">
                          Cancelled
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{formatTime(booking.slotTime)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Repeat className="h-4 w-4 mr-2" />
                      <span>
                        {booking.recurrencePattern === 'DAILY' 
                          ? 'Daily (Weekdays)' 
                          : `Weekly (${booking.dayOfWeek})`}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span>{booking.bookings?.length || 0} sessions scheduled</span>
                    </div>
                  </div>
                  {booking.isActive && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancel(booking.id)}
                        disabled={cancelMutation.isLoading}
                        className="w-full border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Cancel Recurring Booking
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateRecurringBookingModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            queryClient.invalidateQueries('recurringBookings')
            queryClient.invalidateQueries('parentBookings')
          }}
        />
      )}
    </div>
  )
}

export default RecurringBookings

