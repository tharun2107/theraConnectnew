import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { motion } from 'framer-motion'
import { adminAPI } from '../lib/api'
import { 
  Calendar, 
  Clock, 
  AlertCircle,
  CheckCircle,
  XCircle,
  X,
  FileText,
  User,
  Eye
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { LoadingSpinner } from '../components/ui/loading-spinner'
import toast from 'react-hot-toast'
import { formatDateString, formatDateSimple } from '../utils/dateUtils'

interface Leave {
  id: string
  date: string
  type: 'CASUAL' | 'SICK' | 'FESTIVE' | 'OPTIONAL'
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  reason?: string
  createdAt: string
  therapist: {
    id: string
    name: string
    phone: string
  }
}

interface LeaveDetailsModalProps {
  leave: Leave | null
  isOpen: boolean
  onClose: () => void
  onApprove: (leaveId: string, adminNotes?: string) => void
  onReject: (leaveId: string, adminNotes?: string) => void
  isLoading?: boolean
}

const LeaveDetailsModal: React.FC<LeaveDetailsModalProps> = ({ 
  leave, 
  isOpen, 
  onClose, 
  onApprove, 
  onReject,
  isLoading = false
}) => {
  const [adminNotes, setAdminNotes] = useState('')

  if (!isOpen || !leave) return null

  const handleSubmit = (action: 'APPROVE' | 'REJECT') => {
    if (action === 'APPROVE') {
      onApprove(leave.id, adminNotes || undefined)
    } else if (action === 'REJECT') {
      onReject(leave.id, adminNotes || undefined)
    }
    setAdminNotes('')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-black dark:border dark:border-gray-700 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Leave Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Therapist
              </label>
              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-900 dark:text-white">{leave.therapist.name}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone
              </label>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-gray-900 dark:text-white">{leave.therapist.phone}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Leave Date
              </label>
              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-900 dark:text-white">
                  {formatDateString(leave.date)}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Leave Type
              </label>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">
                  {leave.type}
                </Badge>
              </div>
            </div>
          </div>

          {leave.reason && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reason
              </label>
              <div className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-900 dark:text-white">{leave.reason}</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Admin Notes (Optional)
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={3}
              className="input"
              placeholder="Add any notes about this leave request..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline flex-1"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('REJECT')}
              disabled={isLoading}
              className="btn flex-1 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <XCircle className="h-4 w-4 mr-2" />
              {isLoading ? 'Processing...' : 'Reject'}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('APPROVE')}
              disabled={isLoading}
              className="btn flex-1 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {isLoading ? 'Processing...' : 'Approve'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const LeaveApproval: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('ALL')
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const queryClient = useQueryClient()

  const { data: leavesData, isLoading, refetch, error } = useQuery(
    ['adminLeaves', statusFilter],
    () => {
      console.log('[LeaveApproval] Fetching leaves with filter:', statusFilter)
      return adminAPI.getAllLeaves(statusFilter === 'ALL' ? undefined : statusFilter)
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: 'always',
      refetchOnReconnect: false,
      staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes - keep in cache for 10 minutes
      select: (response) => {
        console.log('[LeaveApproval] API Response:', response)
        console.log('[LeaveApproval] Response data:', response.data)
        console.log('[LeaveApproval] Response data type:', typeof response.data)
        console.log('[LeaveApproval] Is array?', Array.isArray(response.data))
        console.log('[LeaveApproval] Response data.data:', response.data?.data)
        console.log('[LeaveApproval] Response data.data?.leaves:', response.data?.data?.leaves)
        
        // Handle both response structures:
        // Case 1: response.data is an array directly (unexpected but possible)
        if (Array.isArray(response.data)) {
          console.log('[LeaveApproval] Using response.data directly (array):', response.data.length)
          return response.data
        }
        
        // Case 2: response.data is an object with nested data.leaves
        if (response.data?.data?.leaves && Array.isArray(response.data.data.leaves)) {
          console.log('[LeaveApproval] Using response.data.data.leaves:', response.data.data.leaves.length)
          return response.data.data.leaves
        }
        
        // Case 3: response.data.leaves (direct leaves property)
        if (response.data?.leaves && Array.isArray(response.data.leaves)) {
          console.log('[LeaveApproval] Using response.data.leaves:', response.data.leaves.length)
          return response.data.leaves
        }
        
        console.warn('[LeaveApproval] No leaves found in response, returning empty array')
        console.warn('[LeaveApproval] Full response structure:', JSON.stringify(response.data, null, 2))
        return []
      },
      onError: (error: any) => {
        console.error('[LeaveApproval] Error fetching leaves:', error)
        console.error('[LeaveApproval] Error response:', error.response)
        console.error('[LeaveApproval] Error data:', error.response?.data)
      }
    }
  )

  console.log('[LeaveApproval] Leaves data after select:', leavesData)
  console.log('[LeaveApproval] Is loading:', isLoading)
  console.log('[LeaveApproval] Error:', error)

  const processMutation = useMutation(
    ({ leaveId, action, adminNotes }: { leaveId: string; action: 'APPROVE' | 'REJECT'; adminNotes?: string }) => {
      console.log('[LeaveApproval] Processing leave:', { leaveId, action, adminNotes })
      return adminAPI.processLeave(leaveId, { action, adminNotes })
    },
    {
      onSuccess: (response, variables) => {
        console.log('[LeaveApproval] Leave processed successfully:', response)
        toast.success(`Leave request ${variables.action === 'APPROVE' ? 'approved' : 'rejected'} successfully`)
        // Invalidate leaves queries to update all dashboards
        queryClient.invalidateQueries('adminLeaves')
        queryClient.invalidateQueries('allLeaves')
        queryClient.invalidateQueries('therapistLeaves')
        queryClient.invalidateQueries('therapistBookings') // Leave affects bookings
        queryClient.invalidateQueries('parentBookings') // Parents need to see cancelled bookings
        setShowDetailsModal(false)
        setSelectedLeave(null)
      },
      onError: (error: any) => {
        console.error('[LeaveApproval] Error processing leave:', error)
        console.error('[LeaveApproval] Error response:', error.response)
        console.error('[LeaveApproval] Error data:', error.response?.data)
        console.error('[LeaveApproval] Error details:', error.response?.data?.errors)
        
        // Show detailed validation errors if available
        if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
          const errorMessages = error.response.data.errors.map((err: any) => 
            `${err.field}: ${err.message}`
          ).join(', ')
          toast.error(`Validation failed: ${errorMessages}`)
        } else {
          const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to process leave request'
          toast.error(errorMessage)
        }
      },
    }
  )

  const handleApprove = (leaveId: string, adminNotes?: string) => {
    processMutation.mutate({ leaveId, action: 'APPROVE', adminNotes })
  }

  const handleReject = (leaveId: string, adminNotes?: string) => {
    processMutation.mutate({ leaveId, action: 'REJECT', adminNotes })
  }

  const handleViewDetails = (leave: Leave) => {
    setSelectedLeave(leave)
    setShowDetailsModal(true)
  }

  const leaves = leavesData as Leave[] || []
  
  console.log('[LeaveApproval] Final leaves array:', leaves)
  console.log('[LeaveApproval] Leaves count:', leaves.length)

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

  const filteredLeaves = statusFilter === 'ALL' 
    ? leaves 
    : leaves.filter((leave: Leave) => leave.status === statusFilter)

  const pendingCount = leaves.filter((l: Leave) => l.status === 'PENDING').length
  const approvedCount = leaves.filter((l: Leave) => l.status === 'APPROVED').length
  const rejectedCount = leaves.filter((l: Leave) => l.status === 'REJECTED').length

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
                Leave Approval
              </h1>
              <p className="text-[#4D4D4D] dark:text-gray-300 text-base sm:text-lg">
                Review and approve therapist leave requests
              </p>
            </div>
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
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{pendingCount}</p>
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
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{approvedCount}</p>
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
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">{rejectedCount}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card className="bg-white dark:bg-black shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (statusFilter !== 'ALL') {
                    setStatusFilter('ALL')
                  }
                }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'ALL' 
                    ? 'bg-black hover:bg-gray-900 text-white dark:bg-black dark:hover:bg-gray-900 dark:text-white' 
                    : 'bg-transparent border border-gray-300 dark:bg-black dark:hover:bg-gray-900 dark:text-white dark:border-gray-700 text-gray-700 dark:text-white'
                }`}
              >
                All ({leaves.length})
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (statusFilter !== 'PENDING') {
                    setStatusFilter('PENDING')
                  }
                }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'PENDING' 
                    ? 'bg-black hover:bg-gray-900 text-white dark:bg-black dark:hover:bg-gray-900 dark:text-white' 
                    : 'bg-transparent border border-gray-300 dark:bg-black dark:hover:bg-gray-900 dark:text-white dark:border-gray-700 text-gray-700 dark:text-white'
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (statusFilter !== 'APPROVED') {
                    setStatusFilter('APPROVED')
                  }
                }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'APPROVED' 
                    ? 'bg-black hover:bg-gray-900 text-white dark:bg-black dark:hover:bg-gray-900 dark:text-white' 
                    : 'bg-transparent border border-gray-300 dark:bg-black dark:hover:bg-gray-900 dark:text-white dark:border-gray-700 text-gray-700 dark:text-white'
                }`}
              >
                Approved ({approvedCount})
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (statusFilter !== 'REJECTED') {
                    setStatusFilter('REJECTED')
                  }
                }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'REJECTED' 
                    ? 'bg-black hover:bg-gray-900 text-white dark:bg-black dark:hover:bg-gray-900 dark:text-white' 
                    : 'bg-transparent border border-gray-300 dark:bg-black dark:hover:bg-gray-900 dark:text-white dark:border-gray-700 text-gray-700 dark:text-white'
                }`}
              >
                Rejected ({rejectedCount})
              </button>
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
              Leave Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {filteredLeaves.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                <p className="text-lg font-medium mb-2 text-gray-900 dark:text-white">No leave requests found</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {statusFilter === 'ALL' 
                    ? 'No leave requests have been submitted yet.'
                    : `No ${statusFilter.toLowerCase()} leave requests found.`}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLeaves
                  .sort((a: Leave, b: Leave) => 
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                  )
                  .map((leave: Leave) => (
                    <motion.div
                      key={leave.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-gradient-to-r from-gray-50 to-gray-100 dark:bg-black dark:from-black dark:to-black dark:border-gray-700 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
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
                            <User className="h-4 w-4 mr-2" />
                            <span className="font-medium">{leave.therapist.name}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-1">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>{formatDateString(leave.date)}</span>
                          </div>
                          {leave.reason && (
                            <div className="flex items-start text-sm text-gray-600 dark:text-gray-400 mt-2">
                              <FileText className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                              <span>{leave.reason}</span>
                            </div>
                          )}
                          <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            Requested on {formatDateSimple(leave.createdAt)}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {leave.status === 'PENDING' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleViewDetails(leave)}
                                variant="outline"
                                className="border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Leave Details Modal */}
      {showDetailsModal && selectedLeave && (
        <LeaveDetailsModal
          leave={selectedLeave}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedLeave(null)
          }}
          onApprove={handleApprove}
          onReject={handleReject}
          isLoading={processMutation.isLoading}
        />
      )}
    </div>
  )
}

export default LeaveApproval

