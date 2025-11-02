import React from "react";
import { Button } from "./ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";

interface CTASectionProps {
  darkMode?: boolean
}

const CTASection: React.FC<CTASectionProps> = ({ darkMode = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.02, 0.98]);

  return (
    <motion.section 
      ref={containerRef}
      className="py-16 sm:py-20 relative overflow-hidden"
      style={{ y, opacity, scale }}
    >
      {/* Enhanced Animated Background */}
      <div className={`absolute inset-0 transition-colors duration-300 ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' 
          : 'bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600'
      }`}>
        {/* Top Transition Wave */}
        <div className="absolute top-0 left-0 w-full overflow-hidden">
          <motion.svg
            className="relative block w-full h-32"
            preserveAspectRatio="none"
            viewBox="0 0 1200 120"
            xmlns="http://www.w3.org/2000/svg"
            animate={{
              d: [
                "M0,0 C300,40 600,0 1200,20 L1200,120 L0,120 Z",
                "M0,0 C300,20 600,40 1200,0 L1200,120 L0,120 Z",
                "M0,0 C300,40 600,0 1200,20 L1200,120 L0,120 Z"
              ]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <path
              d="M0,0 C300,40 600,0 1200,20 L1200,120 L0,120 Z"
              className="fill-white/20"
            />
            <path
              d="M0,0 C300,20 600,40 1200,0 L1200,120 L0,120 Z"
              className="fill-white/10"
            />
          </motion.svg>
        </div>
        
        {/* Enhanced Wave Animation */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <motion.svg
            className="relative block w-full h-32"
            preserveAspectRatio="none"
            viewBox="0 0 1200 120"
            xmlns="http://www.w3.org/2000/svg"
            animate={{
              d: [
                "M0,40 C150,80 350,0 600,40 C850,80 1050,0 1200,40 L1200,120 L0,120 Z",
                "M0,60 C150,40 350,80 600,20 C850,60 1050,40 1200,60 L1200,120 L0,120 Z",
                "M0,40 C150,80 350,0 600,40 C850,80 1050,0 1200,40 L1200,120 L0,120 Z"
              ]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <path
              d="M0,40 C150,80 350,0 600,40 C850,80 1050,0 1200,40 L1200,120 L0,120 Z"
              className="fill-white/10"
            />
            <path
              d="M0,60 C300,20 600,100 1200,60 L1200,120 L0,120 Z"
              className="fill-white/5"
            />
          </motion.svg>
        </div>

        {/* Enhanced Floating Elements */}
        <motion.div 
          className="absolute top-20 left-10 w-24 h-24 bg-white/10 rounded-full"
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-32 right-20 w-16 h-16 bg-white/15 rounded-full"
          animate={{
            y: [0, 25, 0],
            x: [0, -15, 0],
            scale: [1, 0.8, 1],
            rotate: [0, -180, -360]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div 
          className="absolute bottom-40 left-1/4 w-12 h-12 bg-white/20 rounded-full"
          animate={{
            y: [0, -40, 0],
            x: [0, 25, 0],
            scale: [1, 1.3, 1],
            rotate: [0, 360, 720]
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div 
          className="absolute top-1/2 right-1/4 w-8 h-8 bg-white/25 rounded-full"
          animate={{
            y: [0, -20, 0],
            x: [0, -10, 0],
            scale: [1, 1.5, 1],
            rotate: [0, -360, -720]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />
        
        {/* Additional floating particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/30 rounded-full"
            style={{
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [0, -50, 0],
              x: [0, Math.random() * 30 - 15, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Enhanced Sparkle Icon */}
          <motion.div 
            className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-6 sm:mb-8 shadow-2xl relative overflow-hidden"
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{
              rotate: { duration: 8, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
            whileHover={{ scale: 1.2 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white relative z-10" />
          </motion.div>

          {/* Enhanced Headline */}
          <motion.h2 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6 text-white px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Ready to experience the{" "}
            <motion.span 
              className="text-gradient bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 bg-clip-text text-transparent"
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
              future of therapy
            </motion.span>
            ?
          </motion.h2>

          {/* Enhanced Subtext */}
          <motion.p 
            className="text-base sm:text-xl md:text-2xl text-white/90 mb-6 sm:mb-8 leading-relaxed max-w-3xl mx-auto px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Join thousands of families who have found the therapeutic support they need. 
            Your child's mental health journey starts with a single click.
          </motion.p>

          {/* Enhanced CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-8 sm:mb-12 px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Link to="/login">
                <Button 
                  size="lg" 
                  className="text-base sm:text-xl px-8 sm:px-10 py-4 sm:py-6 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold group relative overflow-hidden shadow-2xl w-full sm:w-auto"
                >
                  <motion.span
                    className="relative z-10 flex items-center justify-center"
                    initial={{ opacity: 1 }}
                    whileHover={{ opacity: 0.9 }}
                  >
                    Sign In
                    <motion.div
                      className="ml-2"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </motion.div>
                  </motion.span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                  />
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div 
            className="grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">24/7</div>
              <div className="text-sm sm:text-base text-white/80">Support</div>
            </motion.div>
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">HIPAA</div>
              <div className="text-sm sm:text-base text-white/80">Compliant</div>
            </motion.div>
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">100%</div>
              <div className="text-sm sm:text-base text-white/80">Secure</div>
            </motion.div>
          </motion.div>

          {/* Rating Display */}
          <motion.div 
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <div className="flex justify-center items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <motion.div 
                  key={i}
                  className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: "easeInOut"
                  }}
                />
              ))}
              <span className="ml-3 text-white/90">4.9/5 rating from 2,000+ reviews</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default CTASection;