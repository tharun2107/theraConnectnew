import React from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { 
  Users, 
  User, Shield, 
  ShieldOff, 
  Calendar, 
  Clock, 
  Heart, 
  FileText,
  Star,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { bookingAPI } from '../lib/api'

interface ChildWithConsent {
  id: string
  name: string
  age: number
  condition?: string
  notes?: string
  address?: string
  hasConsent: boolean
  lastSession?: string
  totalSessions: number
  averageRating?: number
}

const TherapistChildrenView: React.FC = () => {
  const { data: bookings = [], isLoading } = useQuery(
    'therapistBookings',
    bookingAPI.getMyBookings,
    { select: (response) => response.data }
  )

  // Process bookings to get unique children with consent info
  const childrenWithConsent: ChildWithConsent[] = React.useMemo(() => {
    const childMap = new Map<string, ChildWithConsent>()
    
    bookings.forEach((booking: any) => {
      if (booking.child) {
        const childId = booking.child.id
        const hasConsent = booking.ConsentRequest?.status === 'GRANTED'
        
        if (!childMap.has(childId)) {
          childMap.set(childId, {
            id: childId,
            name: booking.child.name,
            age: booking.child.age || 0,
            condition: booking.child.condition,
            notes: booking.child.notes,
            address: booking.child.address,
            hasConsent,
            totalSessions: 0,
            lastSession: undefined,
            averageRating: undefined
          })
        }
        
        const child = childMap.get(childId)!
        child.totalSessions++
        
        // Update last session date
        const sessionDate = new Date(booking.timeSlot.startTime)
        if (!child.lastSession || sessionDate > new Date(child.lastSession)) {
          child.lastSession = sessionDate.toISOString()
        }
        
        // Calculate average rating if feedback exists
        if (booking.SessionFeedback?.rating) {
          if (!child.averageRating) {
            child.averageRating = booking.SessionFeedback.rating
          } else {
            child.averageRating = (child.averageRating + booking.SessionFeedback.rating) / 2
          }
        }
      }
    })
    
    return Array.from(childMap.values())
  }, [bookings])

  const childrenWithAccess = childrenWithConsent.filter(child => child.hasConsent)
  const childrenWithoutAccess = childrenWithConsent.filter(child => !child.hasConsent)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading children data...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Status Indicators */}
      <div className="flex items-center justify-end space-x-3 sm:space-x-4 text-sm flex-wrap gap-2">
        <div className="flex items-center text-green-600">
          <CheckCircle className="h-4 w-4 mr-1" />
          {childrenWithAccess.length} with access
        </div>
        <div className="flex items-center text-orange-600">
          <AlertCircle className="h-4 w-4 mr-1" />
          {childrenWithoutAccess.length} limited access
        </div>
      </div>

      {/* Children with Full Access */}
      {childrenWithAccess.length > 0 && (
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-green-600" />
            Full Access ({childrenWithAccess.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {childrenWithAccess.map((child) => (
              <motion.div
                key={child.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700">
                  <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-green-800 dark:text-green-300">
                        {child.name}
                      </CardTitle>
                      <Badge variant="default" className="bg-green-600 text-white">
                        <Shield className="h-3 w-3 mr-1" />
                        Full Access
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 sm:space-y-3 px-4 sm:px-6 pb-4 sm:pb-6">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium text-green-700 dark:text-green-400">Age:</span>
                        <p className="text-green-600 dark:text-green-300">{child.age} years</p>
                      </div>
                      <div>
                        <span className="font-medium text-green-700 dark:text-green-400">Sessions:</span>
                        <p className="text-green-600 dark:text-green-300">{child.totalSessions}</p>
                      </div>
                    </div>
                    
                    {child.condition && (
                      <div>
                        <span className="font-medium text-green-700 dark:text-green-400 text-sm">Condition:</span>
                        <p className="text-green-600 dark:text-green-300 text-sm">{child.condition}</p>
                      </div>
                    )}
                    
                    {child.notes && (
                      <div>
                        <span className="font-medium text-green-700 dark:text-green-400 text-sm">Notes:</span>
                        <p className="text-green-600 dark:text-green-300 text-sm">{child.notes}</p>
                      </div>
                    )}
                    
                    {child.address && (
                      <div>
                        <span className="font-medium text-green-700 dark:text-green-400 text-sm">Address:</span>
                        <p className="text-green-600 dark:text-green-300 text-sm">{child.address}</p>
                      </div>
                    )}
                    
                    {child.averageRating && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm text-green-600 dark:text-green-300">
                          {child.averageRating.toFixed(1)} average rating
                        </span>
                      </div>
                    )}
                    
                    {child.lastSession && (
                      <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                        <Calendar className="h-3 w-3 mr-1 text-gray-600 dark:text-gray-400" />
                        Last session: {new Date(child.lastSession).toLocaleDateString()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Children with Limited Access */}
      {childrenWithoutAccess.length > 0 && (
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center">
            <ShieldOff className="h-5 w-5 mr-2 text-orange-600" />
            Limited Access ({childrenWithoutAccess.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {childrenWithoutAccess.map((child) => (
              <motion.div
                key={child.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700">
                  <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-orange-800 dark:text-orange-300">
                        {child.name}
                      </CardTitle>
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                        <ShieldOff className="h-3 w-3 mr-1" />
                        Limited
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 sm:space-y-3 px-4 sm:px-6 pb-4 sm:pb-6">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium text-orange-700 dark:text-orange-400">Age:</span>
                        <p className="text-orange-600 dark:text-orange-300">{child.age} years</p>
                      </div>
                      <div>
                        <span className="font-medium text-orange-700 dark:text-orange-400">Sessions:</span>
                        <p className="text-orange-600 dark:text-orange-300">{child.totalSessions}</p>
                      </div>
                    </div>
                    
                    <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg">
                      <div className="flex items-center text-orange-700 dark:text-orange-300 text-sm">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        <span className="font-medium">Limited Information</span>
                      </div>
                      <p className="text-orange-600 dark:text-orange-400 text-xs mt-1">
                        Parent has not granted access to detailed information. You can only see basic details and past sessions.
                      </p>
                    </div>
                    
                    {child.lastSession && (
                      <div className="flex items-center text-xs text-orange-600 dark:text-orange-400">
                        <Calendar className="h-3 w-3 mr-1 text-orange-600 dark:text-orange-400" />
                        Last session: {new Date(child.lastSession).toLocaleDateString()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {childrenWithConsent.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No children yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Children you've worked with will appear here once you have completed sessions.
          </p>
        </div>
      )}
    </div>
  )
}

export default TherapistChildrenView
