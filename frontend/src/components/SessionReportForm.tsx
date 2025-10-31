import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { FileText, Send, XCircle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { feedbackAPI } from '../lib/api'

interface SessionReportFormData {
  sessionExperience: string
  childPerformance: string
  improvements: string
  medication: string
  recommendations: string
  nextSteps: string
}

interface SessionReportFormProps {
  bookingId: string
  childName: string
  parentName: string
  onSuccess: () => void
  onCancel: () => void
}

const SessionReportForm: React.FC<SessionReportFormProps> = ({
  bookingId,
  childName,
  parentName,
  onSuccess,
  onCancel,
}) => {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SessionReportFormData>({
    defaultValues: {
      sessionExperience: '',
      childPerformance: '',
      improvements: '',
      medication: '',
      recommendations: '',
      nextSteps: '',
    },
  })

  const onSubmit = async (data: SessionReportFormData) => {
    setIsLoading(true)
    try {
      console.log('📋 Submitting session report:', {
        bookingId,
        sessionExperience: data.sessionExperience,
        childPerformance: data.childPerformance,
        improvements: data.improvements,
        medication: data.medication,
        recommendations: data.recommendations,
        nextSteps: data.nextSteps
      })
      
      await feedbackAPI.createSessionReport({
        bookingId,
        sessionExperience: data.sessionExperience,
        childPerformance: data.childPerformance || undefined,
        improvements: data.improvements || undefined,
        medication: data.medication || undefined,
        recommendations: data.recommendations || undefined,
        nextSteps: data.nextSteps || undefined,
      })

      toast.success('Session report created and sent to parent!')
      onSuccess()
    } catch (error: any) {
      console.error('❌ Session report submission error:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create session report'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-4 sm:mb-6">
          <div className="mx-auto h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 mb-3 sm:mb-4">
            <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Session Report
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 px-2">
            Create a detailed report for {childName}'s session with {parentName}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
          {/* Session Experience - Required */}
          <div>
            <label htmlFor="sessionExperience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Session Experience *
            </label>
            <textarea
              {...register('sessionExperience', { required: 'Session experience is required' })}
              id="sessionExperience"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="Describe how the session went, what activities were done, and the overall experience..."
            />
            {errors.sessionExperience && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.sessionExperience.message}</p>
            )}
          </div>

          {/* Child Performance */}
          <div>
            <label htmlFor="childPerformance" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Child Performance
            </label>
            <textarea
              {...register('childPerformance')}
              id="childPerformance"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="How did the child perform during the session? Any notable behaviors or responses..."
            />
          </div>

          {/* Improvements */}
          <div>
            <label htmlFor="improvements" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Areas of Improvement
            </label>
            <textarea
              {...register('improvements')}
              id="improvements"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="What areas need improvement? Any challenges observed..."
            />
          </div>

          {/* Medication */}
          <div>
            <label htmlFor="medication" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Medication Notes
            </label>
            <textarea
              {...register('medication')}
              id="medication"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="Any medication-related observations or recommendations..."
            />
          </div>

          {/* Recommendations */}
          <div>
            <label htmlFor="recommendations" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Recommendations
            </label>
            <textarea
              {...register('recommendations')}
              id="recommendations"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="Recommendations for the parent regarding home activities, exercises, or other interventions..."
            />
          </div>

          {/* Next Steps */}
          <div>
            <label htmlFor="nextSteps" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Next Steps
            </label>
            <textarea
              {...register('nextSteps')}
              id="nextSteps"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="What should be the focus for the next session? Any specific goals or objectives..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Report...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Report to Parent
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SessionReportForm
