import React, { ReactNode, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../contexts/ThemeContext'
import ModernSidebar from './ModernSidebar'
import ModernHeader from './ModernHeader'

interface LayoutProps {
  children: ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  if (!user) {
    return <div>{children}</div>
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${theme === 'dark' ? 'dark' : ''}`}>
      <ModernSidebar 
        userRole={user.role || 'USER'}
        userName={user.name || 'User'}
        userEmail={user.email || 'user@example.com'}
        notifications={0}
      />
      <ModernHeader
        userRole={user.role || 'USER'}
        userName={user.name || 'User'}
        userEmail={user.email || 'user@example.com'}
        notifications={0}
        isDarkMode={theme === 'dark'}
        onToggleDarkMode={toggleTheme}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <main className="ml-72 pt-16 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 overflow-y-auto">
        <div className="p-6 pb-20">
          {children}
        </div>
      </main>
    </div>
  )
}

export default Layout
