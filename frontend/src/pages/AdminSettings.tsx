import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { adminAPI } from '../lib/api'
import { 
  Settings, 
  Bell, 
  Shield, 
  Mail,
  Globe,
  Database,
  Users,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { LoadingSpinner } from '../components/ui/loading-spinner'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Switch } from '../components/ui/switch'
import { Textarea } from '../components/ui/textarea'
import toast from 'react-hot-toast'

interface PlatformSettings {
  id: string
  platformName: string
  platformEmail: string
  platformPhone: string
  maintenanceMode: boolean
  allowNewRegistrations: boolean
  emailNotifications: boolean
  sessionReminderHours: number
  maxSessionsPerDay: number
  defaultSessionDuration: number
  platformDescription: string
  termsOfService: string
  privacyPolicy: string
}

const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general')
  const queryClient = useQueryClient()

  const { data: settings, isLoading: settingsLoading } = useQuery(
    'platformSettings',
    adminAPI.getPlatformSettings,
    { select: (response) => response.data }
  )

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<PlatformSettings>({
    defaultValues: settings
  })

  const updateSettingsMutation = useMutation(
    (data: Partial<PlatformSettings>) => adminAPI.updatePlatformSettings(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('platformSettings')
        toast.success('Settings updated successfully')
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to update settings')
      }
    }
  )

  const onSubmit = (data: PlatformSettings) => {
    updateSettingsMutation.mutate(data)
  }

  const handleMaintenanceToggle = (checked: boolean) => {
    setValue('maintenanceMode', checked)
    updateSettingsMutation.mutate({ maintenanceMode: checked })
  }

  const handleRegistrationToggle = (checked: boolean) => {
    setValue('allowNewRegistrations', checked)
    updateSettingsMutation.mutate({ allowNewRegistrations: checked })
  }

  const handleEmailToggle = (checked: boolean) => {
    setValue('emailNotifications', checked)
    updateSettingsMutation.mutate({ emailNotifications: checked })
  }

  if (settingsLoading) {
    return <LoadingSpinner />
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'platform', label: 'Platform', icon: Globe }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-purple-600/10 dark:from-purple-600/20 dark:via-blue-600/20 dark:to-purple-600/20 rounded-2xl" />
        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Platform <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Settings</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Configure your therapy platform settings and preferences
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                <Settings className="h-3 w-3 mr-1" />
                ADMIN
              </Badge>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {activeTab === 'general' && (
          <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
            <CardHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Settings className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="platformName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Platform Name
                    </Label>
                    <Input
                      id="platformName"
                      {...register('platformName', { required: 'Platform name is required' })}
                      className="mt-1"
                      placeholder="TheraConnect"
                    />
                    {errors.platformName && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        {errors.platformName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="platformEmail" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Platform Email
                    </Label>
                    <Input
                      id="platformEmail"
                      type="email"
                      {...register('platformEmail', { required: 'Platform email is required' })}
                      className="mt-1"
                      placeholder="admin@theraconnect.com"
                    />
                    {errors.platformEmail && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        {errors.platformEmail.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="platformPhone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Platform Phone
                    </Label>
                    <Input
                      id="platformPhone"
                      {...register('platformPhone')}
                      className="mt-1"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="defaultSessionDuration" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Default Session Duration (minutes)
                    </Label>
                    <Input
                      id="defaultSessionDuration"
                      type="number"
                      {...register('defaultSessionDuration', { min: 15, max: 180 })}
                      className="mt-1"
                      placeholder="60"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="platformDescription" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Platform Description
                  </Label>
                  <Textarea
                    id="platformDescription"
                    {...register('platformDescription')}
                    className="mt-1"
                    rows={4}
                    placeholder="Describe your therapy platform..."
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <Button
                    type="submit"
                    disabled={updateSettingsMutation.isLoading}
                    className="flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.location.reload()}
                    className="flex items-center space-x-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Reset</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {activeTab === 'notifications' && (
          <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
            <CardHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Bell className="h-5 w-5 mr-2 text-yellow-600 dark:text-yellow-400" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Send email notifications for important events
                    </p>
                  </div>
                  <Switch
                    checked={watch('emailNotifications')}
                    onCheckedChange={handleEmailToggle}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="sessionReminderHours" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Session Reminder (hours before)
                    </Label>
                    <Input
                      id="sessionReminderHours"
                      type="number"
                      {...register('sessionReminderHours', { min: 1, max: 24 })}
                      className="mt-1"
                      placeholder="24"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxSessionsPerDay" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Max Sessions Per Day
                    </Label>
                    <Input
                      id="maxSessionsPerDay"
                      type="number"
                      {...register('maxSessionsPerDay', { min: 1, max: 20 })}
                      className="mt-1"
                      placeholder="8"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'security' && (
          <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
            <CardHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Shield className="h-5 w-5 mr-2 text-red-600 dark:text-red-400" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Maintenance Mode</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Temporarily disable the platform for maintenance
                    </p>
                  </div>
                  <Switch
                    checked={watch('maintenanceMode')}
                    onCheckedChange={handleMaintenanceToggle}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Allow New Registrations</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Allow new users to register on the platform
                    </p>
                  </div>
                  <Switch
                    checked={watch('allowNewRegistrations')}
                    onCheckedChange={handleRegistrationToggle}
                  />
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900 dark:text-blue-100">Security Recommendations</p>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 mt-2 space-y-1">
                        <li>• Enable two-factor authentication for admin accounts</li>
                        <li>• Regularly update passwords</li>
                        <li>• Monitor login attempts and suspicious activity</li>
                        <li>• Keep the platform updated with latest security patches</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'platform' && (
          <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
            <CardHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Globe className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                Platform Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="termsOfService" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Terms of Service
                  </Label>
                  <Textarea
                    id="termsOfService"
                    {...register('termsOfService')}
                    className="mt-1"
                    rows={6}
                    placeholder="Enter terms of service..."
                  />
                </div>

                <div>
                  <Label htmlFor="privacyPolicy" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Privacy Policy
                  </Label>
                  <Textarea
                    id="privacyPolicy"
                    {...register('privacyPolicy')}
                    className="mt-1"
                    rows={6}
                    placeholder="Enter privacy policy..."
                  />
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-900 dark:text-green-100">Platform Status</p>
                      <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                        Your platform is running smoothly. All systems are operational.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  )
}

export default AdminSettings
