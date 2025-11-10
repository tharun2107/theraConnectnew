import React from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from 'react-query'
import { parentAPI } from '../lib/api'
import { X, User } from 'lucide-react'
import toast from 'react-hot-toast'

interface AddChildModalProps {
  onClose: () => void
  onSuccess: () => void
}

interface ChildFormData {
  name: string
  age: number
  address?: string
  condition?: string
  notes?: string
}

const AddChildModal: React.FC<AddChildModalProps> = ({ onClose, onSuccess }) => {
  const queryClient = useQueryClient()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChildFormData>()

  const addChildMutation = useMutation(parentAPI.addChild, {
    onSuccess: () => {
      // Invalidate and refetch children queries to update all dashboards
      queryClient.invalidateQueries('parentChildren')
      queryClient.invalidateQueries('children')
      queryClient.invalidateQueries('allChildren') // For AdminDashboard/AdminChildrenView
      toast.success('Child added successfully!')
      onSuccess()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add child')
    },
  })

  const onSubmit = (data: ChildFormData) => {
    addChildMutation.mutate(data)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-full flex items-start justify-center p-4">
        <div className="bg-white dark:bg-black dark:border dark:border-gray-700 rounded-2xl shadow-2xl max-w-md w-full transform animate-fade-in-up transition-all duration-300 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg flex-shrink-0">
              <User className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Add Child</h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Create a profile for your child</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-all duration-300 hover:scale-110 flex-shrink-0 ml-2"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Child's Name *
            </label>
            <input
              {...register('name', {
                required: 'Name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' },
              })}
              type="text"
              className="input focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              placeholder="Enter child's name"
            />
            {errors.name && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400 animate-fade-in-up">{errors.name.message}</p>
            )}
          </div>

          <div className="animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <label htmlFor="age" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Age *
            </label>
            <input
              {...register('age', {
                required: 'Age is required',
                valueAsNumber: true,
                min: { value: 1, message: 'Age must be at least 1' },
                max: { value: 18, message: 'Age must be less than 18' },
              })}
              type="number"
              className="input focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              placeholder="Enter child's age"
            />
            {errors.age && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400 animate-fade-in-up">{errors.age.message}</p>
            )}
          </div>

          <div className="animate-fade-in-up" style={{animationDelay: '0.3s'}}>
            <label htmlFor="address" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Address
            </label>
            <input
              {...register('address')}
              type="text"
              className="input focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              placeholder="Enter child's address (optional)"
            />
          </div>

          <div className="animate-fade-in-up" style={{animationDelay: '0.4s'}}>
            <label htmlFor="condition" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Condition/Diagnosis
            </label>
            <input
              {...register('condition')}
              type="text"
              className="input focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              placeholder="Enter any medical condition (optional)"
            />
          </div>

          <div className="animate-fade-in-up" style={{animationDelay: '0.5s'}}>
            <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Additional Notes
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="input focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
              placeholder="Any additional notes about the child (optional)"
            />
          </div>

          <div className="flex space-x-4 pt-6 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline flex-1 transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addChildMutation.isLoading}
              className="btn btn-primary flex-1 transform hover:scale-105 transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addChildMutation.isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </div>
              ) : (
                'Add Child'
              )}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  )
}

export default AddChildModal
