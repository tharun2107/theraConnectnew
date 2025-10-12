import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  UserPlus, 
  Search,
  Heart,
  Bell,
  Settings,
  LogOut
} from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { cn } from '../lib/utils'

interface SidebarItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

interface ModernSidebarProps {
  userRole: string
  userName: string
  userEmail: string
  notifications?: number
}

const ModernSidebar: React.FC<ModernSidebarProps> = ({
  userRole,
  userName,
  userEmail,
  notifications = 0
}) => {
  const navigate = useNavigate()
  const location = useLocation()

  const getSidebarItems = (): SidebarItem[] => {
    const basePath = `/${userRole.toLowerCase()}`
    
    if (userRole === 'PARENT') {
      return [
        { name: 'Dashboard', href: basePath, icon: LayoutDashboard },
        { name: 'My Children', href: `${basePath}/children`, icon: Users },
        { name: 'Bookings', href: `${basePath}/bookings`, icon: Calendar },
        { name: 'Find Therapists', href: `${basePath}/therapists`, icon: Search },
      ]
    } else if (userRole === 'THERAPIST') {
      return [
        { name: 'Dashboard', href: basePath, icon: LayoutDashboard },
        { name: 'Schedule', href: `${basePath}/schedule`, icon: Calendar },
        { name: 'Bookings', href: `${basePath}/bookings`, icon: Users },
        { name: 'Leave Requests', href: `${basePath}/leaves`, icon: UserPlus },
      ]
    } else if (userRole === 'ADMIN') {
      return [
        { name: 'Dashboard', href: basePath, icon: LayoutDashboard },
        { name: 'Therapists', href: `${basePath}/therapists`, icon: Users },
        { name: 'Bookings', href: `${basePath}/bookings`, icon: Calendar },
      ]
    }
    
    return []
  }

  const sidebarItems = getSidebarItems()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed left-0 top-0 h-full w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-r border-slate-700 dark:border-gray-700 z-40 overflow-y-auto"
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-700 dark:border-gray-700">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex items-center space-x-3"
        >
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">TheraConnect</h1>
            <p className="text-sm text-slate-400">Professional Therapy</p>
          </div>
        </motion.div>
      </div>

      {/* User Profile */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="p-6 border-b border-slate-700"
      >
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {userName ? userName.charAt(0).toUpperCase() : 'U'}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold">{userName || 'User'}</h3>
            <p className="text-slate-400 text-sm">{userEmail || 'user@example.com'}</p>
            <Badge variant="secondary" className="mt-1 text-xs">
              {userRole || 'USER'}
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 p-6">
        <div className="space-y-2">
          {sidebarItems.map((item, index) => {
            const isActive = location.pathname === item.href || 
              (item.href !== `/${userRole.toLowerCase()}` && location.pathname.startsWith(item.href))
            
            return (
              <motion.div
                key={item.name}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
              >
                <Button
                  variant="ghost"
                  onClick={() => navigate(item.href)}
                  className={cn(
                    "w-full justify-start h-12 px-4 text-left hover:bg-slate-700 dark:hover:bg-gray-700 transition-all duration-200",
                    isActive 
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" 
                      : "text-slate-300 hover:text-white"
                  )}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span className="flex-1">{item.name}</span>
                  {item.badge && item.badge > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              </motion.div>
            )
          })}
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="p-6 border-t border-slate-700 dark:border-gray-700">
        <div className="space-y-2">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <Button
              variant="ghost"
              className="w-full justify-start h-12 px-4 text-slate-300 dark:text-gray-300 hover:text-white dark:hover:text-white hover:bg-slate-700 dark:hover:bg-gray-700"
            >
              <Bell className="w-5 h-5 mr-3" />
              <span className="flex-1">Notifications</span>
              {notifications > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {notifications}
                </Badge>
              )}
            </Button>
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <Button
              variant="ghost"
              className="w-full justify-start h-12 px-4 text-slate-300 dark:text-gray-300 hover:text-white dark:hover:text-white hover:bg-slate-700 dark:hover:bg-gray-700"
            >
              <Settings className="w-5 h-5 mr-3" />
              <span>Settings</span>
            </Button>
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.5 }}
          >
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start h-12 px-4 text-red-400 hover:text-red-300 hover:bg-red-900/20"
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span>Logout</span>
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export default ModernSidebar
