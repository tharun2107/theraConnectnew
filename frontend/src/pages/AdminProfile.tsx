import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { adminAPI } from '../lib/api'
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Shield,
  Save,
  Edit,
  X,
  Check
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Avatar, AvatarFallback } from '../components/ui/avatar'
import { LoadingSpinner } from '../components/ui/loading-spinner'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import toast from 'react-hot-toast'

interface AdminProfile {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  createdAt: string
  lastLogin?: string
}

interface ProfileFormData {
  name: string
  phone: string
}

const AdminProfile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false)
  const queryClient = useQueryClient()

  const { data: profile, isLoading: profileLoading } = useQuery(
    'adminProfile',
    adminAPI.getProfile,
    { select: (response) => response.data }
  )

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileFormData>({
    defaultValues: {
      name: profile?.name || '',
      phone: profile?.phone || ''
    }
  })

  const updateProfileMutation = useMutation(
    (data: ProfileFormData) => adminAPI.updateProfile(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminProfile')
        toast.success('Profile updated successfully')
        setIsEditing(false)
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to update profile')
      }
    }
  )

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data)
  }

  const handleEdit = () => {
    setIsEditing(true)
    reset({
      name: profile?.name || '',
      phone: profile?.phone || ''
    })
  }

  const handleCancel = () => {
    setIsEditing(false)
    reset({
      name: profile?.name || '',
      phone: profile?.phone || ''
    })
  }

  if (profileLoading) {
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
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-purple-600/10 dark:bg-black rounded-2xl" />
        <div className="relative p-4 sm:p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                My <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Profile</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg">
                Manage your admin account information
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                <Shield className="h-3 w-3 mr-1" />
                ADMIN
              </Badge>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Profile Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="bg-white dark:bg-black shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
          <CardHeader className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                Profile Information
              </CardTitle>
              {!isEditing && (
                <Button
                  onClick={handleEdit}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start space-x-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-2xl font-semibold">
                    {profile?.name?.charAt(0).toUpperCase() || 'A'}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Profile Details */}
              <div className="flex-1 space-y-6">
                {isEditing ? (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Full Name
                        </Label>
                        <Input
                          id="name"
                          {...register('name', { required: 'Name is required' })}
                          className="mt-1"
                          placeholder="Enter your full name"
                        />
                        {errors.name && (
                          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                            {errors.name.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          {...register('phone')}
                          className="mt-1"
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Button
                        type="submit"
                        disabled={updateProfileMutation.isLoading}
                        className="flex items-center space-x-2"
                      >
                        <Save className="h-4 w-4" />
                        <span>Save Changes</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        className="flex items-center space-x-2"
                      >
                        <X className="h-4 w-4" />
                        <span>Cancel</span>
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center space-x-3">
                        <User className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Full Name</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {profile?.name || 'Not provided'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {profile?.email || 'Not provided'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {profile?.phone || 'Not provided'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Shield className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Role</p>
                          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                            ADMIN
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Account Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className="bg-white dark:bg-black shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
          <CardHeader className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Account Created</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Account Status</p>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Active
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Security Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Card className="bg-white dark:bg-black shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
          <CardHeader className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Shield className="h-5 w-5 mr-2 text-red-600 dark:text-red-400" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-black dark:border dark:border-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Change Password</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Update your password to keep your account secure
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Change Password
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-black dark:border dark:border-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Enable 2FA
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default AdminProfile
