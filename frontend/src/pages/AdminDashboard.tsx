import React from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { adminAPI } from '../lib/api'
import { Users, UserCheck, UserX, Clock, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

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

  const pendingTherapists = therapists.filter(
    (therapist: Therapist) => therapist.status === 'PENDING_VERIFICATION'
  )
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
      name: 'Pending Approval',
      value: pendingTherapists.length,
      icon: Clock,
      color: 'bg-yellow-500',
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage therapists and platform settings</p>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-primary-600" />
          <span className="text-sm font-medium text-gray-700">Admin Panel</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Approvals */}
      {pendingTherapists.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title text-yellow-800">Pending Therapist Approvals</h3>
            <p className="text-sm text-gray-600">
              {pendingTherapists.length} therapist(s) waiting for approval
            </p>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {pendingTherapists.map((therapist: Therapist) => (
                <div key={therapist.id} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{therapist.name}</h4>
                      <p className="text-sm text-gray-600">{therapist.user.email}</p>
                      <p className="text-sm text-gray-500">
                        {therapist.specialization} • {therapist.experience} years experience
                      </p>
                      <p className="text-sm text-gray-500">
                        Base cost: ${therapist.baseCostPerSession}/session
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleStatusUpdate(therapist.id, 'ACTIVE')}
                        className="btn btn-primary btn-sm"
                        disabled={updateStatusMutation.isLoading}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(therapist.id, 'SUSPENDED')}
                        className="btn btn-outline btn-sm"
                        disabled={updateStatusMutation.isLoading}
                      >
                        Suspend
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* All Therapists */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">All Therapists</h3>
        </div>
        <div className="card-content">
          {therapistsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading therapists...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Therapist
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Specialization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Experience
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cost/Session
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {therapists.map((therapist: Therapist) => (
                    <tr key={therapist.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {therapist.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {therapist.user.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {therapist.specialization}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {therapist.experience} years
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${therapist.baseCostPerSession}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          therapist.status === 'ACTIVE' 
                            ? 'bg-green-100 text-green-800'
                            : therapist.status === 'PENDING_VERIFICATION'
                            ? 'bg-yellow-100 text-yellow-800'
                            : therapist.status === 'SUSPENDED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {therapist.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {therapist.status === 'PENDING_VERIFICATION' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(therapist.id, 'ACTIVE')}
                                className="text-green-600 hover:text-green-900"
                                disabled={updateStatusMutation.isLoading}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(therapist.id, 'SUSPENDED')}
                                className="text-red-600 hover:text-red-900"
                                disabled={updateStatusMutation.isLoading}
                              >
                                Suspend
                              </button>
                            </>
                          )}
                          {therapist.status === 'ACTIVE' && (
                            <button
                              onClick={() => handleStatusUpdate(therapist.id, 'SUSPENDED')}
                              className="text-red-600 hover:text-red-900"
                              disabled={updateStatusMutation.isLoading}
                            >
                              Suspend
                            </button>
                          )}
                          {therapist.status === 'SUSPENDED' && (
                            <button
                              onClick={() => handleStatusUpdate(therapist.id, 'ACTIVE')}
                              className="text-green-600 hover:text-green-900"
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
