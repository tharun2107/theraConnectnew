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
  EyeOff
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { feedbackAPI } from '../lib/api'

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
    sessionExperience: string
    childPerformance?: string
    improvements?: string
    medication?: string
    recommendations?: string
    nextSteps?: string
    createdAt: string
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
      setSessionData(response.data.sessionDetails)
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
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
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
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              {formatDate(booking.timeSlot.startTime)}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant={booking.status === 'COMPLETED' ? 'default' : 'secondary'}>
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

        <CardContent className="space-y-4">
          {/* Basic Session Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {formatTime(booking.timeSlot.startTime)} - {formatTime(booking.timeSlot.endTime)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
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
                  <span className="ml-2 text-gray-600">Loading session details...</span>
                </div>
              ) : (
                <>
                  {/* Session Feedback (for Parents) */}
                  {userRole === 'PARENT' && sessionData?.sessionFeedback && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <Star className="h-5 w-5 text-green-600 mr-2" />
                        <h4 className="font-semibold text-green-800 dark:text-green-200">Your Feedback</h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            {renderStars(sessionData.sessionFeedback.rating)}
                          </div>
                          <span className="text-sm font-medium text-green-700 dark:text-green-300">
                            {getRatingText(sessionData.sessionFeedback.rating)}
                          </span>
                        </div>
                        {sessionData.sessionFeedback.comment && (
                          <div className="bg-white dark:bg-gray-800 rounded p-3 border border-green-200 dark:border-green-700">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
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

                  {/* Session Report (for Parents) */}
                  {userRole === 'PARENT' && sessionData?.sessionReport && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <FileText className="h-5 w-5 text-blue-600 mr-2" />
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200">Therapist's Report</h4>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <h5 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                            Session Experience
                          </h5>
                          <p className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded p-3 border border-blue-200 dark:border-blue-700">
                            {sessionData.sessionReport.sessionExperience}
                          </p>
                        </div>
                        
                        {sessionData.sessionReport.childPerformance && (
                          <div>
                            <h5 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                              Child's Performance
                            </h5>
                            <p className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded p-3 border border-blue-200 dark:border-blue-700">
                              {sessionData.sessionReport.childPerformance}
                            </p>
                          </div>
                        )}

                        {sessionData.sessionReport.recommendations && (
                          <div>
                            <h5 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                              Recommendations
                            </h5>
                            <p className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded p-3 border border-blue-200 dark:border-blue-700">
                              {sessionData.sessionReport.recommendations}
                            </p>
                          </div>
                        )}

                        {sessionData.sessionReport.nextSteps && (
                          <div>
                            <h5 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                              Next Steps
                            </h5>
                            <p className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded p-3 border border-blue-200 dark:border-blue-700">
                              {sessionData.sessionReport.nextSteps}
                            </p>
                          </div>
                        )}

                        <div className="text-xs text-blue-600 dark:text-blue-400">
                          Report created on {formatDate(sessionData.sessionReport.createdAt)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Session Report (for Therapists and Admins) */}
                  {(userRole === 'THERAPIST' || userRole === 'ADMIN') && sessionData?.sessionReport && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <FileText className="h-5 w-5 text-blue-600 mr-2" />
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200">
                          {userRole === 'ADMIN' ? 'Session Report' : 'Your Session Report'}
                        </h4>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <h5 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                            Session Experience
                          </h5>
                          <p className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded p-3 border border-blue-200 dark:border-blue-700">
                            {sessionData.sessionReport.sessionExperience}
                          </p>
                        </div>
                        
                        {sessionData.sessionReport.childPerformance && (
                          <div>
                            <h5 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                              Child's Performance
                            </h5>
                            <p className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded p-3 border border-blue-200 dark:border-blue-700">
                              {sessionData.sessionReport.childPerformance}
                            </p>
                          </div>
                        )}

                        {sessionData.sessionReport.improvements && (
                          <div>
                            <h5 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                              Improvements
                            </h5>
                            <p className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded p-3 border border-blue-200 dark:border-blue-700">
                              {sessionData.sessionReport.improvements}
                            </p>
                          </div>
                        )}

                        {sessionData.sessionReport.recommendations && (
                          <div>
                            <h5 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                              Recommendations
                            </h5>
                            <p className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded p-3 border border-blue-200 dark:border-blue-700">
                              {sessionData.sessionReport.recommendations}
                            </p>
                          </div>
                        )}

                        {sessionData.sessionReport.nextSteps && (
                          <div>
                            <h5 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                              Next Steps
                            </h5>
                            <p className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded p-3 border border-blue-200 dark:border-blue-700">
                              {sessionData.sessionReport.nextSteps}
                            </p>
                          </div>
                        )}

                        <div className="text-xs text-blue-600 dark:text-blue-400">
                          Report created on {formatDate(sessionData.sessionReport.createdAt)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Parent Feedback (for Therapists and Admins) */}
                  {(userRole === 'THERAPIST' || userRole === 'ADMIN') && sessionData?.sessionFeedback && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <Star className="h-5 w-5 text-green-600 mr-2" />
                        <h4 className="font-semibold text-green-800 dark:text-green-200">
                          {userRole === 'ADMIN' ? 'Parent Feedback' : 'Parent\'s Feedback'}
                        </h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            {renderStars(sessionData.sessionFeedback.rating)}
                          </div>
                          <span className="text-sm font-medium text-green-700 dark:text-green-300">
                            {getRatingText(sessionData.sessionFeedback.rating)}
                          </span>
                        </div>
                        {sessionData.sessionFeedback.comment && (
                          <div className="bg-white dark:bg-gray-800 rounded p-3 border border-green-200 dark:border-green-700">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
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

                  {/* Consent Status */}
                  {sessionData?.consentRequest && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <Shield className="h-5 w-5 text-purple-600 mr-2" />
                        <h4 className="font-semibold text-purple-800 dark:text-purple-200">Data Sharing Consent</h4>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={
                            sessionData.consentRequest.status === 'GRANTED' ? 'default' :
                            sessionData.consentRequest.status === 'DENIED' ? 'destructive' : 'secondary'
                          }
                        >
                          {sessionData.consentRequest.status}
                        </Badge>
                        {sessionData.consentRequest.respondedAt && (
                          <span className="text-xs text-purple-600 dark:text-purple-400">
                            on {formatDate(sessionData.consentRequest.respondedAt)}
                          </span>
                        )}
                      </div>
                      {sessionData.consentRequest.notes && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 bg-white dark:bg-gray-800 rounded p-3 border border-purple-200 dark:border-purple-700">
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