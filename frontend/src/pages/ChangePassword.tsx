import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { authAPI } from '../lib/api'
import toast from 'react-hot-toast'

interface FormData {
  email: string
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

const ChangePassword: React.FC = () => {
  const { search } = useLocation()
  const params = new URLSearchParams(search)
  const role = params.get('role') || 'parent'
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormData>()
  const newPassword = watch('newPassword')

  const onSubmit = async (data: FormData) => {
    if (data.newPassword !== data.confirmNewPassword) {
      toast.error('New passwords do not match')
      return
    }
    setIsLoading(true)
    try {
      await authAPI.changePassword({ email: data.email, currentPassword: data.currentPassword, newPassword: data.newPassword })
      toast.success('Password changed successfully')
      navigate('/login')
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to change password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Change Password</h2>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-4 sm:mb-6">Update your account password securely.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              className="input mt-1 w-full"
              placeholder="Enter your email"
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
            <input
              type="password"
              className="input mt-1 w-full"
              placeholder="Enter current password"
              {...register('currentPassword', { required: 'Current password is required', minLength: { value: 8, message: 'Minimum 8 characters' } })}
            />
            {errors.currentPassword && <p className="mt-1 text-sm text-red-600">{errors.currentPassword.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
            <input
              type="password"
              className="input mt-1 w-full"
              placeholder="Enter new password"
              {...register('newPassword', { required: 'New password is required', minLength: { value: 8, message: 'Minimum 8 characters' } })}
            />
            {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
            <input
              type="password"
              className="input mt-1 w-full"
              placeholder="Confirm new password"
              {...register('confirmNewPassword', { required: 'Please confirm your new password', validate: (v) => v === newPassword || 'Passwords do not match' })}
            />
            {errors.confirmNewPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmNewPassword.message}</p>}
          </div>

          <button type="submit" disabled={isLoading} className="btn btn-primary w-full">
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChangePassword
