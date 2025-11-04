import React from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Star, 
  Calendar,
  Award,
  Target,
  Activity,
  Clock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { LoadingSpinner } from '../components/ui/loading-spinner'
import { therapistAPI, bookingAPI } from '../lib/api'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

interface Booking {
  id: string
  status: string
  createdAt: string
  child?: {
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
}

const TherapistAnalytics: React.FC = () => {
  const { data: profile, isLoading: profileLoading } = useQuery(
    'therapistProfile',
    therapistAPI.getProfile,
    { select: (response) => response.data }
  )

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery(
    'therapistBookings',
    bookingAPI.getMyBookings,
    { select: (response) => response.data }
  )

  // Calculate stats
  const totalBookings = bookings.length
  const completedSessions = bookings.filter((booking: Booking) => 
    booking.status === 'COMPLETED'
  ).length
  const upcomingSessions = bookings.filter((booking: Booking) => 
    new Date(booking.timeSlot.startTime) > new Date() && booking.status === 'SCHEDULED'
  ).length

  // Calculate completion rate
  const completionRate = totalBookings > 0 ? Math.round((completedSessions / totalBookings) * 100) : 0

  // Generate real-time monthly session data from bookings
  const monthlyData = React.useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthlySessions: { [key: string]: number } = {}
    
    // Initialize all months with 0
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`
      monthlySessions[monthKey] = 0
    }
    
    // Count sessions per month from real bookings
    bookings.forEach((booking: Booking) => {
      const bookingDate = new Date(booking.createdAt)
      const monthKey = `${bookingDate.getFullYear()}-${bookingDate.getMonth()}`
      if (monthlySessions.hasOwnProperty(monthKey)) {
        monthlySessions[monthKey]++
      }
    })
    
    // Convert to chart format (last 6 months)
    const chartData = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`
      chartData.push({
        month: monthNames[date.getMonth()],
        sessions: monthlySessions[monthKey] || 0
      })
    }
    
    return chartData
  }, [bookings])

  const sessionStatusData = [
    { name: 'Completed', value: completedSessions, color: '#10B981' },
    { name: 'Upcoming', value: upcomingSessions, color: '#3B82F6' },
    { name: 'Cancelled', value: totalBookings - completedSessions - upcomingSessions, color: '#F59E0B' },
  ]

  const childData = bookings.reduce((acc: any, booking: Booking) => {
    if (booking.child) {
      const childName = booking.child.name
      if (!acc[childName]) {
        acc[childName] = {
          name: childName,
          sessions: 0,
          age: booking.child.age
        }
      }
      acc[childName].sessions++
    }
    return acc
  }, {})

  const childChartData = Object.values(childData).slice(0, 6)

  const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

  if (profileLoading || bookingsLoading) {
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
                <span className="text-[#1A1A1A] dark:text-white">Analytics</span> Dashboard
              </h1>
              <p className="text-[#4D4D4D] dark:text-gray-300 text-base sm:text-lg">
                Track your therapy practice performance and insights
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card className="bg-[#F9F9F9] dark:bg-black border-gray-border dark:border-gray-700">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#1A1A1A] dark:text-white">Total Sessions</p>
                <p className="text-2xl font-bold text-[#1A1A1A] dark:text-white">{totalBookings}</p>
              </div>
              <Calendar className="h-8 w-8 text-[#1A1A1A] dark:text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-accent-green/20 border-accent-green/30">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#1A1A1A] dark:text-white">Completed</p>
                <p className="text-2xl font-bold text-[#1A1A1A] dark:text-white">{completedSessions}</p>
              </div>
              <Target className="h-8 w-8 text-[#1A1A1A] dark:text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#F9F9F9] dark:bg-black border-gray-border dark:border-gray-700">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#1A1A1A] dark:text-white">Completion Rate</p>
                <p className="text-2xl font-bold text-[#1A1A1A] dark:text-white">{completionRate}%</p>
              </div>
              <Award className="h-8 w-8 text-[#1A1A1A] dark:text-white" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts and Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Session Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-white dark:bg-black shadow-gentle rounded-xl border border-gray-border dark:border-gray-700">
            <CardHeader className="p-4 sm:p-6 border-b border-gray-border">
              <CardTitle className="text-xl font-semibold text-[#1A1A1A] dark:text-white flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-[#1A1A1A] dark:text-white" />
                Session Trends
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="sessions" 
                    stroke="#8B5CF6" 
                    fillOpacity={1} 
                    fill="url(#colorSessions)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Session Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="bg-white dark:bg-black shadow-gentle rounded-xl border border-gray-border dark:border-gray-700">
            <CardHeader className="p-4 sm:p-6 border-b border-gray-border">
              <CardTitle className="text-xl font-semibold text-[#1A1A1A] dark:text-white flex items-center">
                <Target className="h-5 w-5 mr-2 text-[#4D4D4D] dark:text-gray-300" />
                Session Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={sessionStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {sessionStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Child Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="bg-white dark:bg-black shadow-gentle rounded-xl border border-gray-border dark:border-gray-700">
            <CardHeader className="p-4 sm:p-6 border-b border-gray-border">
              <CardTitle className="text-xl font-semibold text-[#1A1A1A] dark:text-white flex items-center">
                <Users className="h-5 w-5 mr-2 text-[#1A1A1A] dark:text-white" />
                Sessions by Child
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={childChartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Bar dataKey="sessions" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <Card className="bg-white shadow-gentle rounded-xl border border-gray-border">
          <CardHeader className="p-4 sm:p-6 border-b border-gray-border">
            <CardTitle className="text-xl font-semibold text-[#1A1A1A] flex items-center">
              <Award className="h-5 w-5 mr-2 text-[#1A1A1A]" />
              Practice Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] mb-2">
                  {profile?.averageRating?.toFixed(1) || '0.0'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {childChartData.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active Children</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-[#4D4D4D] mb-2">
                  {upcomingSessions}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Upcoming Sessions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default TherapistAnalytics
