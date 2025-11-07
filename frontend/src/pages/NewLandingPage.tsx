import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Stethoscope, Menu, X, Calendar, Moon, Sun, ArrowRight } from 'lucide-react'
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
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8">
          <div className="flex justify-between items-center h-12 sm:h-14 md:h-16">
            {/* Logo */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
              <motion.div 
                className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg gpu-accelerated"
                whileHover={{ scale: 1.05 }}
                animate={{ 
                  rotate: [0, 3, -3, 0],
                }}
                transition={{ 
                  rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                  scale: { duration: 0.2 }
                }}
              >
                <Stethoscope className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-white" />
              </motion.div>
              <span className="text-sm sm:text-base md:text-lg lg:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap">
                Therabee
              </span>
            </div>

            {/* Navigation Links - Show on md and up */}
            <div className="hidden md:flex items-center space-x-3 lg:space-x-6 xl:space-x-8 flex-1 justify-center max-w-2xl mx-auto">
              <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium text-sm lg:text-base whitespace-nowrap">Features</a>
              <a href="#how-it-works" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium text-sm lg:text-base whitespace-nowrap">How It Works</a>
              <a href="#testimonials" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium text-sm lg:text-base whitespace-nowrap">Testimonials</a>
              <a href="#pricing" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium text-sm lg:text-base whitespace-nowrap">Pricing</a>
            </div>

            {/* Action Buttons - Show on md and up */}
            <div className="hidden md:flex items-center space-x-2 lg:space-x-3 xl:space-x-4 flex-shrink-0">
              <button
                onClick={() => setShowDemoModal(true)}
                className="px-3 lg:px-4 py-1.5 lg:py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-300 flex items-center space-x-1.5 shadow-md hover:shadow-lg text-sm lg:text-base whitespace-nowrap"
              >
                <Calendar className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                <span>Book Demo</span>
              </button>
              <Link
                to="/login"
                className="px-3 lg:px-4 py-1.5 lg:py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium border border-gray-300 dark:border-gray-700 rounded-lg hover:border-blue-600 dark:hover:border-blue-400 text-sm lg:text-base whitespace-nowrap"
              >
                Sign In
              </Link>
              <button
                onClick={toggleDarkMode}
                className="p-1.5 lg:p-2 text-gray-700 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900"
                aria-label="Toggle dark mode"
              >
                <motion.div
                  animate={darkMode ? { rotate: [0, 360] } : { rotate: [360, 0] }}
                  transition={{ duration: 0.3 }}
                  className="gpu-accelerated"
                >
                  {darkMode ? <Sun className="h-4 w-4 lg:h-5 lg:w-5" /> : <Moon className="h-4 w-4 lg:h-5 lg:w-5" />}
                </motion.div>
              </button>
            </div>

            {/* Mobile Menu Button - Show on small devices (below md) */}
            <div className="md:hidden flex items-center space-x-1 sm:space-x-1.5 flex-shrink-0">
              <button
                onClick={() => setShowDemoModal(true)}
                className="px-2 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-300 flex items-center space-x-1 text-xs whitespace-nowrap shadow-md"
              >
                <Calendar className="h-3 w-3" />
                <span>Demo</span>
              </button>
              <button
                onClick={toggleDarkMode}
                className="p-1.5 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg"
                aria-label="Toggle dark mode"
              >
                <motion.div
                  animate={{ 
                    rotate: darkMode ? [0, 360] : [360, 0],
                  }}
                  transition={{ 
                    duration: 0.3,
                    ease: "easeInOut"
                  }}
                  className="gpu-accelerated"
                >
                  {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </motion.div>
              </button>
              <Link
                to="/login"
                className="px-2 py-1.5 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium text-xs border border-gray-300 dark:border-gray-700 rounded-lg whitespace-nowrap"
              >
                Sign In
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1.5 sm:p-2"
                aria-label="Toggle menu"
              >
                <motion.div
                  animate={mobileMenuOpen ? { rotate: 90, scale: 1.1 } : { rotate: 0, scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  {mobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </motion.div>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div 
              className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-black"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                <motion.a
                  href="#features"
                  className="block px-3 py-2 text-gray-700 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ x: 5 }}
                >
                  Features
                </motion.a>
                <motion.a
                  href="#how-it-works"
                  className="block px-3 py-2 text-gray-700 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  whileHover={{ x: 5 }}
                >
                  How It Works
                </motion.a>
                <motion.a
                  href="#testimonials"
                  className="block px-3 py-2 text-gray-700 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ x: 5 }}
                >
                  Testimonials
                </motion.a>
                <motion.a
                  href="#pricing"
                  className="block px-3 py-2 text-gray-700 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  whileHover={{ x: 5 }}
                >
                  Pricing
                </motion.a>
                <motion.button
                  onClick={() => {
                    setShowDemoModal(true)
                    setMobileMenuOpen(false)
                  }}
                  className="w-full mt-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 shadow-md"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Calendar className="h-4 w-4" />
                  <span>Book Demo Session</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Book Demo Modal */}
      <BookDemoModal isOpen={showDemoModal} onClose={() => setShowDemoModal(false)} />

      {/* Main Content */}
      <div className="pt-14 sm:pt-16">
        <HeroSection darkMode={darkMode} onBookDemoClick={() => setShowDemoModal(true)} />
        <VisionSection darkMode={darkMode} />
        <FeaturesSection darkMode={darkMode} />
        <HowItWorksSection darkMode={darkMode} />
        <TestimonialsSection darkMode={darkMode} />
        <PricingSection darkMode={darkMode} />
        <CTASection darkMode={darkMode} />
        
        {/* Demo Section - Before Footer */}
        <section className={`py-12 sm:py-16 lg:py-20 transition-colors duration-300 relative overflow-hidden ${
          darkMode 
            ? 'bg-black' 
            : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
        }`}>
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(2)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute rounded-full gpu-accelerated ${
                  darkMode ? 'bg-blue-500/10' : 'bg-blue-400/20'
                } blur-3xl`}
                style={{
                  width: `${120 + i * 60}px`,
                  height: `${120 + i * 60}px`,
                  left: `${i * 35}%`,
                  top: `${i * 30}%`,
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.3, 0.2],
                  rotate: [0, 90, 180]
                }}
                transition={{
                  duration: 12 + i * 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div 
              className="text-center max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <motion.h2 
                className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Have Any Queries?
              </motion.h2>
              <motion.p 
                className={`text-base sm:text-lg md:text-xl mb-6 sm:mb-8 leading-relaxed ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Book a demo session with our team and discover how Therabee can help your family.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  onClick={() => setShowDemoModal(true)}
                  className={`px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center mx-auto shadow-lg ${
                    darkMode ? 'shadow-2xl shadow-blue-500/30' : ''
                  }`}
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="gpu-accelerated"
                  >
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 mr-2" />
                  </motion.div>
                  <span className="text-sm sm:text-base md:text-lg">Book Demo Session</span>
                  <motion.div
                    className="ml-2 gpu-accelerated"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                  </motion.div>
                </button>
              </motion.div>
            </motion.div>
          </div>
        </section>
        
        <Footer darkMode={darkMode} />
      </div>
    </div>
  )
}

export default NewLandingPage
