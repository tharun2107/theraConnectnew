import React from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { Calendar, CheckCircle, XCircle, ClipboardList } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { therapyNotesAPI } from '../lib/api'

const TherapistTasksView: React.FC = () => {
  // Fetch current month tasks for therapist
  const { data: tasksData, isLoading, error } = useQuery(
    'therapistCurrentMonthTasks',
    therapyNotesAPI.getCurrentMonthTasksForTherapist,
    {
      select: (response) => response.data,
      refetchInterval: 30000, // Auto-refresh every 30 seconds
      retry: 1,
      onError: (error: any) => {
        console.error('[TherapistTasksView] Error fetching tasks:', error)
      }
    }
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    console.error('[TherapistTasksView] Render error:', error)
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
                      Child: {session.child.name} • Parent: {session.booking.parent.name}
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
                      {(Array.isArray(session.sessionDetails) ? session.sessionDetails : []).map((detail: string, idx: number) => (
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
                          Parent's Observation
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
                              {task.isDone === true ? (
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                  <span className="text-sm text-green-700 dark:text-green-400 font-medium">
                                    Completed
                                  </span>
                                </div>
                              ) : task.isDone === false ? (
                                <div className="flex items-center gap-2">
                                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                  <span className="text-sm text-red-700 dark:text-red-400 font-medium">
                                    Not Done
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400 dark:text-gray-600 italic">
                                  Pending
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {task.observation || (
                                <span className="text-gray-400 dark:text-gray-600 italic">
                                  No observation yet
                                </span>
                              )}
                            </p>
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

export default TherapistTasksView

