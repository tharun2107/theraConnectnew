import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { therapistAPI } from '../lib/api'
import { X, Clock, CheckSquare, Square } from 'lucide-react'
import toast from 'react-hot-toast'

interface CreateTimeSlotsModalProps {
  onClose: () => void
  onSuccess: () => void
  isMandatory?: boolean // If true, modal cannot be closed until slots are created
}

// Generate time options for all 24 hours (00:00 to 23:00) in 1-hour intervals
const generateTimeOptions = () => {
  const times: string[] = []
  for (let hour = 0; hour < 24; hour++) {
    const timeStr = `${hour.toString().padStart(2, '0')}:00`
    times.push(timeStr)
  }
  return times
}

const CreateTimeSlotsModal: React.FC<CreateTimeSlotsModalProps> = ({ onClose, onSuccess, isMandatory = false }) => {
  const queryClient = useQueryClient()
  const timeOptions = generateTimeOptions()
  const [selectedTimes, setSelectedTimes] = useState<string[]>([])

  // Load existing slot times if any
  const { data: profile } = useQuery(
    'therapistProfile',
    therapistAPI.getProfile,
    { 
      select: (response) => response.data,
      onSuccess: (data) => {
        if (data?.availableSlotTimes && Array.isArray(data.availableSlotTimes) && data.availableSlotTimes.length > 0) {
          setSelectedTimes(data.availableSlotTimes)
        }
      }
    }
  )

  const setSlotsMutation = useMutation(therapistAPI.setAvailableSlotTimes, {
    onSuccess: () => {
      // Invalidate therapist profile and related queries to update all dashboards
      queryClient.invalidateQueries('therapistProfile')
      queryClient.invalidateQueries('therapistHasActiveSlots')
      queryClient.invalidateQueries('allTherapists') // For AdminDashboard/AdminAnalytics
      toast.success('Available time slots saved successfully! These slots are now locked and will apply to all future dates.')
      onSuccess()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save time slots')
    },
  })

  const toggleTime = (time: string) => {
    setSelectedTimes((prev) => {
      const exists = prev.includes(time)
      if (exists) {
        return prev.filter((t) => t !== time)
      }
      if (prev.length >= 8) {
        toast.error('You can select at most 8 time slots')
        return prev
      }
      return [...prev, time].sort()
    })
  }

  const handleSave = () => {
    if (selectedTimes.length === 0) {
      toast.error('Please select at least one time slot')
      return
    }
    if (selectedTimes.length !== 8) {
      toast.error('Please select exactly 8 time slots')
      return
    }
    setSlotsMutation.mutate(selectedTimes)
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isMandatory) {
          onClose()
        }
      }}
    >
      <div className="bg-white dark:bg-black dark:border dark:border-gray-700 rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg flex-shrink-0">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Set Your Available Time Slots</h2>
              {isMandatory && (
                <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                  ⚠️ Please set your available time slots to continue. These will apply to all days.
                </p>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Select exactly 8 time slots (1 hour each) that you'll be available for every day.
              </p>
              {profile?.availableSlotTimes && profile.availableSlotTimes.length > 0 && (
                <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                  ⚠️ You already have {profile.availableSlotTimes.length} time slot(s) configured. Changes are permanent.
                </p>
              )}
            </div>
          </div>
          {!isMandatory && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0 ml-2"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          )}
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Time Slots Grid */}
          <div className="bg-gray-50 dark:bg-black dark:border dark:border-gray-700 rounded-lg p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Time Slots (8 slots required)
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Selected: {selectedTimes.length} / 8
              </span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 max-h-96 overflow-y-auto">
                {timeOptions.map((time) => {
                  const selected = selectedTimes.includes(time)
                  const [hours, minutes] = time.split(':').map(Number)
                  const time12h = new Date(2000, 0, 1, hours, minutes).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                  })
                  
                  // Calculate end time (1 hour later)
                  const endHour = (hours + 1) % 24
                  const endTime = `${endHour.toString().padStart(2, '0')}:00`
                  const endTime12h = new Date(2000, 0, 1, endHour, 0).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                  })
                  
                  return (
                    <button
                      type="button"
                      key={time}
                      onClick={() => toggleTime(time)}
                      disabled={!selected && selectedTimes.length >= 8}
                      className={`flex flex-col items-center justify-center gap-1 p-3 border-2 rounded-lg hover:bg-white dark:hover:bg-gray-800 text-center transition-all min-h-[80px] ${
                        selected 
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400' 
                          : selectedTimes.length >= 8
                          ? 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-black text-gray-400 cursor-not-allowed'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-white hover:border-primary-300 dark:hover:border-primary-600'
                      }`}
                    >
                      {selected ? (
                        <CheckSquare className="h-5 w-5 text-primary-600 dark:text-primary-400 mb-1" />
                      ) : (
                        <Square className="h-5 w-5 text-gray-400 mb-1" />
                      )}
                      <div className="text-xs font-medium">{time12h}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">to {endTime12h}</div>
                      <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{time} - {endTime}</div>
                    </button>
                  )
                })}
              </div>
          </div>

          {/* Selection Summary */}
          {selectedTimes.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Selected Times</h3>
              <div className="flex flex-wrap gap-2">
                {selectedTimes.sort().map((time) => {
                  const [hours, minutes] = time.split(':').map(Number)
                  const endHour = (hours + 1) % 24
                  const time12h = new Date(2000, 0, 1, hours, minutes).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                  })
                  const endTime12h = new Date(2000, 0, 1, endHour, 0).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                  })
                  return (
                    <span
                      key={time}
                      className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium"
                    >
                      {time12h} - {endTime12h}
                    </span>
                  )
                })}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                Each session is 1 hour long. These time slots will be available for booking on all future dates.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            {!isMandatory && (
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline flex-1"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={setSlotsMutation.isLoading || selectedTimes.length !== 8}
              className={`btn btn-primary flex-1 ${
                selectedTimes.length !== 8 
                  ? 'opacity-50 cursor-not-allowed' 
                  : ''
              }`}
            >
              {setSlotsMutation.isLoading 
                ? 'Saving...' 
                : selectedTimes.length === 8
                ? 'Save Time Slots'
                : `Save Time Slots (${selectedTimes.length}/8)`
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateTimeSlotsModal
