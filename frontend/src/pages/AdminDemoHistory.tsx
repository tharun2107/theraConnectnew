import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import {
  Calendar,
  Clock,
  Mail,
  Phone,
  FileText,
  Video,
  Edit2,
  Check,
  X,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import { adminDemoAPI } from '../lib/api'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import toast from 'react-hot-toast'

interface DemoBooking {
  id: string
  name: string
  mobile: string
  email: string
  reason: string
  slotDate: string
  slotHour: number
  slotTimeString: string
  zoomLink?: string
  meetingId?: string
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
  userQuery?: string
  converted: boolean
  additionalNotes?: string
  createdAt: string
}

// Helper function to convert 24-hour to 12-hour with AM/PM
const formatTime12Hour = (time24: string): string => {
  const [hours, minutes] = time24.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const hours12 = hours % 12 || 12
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`
}

const AdminDemoHistory: React.FC = () => {
  const queryClient = useQueryClient()
  const [selectedBooking, setSelectedBooking] = useState<DemoBooking | null>(null)
  const [notesForm, setNotesForm] = useState({
    userQuery: '',
    converted: false,
    additionalNotes: '',
  })
  const [editingNotes, setEditingNotes] = useState<string | null>(null)

  const { data: bookings = [], isLoading } = useQuery(
    'adminDemoBookings',
    () => adminDemoAPI.getBookingHistory().then((res) => res.data),
    {
      refetchInterval: 30000, // Auto-refresh every 30 seconds
    }
  )

  const createZoomMutation = useMutation(
    (bookingId: string) => adminDemoAPI.createZoomMeeting(bookingId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminDemoBookings')
        toast.success('Zoom meeting created and email sent!')
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to create Zoom meeting')
      },
    }
  )

  const updateNotesMutation = useMutation(
    ({ bookingId, data }: { bookingId: string; data: any }) =>
      adminDemoAPI.updateNotes(bookingId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminDemoBookings')
        toast.success('Notes updated successfully!')
        setEditingNotes(null)
        setSelectedBooking(null)
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to update notes')
      },
    }
  )

  const handleEditNotes = (booking: DemoBooking) => {
    setSelectedBooking(booking)
    setNotesForm({
      userQuery: booking.userQuery || '',
      converted: booking.converted || false,
      additionalNotes: booking.additionalNotes || '',
    })
    setEditingNotes(booking.id)
  }

  const handleSaveNotes = () => {
    if (!editingNotes) return
    updateNotesMutation.mutate({ bookingId: editingNotes, data: notesForm })
  }

  const handleCreateZoom = (bookingId: string) => {
    if (window.confirm('Create Zoom meeting and send link to user?')) {
      createZoomMutation.mutate(bookingId)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-500 text-white border-blue-600 hover:bg-blue-600'
      case 'COMPLETED':
        return 'bg-green-500 text-white border-green-600 hover:bg-green-600'
      case 'CANCELLED':
        return 'bg-red-500 text-white border-red-600 hover:bg-red-600'
      default:
        return 'bg-gray-500 text-white border-gray-600 hover:bg-gray-600'
    }
  }

  const isMeetingFinished = (booking: DemoBooking) => {
    const slotDate = new Date(booking.slotDate)
    slotDate.setHours(booking.slotHour + 1, 0, 0, 0) // Meeting ends 1 hour after start
    return new Date() > slotDate
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading demo bookings...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Demo Booking History</h1>
        <p className="text-sm text-gray-500">
          Auto-refreshes every 30 seconds
        </p>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No demo bookings yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking: DemoBooking) => (
            <Card key={booking.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">{booking.name}</CardTitle>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                      {booking.converted && (
                        <Badge className="bg-green-100 text-green-800">
                          <Check className="h-3 w-3 mr-1" />
                          Converted
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        {booking.email}
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        {booking.mobile}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(booking.slotDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {formatTime12Hour(booking.slotTimeString)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!booking.meetingId && !isMeetingFinished(booking) && (
                      <Button
                        size="sm"
                        onClick={() => handleCreateZoom(booking.id)}
                        disabled={createZoomMutation.isLoading}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Add Zoom Link
                      </Button>
                    )}
                    {booking.zoomLink && !isMeetingFinished(booking) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(booking.zoomLink, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Zoom Link
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditNotes(booking)}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Notes
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex items-start mb-2">
                    <FileText className="h-4 w-4 mr-2 mt-1 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Reason:</p>
                      <p className="text-sm text-gray-600">{booking.reason}</p>
                    </div>
                  </div>
                </div>

                {(booking.userQuery || booking.additionalNotes) && (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Admin Notes:</h4>
                    {booking.userQuery && (
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>User Query:</strong> {booking.userQuery}
                      </p>
                    )}
                    {booking.additionalNotes && (
                      <p className="text-sm text-gray-600">
                        <strong>Additional Notes:</strong> {booking.additionalNotes}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Notes Modal */}
      {selectedBooking && editingNotes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Edit Notes - {selectedBooking.name}</CardTitle>
                <button
                  onClick={() => {
                    setSelectedBooking(null)
                    setEditingNotes(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Query
                </label>
                <textarea
                  value={notesForm.userQuery}
                  onChange={(e) =>
                    setNotesForm({ ...notesForm, userQuery: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Enter user's query or question..."
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={notesForm.converted}
                    onChange={(e) =>
                      setNotesForm({ ...notesForm, converted: e.target.checked })
                    }
                    className="rounded"
                  />
                  Converted (Yes/No)
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={notesForm.additionalNotes}
                  onChange={(e) =>
                    setNotesForm({ ...notesForm, additionalNotes: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Enter any additional notes..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedBooking(null)
                    setEditingNotes(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveNotes}
                  disabled={updateNotesMutation.isLoading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  {updateNotesMutation.isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Save Notes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default AdminDemoHistory

