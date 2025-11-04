import React, { useState } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { motion } from 'framer-motion'
import { therapistAPI } from '../lib/api'
import { 
  Calendar, 
  Clock, 
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { LoadingSpinner } from '../components/ui/loading-spinner'
import RequestLeaveModal from '../components/RequestLeaveModal'

const TherapistSchedule: React.FC = () => {
  const [showRequestLeaveModal, setShowRequestLeaveModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const queryClient = useQueryClient()

  const { data: profile, isLoading: profileLoading } = useQuery(
    'therapistProfile',
    therapistAPI.getProfile,
    { select: (response) => response.data }
  )

  // Check if therapist has active slots
  const { data: hasActiveSlotsData, isLoading: checkingSlots } = useQuery(
    'therapistHasActiveSlots',
    therapistAPI.checkHasActiveSlots,
    { 
      select: (response) => response.data,
      enabled: !!profile,
      retry: 1,
    }
  )

  // Get slots for selected date
  const { data: slotsData, isLoading: slotsLoading, refetch: refetchSlots } = useQuery(
    ['therapistSlots', selectedDate],
    () => therapistAPI.getMySlots(selectedDate),
    { 
      select: (response) => response.data,
      enabled: !!selectedDate && !!profile,
    }
  )

  // Calculate stats
  const totalSlots = slotsData?.slots?.length || 0
  const activeSlots = slotsData?.slots?.filter((slot: any) => slot.isActive)?.length || 0
  const bookedSlots = slotsData?.slots?.filter((slot: any) => slot.isBooked)?.length || 0
  const availableSlots = slotsData?.slots?.filter((slot: any) => slot.isActive && !slot.isBooked)?.length || 0

  const stats = [
    {
      title: 'Total Slots',
      value: totalSlots,
      icon: Calendar,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Active Slots',
      value: activeSlots,
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Booked Slots',
      value: bookedSlots,
      icon: Clock,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      title: 'Available Slots',
      value: availableSlots,
      icon: AlertCircle,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      textColor: 'text-orange-600 dark:text-orange-400'
    }
  ]

  if (profileLoading || checkingSlots) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[#F9F9F9] dark:bg-black rounded-2xl" />
        <div className="relative p-4 sm:p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] dark:text-white mb-2">
                My Schedule
              </h1>
              <p className="text-[#4D4D4D] dark:text-gray-300 text-base sm:text-lg">
                Manage your time slots and availability
              </p>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-4 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => setShowRequestLeaveModal(true)}
                className="border-gray-border text-[#1A1A1A] hover:bg-[#F9F9F9]"
              >
                <Settings className="h-4 w-4 mr-2" />
                Request Leave
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="bg-white dark:bg-black shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.title}</p>
                    <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.textColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </motion.div>

      {/* Available Slot Times */}
      {hasActiveSlotsData?.hasActiveSlots && profile?.availableSlotTimes && profile.availableSlotTimes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-white dark:bg-black shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
            <CardHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Clock className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
                Available Slot Times
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Your configured available time slots that apply to all future dates
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {profile.availableSlotTimes.sort().map((time: string) => {
                  const [hours, minutes] = time.split(':').map(Number)
                  const endHour = (hours + 1) % 24
                  
                  const time12h = new Date(2000, 0, 1, hours, minutes).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                  })
                  const endTime12h = new Date(2000, 0, 1, endHour, 0).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                  })
                  
                  return (
                    <div
                      key={time}
                      className="flex flex-col items-center justify-center p-4 border-2 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 rounded-lg"
                    >
                      <div className="text-lg font-semibold text-purple-700 dark:text-purple-400 mb-1">
                        {time12h}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        to {endTime12h}
                      </div>
                      <div className="mt-2 px-2 py-1 bg-purple-100 dark:bg-purple-900/40 rounded text-xs text-purple-700 dark:text-purple-400 font-medium">
                        1 Hour
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Date Selection & Slots View */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <Card className="bg-white dark:bg-black shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
          <CardHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                  Slots for Selected Date
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  View and manage your time slots for a specific date
                </p>
              </div>
              <div className="w-full sm:w-auto">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {slotsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-300">Loading slots...</span>
              </div>
            ) : !slotsData?.slots || slotsData.slots.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                <p className="text-lg font-medium mb-2 text-gray-900 dark:text-white">No slots found for this date</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Slots will be generated automatically based on your available slot times</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {slotsData.slots.map((slot: any) => {
                  const startTime = new Date(slot.startTime)
                  const endTime = new Date(slot.endTime)
                  const timeStr = `${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })} - ${endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`
                  
                  return (
                    <div
                      key={slot.id}
                      className={`p-4 rounded-lg border-2 ${
                        slot.isBooked
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : slot.isActive
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-300 bg-gray-50 dark:bg-black'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {timeStr}
                        </div>
                        <div className="flex items-center gap-1">
                          {slot.isBooked ? (
                            <span className="px-2 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 rounded">
                              Booked
                            </span>
                          ) : slot.isActive ? (
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 rounded">
                              Available
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-black text-gray-700 dark:text-white rounded">
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                      {slot.booking && (
                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Child:</span> {slot.booking.child?.name || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Parent:</span> {slot.booking.parent?.name || 'N/A'}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Modals */}
      {showRequestLeaveModal && (
        <RequestLeaveModal
          onClose={() => setShowRequestLeaveModal(false)}
          onSuccess={() => {
            queryClient.invalidateQueries('therapistProfile')
            setShowRequestLeaveModal(false)
          }}
        />
      )}
    </div>
  )
}

export default TherapistSchedule

