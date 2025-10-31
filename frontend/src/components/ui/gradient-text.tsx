import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface GradientTextProps {
  children: React.ReactNode
  className?: string
  gradient?: string
}

export const GradientText: React.FC<GradientTextProps> = ({
  children,
  className = '',
  gradient = 'from-[#1A1A1A] to-[#1A1A1A]'
}) => {
  return (
    <motion.span
      className={cn(
        'bg-gradient-to-r bg-clip-text text-transparent font-bold',
        gradient,
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {children}
    </motion.span>
  )
}
