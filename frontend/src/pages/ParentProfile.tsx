import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Edit, 
  Save, 
  X,
  Shield,
  
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { LoadingSpinner } from '../components/ui/loading-spinner'
import { parentAPI } from '../lib/api'
import { toast } from 'react-hot-toast'

const ParentProfile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState({
    name: '',
    phone: ''
  })
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: profile, isLoading: profileLoading } = useQuery(
    'parentProfile',
    parentAPI.getProfile,
    { select: (response) => response.data }
  )

  const updateProfileMutation = useMutation(
    (data: { name: string; phone?: string }) => parentAPI.updateProfile(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('parentProfile')
        setIsEditing(false)
        toast.success('Profile updated successfully!')
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to update profile')
      }
    }
  )

  const handleEdit = () => {
    if (profile) {
      setEditedProfile({
        name: profile.name || '',
        phone: profile.phone || ''
      })
      setIsEditing(true)
    }
  }

  const handleSave = () => {
    updateProfileMutation.mutate(editedProfile)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedProfile({ name: '', phone: '' })
  }

  // Change password disabled per requirements

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
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10 dark:from-blue-600/20 dark:via-purple-600/20 dark:to-blue-600/20 rounded-2xl" />
        <div className="relative p-4 sm:p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                My <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Profile</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg">
                Manage your account information and preferences
              </p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
              {/* Change Password button removed */}
              {!isEditing ? (
                <Button
                  onClick={handleEdit}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={updateProfileMutation.isLoading}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateProfileMutation.isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
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
        <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
          <CardHeader className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <User className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600 dark:text-blue-400" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Name
                </Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={editedProfile.name}
                    onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-900 dark:text-white">
                      {profile?.name || 'Not provided'}
                    </span>
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </Label>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-900 dark:text-white">
                    {profile?.user?.email || 'Not provided'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Email cannot be changed. Contact support if needed.
                </p>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phone Number
                </Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={editedProfile.phone}
                    onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                    placeholder="Enter your phone number"
                    className="w-full"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-900 dark:text-white">
                      {profile?.phone || 'Not provided'}
                    </span>
                  </div>
                )}
              </div>

              {/* Member Since */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Member Since
                </Label>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-900 dark:text-white">
                    {profile?.user?.createdAt 
                      ? new Date(profile.user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'Not available'
                    }
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Account Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
          <CardHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Shield className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
              Account Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Password</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Change your account password
                  </p>
                </div>
                {/* Change Password shortcut removed */}
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Account Status</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your account is active and in good standing
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
          <CardHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
              Account Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {profile?.children?.length || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Children Registered</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {profile?.bookings?.length || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Bookings</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {profile?.user?.createdAt 
                    ? Math.floor((new Date().getTime() - new Date(profile.user.createdAt).getTime()) / (1000 * 60 * 60 * 24))
                    : 0
                  }
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Days as Member</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default ParentProfile
