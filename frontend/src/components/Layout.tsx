import React, { ReactNode, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../contexts/ThemeContext'
import { 
  LogOut, 
  Bell, 
  Moon, 
  Sun, 
  Menu,
  X,
  User,
  Home,
  Users,
  Calendar,
  BarChart3,
  UserCheck
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
        { id: 'leaves', label: 'Leave Management', icon: UserCheck, path: '/therapist/leaves' },
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
      case 'PARENT': return 'bg-accent-blue/20 dark:bg-blue-900/30 text-[#1A1A1A] dark:text-white border border-accent-blue/30 dark:border-blue-700'
      case 'THERAPIST': return 'bg-accent-green/20 dark:bg-green-900/30 text-[#1A1A1A] dark:text-white border border-accent-green/30 dark:border-green-700'
      case 'ADMIN': return 'bg-[#F9F9F9] dark:bg-black text-[#1A1A1A] dark:text-white border border-gray-border dark:border-gray-700'
      default: return 'bg-[#F9F9F9] dark:bg-black text-[#1A1A1A] dark:text-white border border-gray-border dark:border-gray-700'
    }
  }

  return (
    <div className="min-h-screen transition-colors duration-200">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-border dark:border-gray-700 bg-white/95 dark:bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-white/95 dark:supports-[backdrop-filter]:bg-black/95">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TC</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-[#1A1A1A] dark:text-white">Therabee</h1>
                <p className="text-xs text-[#4D4D4D] dark:text-gray-400">Professional Therapy</p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Items */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-[#4D4D4D] dark:text-gray-300 hover:text-[#1A1A1A] dark:hover:text-white hover:bg-[#F9F9F9] dark:hover:bg-gray-900 rounded-lg transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              )
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2 text-[#B3B3B3] dark:text-gray-400 hover:text-[#1A1A1A] dark:hover:text-white"
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
              className="p-2 text-[#B3B3B3] dark:text-gray-400 hover:text-[#1A1A1A] dark:hover:text-white relative"
            >
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs bg-black text-white">
                0
              </Badge>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 sm:space-x-3 p-1.5 sm:p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-black text-white text-sm font-medium">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-[#1A1A1A] dark:text-white">{user.name || 'User'}</p>
                    <p className="text-xs text-[#4D4D4D] dark:text-gray-400">{user.email || 'user@example.com'}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-[#1A1A1A] dark:text-white">{user.name || 'User'}</p>
                  <p className="text-xs text-[#4D4D4D] dark:text-gray-400">{user.email || 'user@example.com'}</p>
                  <Badge className={`mt-1 text-xs ${getRoleColor(user.role || 'USER')}`}>
                    {user.role || 'USER'}
                  </Badge>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(user.role === 'ADMIN' ? '/admin/profile' : user.role === 'PARENT' ? '/parent/profile' : '/therapist/profile')}>
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-[#1A1A1A] dark:text-white hover:bg-[#F9F9F9] dark:hover:bg-gray-900">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-border dark:border-gray-700 bg-white dark:bg-black">
            <nav className="px-4 py-3 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    onClick={() => {
                      navigate(item.path)
                      setMobileMenuOpen(false)
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-2.5 text-base font-medium text-[#4D4D4D] dark:text-gray-300 hover:text-[#1A1A1A] dark:hover:text-white hover:bg-[#F9F9F9] dark:hover:bg-gray-900 rounded-lg transition-colors justify-start"
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Button>
                )
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="min-h-screen bg-[#F9F9F9] dark:bg-black transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}

export default Layout
