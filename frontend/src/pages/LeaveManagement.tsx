import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { therapistAPI } from '../lib/api'
import { 
  Calendar, 
  Clock, 
  AlertCircle,
  CheckCircle,
  XCircle,
  FileText
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { LoadingSpinner } from '../components/ui/loading-spinner'
import RequestLeaveModal from '../components/RequestLeaveModal'
import { Button } from '../components/ui/button'
import { Plus } from 'lucide-react'

interface Leave {
  id: string
  date: string
  type: 'CASUAL' | 'SICK' | 'FESTIVE' | 'OPTIONAL'
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  reason?: string
  createdAt: string
  casualRemaining?: number
  sickRemaining?: number
  festiveRemaining?: number
  optionalRemaining?: number
}

const LeaveManagement: React.FC = () => {
  const [showRequestModal, setShowRequestModal] = useState(false)

  const { data: leavesData, isLoading, refetch, error } = useQuery(
    'therapistLeaves',
    therapistAPI.getMyLeaves,
    {
      select: (response) => {
        console.log('[LeaveManagement] API Response:', response)
        console.log('[LeaveManagement] Response data:', response.data)
        console.log('[LeaveManagement] Response data.data:', response.data?.data)
        console.log('[LeaveManagement] Leaves array:', response.data?.data?.leaves)
        // Backend returns: { success: true, data: { leaves: [...], totalLeaves: 2 } }
        // Axios wraps it, so response.data = { success: true, data: { leaves: [...] } }
        return response.data?.data?.leaves || []
      },
      onError: (error: any) => {
        console.error('[LeaveManagement] Error fetching leaves:', error)
        console.error('[LeaveManagement] Error response:', error.response)
        console.error('[LeaveManagement] Error data:', error.response?.data)
      }
    }
  )

  console.log('[LeaveManagement] Leaves data after select:', leavesData)
  console.log('[LeaveManagement] Is loading:', isLoading)
  console.log('[LeaveManagement] Error:', error)

  const leaves = leavesData as Leave[] || []
  
  console.log('[LeaveManagement] Final leaves array:', leaves)
  console.log('[LeaveManagement] Leaves count:', leaves.length)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
      case 'REJECTED':
        return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4" />
      case 'REJECTED':
        return <XCircle className="h-4 w-4" />
      case 'PENDING':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'CASUAL':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
      case 'SICK':
        return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
      case 'FESTIVE':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400'
      case 'OPTIONAL':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  const pendingLeaves = leaves.filter((leave: Leave) => leave.status === 'PENDING')
  const approvedLeaves = leaves.filter((leave: Leave) => leave.status === 'APPROVED')
  const rejectedLeaves = leaves.filter((leave: Leave) => leave.status === 'REJECTED')

  if (isLoading) {
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
                Leave Management
              </h1>
              <p className="text-[#4D4D4D] dark:text-gray-300 text-base sm:text-lg">
                Request and manage your leave requests
              </p>
            </div>
            <Button
              onClick={() => setShowRequestModal(true)}
              className="bg-black hover:bg-[#1A1A1A] text-white shadow-gentle hover:shadow-calm transition-all duration-300"
            >
              <Plus className="h-4 w-4 mr-2" />
              Request Leave
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6"
      >
        <Card className="bg-white dark:bg-black shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{pendingLeaves.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-black shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Approved</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{approvedLeaves.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-black shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Rejected</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">{rejectedLeaves.length}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Leave Requests List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className="bg-white dark:bg-black shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
          <CardHeader className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
              My Leave Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {leaves.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                <p className="text-lg font-medium mb-2 text-gray-900 dark:text-white">No leave requests yet</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Request a leave to get started.
                </p>
                <Button
                  onClick={() => setShowRequestModal(true)}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Request Leave
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {leaves
                  .sort((a: Leave, b: Leave) => 
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                  )
                  .map((leave: Leave) => (
                    <motion.div
                      key={leave.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className={getTypeColor(leave.type)}>
                              {leave.type}
                            </Badge>
                            <Badge className={getStatusColor(leave.status)}>
                              <span className="flex items-center gap-1">
                                {getStatusIcon(leave.status)}
                                {leave.status}
                              </span>
                            </Badge>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-1">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>{new Date(leave.date).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}</span>
                          </div>
                          {leave.reason && (
                            <div className="flex items-start text-sm text-gray-600 dark:text-gray-400 mt-2">
                              <FileText className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                              <span>{leave.reason}</span>
                            </div>
                          )}
                          <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            Requested on {new Date(leave.createdAt).toLocaleDateString()}
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

      {/* Request Leave Modal */}
      {showRequestModal && (
        <RequestLeaveModal
          onClose={() => setShowRequestModal(false)}
          onSuccess={() => {
            refetch()
            setShowRequestModal(false)
          }}
        />
      )}
    </div>
  )
}

export default LeaveManagement

