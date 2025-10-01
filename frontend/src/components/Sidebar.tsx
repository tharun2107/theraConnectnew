import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  Home, 
  Users, 
  Calendar, 
  UserCheck, 
  Settings, 
  Clock,
  Heart,
  Shield
} from 'lucide-react'

const Sidebar: React.FC = () => {
  const { user } = useAuth()

  const getNavigationItems = () => {
    switch (user?.role) {
      case 'PARENT':
        return [
          { to: '/parent', icon: Home, label: 'Dashboard' },
          { to: '/parent/children', icon: Users, label: 'My Children' },
          { to: '/parent/bookings', icon: Calendar, label: 'Bookings' },
          { to: '/parent/therapists', icon: Heart, label: 'Find Therapists' },
        ]
      case 'THERAPIST':
        return [
          { to: '/therapist', icon: Home, label: 'Dashboard' },
          { to: '/therapist/schedule', icon: Calendar, label: 'Schedule' },
          { to: '/therapist/bookings', icon: Clock, label: 'Bookings' },
          { to: '/therapist/leaves', icon: UserCheck, label: 'Leave Requests' },
        ]
      case 'ADMIN':
        return [
          { to: '/admin', icon: Home, label: 'Dashboard' },
          { to: '/admin/therapists', icon: Users, label: 'Therapists' },
          { to: '/admin/bookings', icon: Calendar, label: 'All Bookings' },
          { to: '/admin/settings', icon: Settings, label: 'Settings' },
        ]
      default:
        return []
    }
  }

  const navigationItems = getNavigationItems()

  return (
    <div className="w-64 bg-white dark:bg-gray-900 shadow-sm border-r border-gray-200 dark:border-gray-700 min-h-screen transition-colors duration-200">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">TheraConnect</h2>
        </div>
      </div>
      
      <nav className="mt-6 px-3">
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
      
      {/* Removed role badge */}
    </div>
  )
}

export default Sidebar
