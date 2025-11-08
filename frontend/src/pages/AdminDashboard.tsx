import React from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { motion } from 'framer-motion'
import { adminAPI } from '../lib/api'
import { 
  Users, 
  UserCheck, 
  UserX, 
  Shield, 
  Stethoscope,
  Star,
  Plus,
  Calendar,
  History,
  FileText
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Avatar, AvatarFallback } from '../components/ui/avatar'
import { StatsCard } from '../components/ui/stats-card'
import { LoadingSpinner } from '../components/ui/loading-spinner'
import { GradientText } from '../components/ui/gradient-text'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

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

const AdminDashboard: React.FC = () => {
  const queryClient = useQueryClient()

  const { data: therapists = [], isLoading: therapistsLoading } = useQuery(
    'allTherapists',
    adminAPI.getAllTherapists,
    {
      select: (response) => response.data,
    }
  )

  const updateStatusMutation = useMutation(
    ({ therapistId, status }: { therapistId: string; status: string }) =>
      adminAPI.updateTherapistStatus(therapistId, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('allTherapists')
        toast.success('Therapist status updated successfully')
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to update status')
      },
    }
  )

  const handleStatusUpdate = (therapistId: string, status: string) => {
    updateStatusMutation.mutate({ therapistId, status })
  }

  // Calculate stats
  const totalTherapists = therapists.length
  const activeTherapists = therapists.filter((t: Therapist) => t.status === 'ACTIVE').length
  const pendingTherapists = therapists.filter((t: Therapist) => t.status === 'PENDING_VERIFICATION').length
  const averageRating = therapists.length > 0 
    ? therapists.reduce((sum: number, t: Therapist) => sum + t.averageRating, 0) / therapists.length 
    : 0

  const stats = [
    {
      title: 'Total Therapists',
      value: totalTherapists,
      icon: Users,
      color: 'from-[#1A1A1A] to-[#1A1A1A]',
      bgColor: 'bg-[#F9F9F9]',
      textColor: 'text-[#1A1A1A]'
    },
    {
      title: 'Active Therapists',
      value: activeTherapists,
      icon: UserCheck,
      color: 'from-accent-green to-accent-green',
      bgColor: 'bg-accent-green/20',
      textColor: 'text-[#1A1A1A]'
    },
    {
      title: 'Pending Verification',
      value: pendingTherapists,
      icon: Shield,
      color: 'from-[#4D4D4D] to-[#4D4D4D]',
      bgColor: 'bg-[#F9F9F9]',
      textColor: 'text-[#4D4D4D]'
    },
    {
      title: 'Average Rating',
      value: averageRating.toFixed(1),
      icon: Star,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400'
    }
  ]

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

  if (therapistsLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Welcome Section */}
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
                Welcome back, <span className="text-[#1A1A1A] dark:text-white">Admin</span>!
              </h1>
              <p className="text-[#4D4D4D] dark:text-gray-300 text-base sm:text-lg">
                Manage your therapy platform and support your team.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2 md:gap-3 w-full lg:w-auto">
              <Link to="/admin/create-therapist" className="w-full">
                <Button className="w-full bg-black hover:bg-[#1A1A1A] text-white shadow-gentle hover:shadow-calm transition-all duration-300 text-sm sm:text-sm md:text-base">
                  <Stethoscope className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Create Therapist</span>
                  <span className="sm:hidden">Create</span>
                </Button>
              </Link>
              <Link to="/admin/demo-slots" className="w-full">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm sm:text-sm md:text-base">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Manage Demo Slots</span>
                  <span className="sm:hidden">Demo Slots</span>
                </Button>
              </Link>
              <Link to="/admin/demo-history" className="w-full">
                <Button
                  variant="outline"
                  className="w-full border-gray-border text-[#1A1A1A] hover:bg-[#F9F9F9] text-sm sm:text-sm md:text-base"
                >
                  <History className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Demo History</span>
                  <span className="sm:hidden">History</span>
                </Button>
              </Link>
              <Link to="/admin/leaves" className="w-full">
                <Button
                  variant="outline"
                  className="w-full border-gray-border text-[#1A1A1A] hover:bg-[#F9F9F9] text-sm sm:text-sm md:text-base"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Leave Approval</span>
                  <span className="sm:hidden">Leaves</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4 md:gap-6"
      >
        {stats.map((stat, index) => (
          <StatsCard
            key={stat.title}
            {...stat}
            delay={index * 0.1}
          />
        ))}
      </motion.div>

      {/* Therapists Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className="bg-white dark:bg-black shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
          <CardHeader className="p-4 sm:p-5 md:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-3 md:gap-4">
              <CardTitle className="text-lg sm:text-lg md:text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Users className="h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-2 text-blue-600 dark:text-blue-400" />
                Therapists Management
              </CardTitle>
              <Link to="/admin/create-therapist" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-sm sm:text-sm md:text-base">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Therapist
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {therapists.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No therapists yet
                </h3>
                <p className="text-sm mb-4">Create your first therapist to get started.</p>
                <Link to="/admin/create-therapist">
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                    <Stethoscope className="h-4 w-4 mr-2" />
                    Create First Therapist
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {therapists.map((therapist: Therapist) => (
                  <motion.div
                    key={therapist.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 p-4 sm:p-5 md:p-6 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex items-center space-x-3 sm:space-x-3 md:space-x-4 flex-1 min-w-0 w-full md:w-auto">
                        <Avatar className="h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 flex-shrink-0">
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white font-semibold text-sm sm:text-sm md:text-base">
                            {therapist.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white truncate">
                            {therapist.name}
                          </h3>
                          <p className="text-xs sm:text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate">
                            {therapist.specialization} • {therapist.experience} years experience
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                            {therapist.user.email} • Joined {new Date(therapist.user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-start sm:items-center md:items-end lg:items-center gap-3 sm:gap-3 md:gap-3 lg:gap-4 w-full md:w-auto">
                        <div className="flex items-center space-x-3 sm:space-x-3 md:space-x-2 lg:space-x-4 w-full sm:w-auto md:w-full lg:w-auto">
                          <div className="text-left sm:text-right md:text-left lg:text-right">
                            <div className="flex items-center space-x-2 mb-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {therapist.averageRating.toFixed(1)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              ${therapist.baseCostPerSession}/session
                            </p>
                          </div>
                          
                          <Badge className={`${getStatusColor(therapist.status)} whitespace-nowrap`}>
                            {therapist.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap sm:flex-nowrap md:flex-wrap lg:flex-nowrap gap-2 w-full sm:w-auto md:w-full lg:w-auto">
                          {therapist.status === 'PENDING_VERIFICATION' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleStatusUpdate(therapist.id, 'ACTIVE')}
                                className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none md:flex-1 lg:flex-none"
                                disabled={updateStatusMutation.isLoading}
                              >
                                <UserCheck className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusUpdate(therapist.id, 'SUSPENDED')}
                                className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 flex-1 sm:flex-none md:flex-1 lg:flex-none"
                                disabled={updateStatusMutation.isLoading}
                              >
                                <UserX className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          
                          {therapist.status === 'ACTIVE' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusUpdate(therapist.id, 'INACTIVE')}
                              className="border-orange-300 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-900/20 w-full sm:w-auto md:w-full lg:w-auto"
                              disabled={updateStatusMutation.isLoading}
                            >
                              <UserX className="h-4 w-4 mr-1" />
                              Deactivate
                            </Button>
                          )}
                          
                          {therapist.status === 'INACTIVE' && (
                            <Button
                              size="sm"
                              onClick={() => handleStatusUpdate(therapist.id, 'ACTIVE')}
                              className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto md:w-full lg:w-auto"
                              disabled={updateStatusMutation.isLoading}
                            >
                              <UserCheck className="h-4 w-4 mr-1" />
                              Activate
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default AdminDashboard