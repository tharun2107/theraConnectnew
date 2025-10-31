import React from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { bookingAPI, parentAPI } from '../lib/api'
import SessionDetails from '../components/SessionDetails'

const ParentChildDetails: React.FC = () => {
  const { childId } = useParams()

  const { data: children = [] } = useQuery('children', parentAPI.getChildren, { select: (r) => r.data })
  const child = (children as any[]).find((c) => c.id === childId)

  const { data: bookings = [], isLoading } = useQuery(
    ['childBookings', childId],
    bookingAPI.getMyBookings,
    { select: (r) => r.data }
  )

  const childBookings = (bookings as any[]).filter((b) => b.child?.id === childId)
  const pastSessions = childBookings.filter((b) => b.status === 'COMPLETED')

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-semibold">Child Profile</h1>
      {child ? (
        <div className="border p-4">
          <div className="font-medium">{child.name}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Age: {child.age}</div>
          {child.condition && <div className="text-sm">Condition: {child.condition}</div>}
          {child.address && <div className="text-sm">Address: {child.address}</div>}
          {child.notes && <div className="text-sm">Notes: {child.notes}</div>}
        </div>
      ) : (
        <div>No child found.</div>
      )}

      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-3">Past Sessions</h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading sessions...</span>
          </div>
        ) : pastSessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-3">📅</div>
            <p className="text-lg font-medium mb-2">No completed sessions yet</p>
            <p className="text-sm">Completed therapy sessions will appear here with feedback and reports.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pastSessions
              .sort((a, b) => new Date(b.timeSlot.startTime).getTime() - new Date(a.timeSlot.startTime).getTime())
              .map((booking) => (
                <SessionDetails
                  key={booking.id}
                  booking={booking}
                  userRole="PARENT"
                />
              ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ParentChildDetails


