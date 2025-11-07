import React from "react";
import { Button } from "./ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar } from "lucide-react";
import heroImage from "../../assets/hero-therapy-session.jpg";

interface HeroSectionProps {
  darkMode?: boolean
  onBookDemoClick?: () => void
}

const HeroSection: React.FC<HeroSectionProps> = ({ darkMode = false, onBookDemoClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Enhanced parallax effects for smooth transitions
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7, 1], [1, 0.8, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.8, 1], [1, 0.95, 0.9]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [0, 5]);

  return (
    <motion.section 
      ref={containerRef}
      className={`relative min-h-screen flex items-center justify-center overflow-hidden transition-colors duration-300 ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900' 
          : 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900'
      }`}
      style={{ y, opacity, scale, rotateX }}
    >
      {/* Enhanced 3D Floating Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Large 3D Bubbles */}
        <motion.div 
          className="absolute top-20 left-10 w-40 h-40 bg-gradient-to-br from-cyan-400/30 to-blue-500/30 rounded-full shadow-2xl"
          style={{ 
            background: 'radial-gradient(circle at 30% 30%, rgba(34, 211, 238, 0.4), rgba(59, 130, 246, 0.2))',
            boxShadow: '0 0 60px rgba(34, 211, 238, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.1)'
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            scale: [1, 1.2, 1],
            rotateX: [0, 10, 0],
            rotateY: [0, 20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-br from-pink-400/25 to-purple-500/25 rounded-full shadow-2xl"
          style={{ 
            background: 'radial-gradient(circle at 30% 30%, rgba(236, 72, 153, 0.4), rgba(147, 51, 234, 0.2))',
            boxShadow: '0 0 50px rgba(236, 72, 153, 0.3), inset 0 0 15px rgba(255, 255, 255, 0.1)'
          }}
          animate={{
            y: [0, 25, 0],
            x: [0, -20, 0],
            scale: [1, 0.9, 1],
            rotateX: [0, -15, 0],
            rotateY: [0, -25, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div 
          className="absolute bottom-32 left-1/4 w-24 h-24 bg-gradient-to-br from-emerald-400/30 to-teal-500/30 rounded-full shadow-2xl"
          style={{ 
            background: 'radial-gradient(circle at 30% 30%, rgba(16, 185, 129, 0.4), rgba(20, 184, 166, 0.2))',
            boxShadow: '0 0 40px rgba(16, 185, 129, 0.3), inset 0 0 12px rgba(255, 255, 255, 0.1)'
          }}
          animate={{
            y: [0, -35, 0],
            x: [0, 25, 0],
            scale: [1, 1.3, 1],
            rotateX: [0, 20, 0],
            rotateY: [0, 30, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        
        {/* Medium 3D Bubbles */}
        <motion.div 
          className="absolute top-1/3 right-1/3 w-16 h-16 bg-gradient-to-br from-yellow-400/35 to-orange-500/35 rounded-full shadow-xl"
          style={{ 
            background: 'radial-gradient(circle at 30% 30%, rgba(251, 191, 36, 0.5), rgba(249, 115, 22, 0.3))',
            boxShadow: '0 0 30px rgba(251, 191, 36, 0.4), inset 0 0 10px rgba(255, 255, 255, 0.2)'
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, -15, 0],
            rotate: [0, 180, 360],
            scale: [1, 1.1, 1],
            rotateX: [0, 15, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-20 h-20 bg-gradient-to-br from-violet-400/30 to-purple-500/30 rounded-full shadow-xl"
          style={{ 
            background: 'radial-gradient(circle at 30% 30%, rgba(139, 92, 246, 0.4), rgba(124, 58, 237, 0.2))',
            boxShadow: '0 0 35px rgba(139, 92, 246, 0.3), inset 0 0 12px rgba(255, 255, 255, 0.1)'
          }}
          animate={{
            y: [0, 30, 0],
            x: [0, 20, 0],
            scale: [1, 0.8, 1],
            rotateX: [0, -20, 0],
            rotateY: [0, 25, 0],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
        />
        
        {/* Small floating particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${4 + Math.random() * 8}px`,
              height: `${4 + Math.random() * 8}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, rgba(255, 255, 255, ${0.3 + Math.random() * 0.4}), transparent)`,
              boxShadow: `0 0 ${10 + Math.random() * 20}px rgba(255, 255, 255, 0.3)`
            }}
            animate={{
              y: [0, -60 - Math.random() * 40, 0],
              x: [0, (Math.random() - 0.5) * 60, 0],
              opacity: [0, 1, 0],
              scale: [0, 1 + Math.random() * 0.5, 0],
              rotate: [0, 360, 720]
            }}
            transition={{
              duration: 8 + Math.random() * 6,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left Content */}
        <motion.div 
          className="text-center lg:text-left space-y-8"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white drop-shadow-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Connecting Children with{" "}
              <motion.span 
                className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent drop-shadow-lg"
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
                Trusted Therapists
              </motion.span>,{" "}
              <motion.span 
                className="text-cyan-300 drop-shadow-lg"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                Anytime, Anywhere
              </motion.span>
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-200 max-w-2xl mx-auto lg:mx-0 drop-shadow-lg leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Therabee helps families find verified therapists, book secure sessions, 
              and track progress — all in one place.
            </motion.p>
          </motion.div>

          {/* Enhanced CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Link to="/login">
                <Button 
                  size="lg" 
                  className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold relative overflow-hidden group shadow-2xl border-0"
                  style={{
                    boxShadow: '0 10px 30px rgba(34, 211, 238, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <motion.span
                    className="relative z-10 flex items-center"
                    initial={{ opacity: 1 }}
                    whileHover={{ opacity: 0.9 }}
                  >
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </motion.span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                  />
                </Button>
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Button 
                size="lg" 
                onClick={onBookDemoClick}
                className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold relative overflow-hidden group shadow-2xl border-0"
                style={{
                  boxShadow: '0 10px 30px rgba(34, 211, 238, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                }}
              >
                <motion.span
                  className="relative z-10 flex items-center"
                  initial={{ opacity: 1 }}
                  whileHover={{ opacity: 0.9 }}
                >
                  <Calendar className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Book Demo Session
                </motion.span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                />
              </Button>
            </motion.div>
          </motion.div>

          {/* Partner Logos */}
          <motion.div 
            className="pt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            <p className="text-sm text-gray-300 mb-4 drop-shadow-lg">Trusted by leading healthcare providers</p>
            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-6">
              <div className="text-sm font-semibold text-gray-200 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">Mayo Clinic</div>
              <div className="text-sm font-semibold text-gray-200 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">Johns Hopkins</div>
              <div className="text-sm font-semibold text-gray-200 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">Cleveland Clinic</div>
              <div className="text-sm font-semibold text-cyan-300 bg-cyan-500/20 px-3 py-1 rounded-full backdrop-blur-sm">+500 more</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Image with 3D Effects */}
        <motion.div 
          className="relative"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <motion.div 
            className="relative"
            whileHover={{ scale: 1.05, rotateY: 5, rotateX: 2 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
            style={{ perspective: "1000px" }}
          >
            <motion.div
              className="relative rounded-2xl overflow-hidden shadow-2xl"
              style={{
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)'
              }}
            >
              <img
                src={heroImage}
                alt="Child having a therapy session with a professional therapist via video call"
                className="w-full h-auto rounded-2xl"
              />
              {/* 3D Glow Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-tr from-cyan-400/20 via-transparent to-purple-500/20 rounded-2xl"
                animate={{
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
            
            {/* Floating 3D Elements */}
            <motion.div 
              className="absolute -bottom-6 -right-6 w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full shadow-2xl"
              style={{
                boxShadow: '0 0 40px rgba(34, 211, 238, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.2)'
              }}
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 360],
                y: [0, -10, 0]
              }}
              transition={{
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
              }}
            />
            <motion.div 
              className="absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full shadow-2xl"
              style={{
                boxShadow: '0 0 35px rgba(236, 72, 153, 0.5), inset 0 0 15px rgba(255, 255, 255, 0.2)'
              }}
              animate={{
                y: [0, -15, 0],
                scale: [1, 1.3, 1],
                rotate: [0, -180, -360]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            />
            <motion.div 
              className="absolute top-1/2 -right-8 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-xl"
              style={{
                boxShadow: '0 0 25px rgba(251, 191, 36, 0.4), inset 0 0 10px rgba(255, 255, 255, 0.2)'
              }}
              animate={{
                x: [0, 10, 0],
                y: [0, -20, 0],
                scale: [1, 1.1, 1],
                rotate: [0, 90, 180, 270, 360]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
            />
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default HeroSection;