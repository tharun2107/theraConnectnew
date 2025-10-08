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
        return 'bg-green-100 text-green-800 border-green-200'
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
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
        "group relative overflow-hidden rounded-2xl border bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl",
        isToday && "ring-2 ring-blue-500 ring-opacity-50",
        className
      )}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600">
              <AvatarFallback className="text-white font-bold">
                {childName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">{childName}</h3>
              <p className="text-sm text-gray-600">with {therapistName}</p>
              {specialization && (
                <p className="text-xs text-blue-600 font-medium">{specialization}</p>
              )}
            </div>
          </div>
          
          <Badge className={cn("border", getStatusColor(status))}>
            {status}
          </Badge>
        </div>

        {/* Session Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{startDate.toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>
              {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {' '}
              {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
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
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full px-6"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Session
              </Button>
            ) : onJoin ? (
              <Button
                onClick={onJoin}
                size="sm"
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-full px-6"
              >
                <Video className="h-4 w-4 mr-2" />
                Join Session
              </Button>
            ) : null}
          </div>
        )}
      </div>

      {/* Hover effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </motion.div>
  )
}
