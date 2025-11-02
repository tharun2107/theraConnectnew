import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Calendar, Clock, Users, CheckCircle, XCircle, Loader2, Save, Edit2, Video } from 'lucide-react'
import { adminDemoAPI } from '../lib/api'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import toast from 'react-hot-toast'

const AdminDemoManagement: React.FC = () => {
  const queryClient = useQueryClient()
  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [selectedSlots, setSelectedSlots] = useState<string[]>([])
  const [editing, setEditing] = useState(false)

  // Helper function to convert 24-hour to 12-hour with AM/PM
  const formatTime12Hour = (time24: string): string => {
    const [hours, minutes] = time24.split(':').map(Number)
    const period = hours >= 12 ? 'PM' : 'AM'
    const hours12 = hours % 12 || 12
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`
  }

  // Generate 24 hour slots (00:00 to 23:00)
  const allHourSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0')
    return `${hour}:00`
  })

  // Fetch existing slots for the selected month/year
  const { data: existingSlots = [], isLoading } = useQuery(
    ['adminDemoSlots', selectedMonth, selectedYear],
    () => adminDemoAPI.getSlots(selectedMonth, selectedYear).then((res) => res.data),
    {
      onSuccess: (data) => {
        // Extract unique time strings from existing slots
        const uniqueTimes = [...new Set(data.map((slot: any) => slot.timeString))].sort()
        if (uniqueTimes.length > 0) {
          setSelectedSlots(uniqueTimes.slice(0, 8)) // Limit to 8 slots
        }
      },
    }
  )

  const createSlotsMutation = useMutation(
    () =>
      adminDemoAPI.createSlots({
        month: selectedMonth,
        year: selectedYear,
        slotTimes: selectedSlots,
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['adminDemoSlots', selectedMonth, selectedYear])
        toast.success('Demo slots created successfully!')
        setEditing(false)
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to create demo slots')
      },
    }
  )

  const updateSlotsMutation = useMutation(
    () =>
      adminDemoAPI.updateSlots(selectedMonth, selectedYear, selectedSlots),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['adminDemoSlots', selectedMonth, selectedYear])
        toast.success('Demo slots updated successfully!')
        setEditing(false)
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to update demo slots')
      },
    }
  )

  const handleSlotToggle = (time: string) => {
    if (!editing) {
      setEditing(true)
    }

    if (selectedSlots.includes(time)) {
      setSelectedSlots(selectedSlots.filter((t) => t !== time))
    } else {
      if (selectedSlots.length < 8) {
        setSelectedSlots([...selectedSlots, time].sort())
      } else {
        toast.error('You can only select 8 slots per day')
      }
    }
  }

  const handleSave = () => {
    if (selectedSlots.length !== 8) {
      toast.error('Please select exactly 8 slots')
      return
    }

    if (existingSlots.length === 0) {
      createSlotsMutation.mutate()
    } else {
      updateSlotsMutation.mutate()
    }
  }

  const hasExistingSlots = existingSlots.length > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Demo Slot Management</h1>
      </div>

      {/* Month/Year Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Month & Year</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(parseInt(e.target.value))
                  setSelectedSlots([])
                  setEditing(false)
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <option key={month} value={month}>
                    {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(parseInt(e.target.value))
                  setSelectedSlots([])
                  setEditing(false)
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                {Array.from({ length: 5 }, (_, i) => now.getFullYear() + i).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Slot Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Select 8 Fixed Slots Per Day</CardTitle>
            {hasExistingSlots && !editing && (
              <Button
                variant="outline"
                onClick={() => setEditing(true)}
                className="flex items-center"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Slots
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading slots...</span>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Select exactly 8 time slots that will be available every weekday (Monday-Friday)
                for the selected month. Saturday and Sunday are automatically excluded.
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
                {allHourSlots.map((time) => {
                  const time12Hour = formatTime12Hour(time)
                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => handleSlotToggle(time)}
                      disabled={!editing && hasExistingSlots}
                      className={`px-3 py-2 rounded-lg border transition-all ${
                        selectedSlots.includes(time)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : editing || !hasExistingSlots
                          ? 'bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                          : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      }`}
                      title={time} // Show 24-hour format on hover
                    >
                      <span className="block text-xs font-medium">{time12Hour}</span>
                      <span className="block text-[10px] text-gray-500 mt-0.5">{time}</span>
                    </button>
                  )
                })}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Selected: {selectedSlots.length} / 8 slots
                </p>
                {(editing || !hasExistingSlots) && (
                  <Button
                    onClick={handleSave}
                    disabled={selectedSlots.length !== 8 || createSlotsMutation.isLoading}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    {createSlotsMutation.isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {hasExistingSlots ? 'Update Slots' : 'Create Slots'}
                      </>
                    )}
                  </Button>
                )}
              </div>
              {selectedSlots.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-2">Selected Slots:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedSlots.map((time) => (
                      <Badge key={time} className="bg-blue-600 text-white">
                        {formatTime12Hour(time)} ({time})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminDemoManagement

