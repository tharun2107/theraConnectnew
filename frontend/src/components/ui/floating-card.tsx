import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface FloatingCardProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export const FloatingCard: React.FC<FloatingCardProps> = ({
  children,
  className = '',
  delay = 0
}) => {
  return (
    <motion.div
      className={cn(
        "rounded-xl border border-gray-200 bg-white p-6 shadow-lg",
        className
      )}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay,
        ease: "easeOut"
      }}
      whileHover={{
        y: -5,
        transition: { duration: 0.2 }
      }}
    >
      {children}
    </motion.div>
  )
}
