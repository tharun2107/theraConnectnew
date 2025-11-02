import React, { useState, useEffect } from 'react'
import { X, Calendar, Clock, Mail, Phone, User, FileText, Loader2 } from 'lucide-react'
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
}

interface AvailableSlotsResponse {
  date: string
  slots: DemoSlot[]
}[]

const BookDemoModal: React.FC<BookDemoModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    reason: '',
  })
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedSlot, setSelectedSlot] = useState<DemoSlot | null>(null)
  const [availableSlots, setAvailableSlots] = useState<AvailableSlotsResponse>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [userTimezone, setUserTimezone] = useState<string>('')

  // Detect user timezone
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      setUserTimezone(tz)
    } catch (e) {
      setUserTimezone('UTC')
    }
  }, [])

  // Fetch available slots when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAvailableSlots()
    }
  }, [isOpen, userTimezone])

  const fetchAvailableSlots = async () => {
    setLoading(true)
    try {
      const { data } = await demoAPI.getAvailableSlots(userTimezone)
      setAvailableSlots(data)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load available slots')
    } finally {
      setLoading(false)
    }
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
      await demoAPI.createBooking({
        ...formData,
        slotDate: selectedDate,
        slotHour: selectedSlot.hour,
        slotTimeString: selectedSlot.timeString,
      })

      toast.success('Demo session booked successfully! Check your email for confirmation.')
      // Refresh available slots after booking
      await fetchAvailableSlots()
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
    onClose()
  }

  if (!isOpen) return null

  // Group slots by date and get next 30 days
  const upcomingDates = availableSlots.slice(0, 30)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Book a Demo Session
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
          <form onSubmit={handleSubmit} className="space-y-6">
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

            {/* Date and Time Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Calendar className="h-4 w-4 inline mr-2" />
                Select Date and Time *
              </label>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Loading available slots...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingDates.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No available slots at the moment. Please check back later.
                    </p>
                  ) : (
                    upcomingDates.map((dateGroup) => (
                      <div key={dateGroup.date} className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-3">
                          {new Date(dateGroup.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {dateGroup.slots.map((slot) => (
                            <button
                              key={slot.id}
                              type="button"
                              onClick={() => {
                                setSelectedDate(dateGroup.date)
                                setSelectedSlot(slot)
                              }}
                              className={`px-4 py-2 rounded-lg border transition-all ${
                                selectedDate === dateGroup.date &&
                                selectedSlot?.id === slot.id
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                              }`}
                            >
                              {slot.timeString}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Selected Slot Display */}
            {selectedSlot && selectedDate && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900">
                  Selected: {new Date(selectedDate).toLocaleDateString()} at {selectedSlot.timeString}
                </p>
              </div>
            )}

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
                disabled={submitting || !selectedSlot}
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
        </div>
      </div>
    </div>
  )
}

export default BookDemoModal

