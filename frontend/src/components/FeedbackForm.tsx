import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Star, MessageSquare, Shield, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { feedbackAPI } from '../lib/api'

interface FeedbackFormData {
  rating: number
  comment: string
  consentToDataSharing: boolean
}

interface FeedbackFormProps {
  bookingId: string
  childName: string
  therapistName: string
  onSuccess: () => void
  onCancel: () => void
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  bookingId,
  childName,
  therapistName,
  onSuccess,
  onCancel,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRating, setSelectedRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FeedbackFormData>({
    defaultValues: {
      rating: 0,
      comment: '',
      consentToDataSharing: false,
    },
  })

  const consentToDataSharing = watch('consentToDataSharing')

  const onSubmit = async (data: FeedbackFormData) => {
    if (selectedRating === 0) {
      toast.error('Please select a rating')
      return
    }

    setIsLoading(true)
    try {
      console.log('📝 Submitting feedback:', {
        bookingId,
        rating: selectedRating,
        comment: data.comment,
        consentToDataSharing: data.consentToDataSharing
      })
      
      await feedbackAPI.createFeedback({
        bookingId,
        rating: selectedRating,
        comment: data.comment,
        isAnonymous: false,
        consentToDataSharing: data.consentToDataSharing,
      })

      toast.success('Thank you for your feedback!')
      onSuccess()
    } catch (error: any) {
      console.error('❌ Feedback submission error:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit feedback'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1
      const isFilled = starValue <= (hoveredRating || selectedRating)
      
      return (
        <button
          key={index}
          type="button"
          className={`p-1 transition-colors ${
            isFilled ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'
          }`}
          onClick={() => setSelectedRating(starValue)}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
        >
          <Star className="h-8 w-8 fill-current" />
        </button>
      )
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Session Feedback
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 px-2">
            How was the session with {therapistName} for {childName}?
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Rate the session
            </label>
            <div className="flex justify-center space-x-1">
              {renderStars()}
            </div>
            {selectedRating > 0 && (
              <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
                {selectedRating === 1 && 'Poor'}
                {selectedRating === 2 && 'Fair'}
                {selectedRating === 3 && 'Good'}
                {selectedRating === 4 && 'Very Good'}
                {selectedRating === 5 && 'Excellent'}
              </p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <MessageSquare className="h-4 w-4 inline mr-1" />
              Additional comments (optional)
            </label>
            <textarea
              {...register('comment')}
              id="comment"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="Share your thoughts about the session..."
            />
          </div>

          {/* Consent */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="flex-1">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    {...register('consentToDataSharing')}
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Allow therapist to view {childName}'s detailed information
                  </span>
                </label>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  This will give the therapist access to your child's condition, notes, and other details for better care.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || selectedRating === 0}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Submit Feedback
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FeedbackForm
