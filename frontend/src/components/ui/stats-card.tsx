import React from 'react'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { AnimatedCounter } from './animated-counter'
import { cn } from '../../lib/utils'

interface StatsCardProps {
  title: string
  value: number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: LucideIcon
  iconColor?: string
  delay?: number
  className?: string
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'blue',
  delay = 0,
  className = ''
}) => {
  const colorVariants = {
    blue: 'from-[#1A1A1A] to-[#1A1A1A]',
    green: 'from-accent-green to-accent-green',
    purple: 'from-[#1A1A1A] to-[#1A1A1A]',
    orange: 'from-[#4D4D4D] to-[#4D4D4D]',
    red: 'from-[#1A1A1A] to-[#1A1A1A]',
    indigo: 'from-[#1A1A1A] to-[#1A1A1A]'
  }

  const changeColorVariants = {
    positive: 'text-[#1A1A1A]',
    negative: 'text-[#1A1A1A]',
    neutral: 'text-[#4D4D4D]'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 }
      }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-gray-border dark:border-gray-700 bg-white dark:bg-black p-4 sm:p-6 shadow-gentle transition-all duration-300 hover:shadow-calm",
        className
      )}
    >
      {/* Background gradient - white on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white to-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:group-hover:opacity-100" />
      
      <div className="relative z-10">
        {/* Icon */}
        <div className="mb-4 flex items-center justify-between">
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r shadow-lg",
            colorVariants[iconColor as keyof typeof colorVariants]
          )}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          
          {change && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: delay + 0.2, duration: 0.3 }}
              className={cn(
                "text-sm font-medium",
                changeColorVariants[changeType]
              )}
            >
              {change}
            </motion.span>
          )}
        </div>

        {/* Value */}
        <div className="mb-2">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.3, duration: 0.5 }}
            className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] dark:text-white group-hover:text-[#1A1A1A] dark:group-hover:text-[#1A1A1A]"
          >
            <AnimatedCounter value={value} />
          </motion.div>
        </div>

        {/* Title */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.4, duration: 0.5 }}
          className="text-sm font-medium text-[#4D4D4D] dark:text-gray-300 group-hover:text-[#1A1A1A] dark:group-hover:text-[#1A1A1A]"
        >
          {title}
        </motion.p>
      </div>

      {/* Hover effect - white background on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-white to-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:group-hover:opacity-100" />
    </motion.div>
  )
}
