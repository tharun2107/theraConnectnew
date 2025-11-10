import React from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from 'react-query'
import { therapistAPI } from '../lib/api'
import { X, Calendar, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

interface RequestLeaveModalProps {
  onClose: () => void
  onSuccess: () => void
}

interface LeaveFormData {
  date: string
  type: 'CASUAL' | 'SICK' | 'FESTIVE' | 'OPTIONAL'
  reason?: string
}

const RequestLeaveModal: React.FC<RequestLeaveModalProps> = ({ onClose, onSuccess }) => {
  const queryClient = useQueryClient()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeaveFormData>()

  const requestLeaveMutation = useMutation(therapistAPI.requestLeave, {
    onSuccess: () => {
      // Invalidate leaves queries to update the dashboard
      queryClient.invalidateQueries('therapistLeaves')
      queryClient.invalidateQueries('allLeaves')
      queryClient.invalidateQueries('therapistBookings') // Leave affects bookings
      queryClient.invalidateQueries('parentBookings') // Parents need to see cancelled bookings
      toast.success('Leave request submitted successfully!')
      onSuccess()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit leave request')
    },
  })

  const onSubmit = (data: LeaveFormData) => {
    requestLeaveMutation.mutate(data)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-black dark:border dark:border-gray-700 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg flex-shrink-0">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate">Request Leave</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0 ml-2"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  Important Notice
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Requesting leave will automatically cancel all scheduled sessions for that day. 
                  Parents will be notified of the cancellation.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Leave Date *
              </label>
              <input
                {...register('date', { required: 'Please select a leave date' })}
                type="date"
                min={new Date().toISOString().split('T')[0]}
                className="input"
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.date.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Leave Type *
              </label>
              <select
                {...register('type', { required: 'Please select leave type' })}
                className="input"
              >
                <option value="">Select leave type</option>
                <option value="CASUAL">Casual Leave</option>
                <option value="SICK">Sick Leave</option>
                <option value="FESTIVE">Festive Leave</option>
                <option value="OPTIONAL">Optional Leave</option>
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.type.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reason (Optional)
              </label>
              <textarea
                {...register('reason')}
                rows={3}
                className="input"
                placeholder="Please provide a reason for your leave request..."
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
                type="submit"
                disabled={requestLeaveMutation.isLoading}
                className="btn btn-primary flex-1"
              >
                {requestLeaveMutation.isLoading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default RequestLeaveModal
