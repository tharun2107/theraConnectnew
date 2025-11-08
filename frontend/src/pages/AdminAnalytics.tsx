import React from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { useTheme } from '../contexts/ThemeContext'
import { adminAPI } from '../lib/api'
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

interface TherapistStats {
  id: string
  name: string
  totalSessions: number
  completedSessions: number
  averageRating: number
  totalEarnings: number
  activeDays: number
  specialization: string
}

const AdminAnalytics: React.FC = () => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  const { data: therapists = [], isLoading: therapistsLoading } = useQuery(
    'allTherapists',
    adminAPI.getAllTherapists,
    { select: (response) => response.data }
  )

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery(
    'allBookings',
    adminAPI.getAllBookings,
    { select: (response) => response.data }
  )

  // Calculate therapist statistics
  const therapistStats: TherapistStats[] = therapists.map((therapist: any) => {
    const therapistBookings = bookings.filter((booking: any) => 
      booking.therapist?.id === therapist.id
    )
    
    const completedSessions = therapistBookings.filter((booking: any) => 
      booking.status === 'COMPLETED'
    )
    
    const totalEarnings = completedSessions.length * therapist.baseCostPerSession
    
    // Calculate active days (simplified - based on unique session dates)
    const activeDays = new Set(
      therapistBookings.map((booking: any) => 
        new Date(booking.timeSlot.startTime).toDateString()
      )
    ).size

    return {
      id: therapist.id,
      name: therapist.name,
      totalSessions: therapistBookings.length,
      completedSessions: completedSessions.length,
      averageRating: therapist.averageRating,
      totalEarnings,
      activeDays,
      specialization: therapist.specialization
    }
  })

  // Sort therapists by different metrics
  const topRatedTherapists = [...therapistStats]
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, 5)

  const mostActiveTherapists = [...therapistStats]
    .sort((a, b) => b.totalSessions - a.totalSessions)
    .slice(0, 5)

  const topEarningTherapists = [...therapistStats]
    .sort((a, b) => b.totalEarnings - a.totalEarnings)
    .slice(0, 5)

  // Overall platform statistics
  const totalSessions = bookings.length
  const completedSessions = bookings.filter((booking: any) => 
    booking.status === 'COMPLETED'
  ).length
  const totalEarnings = therapistStats.reduce((sum, therapist) => 
    sum + therapist.totalEarnings, 0
  )
  const averageRating = therapistStats.length > 0 
    ? therapistStats.reduce((sum, therapist) => sum + therapist.averageRating, 0) / therapistStats.length 
    : 0

  // Generate real-time monthly session data from bookings
  const sessionTrendData = React.useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthlySessions: { [key: string]: number } = {}
    const monthlyRevenue: { [key: string]: number } = {}
    
    // Initialize all months with 0
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`
      monthlySessions[monthKey] = 0
      monthlyRevenue[monthKey] = 0
    }
    
    // Count sessions and calculate revenue per month from real bookings
    bookings.forEach((booking: any) => {
      const bookingDate = new Date(booking.createdAt)
      const monthKey = `${bookingDate.getFullYear()}-${bookingDate.getMonth()}`
      if (monthlySessions.hasOwnProperty(monthKey)) {
        monthlySessions[monthKey]++
        // Calculate revenue for completed sessions only
        if (booking.status === 'COMPLETED' && booking.therapist?.baseCostPerSession) {
          monthlyRevenue[monthKey] += booking.therapist.baseCostPerSession
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
        revenue: monthlyRevenue[monthKey] || 0
      })
    }
    
    return chartData
  }, [bookings])

  const therapistPerformanceData = therapistStats.slice(0, 6).map(therapist => ({
    name: therapist.name.split(' ')[0], // First name only for chart
    sessions: therapist.totalSessions,
    rating: therapist.averageRating,
    earnings: therapist.totalEarnings
  }))

  const sessionStatusData = [
    { name: 'Completed', value: completedSessions, color: '#10B981' },
    { name: 'Scheduled', value: totalSessions - completedSessions, color: '#F59E0B' },
  ]

  const specializationData = therapists.reduce((acc: any, therapist: any) => {
    const spec = therapist.specialization
    acc[spec] = (acc[spec] || 0) + 1
    return acc
  }, {})

  const specializationChartData = Object.entries(specializationData).map(([name, value]) => ({
    name,
    therapists: value
  }))

  const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

  if (therapistsLoading || bookingsLoading) {
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
                Platform <span className="text-[#1A1A1A] dark:text-white">Analytics</span>
              </h1>
              <p className="text-[#4D4D4D] dark:text-gray-300 text-base sm:text-lg">
                Comprehensive insights into your therapy platform performance
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-2xl font-bold text-[#1A1A1A] dark:text-white">
                  {totalSessions}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Total Sessions
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">
                  ${totalEarnings.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Revenue
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
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{totalSessions}</p>
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

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-700">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Avg Rating</p>
                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                  {averageRating.toFixed(1)}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Revenue</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  ${totalEarnings.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Rated Therapists */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-white dark:bg-black shadow-gentle rounded-xl border border-gray-border dark:border-gray-700">
            <CardHeader className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="text-lg font-semibold text-[#1A1A1A] dark:text-white flex items-center">
                <Award className="h-5 w-5 mr-2 text-yellow-600 dark:text-yellow-400" />
                Top Rated Therapists
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                {topRatedTherapists.map((therapist, index) => (
                  <div key={therapist.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-black dark:border dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-[#1A1A1A] dark:text-white">{therapist.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{therapist.specialization}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-semibold text-[#1A1A1A] dark:text-white">
                        {therapist.averageRating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Most Active Therapists */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="bg-white dark:bg-black shadow-gentle rounded-xl border border-gray-border dark:border-gray-700">
            <CardHeader className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="text-lg font-semibold text-[#1A1A1A] dark:text-white flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                Most Active Therapists
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                {mostActiveTherapists.map((therapist, index) => (
                  <div key={therapist.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-black dark:border dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-[#1A1A1A] dark:text-white">{therapist.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{therapist.specialization}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[#1A1A1A] dark:text-white">
                        {therapist.totalSessions}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">sessions</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Earning Therapists */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="bg-white dark:bg-black shadow-gentle rounded-xl border border-gray-border dark:border-gray-700">
            <CardHeader className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="text-lg font-semibold text-[#1A1A1A] dark:text-white flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                Top Earning Therapists
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                {topEarningTherapists.map((therapist, index) => (
                  <div key={therapist.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-black dark:border dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-[#1A1A1A] dark:text-white">{therapist.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{therapist.specialization}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[#1A1A1A] dark:text-white">
                        ${therapist.totalEarnings.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">earned</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts and Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Session Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <Card className="bg-white dark:bg-black shadow-gentle rounded-xl border border-gray-border dark:border-gray-700">
            <CardHeader className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="text-xl font-semibold text-[#1A1A1A] dark:text-white flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                Session Trends
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={sessionTrendData}>
                  <defs>
                    <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="month" 
                    stroke={isDark ? '#9CA3AF' : '#6B7280'}
                    tick={{ fill: isDark ? '#9CA3AF' : '#6B7280' }}
                  />
                  <YAxis 
                    stroke={isDark ? '#9CA3AF' : '#6B7280'}
                    tick={{ fill: isDark ? '#9CA3AF' : '#6B7280' }}
                  />
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#1F2937' : '#fff', 
                      border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: isDark ? '#F9FAFB' : '#1A1A1A' }}
                    itemStyle={{ color: isDark ? '#F9FAFB' : '#1A1A1A' }}
                  />
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

        {/* Therapist Performance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Card className="bg-white dark:bg-black shadow-gentle rounded-xl border border-gray-border dark:border-gray-700">
            <CardHeader className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="text-xl font-semibold text-[#1A1A1A] dark:text-white flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                Therapist Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={therapistPerformanceData}>
                  <XAxis 
                    dataKey="name" 
                    stroke={isDark ? '#9CA3AF' : '#6B7280'}
                    tick={{ fill: isDark ? '#9CA3AF' : '#6B7280' }}
                  />
                  <YAxis 
                    stroke={isDark ? '#9CA3AF' : '#6B7280'}
                    tick={{ fill: isDark ? '#9CA3AF' : '#6B7280' }}
                  />
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#1F2937' : '#fff', 
                      border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: isDark ? '#F9FAFB' : '#1A1A1A' }}
                    itemStyle={{ color: isDark ? '#F9FAFB' : '#1A1A1A' }}
                  />
                  <Bar dataKey="sessions" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Session Status Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <Card className="bg-white dark:bg-black shadow-gentle rounded-xl border border-gray-border dark:border-gray-700">
            <CardHeader className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="text-xl font-semibold text-[#1A1A1A] dark:text-white flex items-center">
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
                    label={({ name, percent, cx, cy, midAngle, innerRadius, outerRadius }) => {
                      const RADIAN = Math.PI / 180
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.5
                      const x = cx + radius * Math.cos(-midAngle * RADIAN)
                      const y = cy + radius * Math.sin(-midAngle * RADIAN)
                      
                      return (
                        <text
                          x={x}
                          y={y}
                          fill={isDark ? '#F9FAFB' : '#1A1A1A'}
                          textAnchor={x > cx ? 'start' : 'end'}
                          dominantBaseline="central"
                          fontSize={12}
                          fontWeight={500}
                        >
                          {`${name} ${(percent * 100).toFixed(0)}%`}
                        </text>
                      )
                    }}
                    labelLine={{ stroke: isDark ? '#9CA3AF' : '#6B7280' }}
                  >
                    {sessionStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#1F2937' : '#fff', 
                      border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: isDark ? '#F9FAFB' : '#1A1A1A' }}
                    itemStyle={{ color: isDark ? '#F9FAFB' : '#1A1A1A' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Specialization Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <Card className="bg-white dark:bg-black shadow-gentle rounded-xl border border-gray-border dark:border-gray-700">
            <CardHeader className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="text-xl font-semibold text-[#1A1A1A] dark:text-white flex items-center">
                <Users className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
                Specialization Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={specializationChartData} layout="horizontal">
                  <XAxis 
                    type="number" 
                    stroke={isDark ? '#9CA3AF' : '#6B7280'}
                    tick={{ fill: isDark ? '#9CA3AF' : '#6B7280' }}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={100}
                    stroke={isDark ? '#9CA3AF' : '#6B7280'}
                    tick={{ fill: isDark ? '#9CA3AF' : '#6B7280' }}
                  />
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#1F2937' : '#fff', 
                      border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: isDark ? '#F9FAFB' : '#1A1A1A' }}
                    itemStyle={{ color: isDark ? '#F9FAFB' : '#1A1A1A' }}
                  />
                  <Bar dataKey="therapists" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detailed Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.1 }}
      >
        <Card className="bg-white dark:bg-black shadow-gentle rounded-xl border border-gray-border dark:border-gray-700">
          <CardHeader className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="text-xl font-semibold text-[#1A1A1A] dark:text-white flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
              Platform Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {therapists.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Therapists</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {Math.round((completedSessions / totalSessions) * 100) || 0}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {therapistStats.length > 0 ? Math.round(therapistStats.reduce((sum, t) => sum + t.activeDays, 0) / therapistStats.length) : 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg Active Days</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                  ${Math.round(totalEarnings / therapistStats.length) || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg Revenue per Therapist</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default AdminAnalytics
