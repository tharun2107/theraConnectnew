import React, { ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../contexts/ThemeContext'
import { 
  LogOut, 
  Bell, 
  Settings, 
  Moon, 
  Sun, 
  Menu,
  User,
  Home,
  Users,
  Calendar,
  BarChart3,
  Shield
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from './ui/button'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Badge } from './ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'

interface LayoutProps {
  children: ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  if (!user) {
    return <div>{children}</div>
  }

  const getNavigationItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/' },
    ]

    if (user.role === 'PARENT') {
      return [
        ...baseItems,
        { id: 'children', label: 'My Children', icon: Users, path: '/parent/children' },
        { id: 'bookings', label: 'Bookings', icon: Calendar, path: '/parent/bookings' },
        { id: 'therapists', label: 'Find Therapists', icon: Users, path: '/parent/therapists' },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/parent/analytics' },
      ]
    } else if (user.role === 'THERAPIST') {
      return [
        ...baseItems,
        { id: 'schedule', label: 'Schedule', icon: Calendar, path: '/therapist/schedule' },
        { id: 'bookings', label: 'Bookings', icon: Users, path: '/therapist/bookings' },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/therapist/analytics' },
      ]
    } else if (user.role === 'ADMIN') {
      return [
        ...baseItems,
        { id: 'therapists', label: 'Therapists', icon: Users, path: '/admin/therapists' },
        { id: 'children', label: 'Children', icon: Users, path: '/admin/children' },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
      ]
    }

    return baseItems
  }

  const navigationItems = getNavigationItems()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'PARENT': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'THERAPIST': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'ADMIN': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60">
        <div className="flex h-16 items-center justify-between px-6">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TC</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">TheraConnect</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Professional Therapy</p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              )
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 relative"
            >
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs bg-red-500 text-white">
                0
              </Badge>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-3 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white text-sm font-medium">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name || 'User'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email || 'user@example.com'}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name || 'User'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.email || 'user@example.com'}</p>
                  <Badge className={`mt-1 text-xs ${getRoleColor(user.role || 'USER')}`}>
                    {user.role || 'USER'}
                  </Badge>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(user.role === 'ADMIN' ? '/admin/profile' : user.role === 'PARENT' ? '/parent/profile' : '/therapist/profile')}>
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(user.role === 'ADMIN' ? '/admin/settings' : user.role === 'PARENT' ? '/parent/settings' : '/therapist/settings')}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}

export default Layout
