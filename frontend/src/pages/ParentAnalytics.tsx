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
  DollarSign,
  Clock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { LoadingSpinner } from '../components/ui/loading-spinner'
import { parentAPI, bookingAPI } from '../lib/api'
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

interface Child {
  id: string
  name: string
  age: number
  condition?: string
}

interface Booking {
  id: string
  status: string
  createdAt: string
  child: Child
  therapist: {
    name: string
    specialization: string
  }
  timeSlot: {
    startTime: string
    endTime: string
  }
}

const ParentAnalytics: React.FC = () => {
  const { data: profile, isLoading: profileLoading } = useQuery(
    'parentProfile',
    parentAPI.getProfile,
    { select: (response) => response.data }
  )

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

  // Calculate stats
  const totalChildren = children.length
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
    const monthlyChildren: { [key: string]: Set<string> } = {}
    
    // Initialize all months with 0
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`
      monthlySessions[monthKey] = 0
      monthlyChildren[monthKey] = new Set()
    }
    
    // Count sessions and unique children per month from real bookings
    bookings.forEach((booking: Booking) => {
      const bookingDate = new Date(booking.createdAt)
      const monthKey = `${bookingDate.getFullYear()}-${bookingDate.getMonth()}`
      if (monthlySessions.hasOwnProperty(monthKey)) {
        monthlySessions[monthKey]++
        if (booking.child?.id) {
          monthlyChildren[monthKey].add(booking.child.id)
        }
      }
    })
    
    // Convert to chart format (last 6 months)
    const chartData = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`
      chartData.push({
        month: monthNames[date.getMonth()],
        sessions: monthlySessions[monthKey] || 0,
        children: monthlyChildren[monthKey]?.size || 0
      })
    }
    
    return chartData
  }, [bookings])

  const childSessionData = children.map((child: Child) => {
    const childBookings = bookings.filter((booking: Booking) => 
      booking.child.id === child.id
    )
    return {
      name: child.name,
      sessions: childBookings.length,
      completed: childBookings.filter((b: Booking) => b.status === 'COMPLETED').length
    }
  })

  const sessionStatusData = [
    { name: 'Completed', value: completedSessions, color: '#10B981' },
    { name: 'Upcoming', value: upcomingSessions, color: '#3B82F6' },
    { name: 'Cancelled', value: totalBookings - completedSessions - upcomingSessions, color: '#F59E0B' },
  ]

  const therapistData = bookings.reduce((acc: any, booking: Booking) => {
    const therapistName = booking.therapist.name
    if (!acc[therapistName]) {
      acc[therapistName] = {
        name: therapistName,
        specialization: booking.therapist.specialization,
        sessions: 0
      }
    }
    acc[therapistName].sessions++
    return acc
  }, {})

  const therapistChartData = Object.values(therapistData).slice(0, 5)

  const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444']

  if (profileLoading || childrenLoading || bookingsLoading) {
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
        <div className="absolute inset-0 bg-[#F9F9F9] rounded-2xl" />
        <div className="relative p-4 sm:p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] mb-2">
                <span className="text-[#1A1A1A]">Analytics</span> Dashboard
              </h1>
              <p className="text-[#4D4D4D] text-base sm:text-lg">
                Track your children's therapy progress and session insights
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-2xl font-bold text-[#1A1A1A]">
                  {completionRate}%
                </p>
                <p className="text-sm text-[#4D4D4D]">
                  Completion Rate
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Sessions</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{totalBookings}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Completed</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{completedSessions}</p>
              </div>
              <Target className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">My Children</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{totalChildren}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Upcoming</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{upcomingSessions}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400" />
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
          <Card className="bg-white shadow-gentle rounded-xl border border-gray-border">
            <CardHeader className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="text-xl font-semibold text-[#1A1A1A] flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
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

        {/* Child Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="bg-white shadow-gentle rounded-xl border border-gray-border">
            <CardHeader className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="text-xl font-semibold text-[#1A1A1A] flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                Child Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={childSessionData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Bar dataKey="sessions" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Session Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="bg-white shadow-gentle rounded-xl border border-gray-border">
            <CardHeader className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="text-xl font-semibold text-[#1A1A1A] flex items-center">
                <Target className="h-5 w-5 mr-2 text-orange-600 dark:text-orange-400" />
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

        {/* Therapist Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <Card className="bg-white shadow-gentle rounded-xl border border-gray-border">
            <CardHeader className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="text-xl font-semibold text-[#1A1A1A] flex items-center">
                <Users className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
                Therapist Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={therapistChartData} layout="horizontal">
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
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
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <Card className="bg-white shadow-gentle rounded-xl border border-gray-border">
          <CardHeader className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="text-xl font-semibold text-[#1A1A1A] flex items-center">
              <Award className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
              Progress Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {totalChildren}
                </div>
                <div className="text-sm text-[#4D4D4D]">Children in Therapy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {completionRate}%
                </div>
                <div className="text-sm text-[#4D4D4D]">Session Completion Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {therapistChartData.length}
                </div>
                <div className="text-sm text-[#4D4D4D]">Active Therapists</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                  {upcomingSessions}
                </div>
                <div className="text-sm text-[#4D4D4D]">Upcoming Sessions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default ParentAnalytics
