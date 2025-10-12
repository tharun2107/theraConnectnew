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
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
    indigo: 'from-indigo-500 to-indigo-600'
  }

  const changeColorVariants = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600'
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
        "group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-lg transition-all duration-300 hover:shadow-xl",
        className
      )}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
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
            className="text-3xl font-bold text-gray-900 dark:text-white"
          >
            <AnimatedCounter value={value} />
          </motion.div>
        </div>

        {/* Title */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.4, duration: 0.5 }}
          className="text-sm font-medium text-gray-600 dark:text-gray-400"
        >
          {title}
        </motion.p>
      </div>

      {/* Hover effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 dark:from-blue-500/10 dark:to-purple-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </motion.div>
  )
}
