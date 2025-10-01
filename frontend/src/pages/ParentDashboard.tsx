import React, { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { parentAPI, bookingAPI } from "../lib/api"
import {
  Plus,
  Calendar,
  Users,
  Clock,
  Heart,
  Edit,
  Eye,
  TrendingUp,
  Star,
} from "lucide-react"
import AddChildModal from "../components/AddChildModal"
import BookSessionModal from "../components/BookSessionModal"

interface Child {
  id: string
  name: string
  age: number
  address?: string
  condition?: string
  notes?: string
}

interface Booking {
  id: string
  status: string
  createdAt: string
  child: Child
  therapist: {
    name: string
    specialization: string
  }
  timeSlot: {
    startTime: string
    endTime: string
  }
}

const ParentDashboard: React.FC = () => {
  const [showAddChildModal, setShowAddChildModal] = useState(false)
  const [showBookSessionModal, setShowBookSessionModal] = useState(false)
  const queryClient = useQueryClient()

  const { data: children = [], isLoading: childrenLoading } = useQuery(
    "children",
    parentAPI.getChildren,
    {
      select: (response) => response.data,
    }
  )

  const { data: profile, isLoading: profileLoading } = useQuery(
    "parentProfile",
    parentAPI.getProfile,
    { select: (response) => response.data }
  )

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery(
    "parentBookings",
    bookingAPI.getMyBookings,
    {
      select: (response) => response.data,
    }
  )

  const deleteChildMutation = useMutation(
    (childId: string) => parentAPI.deleteChild(childId),
    {
      onSuccess: () => queryClient.invalidateQueries("children"),
    }
  )

  const upcomingBookings = bookings
    .filter((booking: Booking) => new Date(booking.timeSlot.startTime) > new Date())
    .slice(0, 3)

  const stats = [
    {
      name: "Total Children",
      value: children.length,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
      change: "+2 this month",
    },
    {
      name: "Upcoming Sessions",
      value: upcomingBookings.length,
      icon: Calendar,
      color: "bg-green-100 text-green-600",
      change: "3 this week",
    },
    {
      name: "Total Bookings",
      value: bookings.length,
      icon: Clock,
      color: "bg-purple-100 text-purple-600",
      change: "+5 this month",
    },
    {
      name: "Sessions Completed",
      value: bookings.filter((b: Booking) => b.status === "COMPLETED").length,
      icon: Star,
      color: "bg-orange-100 text-orange-600",
      change: "Great progress!",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {profileLoading ? "Loading..." : `Welcome${profile?.name ? ", " + profile.name : ""}`}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Manage your children and therapy sessions with ease
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setShowAddChildModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Child
          </button>
          <button
            onClick={() => setShowBookSessionModal(true)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Heart className="h-4 w-4" />
            Book Session
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My Children */}
        <div className="rounded-xl bg-white dark:bg-gray-800 shadow-sm">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              My Children
            </h3>
            <button
              onClick={() => setShowAddChildModal(true)}
              className="btn btn-outline btn-sm"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="p-6">
            {childrenLoading ? (
              <p className="text-center text-gray-500">Loading children...</p>
            ) : children.length === 0 ? (
              <div className="text-center space-y-4">
                <Users className="h-10 w-10 text-gray-400 mx-auto" />
                <p className="text-gray-600 dark:text-gray-300">
                  No children added yet. Start by adding your first child.
                </p>
                <button
                  onClick={() => setShowAddChildModal(true)}
                  className="btn btn-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Child
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {children.map((child: Child) => (
                  <div
                    key={child.id}
                    className="p-4 border rounded-lg hover:shadow-md transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                          {child.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {child.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Age: {child.age} years
                          </p>
                          {child.condition && (
                            <p className="text-sm text-blue-600 dark:text-blue-400">
                              {child.condition}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-green-600">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-red-600"
                          onClick={() => deleteChildMutation.mutate(child.id)}
                          disabled={deleteChildMutation.isLoading}
                          aria-label="Delete child"
                        >
                          <span className="block h-4 w-4">×</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="rounded-xl bg-white dark:bg-gray-800 shadow-sm">
          <div className="flex items-center gap-2 border-b px-6 py-4">
            <Calendar className="h-5 w-5 text-green-500" />
            <h3 className="text-lg font-semibold">Upcoming Sessions</h3>
          </div>
          <div className="p-6">
            {bookingsLoading ? (
              <p className="text-center text-gray-500">Loading bookings...</p>
            ) : upcomingBookings.length === 0 ? (
              <div className="text-center space-y-4">
                <Calendar className="h-10 w-10 text-gray-400 mx-auto" />
                <p className="text-gray-600 dark:text-gray-300">
                  No upcoming sessions. Book your first therapy session.
                </p>
                <button
                  onClick={() => setShowBookSessionModal(true)}
                  className="btn btn-primary"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Book a Session
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map((booking: Booking) => (
                  <div
                    key={booking.id}
                    className="p-4 border rounded-lg hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold">
                            {booking.child.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {booking.child.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              with {booking.therapist.name}
                            </p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(
                            booking.timeSlot.startTime
                          ).toLocaleDateString()}{" "}
                          •{" "}
                          {new Date(
                            booking.timeSlot.startTime
                          ).toLocaleTimeString()}
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          booking.status === "SCHEDULED"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddChildModal && (
        <AddChildModal
          onClose={() => setShowAddChildModal(false)}
          onSuccess={() => {
            queryClient.invalidateQueries("children")
            setShowAddChildModal(false)
          }}
        />
      )}

      {showBookSessionModal && (
        <BookSessionModal
          onClose={() => setShowBookSessionModal(false)}
          onSuccess={() => {
            queryClient.invalidateQueries("parentBookings")
            setShowBookSessionModal(false)
          }}
        />
      )}
    </div>
  )
}

export default ParentDashboard
