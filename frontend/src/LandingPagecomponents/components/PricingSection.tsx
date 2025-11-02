import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Check, Zap, Crown, Star, ArrowRight } from "lucide-react";

interface PricingSectionProps {
  darkMode?: boolean
}

const plans = [
  {
    name: "Starter",
    price: "$29",
    period: "/month",
    description: "Perfect for families just beginning their therapy journey",
    icon: Zap,
    features: [
      "Up to 4 therapy sessions per month",
      "Basic progress tracking",
      "Email support",
      "Secure video sessions",
      "Calendar integration",
      "Basic reports"
    ],
    buttonText: "Sign In",
    isPopular: false
  },
  {
    name: "Standard",
    price: "$59",
    period: "/month",
    description: "Most popular choice for regular therapy sessions",
    icon: Star,
    features: [
      "Up to 8 therapy sessions per month",
      "Advanced progress tracking",
      "Priority email & chat support",
      "HD video sessions with recording",
      "Smart scheduling assistant",
      "Detailed progress reports",
      "Family portal access",
      "Mobile app included"
    ],
    buttonText: "Sign In",
    isPopular: true
  },
  {
    name: "Professional",
    price: "$99",
    period: "/month",
    description: "Comprehensive solution for intensive therapy programs",
    icon: Crown,
    features: [
      "Unlimited therapy sessions",
      "Premium progress analytics",
      "24/7 phone & chat support",
      "4K video sessions with recording",
      "AI-powered scheduling",
      "Comprehensive progress reports",
      "Multi-family management",
      "API access",
      "Custom integrations",
      "Dedicated account manager"
    ],
    buttonText: "Sign In",
    isPopular: false
  }
];

const PricingSection: React.FC<PricingSectionProps> = ({ darkMode = false }) => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section 
      id="pricing" 
      ref={sectionRef}
      className={`py-12 sm:py-16 lg:py-20 transition-colors duration-300 relative overflow-hidden ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-br from-gray-50 via-white to-blue-50'
      }`}
    >
      {/* 3D Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full ${
              darkMode ? 'bg-blue-500/10' : 'bg-blue-400/20'
            } blur-3xl`}
            style={{
              width: `${180 + i * 40}px`,
              height: `${180 + i * 40}px`,
              left: `${i * 20}%`,
              top: `${i * 15}%`,
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
              rotate: [0, 180, 360]
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
            Choose Your <motion.span 
              className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
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
              Perfect Plan
            </motion.span>
          </h2>
          <p className={`text-base sm:text-lg md:text-xl max-w-2xl mx-auto px-4 ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Flexible pricing options designed to fit your family's needs and budget. 
            All plans include our core security and privacy features.
          </p>
          <motion.div 
            className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mt-6"
            initial={{ width: 0 }}
            animate={isInView ? { width: 96 } : { width: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ 
                scale: 1.05, 
                y: -10,
                rotateY: 2,
                rotateX: 2
              }}
              style={{ perspective: "1000px" }}
            >
              <Card 
                className={`relative border-0 shadow-xl hover:shadow-2xl transition-all duration-300 h-full ${
                  plan.isPopular 
                    ? `ring-2 ${darkMode ? 'ring-purple-500 shadow-2xl shadow-purple-500/30 scale-105' : 'ring-blue-500 shadow-xl'}` 
                    : ''
                } ${
                  darkMode 
                    ? 'bg-gray-800/50 backdrop-blur-sm border-gray-700' 
                    : 'bg-white border-gray-200'
                }`}
              >
                {/* Popular Badge */}
                {plan.isPopular && (
                  <motion.div 
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10"
                    animate={{
                      scale: [1, 1.1, 1],
                      y: [0, -3, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <div className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg ${
                      darkMode 
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    }`}>
                      Most Popular
                    </div>
                  </motion.div>
                )}

                <CardHeader className="text-center pb-6 sm:pb-8">
                  {/* Plan Icon */}
                  <motion.div 
                    className={`mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-4 shadow-xl relative overflow-hidden ${
                      plan.isPopular 
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500' 
                        : darkMode 
                          ? 'bg-gradient-to-r from-purple-500/30 to-blue-500/30' 
                          : 'bg-gradient-to-r from-purple-500/20 to-blue-500/20'
                    }`}
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    style={{
                      boxShadow: '0 10px 30px rgba(147, 51, 234, 0.4)'
                    }}
                  >
                    <plan.icon className={`w-7 h-7 sm:w-8 sm:h-8 ${
                      plan.isPopular ? 'text-white' : darkMode ? 'text-purple-300' : 'text-purple-600'
                    } relative z-10`} />
                  </motion.div>

                  {/* Plan Name */}
                  <CardTitle className={`text-xl sm:text-2xl font-bold mb-2 ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    {plan.name}
                  </CardTitle>

                  {/* Price */}
                  <div className="mb-4">
                    <motion.span 
                      className={`text-3xl sm:text-4xl font-bold ${
                        darkMode ? 'text-white' : 'text-gray-800'
                      }`}
                      animate={plan.isPopular ? {
                        scale: [1, 1.05, 1]
                      } : {}}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      {plan.price}
                    </motion.span>
                    <span className={`text-sm sm:text-base ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {plan.period}
                    </span>
                  </div>

                  {/* Description */}
                  <p className={`text-sm sm:text-base ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {plan.description}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4 sm:space-y-6">
                  {/* Features List */}
                  <ul className="space-y-2 sm:space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <motion.li 
                        key={featureIndex} 
                        className="flex items-start space-x-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                        transition={{ duration: 0.4, delay: index * 0.2 + featureIndex * 0.05 }}
                      >
                        <motion.div 
                          className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            darkMode 
                              ? 'bg-gradient-to-r from-purple-500 to-blue-500' 
                              : 'bg-gradient-to-r from-purple-500 to-blue-500'
                          }`}
                          whileHover={{ scale: 1.2, rotate: 180 }}
                          transition={{ duration: 0.3 }}
                          style={{
                            boxShadow: '0 2px 10px rgba(147, 51, 234, 0.3)'
                          }}
                        >
                          <Check className="w-3 h-3 text-white" />
                        </motion.div>
                        <span className={`text-xs sm:text-sm leading-relaxed ${
                          darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {feature}
                        </span>
                      </motion.li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Link to="/login">
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Button 
                        className={`w-full text-base sm:text-lg py-4 sm:py-6 font-semibold transition-all duration-300 flex items-center justify-center ${
                          plan.isPopular 
                            ? `bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-xl ${
                                darkMode ? 'shadow-2xl shadow-purple-500/30' : 'shadow-lg'
                              }` 
                            : darkMode 
                              ? 'border-2 border-purple-500 text-purple-300 hover:bg-purple-500 hover:text-white' 
                              : 'border-2 border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white'
                        }`}
                        variant={plan.isPopular ? "default" : "outline"}
                      >
                        {plan.buttonText}
                        <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                    </motion.div>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Payment Icons */}
        <motion.div 
          className="text-center mt-12 sm:mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <p className={`text-sm sm:text-base mb-4 sm:mb-6 px-4 ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Secure payments powered by industry leaders
          </p>
          <div className="flex justify-center items-center space-x-4 sm:space-x-8 px-4">
            <motion.div 
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg ${
                darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'
              }`}
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <span className={`font-semibold text-sm sm:text-base ${
                darkMode ? 'text-cyan-300' : 'text-gray-700'
              }`}>
                Stripe
              </span>
            </motion.div>
            <motion.div 
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg ${
                darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'
              }`}
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <span className={`font-semibold text-sm sm:text-base ${
                darkMode ? 'text-cyan-300' : 'text-gray-700'
              }`}>
                Razorpay
              </span>
            </motion.div>
          </div>
        </motion.div>

        {/* Money Back Guarantee */}
        <motion.div 
          className="text-center mt-8 sm:mt-12 px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 1.4 }}
        >
          <div className={`rounded-2xl p-4 sm:p-6 max-w-md mx-auto shadow-xl border ${
            darkMode 
              ? 'bg-gradient-to-br from-gray-800/80 to-purple-900/30 backdrop-blur-sm border-gray-700' 
              : 'bg-gradient-to-br from-purple-50 to-blue-50 border-gray-200'
          }`}>
            <motion.div 
              className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                boxShadow: '0 4px 15px rgba(147, 51, 234, 0.4)'
              }}
            >
              <Check className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </motion.div>
            <h3 className={`font-semibold text-base sm:text-lg mb-2 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>
              30-Day Money Back Guarantee
            </h3>
            <p className={`text-xs sm:text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Not satisfied? Get a full refund within 30 days, no questions asked.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;