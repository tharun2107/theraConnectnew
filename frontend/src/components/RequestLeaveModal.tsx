import React from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from 'react-query'
import { therapistAPI } from '../lib/api'
import { X, Calendar, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

interface RequestLeaveModalProps {
  onClose: () => void
  onSuccess: () => void
}

interface LeaveFormData {
  date: string
  type: 'FULL_DAY'
  reason?: string
}

const RequestLeaveModal: React.FC<RequestLeaveModalProps> = ({ onClose, onSuccess }) => {
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeaveFormData>()

  const requestLeaveMutation = useMutation(therapistAPI.requestLeave, {
    onSuccess: () => {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="h-5 w-5 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Request Leave</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
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
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Leave Date *
              </label>
              <input
                {...register('date', { required: 'Please select a leave date' })}
                type="date"
                min={new Date().toISOString().split('T')[0]}
                className="input"
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Leave Type *
              </label>
              <select
                {...register('type', { required: 'Please select leave type' })}
                className="input"
              >
                <option value="FULL_DAY">Full Day</option>
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
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
