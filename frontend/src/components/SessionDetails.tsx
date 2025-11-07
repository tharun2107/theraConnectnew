import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Star, 
  MessageSquare, 
  FileText, 
  Calendar, 
  Clock, 
  User, 
  Shield,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Target,
  ClipboardList,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { feedbackAPI, therapyNotesAPI } from '../lib/api'

interface SessionDetailsProps {
  booking: {
    id: string
    status: string
    completedAt?: string
    child?: {
      id?: string
      name: string
      age: number
    }
    therapist?: {
      id?: string
      name: string
      specialization: string
    }
    parent?: {
      id?: string
      name: string
    }
    timeSlot: {
      startTime: string
      endTime: string
    }
  }
  userRole: 'PARENT' | 'THERAPIST' | 'ADMIN'
}

interface SessionData {
  sessionFeedback?: {
    id: string
    rating: number
    comment?: string
    isAnonymous: boolean
    createdAt: string
  }
  sessionReport?: {
    id: string
    sessionDetails?: string[]
    createdAt: string
    tasks?: {
      id: string
      taskGiven: string
      isDone: boolean | null
      observation?: string
    }[]
  }
  monthlyGoals?: {
    id: string
    goals: string[]
    month: number
    year: number
  }
  consentRequest?: {
    id: string
    status: 'PENDING' | 'GRANTED' | 'DENIED'
    notes?: string
    respondedAt?: string
  }
}

const SessionDetails: React.FC<SessionDetailsProps> = ({ booking, userRole }) => {
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)

  // Add defensive checks for booking object
  if (!booking) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
        <p className="text-red-600">Error: Session data not available</p>
      </div>
    )
  }

  if (!booking.timeSlot) {
    return (
      <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
        <p className="text-yellow-600">Error: Session time slot not available</p>
      </div>
    )
  }

  // Check for required data based on user role
  if (userRole === 'PARENT' && !booking.therapist) {
    return (
      <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
        <p className="text-yellow-600">Error: Therapist information not available</p>
      </div>
    )
  }

  if (userRole === 'THERAPIST' && !booking.child) {
    return (
      <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
        <p className="text-yellow-600">Error: Child information not available</p>
      </div>
    )
  }

  const loadSessionDetails = async () => {
    if (hasLoaded) return
    
    setIsLoading(true)
    try {
      console.log('🔍 Loading session details for booking:', booking.id, 'Data:', booking)
      const response = await feedbackAPI.getSessionDetails(booking.id)
      console.log('📋 Session details loaded:', response.data)
      
      // Extract session details and ensure proper field mapping
      const sessionDetailsData = response.data.sessionDetails || response.data
      
      // Handle both SessionFeedback (from Prisma) and sessionFeedback (transformed)
      const sessionFeedback = sessionDetailsData.sessionFeedback || sessionDetailsData.SessionFeedback || null
      const sessionReport = sessionDetailsData.sessionReport || null
      const consentRequest = sessionDetailsData.consentRequest || sessionDetailsData.ConsentRequest || null
      
      // Fetch therapy notes if session report exists
      let monthlyGoals = null
      if (sessionReport && booking.child?.id) {
        try {
          const sessionDate = new Date(booking.timeSlot.startTime)
          const month = sessionDate.getMonth() + 1
          const year = sessionDate.getFullYear()
          
          const goalsResponse = await therapyNotesAPI.getMonthlyGoals(booking.child.id, month, year)
          monthlyGoals = goalsResponse.data?.data
          console.log('📋 Monthly goals loaded:', monthlyGoals)
        } catch (error) {
          console.log('⚠️ No monthly goals found for this session')
        }
      }
      
      const mappedData: SessionData = {
        sessionFeedback: sessionFeedback,
        sessionReport: sessionReport,
        monthlyGoals: monthlyGoals,
        consentRequest: consentRequest,
      }
      
      console.log('📋 Mapped session data:', mappedData)
      setSessionData(mappedData)
      setHasLoaded(true)
    } catch (error) {
      console.error('❌ Failed to load session details:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleExpanded = () => {
    if (!isExpanded && !hasLoaded) {
      loadSessionDetails()
    }
    setIsExpanded(!isExpanded)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    // Use the local time representation directly from the Date object
    // JavaScript Date automatically converts UTC to local time when we call getHours() and getMinutes()
    const slotDate = new Date(dateString)
    const localHours = slotDate.getHours()
    const localMinutes = slotDate.getMinutes()
    
    // Create a date with local hours/minutes to display correctly
    const displayDate = new Date(2000, 0, 1, localHours, localMinutes)
    return displayDate.toLocaleTimeString([], { 
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
      transition={{ duration: 0.3 }}
    >
      <Card className="border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
        <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <CardTitle className="text-base sm:text-lg flex items-center">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
              {formatDate(booking.timeSlot.startTime)}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge 
                className={
                  booking.status === 'COMPLETED'
                    ? 'bg-green-500 text-white border-green-600 hover:bg-green-600'
                    : booking.status === 'SCHEDULED'
                    ? 'bg-blue-500 text-white border-blue-600 hover:bg-blue-600'
                    : booking.status.includes('CANCELLED')
                    ? 'bg-red-500 text-white border-red-600 hover:bg-red-600'
                    : 'bg-gray-500 text-white border-gray-600 hover:bg-gray-600'
                }
              >
                {booking.status}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleExpanded}
                className="p-1"
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
          {/* Basic Session Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {formatTime(booking.timeSlot.startTime)} - {formatTime(booking.timeSlot.endTime)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {userRole === 'PARENT' 
                  ? `Therapist: ${booking.therapist?.name || 'Unknown Therapist'}`
                  : userRole === 'ADMIN'
                  ? `Child: ${booking.child?.name || 'Unknown Child'} | Therapist: ${booking.therapist?.name || 'Unknown Therapist'}`
                  : `Child: ${booking.child?.name || 'Unknown Child'}`
                }
              </span>
            </div>
          </div>

          {/* Expanded Details */}
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600 dark:text-gray-300">Loading session details...</span>
                </div>
              ) : (
                <>
                  {/* Therapy Notes (for Parents) - New format */}
                  {userRole === 'PARENT' && sessionData?.sessionReport && (
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
                                    task.isDone ? (
                                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                                    ) : (
                                      <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                                    )
                                  )}
                                </div>
                                {task.observation && (
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 italic">
                                    Note: {task.observation}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Report created on {formatDate(sessionData.sessionReport.createdAt)}
                      </div>
                    </div>
                  )}

                  {/* For ADMIN: Display both Therapy Notes and Parent Feedback side by side */}
                  {userRole === 'ADMIN' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Therapy Notes */}
                      {sessionData?.sessionReport ? (
                        <div className="space-y-3">
                          {/* Monthly Goals */}
                          {sessionData.monthlyGoals && sessionData.monthlyGoals.goals && sessionData.monthlyGoals.goals.length > 0 && (
                            <div className="bg-purple-50 dark:bg-black border border-purple-200 dark:border-gray-700 rounded-lg p-3">
                              <div className="flex items-center mb-2">
                                <Target className="h-4 w-4 text-purple-600 mr-2" />
                                <h4 className="font-semibold text-sm text-purple-800 dark:text-white">Monthly Goals</h4>
                              </div>
                              <ul className="space-y-1">
                                {sessionData.monthlyGoals.goals.slice(0, 3).map((goal, idx) => (
                                  <li key={idx} className="flex items-start space-x-2">
                                    <CheckCircle className="h-3 w-3 text-purple-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-xs text-gray-700 dark:text-white">{goal}</span>
                                  </li>
                                ))}
                                {sessionData.monthlyGoals.goals.length > 3 && (
                                  <li className="text-xs text-purple-600 dark:text-purple-400">
                                    +{sessionData.monthlyGoals.goals.length - 3} more
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}

                          {/* Session Details */}
                          {sessionData.sessionReport.sessionDetails && sessionData.sessionReport.sessionDetails.length > 0 && (
                            <div className="bg-blue-50 dark:bg-black border border-blue-200 dark:border-gray-700 rounded-lg p-3">
                              <div className="flex items-center mb-2">
                                <FileText className="h-4 w-4 text-blue-600 mr-2" />
                                <h4 className="font-semibold text-sm text-blue-800 dark:text-white">Session Details</h4>
                              </div>
                              <ul className="space-y-1">
                                {sessionData.sessionReport.sessionDetails.slice(0, 3).map((detail, idx) => (
                                  <li key={idx} className="flex items-start space-x-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-1 flex-shrink-0" />
                                    <span className="text-xs text-gray-700 dark:text-white">{detail}</span>
                                  </li>
                                ))}
                                {sessionData.sessionReport.sessionDetails.length > 3 && (
                                  <li className="text-xs text-blue-600 dark:text-blue-400">
                                    +{sessionData.sessionReport.sessionDetails.length - 3} more
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}

                          {/* Home Tasks Summary */}
                          {sessionData.sessionReport.tasks && sessionData.sessionReport.tasks.length > 0 && (
                            <div className="bg-green-50 dark:bg-black border border-green-200 dark:border-gray-700 rounded-lg p-3">
                              <div className="flex items-center mb-2">
                                <ClipboardList className="h-4 w-4 text-green-600 mr-2" />
                                <h4 className="font-semibold text-sm text-green-800 dark:text-white">
                                  Home Tasks ({sessionData.sessionReport.tasks.length})
                                </h4>
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                {sessionData.sessionReport.tasks.filter(t => t.isDone === true).length} completed
                              </div>
                            </div>
                          )}

                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Report: {formatDate(sessionData.sessionReport.createdAt)}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 dark:bg-black dark:border-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center justify-center">
                          <p className="text-sm text-gray-500 dark:text-gray-300">
                            No therapy notes available
                          </p>
                        </div>
                      )}

                      {/* Parent Feedback */}
                      {sessionData?.sessionFeedback ? (
                        <div className="bg-green-50 dark:bg-black border border-green-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-center mb-3">
                            <Star className="h-5 w-5 text-green-600 mr-2" />
                            <h4 className="font-semibold text-green-800 dark:text-white">
                              Parent Feedback
                            </h4>
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
                            <div className="text-xs text-green-600 dark:text-white">
                              Submitted on {formatDate(sessionData.sessionFeedback.createdAt)}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 dark:bg-black dark:border-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center justify-center">
                          <p className="text-sm text-gray-500 dark:text-gray-300">
                            No parent feedback available
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* Therapy Notes (for Therapists only) */}
                      {userRole === 'THERAPIST' && sessionData?.sessionReport && (
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
                                <h4 className="font-semibold text-green-800 dark:text-white">Home Tasks Assigned</h4>
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

                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Report created on {formatDate(sessionData.sessionReport.createdAt)}
                          </div>
                        </div>
                      )}

                      {/* Parent Feedback (for Therapists) */}
                      {userRole === 'THERAPIST' && sessionData?.sessionFeedback && (
                        <div className="bg-green-50 dark:bg-black border border-green-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-center mb-3">
                            <Star className="h-5 w-5 text-green-600 mr-2" />
                            <h4 className="font-semibold text-green-800 dark:text-white">
                              Parent Feedback
                            </h4>
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
                    </>
                  )}

                  {/* Consent Status */}
                  {sessionData?.consentRequest && (
                    <div className="bg-purple-50 dark:bg-black border border-purple-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <Shield className="h-5 w-5 text-purple-600 mr-2" />
                        <h4 className="font-semibold text-purple-800 dark:text-white">Data Sharing Consent</h4>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          className={
                            sessionData.consentRequest.status === 'GRANTED'
                              ? 'bg-green-500 text-white border-green-600 hover:bg-green-600'
                              : sessionData.consentRequest.status === 'DENIED'
                              ? 'bg-red-500 text-white border-red-600 hover:bg-red-600'
                              : 'bg-yellow-500 text-white border-yellow-600 hover:bg-yellow-600'
                          }
                        >
                          {sessionData.consentRequest.status}
                        </Badge>
                        {sessionData.consentRequest.respondedAt && (
                          <span className="text-xs text-purple-600 dark:text-white">
                            on {formatDate(sessionData.consentRequest.respondedAt)}
                          </span>
                        )}
                      </div>
                      {sessionData.consentRequest.notes && (
                        <p className="text-sm text-gray-700 dark:text-white mt-2 bg-white dark:bg-black rounded p-3 border border-purple-200 dark:border-gray-700">
                          {sessionData.consentRequest.notes}
                        </p>
                      )}
                    </div>
                  )}

                  {/* No Data Available */}
                  {!sessionData?.sessionFeedback && !sessionData?.sessionReport && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">
                        {userRole === 'PARENT' 
                          ? 'No feedback or session report available yet.'
                          : userRole === 'ADMIN'
                          ? 'No session report or parent feedback available yet.'
                          : 'No session report or parent feedback available yet.'
                        }
                      </p>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default SessionDetails