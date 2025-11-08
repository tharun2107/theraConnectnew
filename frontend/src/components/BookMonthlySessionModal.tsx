import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { parentAPI, bookingAPI } from '../lib/api'
import { X, Calendar, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

interface BookMonthlySessionModalProps {
  onClose: () => void
  onSuccess: () => void
  therapistId?: string
}

interface Child {
  id: string
  name: string
  age: number
}

interface Therapist {
  id: string
  name: string
  specialization: string
  baseCostPerSession: number
  availableSlotTimes?: string[] // Array of time strings like ["09:00", "10:00", ...]
}

interface BookingFormData {
  childId: string
  therapistId: string
  slotTime: string // HH:mm format
  startDate: string // YYYY-MM-DD
}

const BookMonthlySessionModal: React.FC<BookMonthlySessionModalProps> = ({ onClose, onSuccess, therapistId }) => {
  const queryClient = useQueryClient()
  const [selectedTherapist, setSelectedTherapist] = useState<string>(therapistId || '')
  const [selectedStartDate, setSelectedStartDate] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm<BookingFormData>({
    defaultValues: {
      therapistId: therapistId || '',
    },
  })
  const selectedSlotTime = watch('slotTime')
  const selectedChildId = watch('childId')

  const { data: children = [] } = useQuery(
    'children',
    parentAPI.getChildren,
    {
      select: (response) => response.data,
    }
  )

  // Load ACTIVE therapists from backend
  const { data: therapists = [], isLoading: loadingTherapists } = useQuery(
    'activeTherapists',
    parentAPI.getActiveTherapists,
    { 
      select: (response) => {
        console.log('[BookMonthlySessionModal] API Response:', response)
        console.log('[BookMonthlySessionModal] Response data:', response.data)
        // Handle both direct array and wrapped response
        const therapistsData = Array.isArray(response.data) ? response.data : (response.data?.data || response.data || [])
        console.log('[BookMonthlySessionModal] Therapists data:', therapistsData)
        therapistsData.forEach((t: any) => {
          console.log(`[BookMonthlySessionModal] Therapist ${t.name}:`, {
            id: t.id,
            availableSlotTimes: t.availableSlotTimes,
            hasSlots: Array.isArray(t.availableSlotTimes) && t.availableSlotTimes.length > 0
          })
        })
        return therapistsData
      }
    }
  )

  // If preselected therapist, auto set
  React.useEffect(() => {
    if (therapistId) setSelectedTherapist(therapistId)
  }, [therapistId])

  const handleTherapistChange = (therapistId: string) => {
    setSelectedTherapist(therapistId)
    setValue('therapistId', therapistId, { shouldValidate: true })
    setValue('slotTime', '') // Reset slot time when therapist changes
  }

  const handleStartDateChange = (date: string) => {
    if (!date) {
      setSelectedStartDate('')
      setValue('startDate', '')
      return
    }
    
    // Normalize to strict YYYY-MM-DD
    let normalized = date.trim()
    if (normalized.length > 10) {
      normalized = normalized.slice(0, 10)
    }
    
    // Check if selected date is a weekend
    const dateObj = new Date(normalized + 'T00:00:00')
    const dayOfWeek = dateObj.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      toast.error('Bookings cannot start on weekends (Saturday and Sunday). Please select a weekday.')
      setSelectedStartDate('')
      setValue('startDate', '')
      return
    }
    
    setSelectedStartDate(normalized)
    setValue('startDate', normalized, { shouldValidate: true })
  }

  // Calculate end date (exactly one month from start date, minus 1 day)
  // Example: Nov 7 -> Dec 6 (complete month from booking date)
  const calculateEndDate = (startDate: string): string => {
    if (!startDate) return ''
    const start = new Date(startDate)
    const end = new Date(start)
    
    // Add one month
    end.setMonth(end.getMonth() + 1)
    
    // Subtract one day to get the day before the same date next month
    // This gives us a complete month: Nov 7 -> Dec 6
    end.setDate(end.getDate() - 1)
    
    return end.toISOString().split('T')[0]
  }

  const endDate = selectedStartDate ? calculateEndDate(selectedStartDate) : ''

  const bookMonthlyMutation = useMutation(
    (data: BookingFormData) => {
      const endDateCalculated = calculateEndDate(data.startDate)
      return bookingAPI.createRecurringBooking({
        childId: data.childId,
        therapistId: data.therapistId,
        slotTime: data.slotTime,
        recurrencePattern: 'DAILY', // Always DAILY for monthly bookings
        startDate: data.startDate,
        endDate: endDateCalculated,
      })
    },
    {
      onSuccess: () => {
        console.log('[BookMonthlySessionModal] Monthly booking successful!')
        toast.success('Monthly sessions booked successfully! All sessions for the month have been created.')
        
        // Invalidate and refetch bookings
        queryClient.invalidateQueries('parentBookings')
        queryClient.invalidateQueries('therapistBookings')
        queryClient.invalidateQueries('recurringBookings')
        
        // Close modal and reset
        onClose()
        setTimeout(() => {
          setSelectedStartDate('')
          setSelectedTherapist(therapistId || '')
          reset({
            childId: '',
            therapistId: therapistId || '',
            slotTime: '',
            startDate: '',
          })
        }, 100)
        onSuccess()
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to book monthly sessions'
        console.error('[BookMonthlySessionModal] Booking error:', error, error.response?.data)
        toast.error(errorMessage)
      },
    }
  )

  const onSubmit = (data: BookingFormData) => {
    console.log('[BookMonthlySessionModal] Submitting monthly booking:', data)
    
    if (!data.slotTime) {
      toast.error('Please select a time slot')
      return
    }
    
    if (!data.childId) {
      toast.error('Please select a child')
      return
    }

    if (!data.startDate) {
      toast.error('Please select a start date')
      return
    }
    
    bookMonthlyMutation.mutate(data)
  }

  const selectedTherapistData = therapists.find((t: Therapist) => t.id === selectedTherapist)
  const availableSlots = selectedTherapistData?.availableSlotTimes || []
  
  // Debug logging
  React.useEffect(() => {
    if (selectedTherapist) {
      console.log('[BookMonthlySessionModal] Selected therapist:', selectedTherapist)
      console.log('[BookMonthlySessionModal] Therapist data:', selectedTherapistData)
      console.log('[BookMonthlySessionModal] Available slots:', availableSlots)
      console.log('[BookMonthlySessionModal] All therapists:', therapists)
    }
  }, [selectedTherapist, selectedTherapistData, availableSlots, therapists])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-black dark:border dark:border-gray-700 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg flex-shrink-0">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate">Book Monthly Sessions</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0 ml-2"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Select Child */}
          <div>
            <label htmlFor="childId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select Child *
            </label>
            <select
              {...register('childId', { required: 'Please select a child' })}
              className="input w-full"
            >
              <option value="">Choose a child</option>
              {children.map((child: Child) => (
                <option key={child.id} value={child.id}>
                  {child.name} (Age: {child.age})
                </option>
              ))}
            </select>
            {errors.childId && (
              <p className="mt-1 text-sm text-red-600">{errors.childId.message}</p>
            )}
          </div>

          {/* Select Therapist */}
          <div>
            <label htmlFor="therapistId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select Therapist *
            </label>
            <select
              {...register('therapistId', { required: 'Please select a therapist' })}
              onChange={(e) => handleTherapistChange(e.target.value)}
              value={selectedTherapist}
              className="input w-full"
            >
              <option value="">Choose a therapist</option>
              {loadingTherapists ? (
                <option value="" disabled>Loading therapists...</option>
              ) : (
                therapists.map((therapist: Therapist) => (
                <option key={therapist.id} value={therapist.id}>
                  {therapist.name} - {therapist.specialization} (${therapist.baseCostPerSession}/session)
                </option>
                ))
              )}
            </select>
            {errors.therapistId && (
              <p className="mt-1 text-sm text-red-600">{errors.therapistId.message}</p>
            )}
          </div>

          {/* Select Start Date */}
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date (Sessions will be booked for one complete month from this date) *
            </label>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={selectedStartDate}
              {...register('startDate', { 
                required: 'Please select a start date',
              })}
              onChange={(e) => {
                const value = e.target.value
                if (value) {
                  handleStartDateChange(value)
                } else {
                  setSelectedStartDate('')
                  setValue('startDate', '')
                }
              }}
              className="input w-full"
            />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
            )}
            {selectedStartDate && endDate && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Sessions will be booked from <strong>{new Date(selectedStartDate).toLocaleDateString()}</strong> to <strong>{new Date(endDate).toLocaleDateString()}</strong>
              </p>
            )}
          </div>

          {/* Available Time Slots */}
          {selectedTherapist && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select Time Slot (This time will be used for all daily sessions) *
              </label>
              {!selectedTherapistData ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Loading therapist information...</p>
                </div>
              ) : !availableSlots || availableSlots.length === 0 ? (
                <div className="text-center py-4 border border-yellow-200 dark:border-yellow-800 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-4">
                  <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">No available time slots</p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-2">
                    This therapist ({selectedTherapistData?.name}) has not set up their available time slots yet.
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    Please select another therapist who has configured their time slots, or contact this therapist to set up their availability.
                  </p>
                  {therapists.filter((t: Therapist) => t.availableSlotTimes && t.availableSlotTimes.length > 0).length > 0 && (
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-2 font-medium">
                      Tip: {therapists.filter((t: Therapist) => t.availableSlotTimes && t.availableSlotTimes.length > 0).length} other therapist(s) have time slots available.
                    </p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {availableSlots.sort().map((time: string) => {
                    // Parse time string (HH:mm) and display in 12-hour format
                    const [hours, minutes] = time.split(':').map(Number)
                    const displayDate = new Date(2000, 0, 1, hours, minutes)
                    const displayTime = displayDate.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true
                    })
                    
                    return (
                      <label key={time} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer dark:border-gray-700 transition-colors">
                        <input
                          {...register('slotTime', { required: 'Please select a time slot' })}
                          type="radio"
                          value={time}
                          className="text-primary-600 focus:ring-2 focus:ring-primary-500"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {displayTime}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Daily at this time
                          </div>
                        </div>
                      </label>
                    )
                  })}
                </div>
              )}
              {errors.slotTime && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.slotTime.message}</p>
              )}
            </div>
          )}

          {/* Session Summary */}
          {selectedTherapistData && selectedStartDate && selectedSlotTime && selectedChildId && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Booking Summary</h3>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <p><strong>Child:</strong> {children.find((c: Child) => c.id === selectedChildId)?.name}</p>
                <p><strong>Therapist:</strong> {selectedTherapistData.name}</p>
                <p><strong>Specialization:</strong> {selectedTherapistData.specialization}</p>
                <p><strong>Time Slot:</strong> {(() => {
                  const [hours, minutes] = selectedSlotTime.split(':').map(Number)
                  const displayDate = new Date(2000, 0, 1, hours, minutes)
                  return displayDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
                })()}</p>
                <p><strong>Start Date:</strong> {new Date(selectedStartDate).toLocaleDateString()}</p>
                <p><strong>End Date:</strong> {endDate ? new Date(endDate).toLocaleDateString() : 'Calculating...'}</p>
                <p><strong>Pattern:</strong> Daily (Monday to Friday)</p>
                <p><strong>Cost per session:</strong> ${selectedTherapistData.baseCostPerSession}</p>
              </div>
            </div>
          )}

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
              disabled={bookMonthlyMutation.isLoading || !selectedTherapist || !selectedStartDate || !selectedSlotTime || !selectedChildId}
              className="btn btn-primary flex-1"
            >
              {bookMonthlyMutation.isLoading ? 'Booking...' : 'Book Monthly Sessions'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BookMonthlySessionModal

