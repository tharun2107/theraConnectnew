import React from 'react'
import { Link } from 'react-router-dom'
import { Users, Stethoscope } from 'lucide-react'
import HeroSection from '../LandingPagecomponents/components/HeroSection'
import VisionSection from '../LandingPagecomponents/components/VisionSection'
import FeaturesSection from '../LandingPagecomponents/components/FeaturesSection'
import HowItWorksSection from '../LandingPagecomponents/components/HowItWorksSection'
import TestimonialsSection from '../LandingPagecomponents/components/TestimonialsSection'
import PricingSection from '../LandingPagecomponents/components/PricingSection'
import CTASection from '../LandingPagecomponents/components/CTASection'
import Footer from '../LandingPagecomponents/components/Footer'

const NewLandingPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TheraConnect
              </span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors">How It Works</a>
              <a href="#testimonials" className="text-gray-600 hover:text-blue-600 transition-colors">Testimonials</a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">Pricing</a>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/register/parent"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
              >
                <Users className="h-4 w-4" />
                <span>Get Started</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-16">
        <HeroSection />
        <VisionSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <PricingSection />
        <CTASection />
        <Footer />
      </div>
    </div>
  )
}

export default NewLandingPage
