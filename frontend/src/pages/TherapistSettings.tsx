import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { motion } from 'framer-motion'
import { 
  Settings, 
  Bell, 
  Shield, 
  Eye, 
  EyeOff,
  Save,
  RefreshCw,
  AlertTriangle,
  Clock,
  Calendar
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Switch } from '../components/ui/switch'
import { Label } from '../components/ui/label'
import { Input } from '../components/ui/input'
import { LoadingSpinner } from '../components/ui/loading-spinner'
import { therapistAPI } from '../lib/api'
import { toast } from 'react-hot-toast'

const TherapistSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    sessionReminders: true,
    reportNotifications: true,
    marketingEmails: false,
    dataSharing: false,
    autoAcceptBookings: false,
    advanceBookingDays: 7,
    sessionDuration: 45
  })
  const [isSaving, setIsSaving] = useState(false)
  const queryClient = useQueryClient()

  const { data: profile, isLoading: profileLoading } = useQuery(
    'therapistProfile',
    therapistAPI.getProfile,
    { select: (response) => response.data }
  )

  const handleSettingChange = (key: string, value: boolean | number) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      // Here you would typically call an API to save settings
      // For now, we'll just simulate the save
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Settings saved successfully!')
      queryClient.invalidateQueries('therapistProfile')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetSettings = () => {
    setSettings({
      emailNotifications: true,
      smsNotifications: false,
      sessionReminders: true,
      reportNotifications: true,
      marketingEmails: false,
      dataSharing: false,
      autoAcceptBookings: false,
      advanceBookingDays: 7,
      sessionDuration: 45
    })
    toast.success('Settings reset to defaults')
  }

  if (profileLoading) {
    return <LoadingSpinner />
  }

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
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Settings</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Customize your practice settings and preferences
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleResetSettings}
                variant="outline"
                className="border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-900/20"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset to Defaults
              </Button>
              <Button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
          <CardHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Bell className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
              Notification Preferences
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Choose how you want to be notified about your practice
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium text-gray-900 dark:text-white">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive important updates via email
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium text-gray-900 dark:text-white">
                    SMS Notifications
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get text messages for urgent updates
                  </p>
                </div>
                <Switch
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => handleSettingChange('smsNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium text-gray-900 dark:text-white">
                    Session Reminders
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Reminders before upcoming therapy sessions
                  </p>
                </div>
                <Switch
                  checked={settings.sessionReminders}
                  onCheckedChange={(checked) => handleSettingChange('sessionReminders', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium text-gray-900 dark:text-white">
                    New Booking Notifications
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Notify when new sessions are booked
                  </p>
                </div>
                <Switch
                  checked={settings.reportNotifications}
                  onCheckedChange={(checked) => handleSettingChange('reportNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium text-gray-900 dark:text-white">
                    Marketing Emails
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive updates about new features and services
                  </p>
                </div>
                <Switch
                  checked={settings.marketingEmails}
                  onCheckedChange={(checked) => handleSettingChange('marketingEmails', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Practice Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
          <CardHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
              Practice Settings
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Configure your practice preferences and booking rules
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium text-gray-900 dark:text-white">
                    Auto-Accept Bookings
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Automatically accept new session bookings
                  </p>
                </div>
                <Switch
                  checked={settings.autoAcceptBookings}
                  onCheckedChange={(checked) => handleSettingChange('autoAcceptBookings', checked)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="advanceBookingDays" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Advance Booking Days
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="advanceBookingDays"
                      type="number"
                      value={settings.advanceBookingDays}
                      onChange={(e) => handleSettingChange('advanceBookingDays', Number(e.target.value))}
                      className="w-20"
                      min="1"
                      max="30"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">days</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    How far in advance can sessions be booked
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessionDuration" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Default Session Duration
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="sessionDuration"
                      type="number"
                      value={settings.sessionDuration}
                      onChange={(e) => handleSettingChange('sessionDuration', Number(e.target.value))}
                      className="w-20"
                      min="15"
                      max="120"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">minutes</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Default duration for therapy sessions
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Privacy Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
          <CardHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Shield className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
              Privacy & Data
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Control how your data is used and shared
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium text-gray-900 dark:text-white">
                    Data Sharing for Research
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Allow anonymized data to be used for therapy research
                  </p>
                </div>
                <Switch
                  checked={settings.dataSharing}
                  onCheckedChange={(checked) => handleSettingChange('dataSharing', checked)}
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800 dark:text-blue-200">
                      HIPAA Compliance Notice
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      All patient information is protected by HIPAA compliance and encrypted storage. 
                      We never share identifiable patient information without explicit consent.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Account Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
          <CardHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Settings className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
              Account Management
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your account and data
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Download My Data</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Export all your account data and session history
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Request Export
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Account Deactivation</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Temporarily deactivate your account
                  </p>
                </div>
                <Button variant="outline" size="sm" className="border-yellow-200 text-yellow-600 hover:bg-yellow-50 dark:border-yellow-800 dark:text-yellow-400 dark:hover:bg-yellow-900/20">
                  <Clock className="h-4 w-4 mr-2" />
                  Deactivate
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Delete Account</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20">
                  <EyeOff className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Current Settings Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.0 }}
      >
        <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
          <CardHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Current Settings Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(settings).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <div className="flex items-center space-x-2">
                    {typeof value === 'boolean' ? (
                      <>
                        <div className={`w-2 h-2 rounded-full ${value ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {value ? 'Enabled' : 'Disabled'}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {value}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default TherapistSettings
