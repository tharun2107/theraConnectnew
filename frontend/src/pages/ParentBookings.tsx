import React from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { Calendar, Clock, User, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { LoadingSpinner } from '../components/ui/loading-spinner'
import { bookingAPI } from '../lib/api'
import SessionDetails from '../components/SessionDetails'

interface Booking {
  id: string
  status: string
  createdAt: string
  child: {
    name: string
    age: number
  }
  therapist: {
    name: string
    specialization: string
  }
  timeSlot: {
    startTime: string
    endTime: string
  }
}

const ParentBookings: React.FC = () => {
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery(
    'parentBookings',
    bookingAPI.getMyBookings,
    { select: (response) => response.data }
  )

  const upcomingBookings = bookings.filter((booking: Booking) => 
    new Date(booking.timeSlot.startTime) > new Date() && booking.status === 'SCHEDULED'
  )

  const completedBookings = bookings.filter((booking: Booking) => 
    booking.status === 'COMPLETED'
  )

  const cancelledBookings = bookings.filter((booking: Booking) => 
    booking.status.includes('CANCELLED')
  )

  if (bookingsLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10 dark:from-blue-600/20 dark:via-purple-600/20 dark:to-blue-600/20 rounded-2xl" />
        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                My <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Bookings</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Manage and view all your therapy session bookings
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {bookings.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Bookings
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Upcoming</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{upcomingBookings.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Completed</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{completedBookings.length}</p>
              </div>
              <Star className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Cancelled</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{cancelledBookings.length}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Upcoming Bookings */}
      {upcomingBookings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
            <CardHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                Upcoming Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {upcomingBookings
                  .sort((a: Booking, b: Booking) => 
                    new Date(a.timeSlot.startTime).getTime() - new Date(b.timeSlot.startTime).getTime()
                  )
                  .map((booking: Booking) => (
                    <SessionDetails
                      key={booking.id}
                      booking={booking}
                      userRole="PARENT"
                    />
                  ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Completed Bookings */}
      {completedBookings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
            <CardHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Star className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                Completed Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {completedBookings
                  .sort((a: Booking, b: Booking) => 
                    new Date(b.timeSlot.startTime).getTime() - new Date(a.timeSlot.startTime).getTime()
                  )
                  .map((booking: Booking) => (
                    <SessionDetails
                      key={booking.id}
                      booking={booking}
                      userRole="PARENT"
                    />
                  ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Cancelled Bookings */}
      {cancelledBookings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
            <CardHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Clock className="h-5 w-5 mr-2 text-orange-600 dark:text-orange-400" />
                Cancelled Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {cancelledBookings
                  .sort((a: Booking, b: Booking) => 
                    new Date(b.timeSlot.startTime).getTime() - new Date(a.timeSlot.startTime).getTime()
                  )
                  .map((booking: Booking) => (
                    <SessionDetails
                      key={booking.id}
                      booking={booking}
                      userRole="PARENT"
                    />
                  ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* No Bookings */}
      {bookings.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
            <CardContent className="p-12 text-center">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No bookings yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start by finding therapists and booking sessions for your children.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

export default ParentBookings
