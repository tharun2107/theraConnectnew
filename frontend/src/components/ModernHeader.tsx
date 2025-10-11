import React from 'react'
import { motion } from 'framer-motion'
import { 
  Bell, 
  Moon, 
  Sun, 
  User, 
  LogOut,
  Menu
} from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback } from './ui/avatar'

interface ModernHeaderProps {
  userRole: string
  userName: string
  userEmail: string
  notifications?: number
  isDarkMode?: boolean
  onToggleDarkMode?: () => void
  onToggleSidebar?: () => void
}

const ModernHeader: React.FC<ModernHeaderProps> = ({
  userRole,
  userName,
  userEmail,
  notifications = 0,
  isDarkMode = false,
  onToggleDarkMode,
  onToggleSidebar
}) => {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 right-0 left-72 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-30 shadow-sm"
    >
      <div className="flex items-center justify-between h-full px-6">
        {/* Left side - Mobile menu button */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="hidden md:block">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome back, {userName || 'User'}!
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">{userEmail || 'user@example.com'}</p>
            </motion.div>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-4">
          {/* Dark mode toggle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleDarkMode}
              className="relative"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="relative"
            >
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {notifications}
                </Badge>
              )}
            </Button>
          </motion.div>

          {/* User menu */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex items-center space-x-3"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                {userName ? userName.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <Badge variant="secondary" className="text-xs">
                {userRole || 'USER'}
              </Badge>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.header>
  )
}

export default ModernHeader
