import React from "react";
import { Card, CardContent } from "./ui/card";
import { Star, Quote } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

interface TestimonialsSectionProps {
  darkMode?: boolean
}

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Parent",
    content: "Therabee transformed how we approach my daughter's therapy. The convenience of home sessions and the quality of therapists exceeded our expectations.",
    rating: 5,
    avatar: "SJ"
  },
  {
    name: "Dr. Michael Chen",
    role: "Licensed Therapist",
    content: "As a therapist, I love how Therabee streamlines my practice. The scheduling, payments, and progress tracking tools are incredibly intuitive.",
    rating: 5,
    avatar: "MC"
  },
  {
    name: "Emma Rodriguez",
    role: "Parent",
    content: "Finding the right therapist for my son was always challenging. Therabee made it simple, and the results have been amazing.",
    rating: 5,
    avatar: "ER"
  },
  {
    name: "Dr. Amanda Foster",
    role: "Child Psychologist",
    content: "The platform's security features and HIPAA compliance give me confidence that my patients' information is always protected.",
    rating: 5,
    avatar: "AF"
  },
  {
    name: "James Mitchell",
    role: "Parent",
    content: "The progress tracking feature helps me stay involved in my child's therapy journey. It's reassuring to see the improvements over time.",
    rating: 5,
    avatar: "JM"
  }
];

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ darkMode = false }) => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const renderStars = (rating: number) => {
    return Array.from({ length: rating }).map((_, i) => (
      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
    ));
  };

  return (
    <section 
      id="testimonials" 
      ref={sectionRef}
      className={`py-12 sm:py-16 lg:py-20 transition-colors duration-300 relative overflow-hidden ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-indigo-900/20 to-gray-900' 
          : 'bg-gradient-to-br from-indigo-50 via-white to-purple-50'
      }`}
    >
      {/* 3D Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full ${
              darkMode ? 'bg-indigo-500/10' : 'bg-indigo-400/20'
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
            What Our <motion.span 
              className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
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
              Community
            </motion.span> Says
          </h2>
          <p className={`text-base sm:text-lg md:text-xl max-w-2xl mx-auto px-4 ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Hear from families and therapists who have experienced the difference 
            that Therabee makes in their therapy journey.
          </p>
          <motion.div 
            className="w-24 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full mx-auto mt-6"
            initial={{ width: 0 }}
            animate={isInView ? { width: 96 } : { width: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
        </motion.div>

        {/* Testimonials Carousel */}
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl">
            <motion.div 
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <motion.div 
                  key={index} 
                  className="w-full flex-shrink-0 px-4 sm:px-6"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={currentIndex === index ? { opacity: 1, scale: 1 } : { opacity: 0.7, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className={`border-0 shadow-xl hover:shadow-2xl max-w-3xl mx-auto transition-all duration-300 ${
                    darkMode 
                      ? 'bg-gray-800/50 backdrop-blur-sm border-gray-700' 
                      : 'bg-white border-gray-200'
                  }`}>
                    <CardContent className="p-6 sm:p-8 text-center">
                      {/* Quote Icon */}
                      <motion.div 
                        className="mb-4 sm:mb-6"
                        animate={{
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <Quote className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto ${
                          darkMode ? 'text-indigo-400/30' : 'text-indigo-400/40'
                        }`} />
                      </motion.div>

                      {/* Testimonial Text */}
                      <blockquote className={`text-base sm:text-lg md:text-xl leading-relaxed mb-6 sm:mb-8 italic ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        "{testimonial.content}"
                      </blockquote>

                      {/* Rating */}
                      <div className="flex justify-center mb-4 sm:mb-6">
                        {renderStars(testimonial.rating)}
                      </div>

                      {/* Author */}
                      <div className="flex items-center justify-center space-x-4">
                        <motion.div 
                          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-semibold shadow-lg ${
                            darkMode 
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' 
                              : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                          }`}
                          whileHover={{ scale: 1.1, rotate: 360 }}
                          transition={{ duration: 0.5 }}
                          style={{
                            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
                          }}
                        >
                          {testimonial.avatar}
                        </motion.div>
                        <div className="text-left">
                          <div className={`font-semibold text-sm sm:text-base ${
                            darkMode ? 'text-white' : 'text-gray-800'
                          }`}>
                            {testimonial.name}
                          </div>
                          <div className={`text-xs sm:text-sm ${
                            darkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {testimonial.role}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Carousel Indicators */}
          <div className="flex justify-center mt-6 sm:mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <motion.button
                key={index}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? darkMode 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg' 
                      : 'bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg'
                    : darkMode 
                      ? 'bg-indigo-500/30 hover:bg-indigo-500/50' 
                      : 'bg-indigo-400/30 hover:bg-indigo-400/50'
                }`}
                onClick={() => setCurrentIndex(index)}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.9 }}
                animate={{
                  scale: index === currentIndex ? [1, 1.2, 1] : 1
                }}
                transition={{
                  duration: 2,
                  repeat: index === currentIndex ? Infinity : 0,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </div>

        {/* Stats */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mt-12 sm:mt-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          {[
            { value: "500+", label: "Verified Therapists" },
            { value: "10k+", label: "Successful Sessions" },
            { value: "98%", label: "Family Satisfaction" }
          ].map((stat, index) => (
            <motion.div 
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
              whileHover={{ scale: 1.1 }}
            >
              <motion.div 
                className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  backgroundSize: "200% 200%",
                  backgroundImage: "linear-gradient(to right, #6366f1, #a855f7, #6366f1)"
                }}
              >
                {stat.value}
              </motion.div>
              <div className={`text-sm sm:text-base ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;