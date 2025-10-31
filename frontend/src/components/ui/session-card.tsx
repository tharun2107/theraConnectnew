import React from 'react'
import { motion } from 'framer-motion'
import { Clock, User, Video, Play, Calendar } from 'lucide-react'
import { Button } from './button'
import { Badge } from './badge'
import { Avatar, AvatarFallback } from './avatar'
import { cn } from '../../lib/utils'

interface SessionCardProps {
  id: string
  childName: string
  parentName: string
  therapistName: string
  startTime: string
  endTime: string
  status: string
  specialization?: string
  onJoin?: () => void
  onStart?: () => void
  delay?: number
  className?: string
}

export const SessionCard: React.FC<SessionCardProps> = ({
  id,
  childName,
  parentName,
  therapistName,
  startTime,
  endTime,
  status,
  specialization,
  onJoin,
  onStart,
  delay = 0,
  className = ''
}) => {
  const startDate = new Date(startTime)
  const endDate = new Date(endTime)
  const isUpcoming = startDate > new Date()
  const isToday = startDate.toDateString() === new Date().toDateString()

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-accent-green/20 text-[#1A1A1A] border-accent-green/30'
      case 'completed':
        return 'bg-[#F9F9F9] text-[#1A1A1A] border-gray-border'
      case 'cancelled':
        return 'bg-[#F9F9F9] text-[#1A1A1A] border-gray-border'
      default:
        return 'bg-[#F9F9F9] text-[#1A1A1A] border-gray-border'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 }
      }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-gray-border bg-white p-4 sm:p-6 shadow-gentle transition-all duration-300 hover:shadow-calm",
        isToday && "ring-2 ring-gray-border ring-opacity-50",
        className
      )}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#F9F9F9] via-white to-[#F9F9F9] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 bg-black">
              <AvatarFallback className="text-white font-bold">
                {childName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-[#1A1A1A] text-lg">{childName}</h3>
              <p className="text-sm text-[#4D4D4D]">with {therapistName}</p>
              {specialization && (
                <p className="text-xs text-[#1A1A1A] font-medium">{specialization}</p>
              )}
            </div>
          </div>
          
          <Badge className={cn("border", getStatusColor(status))}>
            {status}
          </Badge>
        </div>

        {/* Session Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center space-x-2 text-sm text-[#4D4D4D]">
            <Calendar className="h-4 w-4" />
            <span>{startDate.toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-[#4D4D4D]">
            <Clock className="h-4 w-4" />
            <span>
              {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {' '}
              {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-[#4D4D4D]">
            <User className="h-4 w-4" />
            <span>Parent: {parentName}</span>
          </div>
        </div>

        {/* Action Button */}
        {isUpcoming && status === 'SCHEDULED' && (
          <div className="flex justify-end">
            {onStart ? (
              <Button
                onClick={onStart}
                size="sm"
                className="bg-black hover:bg-[#1A1A1A] text-white rounded-full px-6"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Session
              </Button>
            ) : onJoin ? (
              <Button
                onClick={onJoin}
                size="sm"
                className="bg-black hover:bg-[#1A1A1A] text-white rounded-full px-6"
              >
                <Video className="h-4 w-4 mr-2" />
                Join Session
              </Button>
            ) : null}
          </div>
        )}
      </div>

      {/* Hover effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#F9F9F9]/50 to-[#F9F9F9]/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </motion.div>
  )
}
