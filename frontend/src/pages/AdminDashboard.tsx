import React from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { adminAPI } from '../lib/api'
import { Users, UserCheck, UserX, Shield, Stethoscope } from 'lucide-react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

interface Therapist {
  id: string
  name: string
  phone: string
  specialization: string
  experience: number
  baseCostPerSession: number
  averageRating: number
  status: 'PENDING_VERIFICATION' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  leavesRemainingThisMonth: number
  user: {
    email: string
    createdAt: string
  }
}

const AdminDashboard: React.FC = () => {
  const queryClient = useQueryClient()

  const { data: therapists = [], isLoading: therapistsLoading } = useQuery(
    'allTherapists',
    adminAPI.getAllTherapists,
    {
      select: (response) => response.data,
    }
  )

  const updateStatusMutation = useMutation(
    ({ therapistId, status }: { therapistId: string; status: string }) =>
      adminAPI.updateTherapistStatus(therapistId, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('allTherapists')
        toast.success('Therapist status updated successfully')
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to update status')
      },
    }
  )

  const handleStatusUpdate = (therapistId: string, status: string) => {
    updateStatusMutation.mutate({ therapistId, status })
  }

  const activeTherapists = therapists.filter(
    (therapist: Therapist) => therapist.status === 'ACTIVE'
  )

  const stats = [
    {
      name: 'Total Therapists',
      value: therapists.length,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: 'Active Therapists',
      value: activeTherapists.length,
      icon: UserCheck,
      color: 'bg-green-500',
    },
    {
      name: 'Suspended',
      value: therapists.filter((t: Therapist) => t.status === 'SUSPENDED').length,
      icon: UserX,
      color: 'bg-red-500',
    },
  ]

  return (
    <div className="space-y-6 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage therapists and platform settings</p>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-primary-600" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Admin Panel</span>
          <Link to="/admin/create-therapist" className="btn btn-primary btn-sm ml-4 flex items-center">
            <Stethoscope className="h-4 w-4 mr-1" />
            Create Therapist
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="card-content p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* All Therapists */}
      <div className="card bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="card-header p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="card-title text-xl font-semibold text-gray-900 dark:text-white">All Therapists</h3>
        </div>
        <div className="card-content p-6">
          {therapistsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-300">Loading therapists...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Therapist
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Specialization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Experience
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Cost/Session
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {therapists.map((therapist: Therapist) => (
                    <tr key={therapist.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {therapist.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {therapist.user.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {therapist.specialization}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {therapist.experience} years
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        ${therapist.baseCostPerSession}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          therapist.status === 'ACTIVE' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : therapist.status === 'PENDING_VERIFICATION'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : therapist.status === 'SUSPENDED'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                          {therapist.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {therapist.status === 'ACTIVE' && (
                            <button
                              onClick={() => handleStatusUpdate(therapist.id, 'SUSPENDED')}
                              className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
                              disabled={updateStatusMutation.isLoading}
                            >
                              Suspend
                            </button>
                          )}
                          {therapist.status === 'SUSPENDED' && (
                            <button
                              onClick={() => handleStatusUpdate(therapist.id, 'ACTIVE')}
                              className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 transition-colors"
                              disabled={updateStatusMutation.isLoading}
                            >
                              Reactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard