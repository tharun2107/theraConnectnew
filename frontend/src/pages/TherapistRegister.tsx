import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { UserPlus, Stethoscope, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { authAPI } from '../lib/api'

interface RegisterFormData {
  email: string
  name: string
  phone: string
  specialization: string
  experience: number
  baseCostPerSession: number
}

const TherapistRegister: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>()

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    try {
      // Admin creating a therapist: call API directly, do NOT log in as therapist
      // No password needed - therapist will use Google OAuth to login
      await authAPI.registerTherapist({
        email: data.email,
        name: data.name,
        phone: data.phone,
        specialization: data.specialization,
        experience: data.experience,
        baseCostPerSession: data.baseCostPerSession,
      })
      toast.success('Therapist created successfully')
      navigate('/admin')
    } catch (error: any) {
      const status = error?.response?.status
      const message = error?.response?.data?.message || error?.message || 'Registration failed'
      if (status === 409 || /exists/i.test(message)) {
        toast.error('An account with this email/phone already exists. Please sign in instead.')
        navigate('/login')
      } else {
        toast.error(message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">

      {/* Removed glow effect */}


      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="animate-fade-in-up">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 mb-6 animate-float">
              <Stethoscope className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
              Create Therapist
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
            Create, configure, and empower new therapists.
            </p>
            <div className="mt-4">
              <Link
                to="/admin"
                className="inline-flex items-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Admin
              </Link>
            </div>
          </div>
        </div>
        
        <div className="animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Name
                </label>
                <input
                  {...register('name', {
                    required: 'Name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters',
                    },
                  })}
                  type="text"
                  className="input mt-1 w-full"
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Professional Email
                </label>
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  type="email"
                  className="input mt-1 w-full"
                  placeholder="Enter your professional email"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phone Number
                </label>
                <input
                  {...register('phone', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[0-9+\-\s()]+$/,
                      message: 'Invalid phone number',
                    },
                  })}
                  type="tel"
                  className="input mt-1 w-full"
                  placeholder="Enter your phone number"
                />
                {errors.phone && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone.message}</p>}
              </div>

              {/* Specialization */}
              <div>
                <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Specialization
                </label>
                <select
                  {...register('specialization', { required: 'Specialization is required' })}
                  className="input mt-1 w-full"
                >
                  <option value="">Select your specialization</option>
                  <option value="Child Psychology">Child Psychology</option>
                  <option value="Behavioral Therapy">Behavioral Therapy</option>
                  <option value="Speech Therapy">Speech Therapy</option>
                  <option value="Occupational Therapy">Occupational Therapy</option>
                  <option value="Physical Therapy">Physical Therapy</option>
                  <option value="Family Therapy">Family Therapy</option>
                  <option value="Cognitive Therapy">Cognitive Therapy</option>
                  <option value="Other">Other</option>
                </select>
                {errors.specialization && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.specialization.message}</p>}
              </div>

              {/* Experience */}
              <div>
                <label htmlFor="experience" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Years of Experience
                </label>
                <input
                  {...register('experience', {
                    required: 'Experience is required',
                    min: { value: 1, message: 'Experience must be at least 1 year' },
                    max: { value: 50, message: 'Experience must be less than 50 years' },
                    valueAsNumber: true,
                  })}
                  type="number"
                  min="1"
                  max="50"
                  className="input mt-1 w-full"
                  placeholder="Enter years of experience"
                />
                {errors.experience && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.experience.message}</p>}
              </div>

              {/* Base Cost */}
              <div>
                <label htmlFor="baseCostPerSession" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Base Cost Per Session ($)
                </label>
                <input
                  {...register('baseCostPerSession', {
                    required: 'Base cost is required',
                    min: { value: 1, message: 'Base cost must be at least $1' },
                    max: { value: 1000, message: 'Base cost must be less than $1000' },
                    valueAsNumber: true,
                  })}
                  type="number"
                  min="1"
                  max="1000"
                  step="0.01"
                  className="input mt-1 w-full"
                  placeholder="Enter base cost per session"
                />
                {errors.baseCostPerSession && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.baseCostPerSession.message}</p>}
              </div>

              {/* Info message - Therapists use Google OAuth */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Note:</strong> The therapist will use Google OAuth to sign in. No password is required.
                </p>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                I agree to the{' '}
                <a href="#" className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 transition-colors">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 transition-colors">
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Submit */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Therapist Account
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default TherapistRegister
