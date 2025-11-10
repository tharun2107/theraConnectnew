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

  // Slot availability and booking count - check all dates in range
  const [slotAvailability, setSlotAvailability] = useState<{ [slotTime: string]: { isBooked: boolean; bookingCount: number } }>({})
  const [checkingAvailability, setCheckingAvailability] = useState(false)

  // Load ACTIVE therapists from backend (declare before using in useMemo below)
  const { data: therapists = [], isLoading: loadingTherapists } = useQuery(
    'activeTherapists',
    parentAPI.getActiveTherapists,
    { 
      select: (response) => {
        // Handle both direct array and wrapped response
        const therapistsData = Array.isArray(response.data) ? response.data : (response.data?.data || response.data || [])
        return therapistsData
      }
    }
  )

  // Find selected therapist data - only after therapists are loaded
  const selectedTherapistData = React.useMemo(() => {
    if (!selectedTherapist || !therapists || therapists.length === 0) return null
    return therapists.find((t: Therapist) => t.id === selectedTherapist) || null
  }, [selectedTherapist, therapists])

  // Memoize availableSlots to prevent infinite re-renders
  // This ensures the array reference only changes when the therapist data actually changes
  const availableSlots = React.useMemo(() => {
    return selectedTherapistData?.availableSlotTimes || []
  }, [selectedTherapistData])

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

  // Check slot availability using SAME logic as therapist dashboard
  // Fetch all bookings for the therapist when therapist is selected
  const { data: therapistBookingsRaw = [], isLoading: loadingBookings } = useQuery(
    ['therapistBookings', selectedTherapist],
    () => bookingAPI.getTherapistBookings(selectedTherapist),
    {
      enabled: !!selectedTherapist, // Only fetch when therapist is selected
      select: (response) => response.data || [],
      onError: (error: any) => {
        console.error('[BookMonthlySessionModal] Error fetching therapist bookings:', error)
      }
    }
  )

  // Use a ref to store bookings to prevent infinite loops
  // This ensures the reference doesn't change on every render
  const therapistBookingsRef = React.useRef<any[]>([])
  
  // Update ref when bookings change (only when length or therapist changes)
  React.useEffect(() => {
    therapistBookingsRef.current = therapistBookingsRaw
  }, [therapistBookingsRaw.length, selectedTherapist])

  // Check slot availability and count bookings when start date or therapist changes
  // Use the SAME logic as therapist dashboard: filter bookings by slot time and month range
  React.useEffect(() => {
    // Don't check if required data is missing
    if (!selectedTherapist || !selectedStartDate || !availableSlots || availableSlots.length === 0) {
      setSlotAvailability({})
      return
    }

    // Don't check if bookings are still loading
    if (loadingBookings) {
      return
    }

    // Validate start date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(selectedStartDate)) {
      setSlotAvailability({})
      return
    }

    const checkAvailability = () => {
      setCheckingAvailability(true)
      try {
        const end = calculateEndDate(selectedStartDate)
        if (!end) {
          setSlotAvailability({})
          setCheckingAvailability(false)
          return
        }

        // Use UTC for date calculations to avoid timezone issues
        const start = new Date(selectedStartDate + 'T00:00:00Z')
        const endDateObj = new Date(end + 'T23:59:59Z')
        
        // Validate dates
        if (isNaN(start.getTime()) || isNaN(endDateObj.getTime())) {
          console.error('[BookMonthlySessionModal] Invalid date range')
          setSlotAvailability({})
          setCheckingAvailability(false)
          return
        }
        
        // Use the SAME logic as therapist dashboard:
        // Filter bookings by slot time and check if they're in the selected month range
        const availabilityMap: { [slotTime: string]: { isBooked: boolean; bookingCount: number } } = {}
        
        // Use bookings from ref to avoid infinite loops
        const therapistBookings = therapistBookingsRef.current
        
        console.log('[BookMonthlySessionModal] Checking bookings for therapist:', selectedTherapist)
        console.log('[BookMonthlySessionModal] Total bookings found:', therapistBookings.length)
        
        for (const slotTime of availableSlots) {
          try {
            const [hours, minutes] = slotTime.split(':').map(Number)
            if (isNaN(hours) || isNaN(minutes)) {
              continue
            }

            // UPDATED LOGIC: Check if slot is booked based on latest booking date
            // 1. Find all bookings for this time slot (regardless of date)
            // 2. Find the latest booking date for this time slot
            // 3. If selected start date is AFTER latest booking date, slot is available
            // 4. If selected start date is BEFORE or ON latest booking date, check if bookings overlap with selected month range
            
            const allBookingsForSlotTime = therapistBookings.filter((booking: any) => {
              // Check if booking has timeSlot
              if (!booking.timeSlot || !booking.timeSlot.startTime) return false
              
              // Check if booking status is SCHEDULED
              if (booking.status !== 'SCHEDULED') return false
              
              // Check if booking time matches this slot time
              const bookingDate = new Date(booking.timeSlot.startTime)
              const bookingHours = bookingDate.getHours()
              const bookingMinutes = bookingDate.getMinutes()
              return bookingHours === hours && bookingMinutes === minutes
            })
            
            // If no bookings exist for this time slot, it's available
            if (allBookingsForSlotTime.length === 0) {
              availabilityMap[slotTime] = { isBooked: false, bookingCount: 0 }
              continue
            }
            
            // Find the latest booking date for this time slot
            const latestBookingDate = allBookingsForSlotTime.reduce((latest: Date | null, booking: any) => {
              const bookingDate = new Date(booking.timeSlot.startTime)
              // Extract just the date part (ignore time)
              const bookingDateOnly = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate())
              if (!latest) return bookingDateOnly
              const latestDateOnly = new Date(latest.getFullYear(), latest.getMonth(), latest.getDate())
              return bookingDateOnly > latestDateOnly ? bookingDateOnly : latestDateOnly
            }, null)
            
            // Extract just the date part from selected start date (ignore time)
            const selectedStartDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate())
            
            // If selected start date is AFTER the latest booking date, slot is available
            if (latestBookingDate && selectedStartDateOnly > latestBookingDate) {
              availabilityMap[slotTime] = { isBooked: false, bookingCount: 0 }
              continue
            }
            
            // If selected start date is BEFORE or ON latest booking date, check if bookings overlap with selected month range
            const bookingsInRange = allBookingsForSlotTime.filter((booking: any) => {
              const bookingDate = new Date(booking.timeSlot.startTime)
              const bookingMonth = bookingDate.getMonth()
              const bookingYear = bookingDate.getFullYear()
              
              const startMonth = start.getMonth()
              const startYear = start.getFullYear()
              const endMonth = endDateObj.getMonth()
              const endYear = endDateObj.getFullYear()
              
              // Check if booking is within the month range
              const isInRange = (
                (bookingYear === startYear && bookingMonth >= startMonth) ||
                (bookingYear === endYear && bookingMonth <= endMonth) ||
                (bookingYear > startYear && bookingYear < endYear)
              )
              
              return isInRange
            })
            
            // If there are bookings in the selected month range, slot is booked
            const isBooked = bookingsInRange.length > 0
            const bookingCount = bookingsInRange.length
            
            availabilityMap[slotTime] = { isBooked, bookingCount }
          } catch (error) {
            console.error(`[BookMonthlySessionModal] Error processing slot ${slotTime}:`, error)
            availabilityMap[slotTime] = { isBooked: false, bookingCount: 0 }
          }
        }
        
        console.log('[BookMonthlySessionModal] Final availability map:', availabilityMap)
        
        setSlotAvailability(availabilityMap)
        setCheckingAvailability(false)
      } catch (error) {
        console.error('[BookMonthlySessionModal] Error in availability check:', error)
        setSlotAvailability({})
        setCheckingAvailability(false)
      }
    }

    checkAvailability()
  }, [selectedTherapist, selectedStartDate, availableSlots, therapistBookingsRaw.length, loadingBookings])

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
        
        // Invalidate and refetch bookings for all dashboards
        queryClient.invalidateQueries('parentBookings')
        queryClient.invalidateQueries('therapistBookings')
        queryClient.invalidateQueries('recurringBookings')
        queryClient.invalidateQueries('allBookings') // For AdminDashboard/AdminAnalytics
        // Also invalidate therapist bookings query used in booking modal
        queryClient.invalidateQueries(['therapistBookings', selectedTherapist])
        
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
    
    // Check if the selected slot is booked
    const slotInfo = slotAvailability[data.slotTime]
    if (slotInfo?.isBooked) {
      toast.error(`This time slot (${data.slotTime}) is already booked. Please select another time slot.`)
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {availableSlots.sort().map((time: string) => {
                    // Parse time string (HH:mm) and display in 12-hour format
                    const [hours, minutes] = time.split(':').map(Number)
                    const endHour = (hours + 1) % 24
                    const displayDate = new Date(2000, 0, 1, hours, minutes)
                    const displayTime = displayDate.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true
                    })
                    const endTimeDisplay = new Date(2000, 0, 1, endHour, 0).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true
                    })
                    
                    // Get slot availability info
                    const slotInfo = slotAvailability[time]
                    const isBooked = slotInfo?.isBooked || false
                    const bookingCount = slotInfo?.bookingCount || 0
                    
                    return (
                      <motion.div
                        key={time} 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className={`group relative flex flex-col items-center justify-center p-5 border rounded-xl transition-all duration-300 hover:shadow-lg ${
                          isBooked
                            ? 'border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/20 hover:border-red-500 dark:hover:border-red-500'
                            : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg'
                        }`}
                        title={
                          isBooked
                            ? `This slot has ${bookingCount} booking(s) scheduled for the selected date range. For monthly recurring bookings, all dates must be available.`
                            : 'Available for the complete month'
                        }
                      >
                        {isBooked && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 dark:bg-red-500 rounded-full flex items-center justify-center z-10 shadow-lg">
                            <span className="text-white text-xs font-bold">!</span>
                          </div>
                        )}
                        <label
                          className={`flex flex-col items-center w-full ${
                            isBooked ? 'cursor-not-allowed pointer-events-none' : 'cursor-pointer'
                          }`}
                          onClick={(e) => {
                            if (isBooked) {
                              e.preventDefault()
                              e.stopPropagation()
                              toast.error('This time slot is already booked. Please select another time slot.')
                            }
                          }}
                      >
                        <input
                          {...register('slotTime', { required: 'Please select a time slot' })}
                          type="radio"
                          value={time}
                            className={`absolute top-2 left-2 text-primary-600 focus:ring-2 focus:ring-primary-500 ${
                              isBooked ? 'cursor-not-allowed opacity-50 pointer-events-none' : 'cursor-pointer'
                            }`}
                            disabled={isBooked}
                            onClick={(e) => {
                              if (isBooked) {
                                e.preventDefault()
                                e.stopPropagation()
                                toast.error('This time slot is already booked. Please select another time slot.')
                              }
                            }}
                          />
                          <div className="flex-1 w-full">
                            <div className={`text-base sm:text-lg font-semibold mb-1 text-center ${
                              isBooked
                                ? 'text-red-800 dark:text-red-200'
                                : 'text-gray-800 dark:text-gray-200'
                          }`}>
                            {displayTime}
                          </div>
                            <div className={`text-xs sm:text-sm mb-2 text-center ${
                              isBooked
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                              to {endTimeDisplay}
                            </div>
                            <div className={`mt-1 px-3 py-1 rounded-full text-xs font-medium text-center ${
                              isBooked
                                ? 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200'
                                : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                            }`}>
                              {checkingAvailability && !slotInfo ? (
                                <span className="text-xs">Checking...</span>
                              ) : isBooked ? (
                                'Booked'
                              ) : (
                                '1 Hour'
                              )}
                          </div>
                        </div>
                      </label>
                      </motion.div>
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
                  <Calendar className="h-5 w-5 text-gray-700 dark:text-gray-300" />
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

