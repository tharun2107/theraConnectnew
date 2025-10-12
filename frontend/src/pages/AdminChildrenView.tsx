import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { parentAPI, adminAPI } from '../lib/api'
import { 
  Users, 
  Calendar, 
  Clock, 
  Star, 
  ChevronRight,
  ArrowLeft,
  Heart,
  Shield
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Avatar, AvatarFallback } from '../components/ui/avatar'
import { LoadingSpinner } from '../components/ui/loading-spinner'
import SessionDetails from '../components/SessionDetails'
import { useNavigate } from 'react-router-dom'

interface Child {
  id: string
  name: string
  age: number
  address?: string
  condition?: string
  notes?: string
  parent: {
    id: string
    name: string
    phone: string
    user: {
      email: string
    }
  }
}

interface ChildSession {
  id: string
  status: string
  createdAt: string
  child: {
    id: string
    name: string
    age: number
  }
  therapist: {
    name: string
    specialization: string
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

const AdminChildrenView: React.FC = () => {
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const navigate = useNavigate()

  const { data: children = [], isLoading: childrenLoading } = useQuery(
    'allChildren',
    parentAPI.getAllChildren,
    { select: (response) => response.data }
  )

  const { data: childSessions = [], isLoading: sessionsLoading } = useQuery(
    ['childSessions', selectedChild?.id],
    () => adminAPI.getChildSessions(selectedChild!.id),
    { 
      select: (response) => response.data,
      enabled: !!selectedChild?.id
    }
  )

  const handleChildClick = (child: Child) => {
    setSelectedChild(child)
  }

  const handleBackToChildren = () => {
    setSelectedChild(null)
  }

  if (childrenLoading) {
    return <LoadingSpinner />
  }

  if (selectedChild) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={handleBackToChildren}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Children</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedChild.name}'s Sessions
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                View all sessions and progress for this child
              </p>
            </div>
          </div>
        </div>

        {/* Child Info Card */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-500 text-white text-xl font-semibold">
                  {selectedChild.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedChild.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Age: {selectedChild.age} years
                  {selectedChild.condition && ` • ${selectedChild.condition}`}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Parent: {selectedChild.parent.name} ({selectedChild.parent.user.email})
                </p>
                {selectedChild.address && (
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Address: {selectedChild.address}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 mb-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    Child
                  </span>
                </div>
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Active
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sessions List */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
          <CardHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
              All Sessions ({childSessions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {sessionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <span className="ml-2 text-gray-600">Loading sessions...</span>
              </div>
            ) : childSessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No sessions yet
                </h3>
                <p className="text-sm">This child hasn't had any sessions yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {childSessions
                  .sort((a: ChildSession, b: ChildSession) => 
                    new Date(b.timeSlot.startTime).getTime() - new Date(a.timeSlot.startTime).getTime()
                  )
                  .map((session: ChildSession) => (
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Users className="h-6 w-6 mr-2 text-green-600" />
            All Children
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and manage all children in your platform
          </p>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center text-green-600">
            <Heart className="h-4 w-4 mr-1" />
            {children.length} Total
          </div>
          <div className="flex items-center text-blue-600">
            <Shield className="h-4 w-4 mr-1" />
            Active
          </div>
        </div>
      </div>

      {/* Children Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children.map((child: Child) => (
          <motion.div
            key={child.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card 
              className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => handleChildClick(child)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-500 text-white font-semibold">
                        {child.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg text-gray-900 dark:text-white">
                        {child.name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Age: {child.age} years
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Parent:</span>
                  <p className="text-gray-600 dark:text-gray-400">{child.parent.name}</p>
                </div>
                
                {child.condition && (
                  <div className="text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Condition:</span>
                    <p className="text-gray-600 dark:text-gray-400">{child.condition}</p>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Child
                    </span>
                  </div>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Active
                  </Badge>
                </div>
                
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  Parent: {child.parent.user.email}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {children.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No children yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Children will appear here once parents register them.
          </p>
        </div>
      )}
    </div>
  )
}

export default AdminChildrenView
