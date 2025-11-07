import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { parentAPI, bookingAPI } from '../lib/api'
import { X, Calendar, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

interface BookSessionModalProps {
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
}

interface TimeSlot {
  id: string
  startTime: string
  endTime: string
}

interface BookingFormData {
  childId: string
  therapistId: string
  date: string
  timeSlotId: string
}

const BookSessionModal: React.FC<BookSessionModalProps> = ({ onClose, onSuccess, therapistId }) => {
  const queryClient = useQueryClient()
  const [selectedTherapist, setSelectedTherapist] = useState<string>(therapistId || '')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)

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
  const selectedTimeSlotId = watch('timeSlotId')

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
    { select: (response) => response.data }
  )

  // If preselected therapist, auto fetch on date selection and keep dropdown preselected
  React.useEffect(() => {
    if (therapistId) setSelectedTherapist(therapistId)
  }, [therapistId])

  const fetchAvailableSlots = async (therapistId: string, date: string) => {
    if (!therapistId || !date) return
    
    setLoadingSlots(true)
    try {
      // Ensure date is in YYYY-MM-DD format
      let ymd = date
      if (date.length > 10) {
        ymd = date.slice(0, 10)
      }
      
      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(ymd)) {
        throw new Error(`Invalid date format: ${ymd}. Expected YYYY-MM-DD`)
      }
      
      console.log('[BookSessionModal] fetching slots', { therapistId, date: ymd })
      const response = await bookingAPI.getAvailableSlots(therapistId, ymd)
      console.log('[BookSessionModal] slots response', response.data)
      setAvailableSlots(response.data)
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Failed to fetch available slots'
      console.error('[BookSessionModal] slots error:', error?.response?.data || error)
      toast.error(msg)
      setAvailableSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }

  const handleTherapistChange = (therapistId: string) => {
    setSelectedTherapist(therapistId)
    setValue('therapistId', therapistId, { shouldValidate: true })
    setAvailableSlots([])
    if (selectedDate) {
      fetchAvailableSlots(therapistId, selectedDate)
    }
  }

  const handleDateChange = (date: string) => {
    if (!date) {
      setSelectedDate('')
      setValue('date', '')
      setAvailableSlots([])
      return
    }
    
    // Normalize to strict YYYY-MM-DD without timezone conversion
    let normalized = date.trim()
    
    // If date is longer than 10 characters, take first 10
    if (normalized.length > 10) {
      normalized = normalized.slice(0, 10)
    }
    
    // Set the date in both state and react-hook-form
    setSelectedDate(normalized)
    setValue('date', normalized, { shouldValidate: true })
    
    // Just set the date - let the browser's date input handle validation
    // Only validate when we have a complete, valid-looking date
    const isoYMD = /^\d{4}-\d{2}-\d{2}$/
    
    if (isoYMD.test(normalized)) {
      // We have a complete date format, validate it
      const parts = normalized.split('-')
      const year = parseInt(parts[0], 10)
      const month = parseInt(parts[1], 10)
      const day = parseInt(parts[2], 10)
      
      // Only validate if all parts are valid numbers
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        // Validate year range only for complete 4-digit years
        if (year >= 2000 && year <= 2100) {
          // Validate the date is valid (checks for invalid dates like Feb 30)
          const testDate = new Date(`${normalized}T00:00:00.000Z`)
          if (!isNaN(testDate.getTime())) {
            // Double-check that the date parses correctly (using local time)
            const parsedYear = testDate.getFullYear()
            const parsedMonth = testDate.getMonth() + 1
            const parsedDay = testDate.getDate()
            
            // Verify the date didn't get adjusted
            if (parsedYear === year && parsedMonth === month && parsedDay === day) {
              // Date is valid, fetch slots
              console.log('[BookSessionModal] Setting date to:', normalized)
              if (selectedTherapist) {
                fetchAvailableSlots(selectedTherapist, normalized)
              }
              return
            }
          }
        }
      }
    }
  }

  const bookSlotMutation = useMutation(
    ({ timeSlotId, childId }: { timeSlotId: string; childId: string }) =>
      bookingAPI.createBooking({ timeSlotId, childId }),
    {
      onSuccess: () => {
        console.log('[BookSessionModal] Booking successful!')
        toast.success('Session booked successfully!')
        
        // Invalidate and refetch bookings for both parent and therapist
        queryClient.invalidateQueries('parentBookings')
        queryClient.invalidateQueries('therapistBookings')
        queryClient.invalidateQueries('childBookings')
        
        // Close modal first
        onClose()
        // Reset form state after a brief delay to ensure modal closes
        setTimeout(() => {
          setSelectedDate('')
          setSelectedTherapist(therapistId || '')
          setAvailableSlots([])
          reset({
            childId: '',
            therapistId: therapistId || '',
            date: '',
            timeSlotId: '',
          })
        }, 100)
        // Notify parent component to refresh data
        onSuccess()
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to book session'
        console.error('[BookSessionModal] Booking error:', error, error.response?.data)
        toast.error(errorMessage)
      },
    }
  )

  const onSubmit = (data: BookingFormData) => {
    console.log('[BookSessionModal] Submitting booking:', { 
      timeSlotId: data.timeSlotId, 
      childId: data.childId,
      therapistId: data.therapistId,
      date: data.date
    })
    
    if (!data.timeSlotId) {
      toast.error('Please select a time slot before booking')
      return
    }
    
    if (!data.childId) {
      toast.error('Please select a child before booking')
      return
    }
    
    bookSlotMutation.mutate({
      timeSlotId: data.timeSlotId,
      childId: data.childId,
    })
  }

  const selectedTherapistData = therapists.find((t: Therapist) => t.id === selectedTherapist)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-black dark:border dark:border-gray-700 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg flex-shrink-0">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate">Book Therapy Session</h2>
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
            <label htmlFor="childId" className="block text-sm font-medium text-gray-700 mb-1">
              Select Child *
            </label>
            <select
              {...register('childId', { required: 'Please select a child' })}
              className="input"
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
            <label htmlFor="therapistId" className="block text-sm font-medium text-gray-700 mb-1">
              Select Therapist *
            </label>
            <select
              {...register('therapistId', { required: 'Please select a therapist' })}
              onChange={(e) => handleTherapistChange(e.target.value)}
              value={selectedTherapist}
              className="input"
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

          {/* Select Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Select Date *
            </label>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={selectedDate}
              {...register('date', { 
                required: 'Please select a date',
              })}
              onChange={(e) => {
                const value = e.target.value
                console.log('[BookSessionModal] Date input changed:', value)
                if (value) {
                  handleDateChange(value)
                } else {
                  setSelectedDate('')
                  setValue('date', '')
                  setAvailableSlots([])
                }
              }}
              className="input"
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
            )}
          </div>

          {/* Available Time Slots */}
          {selectedTherapist && selectedDate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Available Time Slots *
              </label>
              {loadingSlots ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading available slots...</p>
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="text-center py-4">
                  <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">No available slots for this date</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {availableSlots.map((slot) => {
                    // Extract UTC time and display as local time
                    // Use the local time representation directly from the Date object
                    // JavaScript Date automatically converts UTC to local time when we call getHours() and getMinutes()
                    const slotDate = new Date(slot.startTime)
                    const localHours = slotDate.getHours()
                    const localMinutes = slotDate.getMinutes()
                    
                    // Create a date with local hours/minutes to display correctly
                    const displayDate = new Date(2000, 0, 1, localHours, localMinutes)
                    const displayTime = displayDate.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true
                    })
                    
                    return (
                      <label key={slot.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          {...register('timeSlotId', { required: 'Please select a time slot' })}
                          type="radio"
                          value={slot.id}
                          className="text-primary-600"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {displayTime}
                          </div>
                          <div className="text-xs text-gray-500">
                            Duration: 1 hour
                          </div>
                        </div>
                      </label>
                    )
                  })}
                </div>
              )}
              {errors.timeSlotId && (
                <p className="mt-1 text-sm text-red-600">{errors.timeSlotId.message}</p>
              )}
            </div>
          )}

          {/* Session Summary */}
          {selectedTherapistData && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Session Summary</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>Therapist:</strong> {selectedTherapistData.name}</p>
                <p><strong>Specialization:</strong> {selectedTherapistData.specialization}</p>
                <p><strong>Cost:</strong> ${selectedTherapistData.baseCostPerSession}/session</p>
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
              disabled={bookSlotMutation.isLoading || !selectedTherapist || !selectedDate || !selectedTimeSlotId}
              className="btn btn-primary flex-1"
            >
              {bookSlotMutation.isLoading ? 'Booking...' : 'Book Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BookSessionModal

