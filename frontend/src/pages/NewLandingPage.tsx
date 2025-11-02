import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Stethoscope, Menu, X, Calendar, Moon, Sun } from 'lucide-react'
import HeroSection from '../LandingPagecomponents/components/HeroSection'
import VisionSection from '../LandingPagecomponents/components/VisionSection'
import FeaturesSection from '../LandingPagecomponents/components/FeaturesSection'
import HowItWorksSection from '../LandingPagecomponents/components/HowItWorksSection'
import TestimonialsSection from '../LandingPagecomponents/components/TestimonialsSection'
import PricingSection from '../LandingPagecomponents/components/PricingSection'
import CTASection from '../LandingPagecomponents/components/CTASection'
import Footer from '../LandingPagecomponents/components/Footer'
import BookDemoModal from '../components/BookDemoModal'

const NewLandingPage: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showDemoModal, setShowDemoModal] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark)
    setDarkMode(isDark)
    updateTheme(isDark)
  }, [])

  const updateTheme = (isDark: boolean) => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    updateTheme(newDarkMode)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <motion.div 
                className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Stethoscope className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </motion.div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TheraConnect
              </span>
            </div>

            {/* Navigation Links */}
            <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">Features</a>
              <a href="#how-it-works" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">How It Works</a>
              <a href="#testimonials" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">Testimonials</a>
              <a href="#pricing" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">Pricing</a>
            </div>

            {/* Action Buttons */}
            <div className="hidden lg:flex items-center space-x-3 xl:space-x-4">
              <button
                onClick={() => setShowDemoModal(true)}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-xl transform hover:scale-105"
              >
                <Calendar className="h-4 w-4 mr-2" />
                <span className="hidden xl:inline">Book Demo</span>
                <span className="xl:hidden">Demo</span>
              </button>
              <Link
                to="/login"
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium border border-gray-300 dark:border-gray-700 rounded-lg hover:border-blue-600 dark:hover:border-blue-400"
              >
                Sign In
              </Link>
              <button
                onClick={toggleDarkMode}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center space-x-2">
              <button
                onClick={toggleDarkMode}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button
                onClick={() => setShowDemoModal(true)}
                className="flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all text-sm shadow-md"
              >
                <Calendar className="h-3 w-3 mr-1" />
                Demo
              </button>
              <Link
                to="/login"
                className="px-3 py-1.5 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium text-sm border border-gray-300 dark:border-gray-700 rounded-lg"
              >
                Sign In
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-2"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                ) : (
                  <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <a
                  href="#features"
                  className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  How It Works
                </a>
                <a
                  href="#testimonials"
                  className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Testimonials
                </a>
                <a
                  href="#pricing"
                  className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </a>
                <button
                  onClick={() => {
                    setShowDemoModal(true)
                    setMobileMenuOpen(false)
                  }}
                  className="block w-full text-left px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors mt-2"
                >
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Book Demo
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Book Demo Modal */}
      <BookDemoModal isOpen={showDemoModal} onClose={() => setShowDemoModal(false)} />

      {/* Main Content */}
      <div className="pt-14 sm:pt-16">
        <HeroSection darkMode={darkMode} />
        <VisionSection darkMode={darkMode} />
        <FeaturesSection darkMode={darkMode} />
        <HowItWorksSection darkMode={darkMode} />
        <TestimonialsSection darkMode={darkMode} />
        <PricingSection darkMode={darkMode} />
        <CTASection darkMode={darkMode} />
        <Footer darkMode={darkMode} />
      </div>
    </div>
  )
}

export default NewLandingPage
