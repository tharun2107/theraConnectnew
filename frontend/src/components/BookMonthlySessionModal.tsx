import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { parentAPI, bookingAPI } from '../lib/api'
import { X, Calendar, Clock, Loader2 } from 'lucide-react'
import { Button } from './ui/button'
import { LoadingSpinner } from './ui/loading-spinner'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

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

  // Simple availability check - check a few key dates (same logic as therapist dashboard)
  const [slotAvailability, setSlotAvailability] = useState<{ [slotTime: string]: boolean }>({})

  // Load ACTIVE therapists from backend (declare before using in useMemo below)
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

  // Find selected therapist data - only after therapists are loaded
  const selectedTherapistData = React.useMemo(() => {
    if (!selectedTherapist || !therapists || therapists.length === 0) return null
    return therapists.find((t: Therapist) => t.id === selectedTherapist) || null
  }, [selectedTherapist, therapists])

  const availableSlots = selectedTherapistData?.availableSlotTimes || []

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

  // Check slot availability when start date or therapist changes (simple check - 3 key dates)
  React.useEffect(() => {
    // Don't check if required data is missing
    if (!selectedTherapist || !selectedStartDate || !availableSlots || availableSlots.length === 0) {
      setSlotAvailability({})
      return
    }

    // Validate start date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(selectedStartDate)) {
      setSlotAvailability({})
      return
    }

    const checkAvailability = async () => {
      try {
        const end = calculateEndDate(selectedStartDate)
        if (!end) {
          setSlotAvailability({})
          return
        }

        const start = new Date(selectedStartDate + 'T00:00:00')
        const endDateObj = new Date(end + 'T23:59:59')
        
        // Validate dates
        if (isNaN(start.getTime()) || isNaN(endDateObj.getTime())) {
          console.error('[BookMonthlySessionModal] Invalid date range')
          setSlotAvailability({})
          return
        }
        
        // Check 3 key dates: start, middle, end (much faster than checking all dates)
        const datesToCheck: string[] = []
        
        // Start date
        datesToCheck.push(selectedStartDate)
        
        // Middle date
        const midDate = new Date(start)
        midDate.setDate(midDate.getDate() + Math.floor((endDateObj.getTime() - start.getTime()) / (2 * 24 * 60 * 60 * 1000)))
        // Find next weekday if middle is weekend
        while (midDate <= endDateObj && (midDate.getDay() === 0 || midDate.getDay() === 6)) {
          midDate.setDate(midDate.getDate() + 1)
        }
        if (midDate <= endDateObj) {
          datesToCheck.push(midDate.toISOString().split('T')[0])
        }
        
        // End date (if it's a weekday)
        const endDayOfWeek = endDateObj.getDay()
        if (endDayOfWeek !== 0 && endDayOfWeek !== 6) {
          datesToCheck.push(end)
        }

        // Check each slot time
        const availabilityMap: { [slotTime: string]: boolean } = {}
        
        for (const slotTime of availableSlots) {
          try {
            const [hours, minutes] = slotTime.split(':').map(Number)
            if (isNaN(hours) || isNaN(minutes)) {
              console.error(`[BookMonthlySessionModal] Invalid slot time format: ${slotTime}`)
              continue
            }

            let isBooked = false
            
            // Check each date - if ANY date shows booked, mark as unavailable
            for (const date of datesToCheck) {
              try {
                const response = await bookingAPI.getAvailableSlots(selectedTherapist, date)
                const slots = response.data || []
                
                // Find slot for this time
                const slotForTime = slots.find((s: any) => {
                  if (!s || !s.startTime) return false
                  const slotDate = new Date(s.startTime)
                  if (isNaN(slotDate.getTime())) return false
                  const slotHours = slotDate.getUTCHours()
                  const slotMinutes = slotDate.getUTCMinutes()
                  return slotHours === hours && slotMinutes === minutes
                })
                
                // Check if booked - use isBooked flag or booking relationship
                if (slotForTime && (slotForTime.isBooked || (slotForTime.booking && slotForTime.booking.id))) {
                  isBooked = true
                  break // No need to check other dates if one is booked
                }
              } catch (error) {
                console.error(`[BookMonthlySessionModal] Error checking slot ${slotTime} for ${date}:`, error)
                // Continue checking other dates even if one fails
              }
            }
            
            availabilityMap[slotTime] = isBooked
          } catch (error) {
            console.error(`[BookMonthlySessionModal] Error processing slot ${slotTime}:`, error)
          }
        }
        
        setSlotAvailability(availabilityMap)
      } catch (error) {
        console.error('[BookMonthlySessionModal] Error in availability check:', error)
        setSlotAvailability({})
      }
    }

    checkAvailability()
  }, [selectedTherapist, selectedStartDate, availableSlots])

  const { data: children = [] } = useQuery(
    'children',
    parentAPI.getChildren,
    {
      select: (response) => response.data,
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
      {/* Loading Overlay */}
      <AnimatePresence>
        {bookMonthlyMutation.isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4"
            >
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                  <Loader2 className="h-16 w-16 animate-spin text-blue-600 dark:text-blue-400" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-12 w-12 rounded-full border-4 border-blue-200 dark:border-blue-800 border-t-transparent animate-spin"></div>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Booking Monthly Sessions
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Please wait while we create all sessions for the month...
                  </p>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-600 dark:bg-blue-400 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-black dark:border dark:border-gray-700 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
      >
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
                    
                    // Simple check: if slot is marked as booked in availability map, it's unavailable
                    const isUnavailable = slotAvailability[time] === true
                    
                    return (
                      <label 
                        key={time} 
                        className={`flex items-center space-x-3 p-3 border rounded-lg transition-all relative ${
                          isUnavailable
                            ? 'opacity-60 bg-red-50 dark:bg-red-900/30 border-red-400 dark:border-red-600 cursor-not-allowed'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-300 dark:border-gray-700 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500'
                        }`}
                        title={
                          isUnavailable
                            ? `This slot is already booked for some dates in the selected range. For monthly recurring bookings, all dates must be available.`
                            : 'Available for the complete month'
                        }
                      >
                        <input
                          {...register('slotTime', { required: 'Please select a time slot' })}
                          type="radio"
                          value={time}
                          className={`text-primary-600 focus:ring-2 focus:ring-primary-500 ${
                            isUnavailable ? 'cursor-not-allowed opacity-50' : ''
                          }`}
                          disabled={isUnavailable}
                        />
                        <div className="flex-1">
                          <div className={`text-sm font-medium ${
                            isUnavailable
                              ? 'text-red-700 dark:text-red-300 line-through'
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {displayTime}
                          </div>
                          <div className={`text-xs font-medium ${
                            isUnavailable
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {isUnavailable
                              ? '❌ Already Booked'
                              : '✅ Available for Complete Month'
                            }
                          </div>
                        </div>
                        {isUnavailable && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 dark:bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white text-xs font-bold">✕</span>
                          </div>
                        )}
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
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={bookMonthlyMutation.isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={bookMonthlyMutation.isLoading || !selectedTherapist || !selectedStartDate || !selectedSlotTime || !selectedChildId}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
            >
              {bookMonthlyMutation.isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Booking Sessions...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>Book Monthly Sessions</span>
                </span>
              )}
              {bookMonthlyMutation.isLoading && (
                <motion.div
                  className="absolute inset-0 bg-blue-700/20"
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default BookMonthlySessionModal

