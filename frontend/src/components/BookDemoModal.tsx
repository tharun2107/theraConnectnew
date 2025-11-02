import React, { useState, useEffect } from 'react'
import { X, Calendar, Clock, Mail, Phone, User, FileText, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { demoAPI } from '../lib/api'
import { Button } from './ui/button'
import toast from 'react-hot-toast'

interface BookDemoModalProps {
  isOpen: boolean
  onClose: () => void
}

interface DemoSlot {
  id: string
  date: string
  hour: number
  timeString: string
  originalTimeString: string
  originalHour: number
}

interface AvailableSlotsResponse {
  date: string
  slots: DemoSlot[]
}[]

// Helper function to parse YYYY-MM-DD as local date (not UTC)
const parseLocalDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

// Helper function to format date as YYYY-MM-DD in local timezone
const formatLocalDate = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const BookDemoModal: React.FC<BookDemoModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'date' | 'slots' | 'form'>('date')
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    reason: '',
  })
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedSlot, setSelectedSlot] = useState<DemoSlot | null>(null)
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [availableSlots, setAvailableSlots] = useState<DemoSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [userTimezone, setUserTimezone] = useState<string>('')
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Detect user timezone
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      setUserTimezone(tz)
    } catch (e) {
      setUserTimezone('UTC')
    }
  }, [])

  // Fetch available dates when modal opens
  useEffect(() => {
    if (isOpen && step === 'date') {
      fetchAvailableDates()
    }
  }, [isOpen, step, userTimezone])

  const fetchAvailableDates = async () => {
    setLoading(true)
    try {
      const { data } = await demoAPI.getAvailableSlots(userTimezone)
      // Extract unique dates from the response
      const dates = Array.from(new Set(data.map((item: AvailableSlotsResponse) => item.date))).sort()
      setAvailableDates(dates)
    } catch (error: any) {
      console.error('Error fetching available dates:', error)
      toast.error(error.response?.data?.message || 'Failed to load available dates')
    } finally {
      setLoading(false)
    }
  }

  const fetchSlotsForDate = async (date: string) => {
    setLoadingSlots(true)
    // Always set selectedDate first to ensure correct date is shown
    setSelectedDate(date)
    try {
      const { data } = await demoAPI.getAvailableSlots(userTimezone, date)
      if (data && data.length > 0 && data[0].slots && data[0].slots.length > 0) {
        setAvailableSlots(data[0].slots || [])
        setStep('slots')
      } else {
        // Still move to slots step but show no slots message
        setAvailableSlots([])
        setStep('slots')
        toast.error('No slots available for this date')
      }
    } catch (error: any) {
      setAvailableSlots([])
      setStep('slots')
      toast.error(error.response?.data?.message || 'Failed to load slots')
    } finally {
      setLoadingSlots(false)
    }
  }

  const handleSlotSelect = (slot: DemoSlot) => {
    setSelectedSlot(slot)
    setStep('form')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedDate || !selectedSlot) {
      toast.error('Please select a date and time slot')
      return
    }

    if (!formData.name || !formData.mobile || !formData.email || !formData.reason) {
      toast.error('Please fill in all fields')
      return
    }

    setSubmitting(true)
    try {
      // Use originalHour for booking (admin's timezone)
      await demoAPI.createBooking({
        ...formData,
        slotDate: selectedDate,
        slotHour: selectedSlot.originalHour, // Use admin's original hour
        slotTimeString: selectedSlot.originalTimeString, // Use admin's original time
        userTimezone: userTimezone, // Include user timezone for email conversion
      })

      toast.success('Demo session booked successfully! Check your email for confirmation.')
      handleClose()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to book demo session')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({ name: '', mobile: '', email: '', reason: '' })
    setSelectedDate('')
    setSelectedSlot(null)
    setStep('date')
    setAvailableSlots([])
    onClose()
  }

  const handleDateSelect = (date: string) => {
    fetchSlotsForDate(date)
  }

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (Date | null)[] = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const isDateAvailable = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    const isPast = isDatePast(date)
    const isWeekendDay = isWeekend(date)
    
    // Date is available if:
    // 1. It's not in the past
    // 2. It's not a weekend (only Saturday and Sunday are disabled)
    // Note: We allow all weekdays to be selectable, even if no slots exist yet
    // The slot availability check happens when the date is selected
    return !isPast && !isWeekendDay
  }

  const isDatePast = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const checkDate = new Date(date)
    checkDate.setHours(0, 0, 0, 0)
    return checkDate < today
  }

  const isWeekend = (date: Date) => {
    const day = date.getDay()
    return day === 0 || day === 6 // Sunday or Saturday
  }

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {step === 'date' && 'Select a Date'}
            {step === 'slots' && 'Select a Time'}
            {step === 'form' && 'Book a Demo Session'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Date Selection */}
          {step === 'date' && (
            <div className="space-y-6">
              <div className="text-center mb-4">
                <p className="text-gray-600 mb-2">Your timezone: <span className="font-medium">{userTimezone}</span></p>
                <p className="text-sm text-gray-500">Select a date to view available time slots</p>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Loading available dates...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Calendar Navigation */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={handlePreviousMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <h3 className="text-lg font-semibold">
                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button
                      onClick={handleNextMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Calendar Grid */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-7 gap-2 mb-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {generateCalendarDays().map((day, index) => {
                        if (!day) {
                          return <div key={index} className="aspect-square" />
                        }
                        
                        // Format date as YYYY-MM-DD in local timezone (not UTC)
                        const dateStr = formatLocalDate(day)
                        const isAvailable = isDateAvailable(day)
                        const isPast = isDatePast(day)
                        const isWeekendDay = isWeekend(day)

                        const canSelect = isAvailable // isAvailable already checks !isPast && !isWeekendDay
                        
                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={() => canSelect && handleDateSelect(dateStr)}
                            disabled={!canSelect}
                            className={`aspect-square rounded-lg border transition-all text-sm font-medium ${
                              canSelect
                                ? 'hover:bg-blue-50 hover:border-blue-500 cursor-pointer border-gray-300 text-gray-900 bg-white'
                                : isPast
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                                : isWeekendDay
                                ? 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200'
                                : 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200'
                            }`}
                            title={
                              !canSelect
                                ? isPast
                                  ? 'Past date'
                                  : isWeekendDay
                                  ? 'Weekend (not available)'
                                  : 'No slots available'
                                : 'Click to select'
                            }
                          >
                            {day.getDate()}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Time Slot Selection */}
          {step === 'slots' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-lg font-semibold">
                    {parseLocalDate(selectedDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-sm text-gray-500">Select an available time slot</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep('date')
                    setSelectedDate('')
                    setSelectedSlot(null)
                  }}
                >
                  Change Date
                </Button>
              </div>

              {loadingSlots ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Loading slots...</span>
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No available slots for this date.</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStep('date')
                      setSelectedDate('')
                    }}
                    className="mt-4"
                  >
                    Select Another Date
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => handleSlotSelect(slot)}
                      className="px-4 py-3 rounded-lg border border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all text-center font-medium"
                    >
                      {slot.timeString}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Form */}
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm font-medium text-blue-900">
                  Selected: {parseLocalDate(selectedDate).toLocaleDateString()} at {selectedSlot?.timeString}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStep('slots')
                    setSelectedSlot(null)
                  }}
                  className="mt-2"
                >
                  Change Time
                </Button>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4 inline mr-2" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="h-4 w-4 inline mr-2" />
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="h-4 w-4 inline mr-2" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="h-4 w-4 inline mr-2" />
                    Timezone
                  </label>
                  <input
                    type="text"
                    value={userTimezone}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="h-4 w-4 inline mr-2" />
                  Reason for Demo *
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Please tell us why you're interested in booking a demo session..."
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    'Book Demo'
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default BookDemoModal
