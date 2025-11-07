import React from "react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { UserPlus, Search, CreditCard, Video, TrendingUp } from "lucide-react";

interface HowItWorksSectionProps {
  darkMode?: boolean
}

const steps = [
  {
    icon: UserPlus,
    title: "Sign Up",
    description: "Parents and therapists register with secure verification and background checks.",
    number: "01"
  },
  {
    icon: Search,
    title: "Browse Therapists",
    description: "Explore verified therapist profiles, specializations, and real-time availability.",
    number: "02"
  },
  {
    icon: CreditCard,
    title: "Book & Pay",
    description: "Secure appointment booking with integrated payments via Stripe and Razorpay.",
    number: "03"
  },
  {
    icon: Video,
    title: "Attend Session",
    description: "Join high-quality video sessions powered by Zoom with interactive therapy tools.",
    number: "04"
  },
  {
    icon: TrendingUp,
    title: "Track Progress",
    description: "Receive detailed progress reports, session summaries, and milestone updates.",
    number: "05"
  }
];

const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ darkMode = false }) => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section 
      id="how-it-works" 
      ref={sectionRef}
      className={`py-12 sm:py-16 lg:py-20 transition-colors duration-300 relative overflow-hidden ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900' 
          : 'bg-gradient-to-br from-purple-50 via-white to-blue-50'
      }`}
    >
      {/* 3D Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full ${
              darkMode ? 'bg-purple-500/10' : 'bg-purple-400/20'
            } blur-3xl`}
            style={{
              width: `${150 + i * 60}px`,
              height: `${150 + i * 60}px`,
              left: `${i * 25}%`,
              top: `${i * 20}%`,
            }}
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.2, 0.4, 0.2],
              rotate: [0, 360, 0]
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 px-4 ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>
            How <motion.span 
              className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                backgroundSize: "200% 200%"
              }}
            >
              Therabee
            </motion.span> Works
          </h2>
          <p className={`text-base sm:text-lg md:text-xl max-w-2xl mx-auto px-4 ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Get started with therapy in just 5 simple steps. Our streamlined process 
            makes it easy for families to connect with the right therapist.
          </p>
          <motion.div 
            className="w-24 h-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mx-auto mt-6"
            initial={{ width: 0 }}
            animate={isInView ? { width: 96 } : { width: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Connecting Line */}
          <motion.div 
            className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-purple-400 to-blue-400 rounded-full opacity-30"
            initial={{ scaleY: 0 }}
            animate={isInView ? { scaleY: 1 } : { scaleY: 0 }}
            transition={{ duration: 1.5, delay: 0.5 }}
            style={{ transformOrigin: "top" }}
          />

          {/* Steps */}
          <div className="space-y-8 sm:space-y-12 lg:space-y-16">
            {steps.map((step, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="flex flex-col lg:flex-row items-center gap-6 sm:gap-8 lg:gap-12"
              >
                {/* Content */}
                <motion.div 
                  className="flex-1 text-center lg:text-left w-full"
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ duration: 0.3 }}
                  style={{ perspective: "1000px" }}
                >
                  <div className={`rounded-2xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border ${
                    darkMode 
                      ? 'bg-gray-800/50 backdrop-blur-sm border-gray-700' 
                      : 'bg-white border-gray-200'
                  }`}>
                    <div className="flex items-center justify-center lg:justify-start mb-4">
                      <span className={`text-4xl sm:text-5xl lg:text-6xl font-bold mr-4 ${
                        darkMode ? 'text-purple-300/30' : 'text-purple-200'
                      }`}>
                        {step.number}
                      </span>
                      <motion.div 
                        className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg"
                        whileHover={{ scale: 1.2, rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        style={{
                          boxShadow: '0 8px 25px rgba(147, 51, 234, 0.4)'
                        }}
                      >
                        <step.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </motion.div>
                    </div>
                    <h3 className={`text-xl sm:text-2xl font-bold mb-3 sm:mb-4 ${
                      darkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      {step.title}
                    </h3>
                    <p className={`text-sm sm:text-base leading-relaxed ${
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                </motion.div>

                {/* Center Circle (Desktop) */}
                <div className="hidden lg:flex items-center justify-center">
                  <motion.div 
                    className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-2xl"
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 180, 360]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    style={{
                      boxShadow: '0 0 40px rgba(147, 51, 234, 0.5)'
                    }}
                  >
                    <div className={`w-8 h-8 rounded-full ${
                      darkMode ? 'bg-gray-800' : 'bg-white'
                    }`} />
                  </motion.div>
                </div>

                {/* Spacer for alternating layout */}
                <div className="flex-1 hidden lg:block"></div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div 
          className="text-center mt-12 sm:mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <div className={`rounded-2xl p-6 sm:p-8 shadow-xl max-w-2xl mx-auto border ${
            darkMode 
              ? 'bg-gradient-to-br from-gray-800/80 to-purple-900/30 backdrop-blur-sm border-gray-700' 
              : 'bg-gradient-to-br from-purple-50 to-blue-50 border-gray-200'
          }`}>
            <h3 className={`text-xl sm:text-2xl font-bold mb-3 sm:mb-4 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>
              Ready to Get Started?
            </h3>
            <p className={`text-sm sm:text-base mb-6 ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Join thousands of families who have found the right therapeutic support through Therabee.
            </p>
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Link to="/login">
                <button className={`px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:shadow-xl transition-all duration-300 text-base sm:text-lg flex items-center justify-center mx-auto ${
                  darkMode ? 'shadow-2xl shadow-purple-500/30' : 'shadow-lg'
                }`}>
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;