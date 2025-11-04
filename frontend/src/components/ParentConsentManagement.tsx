import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { motion } from 'framer-motion'
import { 
  Users, 
  Shield, 
  ShieldOff, 
  ToggleLeft, 
  ToggleRight, 
  AlertCircle,
  CheckCircle,
  User,
  Calendar,
  Clock,
  Star,
  Settings
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { parentAPI, bookingAPI, feedbackAPI } from '../lib/api'
import toast from 'react-hot-toast'

interface ChildConsent {
  id: string
  name: string
  age: number
  condition?: string
  hasConsent: boolean
  totalSessions: number
  lastSession?: string
  averageRating?: number
  therapistName?: string
}

const ParentConsentManagement: React.FC = () => {
  const [selectedChild, setSelectedChild] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: children = [], isLoading: childrenLoading } = useQuery(
    'parentChildren',
    parentAPI.getChildren,
    { select: (response) => response.data }
  )

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery(
    'parentBookings',
    bookingAPI.getMyBookings,
    { select: (response) => response.data }
  )

  // Process children with consent information
  const childrenWithConsent: ChildConsent[] = React.useMemo(() => {
    return children.map((child: any) => {
      const childBookings = bookings.filter((booking: any) => booking.child?.id === child.id)
      const completedBookings = childBookings.filter((booking: any) => booking.status === 'COMPLETED')
      const hasConsent = completedBookings.some((booking: any) => booking.ConsentRequest?.status === 'GRANTED')
      
      // Get latest therapist name
      const latestBooking = childBookings.sort((a: any, b: any) => 
        new Date(b.timeSlot.startTime).getTime() - new Date(a.timeSlot.startTime).getTime()
      )[0]
      
      // Calculate average rating
      const ratings = completedBookings
        .map((booking: any) => booking.SessionFeedback?.rating)
        .filter(rating => rating !== undefined)
      const averageRating = ratings.length > 0 
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
        : undefined

      return {
        id: child.id,
        name: child.name,
        age: child.age,
        condition: child.condition,
        hasConsent,
        totalSessions: completedBookings.length,
        lastSession: completedBookings.length > 0 
          ? completedBookings.sort((a: any, b: any) => 
              new Date(b.timeSlot.startTime).getTime() - new Date(a.timeSlot.startTime).getTime()
            )[0].timeSlot.startTime
          : undefined,
        averageRating,
        therapistName: latestBooking?.therapist?.name
      }
    })
  }, [children, bookings])

  const toggleConsentMutation = useMutation(
    async ({ childId, hasConsent }: { childId: string, hasConsent: boolean }) => {
      // Find the latest completed booking for this child
      const childBookings = bookings.filter((booking: any) => 
        booking.child?.id === childId && booking.status === 'COMPLETED'
      )
      
      if (childBookings.length === 0) {
        throw new Error('No completed sessions found for this child')
      }

      const latestBooking = childBookings.sort((a: any, b: any) => 
        new Date(b.timeSlot.startTime).getTime() - new Date(a.timeSlot.startTime).getTime()
      )[0]

      if (hasConsent) {
        // Grant consent
        await feedbackAPI.updateConsent({
          bookingId: latestBooking.id,
          status: 'GRANTED',
          notes: 'Parent granted consent through consent management'
        })
      } else {
        // Revoke consent
        await feedbackAPI.updateConsent({
          bookingId: latestBooking.id,
          status: 'DENIED',
          notes: 'Parent revoked consent through consent management'
        })
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('parentBookings')
        toast.success('Consent status updated successfully')
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to update consent')
      }
    }
  )

  const handleToggleConsent = (childId: string, currentConsent: boolean) => {
    toggleConsentMutation.mutate({ 
      childId, 
      hasConsent: !currentConsent 
    })
  }

  if (childrenLoading || bookingsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading consent data...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Settings className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-blue-600" />
            Consent Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
            Manage which therapists can access your children's detailed information
          </p>
        </div>
        <div className="flex items-center space-x-3 sm:space-x-4 text-sm flex-wrap gap-2">
          <div className="flex items-center text-green-600">
            <CheckCircle className="h-4 w-4 mr-1" />
            {childrenWithConsent.filter(c => c.hasConsent).length} with access
          </div>
          <div className="flex items-center text-orange-600">
            <AlertCircle className="h-4 w-4 mr-1" />
            {childrenWithConsent.filter(c => !c.hasConsent).length} restricted
          </div>
        </div>
      </div>

      {/* Children List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {childrenWithConsent.map((child) => (
          <motion.div
            key={child.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={`${
              child.hasConsent 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
                : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700'
            }`}>
              <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                <div className="flex items-center justify-between">
                  <CardTitle className={`text-lg ${
                    child.hasConsent 
                      ? 'text-green-800 dark:text-green-300' 
                      : 'text-orange-800 dark:text-orange-300'
                  }`}>
                    {child.name}
                  </CardTitle>
                  <Badge variant={child.hasConsent ? "default" : "secondary"} 
                    className={child.hasConsent 
                      ? 'bg-green-600 text-white' 
                      : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                    }>
                    {child.hasConsent ? (
                      <>
                        <Shield className="h-3 w-3 mr-1" />
                        Access Granted
                      </>
                    ) : (
                      <>
                        <ShieldOff className="h-3 w-3 mr-1" />
                        Restricted
                      </>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
                {/* Child Info */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className={`font-medium ${
                      child.hasConsent 
                        ? 'text-green-700 dark:text-green-400' 
                        : 'text-orange-700 dark:text-orange-400'
                    }`}>
                      Age:
                    </span>
                    <p className={`${
                      child.hasConsent 
                        ? 'text-green-600 dark:text-green-300' 
                        : 'text-orange-600 dark:text-orange-300'
                    }`}>
                      {child.age} years
                    </p>
                  </div>
                  <div>
                    <span className={`font-medium ${
                      child.hasConsent 
                        ? 'text-green-700 dark:text-green-400' 
                        : 'text-orange-700 dark:text-orange-400'
                    }`}>
                      Sessions:
                    </span>
                    <p className={`${
                      child.hasConsent 
                        ? 'text-green-600 dark:text-green-300' 
                        : 'text-orange-600 dark:text-orange-300'
                    }`}>
                      {child.totalSessions}
                    </p>
                  </div>
                </div>

                {child.condition && (
                  <div>
                    <span className={`font-medium text-sm ${
                      child.hasConsent 
                        ? 'text-green-700 dark:text-green-400' 
                        : 'text-orange-700 dark:text-orange-400'
                    }`}>
                      Condition:
                    </span>
                    <p className={`text-sm ${
                      child.hasConsent 
                        ? 'text-green-600 dark:text-green-300' 
                        : 'text-orange-600 dark:text-orange-300'
                    }`}>
                      {child.condition}
                    </p>
                  </div>
                )}

                {child.therapistName && (
                  <div>
                    <span className={`font-medium text-sm ${
                      child.hasConsent 
                        ? 'text-green-700 dark:text-green-400' 
                        : 'text-orange-700 dark:text-orange-400'
                    }`}>
                      Latest Therapist:
                    </span>
                    <p className={`text-sm ${
                      child.hasConsent 
                        ? 'text-green-600 dark:text-green-300' 
                        : 'text-orange-600 dark:text-orange-300'
                    }`}>
                      {child.therapistName}
                    </p>
                  </div>
                )}

                {child.averageRating && (
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className={`text-sm ${
                      child.hasConsent 
                        ? 'text-green-600 dark:text-green-300' 
                        : 'text-orange-600 dark:text-orange-300'
                    }`}>
                      {child.averageRating.toFixed(1)} average rating
                    </span>
                  </div>
                )}

                {child.lastSession && (
                  <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                    <Calendar className="h-3 w-3 mr-1" />
                    Last session: {new Date(child.lastSession).toLocaleDateString()}
                  </div>
                )}

                {/* Consent Toggle */}
                <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        child.hasConsent 
                          ? 'text-green-700 dark:text-green-400' 
                          : 'text-orange-700 dark:text-orange-400'
                      }`}>
                        Therapist Access
                      </p>
                      <p className={`text-xs ${
                        child.hasConsent 
                          ? 'text-green-600 dark:text-green-300' 
                          : 'text-orange-600 dark:text-orange-300'
                      }`}>
                        {child.hasConsent 
                          ? 'Therapists can view detailed information' 
                          : 'Therapists can only see basic information'
                        }
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleConsent(child.id, child.hasConsent)}
                      disabled={toggleConsentMutation.isLoading || child.totalSessions === 0}
                      className={`${
                        child.hasConsent 
                          ? 'text-green-600 hover:text-green-700 hover:bg-green-100' 
                          : 'text-orange-600 hover:text-orange-700 hover:bg-orange-100'
                      }`}
                    >
                      {child.hasConsent ? (
                        <ToggleRight className="h-5 w-5" />
                      ) : (
                        <ToggleLeft className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                  
                  {child.totalSessions === 0 && (
                    <div className="mt-2 p-2 bg-gray-100 dark:bg-black dark:border dark:border-gray-700 rounded text-xs text-gray-600 dark:text-gray-300">
                      <AlertCircle className="h-3 w-3 inline mr-1" />
                      No completed sessions yet. Consent can be managed after the first session.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {childrenWithConsent.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No children found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Add children to your profile to manage their consent settings.
          </p>
        </div>
      )}
    </div>
  )
}

export default ParentConsentManagement
