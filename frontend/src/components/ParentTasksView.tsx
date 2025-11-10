import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { motion } from 'framer-motion'
import { Calendar, CheckCircle, XCircle, Edit2, Save, ClipboardList } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { therapyNotesAPI } from '../lib/api'
import toast from 'react-hot-toast'

const ParentTasksView: React.FC = () => {
  const queryClient = useQueryClient()
  const [editingObservation, setEditingObservation] = useState<string | null>(null)
  const [observationText, setObservationText] = useState('')

  // Fetch current month tasks
  const { data: tasksData, isLoading, error } = useQuery(
    'currentMonthTasks',
    therapyNotesAPI.getCurrentMonthTasks,
    {
      select: (response) => response.data,
      refetchInterval: 30000, // Refresh every 30 seconds
      retry: 1,
      onError: (error: any) => {
        console.error('[ParentTasksView] Error fetching tasks:', error)
      }
    }
  )

  // Update task completion mutation
  const updateCompletionMutation = useMutation(
    ({ taskId, isDone }: { taskId: string; isDone: boolean }) =>
      therapyNotesAPI.updateTaskCompletion(taskId, isDone),
    {
      onSuccess: () => {
        toast.success('Task status updated')
        queryClient.invalidateQueries('currentMonthTasks')
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to update task status')
      }
    }
  )

  // Update task observation mutation
  const updateObservationMutation = useMutation(
    ({ taskId, observation }: { taskId: string; observation: string }) =>
      therapyNotesAPI.updateTaskObservation(taskId, observation),
    {
      onSuccess: () => {
        toast.success('Observation saved')
        queryClient.invalidateQueries('currentMonthTasks')
        setEditingObservation(null)
        setObservationText('')
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to save observation')
      }
    }
  )

  const handleToggleCompletion = (taskId: string, currentStatus: boolean | null) => {
    const newStatus = currentStatus === null ? true : !currentStatus
    updateCompletionMutation.mutate({ taskId, isDone: newStatus })
  }

  const handleSaveObservation = (taskId: string) => {
    if (!observationText.trim()) {
      toast.error('Please enter an observation')
      return
    }
    updateObservationMutation.mutate({ taskId, observation: observationText.trim() })
  }

  const handleEditObservation = (taskId: string, currentObservation: string | null) => {
    setEditingObservation(taskId)
    setObservationText(currentObservation || '')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    console.error('[ParentTasksView] Render error:', error)
    return (
      <Card className="bg-white dark:bg-gray-900">
        <CardContent className="py-12 text-center">
          <ClipboardList className="h-16 w-16 mx-auto mb-4 text-red-400 dark:text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Tasks
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Unable to load session tasks. Please try refreshing the page.
          </p>
        </CardContent>
      </Card>
    )
  }

  const sessions = tasksData?.data || []

  if (sessions.length === 0) {
    return (
      <Card className="bg-white dark:bg-gray-900">
        <CardContent className="py-12 text-center">
          <ClipboardList className="h-16 w-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Tasks Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Tasks from completed sessions will appear here
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Current Month Session Tasks
        </h2>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {sessions.length} session{sessions.length !== 1 ? 's' : ''}
        </span>
      </div>

      {sessions.map((session: any, sessionIndex: number) => {
        const sessionDate = new Date(session.booking.timeSlot.startTime)
        const formattedDate = sessionDate.toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        })

        return (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sessionIndex * 0.1 }}
          >
            <Card className="bg-white dark:bg-black shadow-lg">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700 dark:bg-black">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      Session - {formattedDate}
                    </CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Therapist: {session.therapist.name} • Child: {session.child.name}
                    </p>
                  </div>
                  <span className="text-xs px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                    {session.tasks.filter((t: any) => t.isDone !== null).length} / {session.tasks.length} reviewed
                  </span>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                {/* Session Details */}
                {session.sessionDetails && session.sessionDetails.length > 0 && (
                  <div className="mb-6 p-4 bg-blue-50 dark:bg-black dark:border dark:border-gray-700 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Session Details:
                    </h4>
                    <ul className="space-y-2">
                      {session.sessionDetails.map((detail: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                          <span className="text-blue-600 dark:text-blue-400">•</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tasks Table */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-black dark:border-b dark:border-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Task Given
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 w-40">
                          Task Done?
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Your Observation
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {session.tasks.map((task: any, taskIndex: number) => (
                        <tr
                          key={task.id}
                          className={`border-t border-gray-200 dark:border-gray-700 ${
                            taskIndex % 2 === 0 ? 'bg-white dark:bg-black' : 'bg-gray-50 dark:bg-black'
                          }`}
                        >
                          <td className="px-4 py-4 text-gray-800 dark:text-gray-200">
                            {task.taskGiven}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleToggleCompletion(task.id, task.isDone)}
                                disabled={updateCompletionMutation.isLoading}
                                className={`p-2 rounded-lg transition-all ${
                                  task.isDone === true
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                                title="Yes"
                              >
                                <CheckCircle className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleToggleCompletion(task.id, task.isDone === false ? null : false)}
                                disabled={updateCompletionMutation.isLoading}
                                className={`p-2 rounded-lg transition-all ${
                                  task.isDone === false
                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                                title="No"
                              >
                                <XCircle className="h-5 w-5" />
                              </button>
                            </div>
                            {task.isDone !== null && (
                              <p className="text-xs text-center mt-1 text-gray-600 dark:text-gray-400">
                                {task.isDone ? 'Completed' : 'Not done'}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            {editingObservation === task.id ? (
                              <div className="flex gap-2">
                                <textarea
                                  value={observationText}
                                  onChange={(e) => setObservationText(e.target.value)}
                                  placeholder="Enter your observation..."
                                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm resize-none"
                                  rows={2}
                                />
                                <div className="flex flex-col gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleSaveObservation(task.id)}
                                    disabled={updateObservationMutation.isLoading}
                                    className="px-3"
                                  >
                                    <Save className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingObservation(null)
                                      setObservationText('')
                                    }}
                                    className="px-3"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  {task.observation || (
                                    <span className="text-gray-400 dark:text-gray-600 italic">
                                      No observation yet
                                    </span>
                                  )}
                                </p>
                                <button
                                  onClick={() => handleEditObservation(task.id, task.observation)}
                                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

export default ParentTasksView

