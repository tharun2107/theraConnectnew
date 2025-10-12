import React from 'react'
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
      <HeroSection />
      <VisionSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  )
}

export default NewLandingPage
