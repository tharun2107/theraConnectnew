import React from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { Sun, Moon } from 'lucide-react'

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-100 dark:bg-black dark:border dark:border-gray-700 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-900 transition-colors duration-200"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </button>
  )
}

export default ThemeToggle
