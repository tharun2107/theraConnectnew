import React from "react";
import { Separator } from "./ui/separator";
import { Heart, Linkedin, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";
import { motion } from "framer-motion";

interface FooterProps {
  darkMode?: boolean
}

const Footer: React.FC<FooterProps> = ({ darkMode = false }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`relative overflow-hidden transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white' 
        : 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white'
    }`}>
      {/* Enhanced gradient line at top with glow */}
      <div className="h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 relative">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500"
          animate={{
            opacity: [0.5, 1, 0.5],
            scaleX: [0.8, 1, 0.8]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            filter: 'blur(8px)',
            boxShadow: '0 0 20px rgba(34, 211, 238, 0.5)'
          }}
        />
      </div>

      {/* Enhanced background lighting effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Animated light rays */}
        <motion.div
          className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-cyan-400/30 via-transparent to-transparent"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            x: [-20, 20, -20]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-purple-400/30 via-transparent to-transparent"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            x: [20, -20, 20]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div
          className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-blue-400/30 via-transparent to-transparent"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            x: [-15, 15, -15]
          }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        
        {/* Floating glow orbs */}
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 bg-cyan-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, 30, 0],
            y: [0, 20, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, -25, 0],
            y: [0, -15, 0]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Therabee</h3>
              <p className="text-gray-300 leading-relaxed">
                Connecting children with trusted therapists through secure, 
                accessible, and innovative technology solutions.
              </p>
            </div>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-cyan-400" />
                <span className="text-gray-300 text-sm">hello@therabee.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-cyan-400" />
                <span className="text-gray-300 text-sm">1-800-THERAPY</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span className="text-gray-300 text-sm">San Francisco, CA</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4 sm:space-y-6">
            <h4 className="text-base sm:text-lg font-semibold text-cyan-300">Quick Links</h4>
            <ul className="space-y-2 sm:space-y-3">
              {['About Us', 'How It Works', 'Find Therapists', 'Pricing', 'Blog'].map((link) => (
                <li key={link}>
                  <motion.a 
                    href="#" 
                    className="text-gray-300 hover:text-cyan-400 transition-colors text-sm block"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {link}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4 sm:space-y-6">
            <h4 className="text-base sm:text-lg font-semibold text-cyan-300">Support</h4>
            <ul className="space-y-2 sm:space-y-3">
              {['Help Center', 'Contact Support', 'Safety & Privacy', 'Community Guidelines', 'Emergency Resources', 'System Status'].map((link) => (
                <li key={link}>
                  <motion.a 
                    href="#" 
                    className="text-gray-300 hover:text-cyan-400 transition-colors text-sm block"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {link}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Social */}
          <div className="space-y-4 sm:space-y-6">
            <h4 className="text-base sm:text-lg font-semibold text-cyan-300">Legal</h4>
            <ul className="space-y-2 sm:space-y-3">
              {['Privacy Policy', 'Terms of Service', 'HIPAA Compliance', 'Cookie Policy', 'Accessibility'].map((link) => (
                <li key={link}>
                  <motion.a 
                    href="#" 
                    className="text-gray-300 hover:text-cyan-400 transition-colors text-sm block"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {link}
                  </motion.a>
                </li>
              ))}
            </ul>

            {/* Social Media */}
            <div className="space-y-4">
              <h5 className="text-sm font-semibold text-cyan-300">Follow Us</h5>
              <div className="flex space-x-4">
                {[
                  { icon: Linkedin, href: '#', label: 'LinkedIn' },
                  { icon: Twitter, href: '#', label: 'Twitter' },
                  { icon: Instagram, href: '#', label: 'Instagram' }
                ].map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center hover:shadow-xl transition-all group relative overflow-hidden"
                    aria-label={social.label}
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    style={{
                      boxShadow: '0 4px 15px rgba(34, 211, 238, 0.4)'
                    }}
                  >
                    <social.icon className="w-4 h-4 text-white relative z-10 group-hover:scale-110 transition-transform" />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500"
                      initial={{ scale: 0 }}
                      whileHover={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Separator className={`my-6 sm:my-8 ${darkMode ? 'bg-gray-800' : 'bg-gray-700'}`} />

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 text-gray-300 text-xs sm:text-sm">
            <span>© {currentYear} Therabee. All Rights Reserved.</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center space-x-1">
              <span>Made with</span>
              <motion.div
                animate={{
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 fill-current" />
              </motion.div>
              <span>for families</span>
            </span>
          </div>

          {/* Certifications */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <motion.div 
              className={`px-2 sm:px-3 py-1 rounded ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'} shadow-lg`}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <span className={`text-[10px] sm:text-xs font-semibold ${darkMode ? 'text-cyan-300' : 'text-gray-700'}`}>HIPAA Compliant</span>
            </motion.div>
            <motion.div 
              className={`px-2 sm:px-3 py-1 rounded ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'} shadow-lg`}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <span className={`text-[10px] sm:text-xs font-semibold ${darkMode ? 'text-cyan-300' : 'text-gray-700'}`}>SOC 2 Certified</span>
            </motion.div>
          </div>
        </div>

        {/* Emergency Notice */}
        <motion.div 
          className={`mt-6 sm:mt-8 p-3 sm:p-4 rounded-lg ${
            darkMode 
              ? 'bg-red-900/30 border border-red-800' 
              : 'bg-red-50 border border-red-200'
          }`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <p className={`text-sm text-center ${
            darkMode ? 'text-red-300' : 'text-red-700'
          }`}>
            <strong>Crisis Support:</strong> If you or your child are experiencing a mental health emergency, 
            please call <a href="tel:988" className="underline font-semibold">988</a> (Suicide & Crisis Lifeline) or go to your nearest emergency room immediately.
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;