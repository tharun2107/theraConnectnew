import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { adminAPI, bookingAPI } from '../lib/api'
import { 
  Users, 
  Star, 
  Calendar, 
  Clock, 
  TrendingUp,
  Shield,
  ChevronRight,
  ArrowLeft,
  UserCheck,
  UserX
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Avatar, AvatarFallback } from '../components/ui/avatar'
import { LoadingSpinner } from '../components/ui/loading-spinner'
import SessionDetails from '../components/SessionDetails'
import { useNavigate } from 'react-router-dom'

interface Therapist {
  id: string
  name: string
  phone: string
  specialization: string
  experience: number
  baseCostPerSession: number
  averageRating: number
  status: 'PENDING_VERIFICATION' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  leavesRemainingThisMonth: number
  user: {
    email: string
    createdAt: string
  }
}

interface TherapistSession {
  id: string
  status: string
  createdAt: string
  child?: {
    id: string
    name: string
    age: number
  }
  parent: {
    name: string
  }
  timeSlot: {
    startTime: string
    endTime: string
  }
  SessionFeedback?: {
    rating: number
    comment?: string
  }
  sessionReport?: {
    sessionExperience: string
    childPerformance?: string
    improvements?: string
    medication?: string
    recommendations?: string
    nextSteps?: string
  }
}

const AdminTherapistsView: React.FC = () => {
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null)
  const navigate = useNavigate()

  const { data: therapists = [], isLoading: therapistsLoading } = useQuery(
    'allTherapists',
    adminAPI.getAllTherapists,
    { select: (response) => response.data }
  )

  const { data: therapistSessions = [], isLoading: sessionsLoading } = useQuery(
    ['therapistSessions', selectedTherapist?.id],
    () => adminAPI.getTherapistSessions(selectedTherapist!.id),
    { 
      select: (response) => response.data,
      enabled: !!selectedTherapist?.id
    }
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500 text-white border-green-600 hover:bg-green-600'
      case 'PENDING_VERIFICATION':
        return 'bg-yellow-500 text-white border-yellow-600 hover:bg-yellow-600'
      case 'INACTIVE':
        return 'bg-gray-500 text-white border-gray-600 hover:bg-gray-600'
      case 'SUSPENDED':
        return 'bg-red-500 text-white border-red-600 hover:bg-red-600'
      default:
        return 'bg-gray-500 text-white border-gray-600 hover:bg-gray-600'
    }
  }

  const handleTherapistClick = (therapist: Therapist) => {
    setSelectedTherapist(therapist)
  }

  const handleBackToTherapists = () => {
    setSelectedTherapist(null)
  }

  if (therapistsLoading) {
    return <LoadingSpinner />
  }

  if (selectedTherapist) {
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-start sm:items-center md:items-start lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-start sm:items-center md:items-start lg:items-center gap-3 sm:gap-3 md:gap-3 lg:gap-4">
            <Button
              variant="ghost"
              onClick={handleBackToTherapists}
              className="flex items-center space-x-2 w-full sm:w-auto md:w-full lg:w-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Therapists</span>
            </Button>
            <div>
              <h1 className="text-xl sm:text-xl md:text-2xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                {selectedTherapist.name}'s Sessions
              </h1>
              <p className="text-sm sm:text-sm md:text-base lg:text-base text-gray-600 dark:text-gray-400">
                View all sessions and feedback for this therapist
              </p>
            </div>
          </div>
        </div>

        {/* Therapist Info Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-700">
          <CardContent className="p-4 sm:p-5 md:p-6">
            <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-start sm:items-center md:items-start lg:items-center gap-4">
              <Avatar className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 flex-shrink-0">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-lg sm:text-lg md:text-xl font-semibold">
                  {selectedTherapist.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 w-full md:w-auto">
                <h2 className="text-lg sm:text-lg md:text-xl lg:text-xl font-semibold text-gray-900 dark:text-white truncate">
                  {selectedTherapist.name}
                </h2>
                <p className="text-sm sm:text-sm md:text-base lg:text-base text-gray-600 dark:text-gray-400 truncate">
                  {selectedTherapist.specialization} • {selectedTherapist.experience} years experience
                </p>
                <p className="text-xs sm:text-xs md:text-sm lg:text-sm text-gray-500 dark:text-gray-500 truncate">
                  {selectedTherapist.user.email} • ${selectedTherapist.baseCostPerSession}/session
                </p>
              </div>
              <div className="flex items-center sm:flex-col sm:items-end md:flex-row md:items-center lg:flex-col lg:items-end gap-3 sm:gap-2 md:gap-3 lg:gap-2 w-full sm:w-auto md:w-full lg:w-auto">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5 text-yellow-500 fill-current" />
                  <span className="text-base sm:text-base md:text-lg lg:text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedTherapist.averageRating.toFixed(1)}
                  </span>
                </div>
                <Badge className={`${getStatusColor(selectedTherapist.status)} whitespace-nowrap`}>
                  {selectedTherapist.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sessions List */}
        <Card className="bg-white dark:bg-black shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
          <CardHeader className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600 dark:text-blue-400" />
              All Sessions ({therapistSessions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {sessionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading sessions...</span>
              </div>
            ) : therapistSessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No sessions yet
                </h3>
                <p className="text-sm">This therapist hasn't had any sessions yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {therapistSessions
                  .sort((a: TherapistSession, b: TherapistSession) => 
                    new Date(b.timeSlot.startTime).getTime() - new Date(a.timeSlot.startTime).getTime()
                  )
                  .map((session: TherapistSession) => (
                      <SessionDetails
                        key={session.id}
                        booking={session}
                        userRole="ADMIN"
                      />
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-blue-600" />
              All Therapists
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
              Manage and view all therapists in your platform
            </p>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-4 text-sm flex-wrap gap-2">
          <div className="flex items-center text-green-600">
            <UserCheck className="h-4 w-4 mr-1" />
            {therapists.filter((t: Therapist) => t.status === 'ACTIVE').length} Active
          </div>
          <div className="flex items-center text-yellow-600">
            <Shield className="h-4 w-4 mr-1" />
            {therapists.filter((t: Therapist) => t.status === 'PENDING_VERIFICATION').length} Pending
          </div>
        </div>
      </div>

      {/* Therapists Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-4 md:gap-6">
        {therapists.map((therapist: Therapist) => (
          <motion.div
            key={therapist.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card 
              className="bg-white dark:bg-black shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => handleTherapistClick(therapist)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                        {therapist.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg text-gray-900 dark:text-white">
                        {therapist.name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {therapist.specialization}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Experience:</span>
                    <p className="text-gray-600 dark:text-gray-400">{therapist.experience} years</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Rate:</span>
                    <p className="text-gray-600 dark:text-gray-400">${therapist.baseCostPerSession}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {therapist.averageRating.toFixed(1)}
                    </span>
                  </div>
                  <Badge className={`${getStatusColor(therapist.status)}`}>
                    {therapist.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  Joined: {new Date(therapist.user.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {therapists.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No therapists yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Create your first therapist to get started.
          </p>
        </div>
      )}
    </div>
  )
}

export default AdminTherapistsView
