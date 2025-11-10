import React, { useState, useMemo } from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  User, 
  Star,
  Target,
  FileText,
  ClipboardList,
  CheckCircle,
  XCircle,
  Filter,
  Search
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { bookingAPI, feedbackAPI, therapyNotesAPI } from '../lib/api'

interface Booking {
  id: string
  status: string
  child?: {
    id: string
    name: string
    age: number
  }
  parent: {
    name: string
  }
  therapist?: {
    name: string
  }
  timeSlot: {
    startTime: string
    endTime: string
  }
  SessionFeedback?: any
  sessionReport?: any
}

interface SessionData {
  sessionFeedback?: {
    rating: number
    comment?: string
    createdAt: string
  }
  sessionReport?: {
    sessionDetails: string[]
    tasks: {
      id: string
      taskGiven: string
      isDone: boolean | null
      observation?: string
    }[]
    createdAt: string
  }
  monthlyGoals?: {
    goals: string[]
  }
}

const TherapistCurrentMonthBookings: React.FC = () => {
  const [selectedSlot, setSelectedSlot] = useState<string>('all')
  const [selectedPatient, setSelectedPatient] = useState<string>('all')
  const [expandedBookings, setExpandedBookings] = useState<Set<string>>(new Set())

  // Fetch all bookings
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery(
    'therapistBookings',
    bookingAPI.getMyBookings,
    {
      select: (response) => response.data || [],
      refetchInterval: 30000, // Auto-refresh every 30 seconds
    }
  )

  // Filter for current month completed bookings
  const currentMonthBookings = useMemo(() => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    return bookings.filter((booking: Booking) => {
      const bookingDate = new Date(booking.timeSlot.startTime)
      return (
        booking.status === 'COMPLETED' &&
        bookingDate >= startOfMonth &&
        bookingDate <= endOfMonth
      )
    })
  }, [bookings])

  // Get unique slots and patients for filtering
  const uniqueSlots = useMemo(() => {
    const slots = new Set<string>()
    currentMonthBookings.forEach((booking: Booking) => {
      const startTime = new Date(booking.timeSlot.startTime)
      const timeStr = startTime.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
      slots.add(timeStr)
    })
    return Array.from(slots).sort()
  }, [currentMonthBookings])

  const uniquePatients = useMemo(() => {
    const patients = new Map<string, string>() // childId -> childName
    currentMonthBookings.forEach((booking: Booking) => {
      if (booking.child) {
        patients.set(booking.child.id, booking.child.name)
      }
    })
    return Array.from(patients.entries()).sort((a, b) => a[1].localeCompare(b[1]))
  }, [currentMonthBookings])

  // Filter bookings based on selected filters
  const filteredBookings = useMemo(() => {
    let filtered = currentMonthBookings

    if (selectedSlot !== 'all') {
      filtered = filtered.filter((booking: Booking) => {
        const startTime = new Date(booking.timeSlot.startTime)
        const timeStr = startTime.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        })
        return timeStr === selectedSlot
      })
    }

    if (selectedPatient !== 'all') {
      filtered = filtered.filter((booking: Booking) => 
        booking.child?.id === selectedPatient
      )
    }

    return filtered.sort((a: Booking, b: Booking) => 
      new Date(b.timeSlot.startTime).getTime() - new Date(a.timeSlot.startTime).getTime()
    )
  }, [currentMonthBookings, selectedSlot, selectedPatient])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const slotDate = new Date(dateString)
    return slotDate.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const toggleExpanded = (bookingId: string) => {
    const newExpanded = new Set(expandedBookings)
    if (newExpanded.has(bookingId)) {
      newExpanded.delete(bookingId)
    } else {
      newExpanded.add(bookingId)
    }
    setExpandedBookings(newExpanded)
  }

  if (bookingsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (currentMonthBookings.length === 0) {
    return (
      <Card className="bg-white dark:bg-gray-900">
        <CardContent className="py-12 text-center">
          <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Current Month Bookings
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Completed bookings for this month will appear here
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Current Month Bookings
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {filteredBookings.length} of {currentMonthBookings.length} booking{currentMonthBookings.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          {/* Slot Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <select
              value={selectedSlot}
              onChange={(e) => setSelectedSlot(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Slots</option>
              {uniqueSlots.map((slot) => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>

          {/* Patient Filter */}
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Patients</option>
              {uniquePatients.map(([childId, childName]) => (
                <option key={childId} value={childId}>{childName}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Booking Cards */}
      <div className="space-y-4">
        {filteredBookings.map((booking: Booking, index: number) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            index={index}
            isExpanded={expandedBookings.has(booking.id)}
            onToggleExpanded={() => toggleExpanded(booking.id)}
          />
        ))}
      </div>
    </div>
  )
}

interface BookingCardProps {
  booking: Booking
  index: number
  isExpanded: boolean
  onToggleExpanded: () => void
}

const BookingCard: React.FC<BookingCardProps> = ({ 
  booking, 
  index, 
  isExpanded, 
  onToggleExpanded 
}) => {
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)

  const loadSessionDetails = async () => {
    if (hasLoaded || isLoadingDetails) return
    
    setIsLoadingDetails(true)
    try {
      // Fetch session details
      const response = await feedbackAPI.getSessionDetails(booking.id)
      const sessionDetailsData = response.data.sessionDetails || response.data
      
      const sessionFeedback = sessionDetailsData.sessionFeedback || sessionDetailsData.SessionFeedback || null
      const sessionReport = sessionDetailsData.sessionReport || null
      
      // Fetch monthly goals if session report exists
      let monthlyGoals = null
      if (sessionReport && booking.child?.id) {
        try {
          const sessionDate = new Date(booking.timeSlot.startTime)
          const month = sessionDate.getMonth() + 1
          const year = sessionDate.getFullYear()
          
          const goalsResponse = await therapyNotesAPI.getMonthlyGoals(booking.child.id, month, year)
          monthlyGoals = goalsResponse.data?.data
        } catch (error) {
          console.log('⚠️ No monthly goals found for this session')
        }
      }
      
      setSessionData({
        sessionFeedback,
        sessionReport,
        monthlyGoals
      })
      setHasLoaded(true)
    } catch (error) {
      console.error('❌ Failed to load session details:', error)
    } finally {
      setIsLoadingDetails(false)
    }
  }

  React.useEffect(() => {
    if (isExpanded && !hasLoaded) {
      loadSessionDetails()
    }
  }, [isExpanded, hasLoaded])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const slotDate = new Date(dateString)
    return slotDate.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  const getRatingText = (rating: number) => {
    const ratings = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']
    return ratings[rating] || ''
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                {formatDate(booking.timeSlot.startTime)}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span><strong>Parent:</strong> {booking.parent.name}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span><strong>Child:</strong> {booking.child?.name || 'N/A'}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatTime(booking.timeSlot.startTime)} - {formatTime(booking.timeSlot.endTime)}</span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleExpanded}
              className="ml-4"
            >
              {isExpanded ? 'Collapse' : 'View Details'}
            </Button>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="pt-0 space-y-4">
            {isLoadingDetails ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-300">Loading session details...</span>
              </div>
            ) : sessionData ? (
              <>
                {/* Therapy Notes */}
                {sessionData.sessionReport && (
                  <div className="space-y-4">
                    {/* Monthly Goals */}
                    {sessionData.monthlyGoals && sessionData.monthlyGoals.goals && sessionData.monthlyGoals.goals.length > 0 && (
                      <div className="bg-purple-50 dark:bg-black border border-purple-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <Target className="h-5 w-5 text-purple-600 mr-2" />
                          <h4 className="font-semibold text-purple-800 dark:text-white">Monthly Goals</h4>
                        </div>
                        <ul className="space-y-2">
                          {sessionData.monthlyGoals.goals.map((goal, idx) => (
                            <li key={idx} className="flex items-start space-x-2">
                              <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700 dark:text-white">{goal}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Session Details */}
                    {sessionData.sessionReport.sessionDetails && sessionData.sessionReport.sessionDetails.length > 0 && (
                      <div className="bg-blue-50 dark:bg-black border border-blue-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <FileText className="h-5 w-5 text-blue-600 mr-2" />
                          <h4 className="font-semibold text-blue-800 dark:text-white">Session Details</h4>
                        </div>
                        <ul className="space-y-2">
                          {sessionData.sessionReport.sessionDetails.map((detail, idx) => (
                            <li key={idx} className="flex items-start space-x-2">
                              <div className="h-2 w-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700 dark:text-white">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Home Tasks */}
                    {sessionData.sessionReport.tasks && sessionData.sessionReport.tasks.length > 0 && (
                      <div className="bg-green-50 dark:bg-black border border-green-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <ClipboardList className="h-5 w-5 text-green-600 mr-2" />
                          <h4 className="font-semibold text-green-800 dark:text-white">Home Tasks</h4>
                        </div>
                        <div className="space-y-3">
                          {sessionData.sessionReport.tasks.map((task) => (
                            <div key={task.id} className="bg-white dark:bg-black border border-green-200 dark:border-gray-700 rounded p-3">
                              <div className="flex items-start justify-between mb-2">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{task.taskGiven}</p>
                                {task.isDone !== null && (
                                  <Badge className={task.isDone ? 'bg-green-500' : 'bg-red-500'}>
                                    {task.isDone ? 'Completed' : 'Not Done'}
                                  </Badge>
                                )}
                              </div>
                              {task.observation && (
                                <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-900 rounded">
                                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Parent's Observation:
                                  </p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {task.observation}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Parent Feedback */}
                {sessionData.sessionFeedback && (
                  <div className="bg-green-50 dark:bg-black border border-green-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Star className="h-5 w-5 text-green-600 mr-2" />
                      <h4 className="font-semibold text-green-800 dark:text-white">Parent Feedback</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          {renderStars(sessionData.sessionFeedback.rating)}
                        </div>
                        <span className="text-sm font-medium text-green-700 dark:text-white">
                          {getRatingText(sessionData.sessionFeedback.rating)}
                        </span>
                      </div>
                      {sessionData.sessionFeedback.comment && (
                        <div className="bg-white dark:bg-black rounded p-3 border border-green-200 dark:border-gray-700">
                          <p className="text-sm text-gray-700 dark:text-white">
                            {sessionData.sessionFeedback.comment}
                          </p>
                        </div>
                      )}
                      <div className="text-xs text-green-600 dark:text-green-400">
                        Submitted on {formatDate(sessionData.sessionFeedback.createdAt)}
                      </div>
                    </div>
                  </div>
                )}

                {!sessionData.sessionReport && !sessionData.sessionFeedback && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p className="text-sm">No session details available yet</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p className="text-sm">No session details available</p>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </motion.div>
  )
}

export default TherapistCurrentMonthBookings

