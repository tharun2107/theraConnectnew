import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { X, Plus, Trash2, Save, Calendar, User } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { therapyNotesAPI } from '../lib/api'
import toast from 'react-hot-toast'

interface TherapyNotesModalProps {
  bookingId: string
  childId: string
  childName: string
  therapistName: string
  sessionDate: Date
  onClose: () => void
  onSuccess?: () => void
}

const TherapyNotesModal: React.FC<TherapyNotesModalProps> = ({
  bookingId,
  childId,
  childName,
  therapistName,
  sessionDate,
  onClose,
  onSuccess
}) => {
  const queryClient = useQueryClient()
  const month = sessionDate.getMonth() + 1
  const year = sessionDate.getFullYear()

  // State
  const [monthlyGoals, setMonthlyGoals] = useState<string[]>([])
  const [newGoal, setNewGoal] = useState('')
  const [sessionDetails, setSessionDetails] = useState<string[]>([])
  const [newDetail, setNewDetail] = useState('')
  const [tasks, setTasks] = useState<{ taskGiven: string }[]>([])
  const [newTask, setNewTask] = useState('')
  const [isFirstSession, setIsFirstSession] = useState(false)

  // Check if this is the first session of the month
  const { data: firstSessionData } = useQuery(
    ['isFirstSession', bookingId],
    () => therapyNotesAPI.checkIsFirstSession(bookingId),
    {
      select: (response) => response.data,
      onSuccess: (data) => {
        setIsFirstSession(data.data?.isFirstSession || false)
      }
    }
  )

  // Fetch monthly goals
  const { data: goalsData, isLoading: goalsLoading } = useQuery(
    ['monthlyGoals', childId, month, year],
    () => therapyNotesAPI.getMonthlyGoals(childId, month, year),
    {
      select: (response) => response.data,
      onSuccess: (data) => {
        if (data.data?.goals) {
          setMonthlyGoals(data.data.goals)
        }
      }
    }
  )

  // Fetch existing session report if any
  const { data: existingReport } = useQuery(
    ['sessionReport', bookingId],
    () => therapyNotesAPI.getSessionReport(bookingId),
    {
      select: (response) => response.data,
      enabled: !!bookingId,
      onSuccess: (data) => {
        if (data.data?.sessionDetails) {
          setSessionDetails(data.data.sessionDetails)
        }
        if (data.data?.tasks) {
          setTasks(data.data.tasks.map((t: any) => ({ taskGiven: t.taskGiven })))
        }
      }
    }
  )

  // Update monthly goals mutation
  const updateGoalsMutation = useMutation(
    therapyNotesAPI.updateMonthlyGoals,
    {
      onSuccess: () => {
        toast.success('Monthly goals updated successfully')
        queryClient.invalidateQueries(['monthlyGoals', childId, month, year])
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to update monthly goals')
      }
    }
  )

  // Create/Update session report mutation
  const createReportMutation = useMutation(
    therapyNotesAPI.createSessionReport,
    {
      onSuccess: () => {
        toast.success('Therapy notes saved successfully!')
        queryClient.invalidateQueries(['sessionReport', bookingId])
        queryClient.invalidateQueries(['therapistBookings'])
        if (onSuccess) onSuccess()
        onClose()
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to save therapy notes')
      }
    }
  )

  // Add goal
  const handleAddGoal = () => {
    if (newGoal.trim()) {
      setMonthlyGoals([...monthlyGoals, newGoal.trim()])
      setNewGoal('')
    }
  }

  // Remove goal
  const handleRemoveGoal = (index: number) => {
    setMonthlyGoals(monthlyGoals.filter((_, i) => i !== index))
  }

  // Save monthly goals
  const handleSaveGoals = () => {
    updateGoalsMutation.mutate({
      childId,
      month,
      year,
      goals: monthlyGoals
    })
  }

  // Add session detail
  const handleAddDetail = () => {
    if (newDetail.trim()) {
      setSessionDetails([...sessionDetails, newDetail.trim()])
      setNewDetail('')
    }
  }

  // Remove session detail
  const handleRemoveDetail = (index: number) => {
    setSessionDetails(sessionDetails.filter((_, i) => i !== index))
  }

  // Add task
  const handleAddTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, { taskGiven: newTask.trim() }])
      setNewTask('')
    }
  }

  // Remove task
  const handleRemoveTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index))
  }

  // Submit all
  const handleSubmit = () => {
    if (sessionDetails.length === 0) {
      toast.error('Please add at least one session detail')
      return
    }

    if (tasks.length === 0) {
      toast.error('Please add at least one task for the parent')
      return
    }

    // Save session report
    createReportMutation.mutate({
      bookingId,
      childId,
      sessionDetails,
      tasks
    })

    // Save goals if this is the first session and goals were edited
    if (isFirstSession && monthlyGoals.length > 0) {
      updateGoalsMutation.mutate({
        childId,
        month,
        year,
        goals: monthlyGoals
      })
    }
  }

  const formattedDate = sessionDate.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              THERAPY NOTES
            </h2>
            <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>
                  <strong>Therapist:</strong> {therapistName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  <strong>Date:</strong> {formattedDate}
                </span>
              </div>
              <div>
                <strong>Child:</strong> {childName}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Goals - Only editable on first session */}
          <Card className="border-2 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Current Goals</span>
                {isFirstSession && (
                  <span className="text-sm font-normal text-orange-600 dark:text-orange-400">
                    ⚠️ Editable (First session of the month)
                  </span>
                )}
                {!isFirstSession && (
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    📌 Fixed for this month
                  </span>
                )}
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Goals for this month ({new Date(year, month - 1).toLocaleString('default', { month: 'long' })} {year})
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {monthlyGoals.map((goal, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </span>
                  <p className="flex-1 text-gray-800 dark:text-gray-200">{goal}</p>
                  {isFirstSession && (
                    <button
                      onClick={() => handleRemoveGoal(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}

              {isFirstSession && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddGoal()}
                    placeholder="Add a new goal..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                  <Button onClick={handleAddGoal} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
              )}

              {isFirstSession && monthlyGoals.length > 0 && (
                <Button
                  onClick={handleSaveGoals}
                  variant="outline"
                  className="w-full"
                  disabled={updateGoalsMutation.isLoading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateGoalsMutation.isLoading ? 'Saving...' : 'Save Goals'}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Session Details */}
          <Card>
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                What happened in today's session?
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {sessionDetails.map((detail, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="flex-shrink-0 text-gray-500 dark:text-gray-400">•</span>
                  <p className="flex-1 text-gray-800 dark:text-gray-200">{detail}</p>
                  <button
                    onClick={() => handleRemoveDetail(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newDetail}
                  onChange={(e) => setNewDetail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddDetail()}
                  placeholder="Add session detail..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
                <Button onClick={handleAddDetail} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* To be followed at home - Tasks Table */}
          <Card>
            <CardHeader>
              <CardTitle>To be followed at home</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tasks for the parent to complete with the child
              </p>
            </CardHeader>
            <CardContent>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Tasks Given
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 w-32">
                        Tasks Done
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Observation
                      </th>
                      <th className="w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task, index) => (
                      <tr key={index} className="border-t border-gray-200 dark:border-gray-700">
                        <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                          {task.taskGiven}
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm">
                          (Parent will mark)
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm">
                          (Parent will add notes)
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleRemoveTask(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-2 mt-4">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                  placeholder="Add a task for the parent..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
                <Button onClick={handleAddTask} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Task
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={createReportMutation.isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createReportMutation.isLoading || sessionDetails.length === 0 || tasks.length === 0}
              className="flex items-center gap-2 px-6"
            >
              <Save className="h-4 w-4" />
              {createReportMutation.isLoading ? 'Saving...' : 'Save Therapy Notes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TherapyNotesModal

