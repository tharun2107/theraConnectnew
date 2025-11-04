import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, Bell, User } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

const Header: React.FC = () => {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="bg-white dark:bg-black shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Welcome back, {user?.role === 'PARENT' ? 'Parent' : user?.role === 'THERAPIST' ? 'Therapist' : 'Admin'}!
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {user?.email}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
            
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-full">
                <User className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.role}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="btn btn-outline btn-sm flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
