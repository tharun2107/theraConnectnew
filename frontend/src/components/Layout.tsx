import React, { ReactNode, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import ModernSidebar from './ModernSidebar'
import ModernHeader from './ModernHeader'

interface LayoutProps {
  children: ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useAuth()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  if (!user) {
    return <div>{children}</div>
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    // You can add theme switching logic here
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'dark' : ''}`}>
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
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <main>
        {children}
      </main>
    </div>
  )
}

export default Layout
