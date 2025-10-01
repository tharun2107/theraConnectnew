import React from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { bookingAPI, parentAPI } from '../lib/api'

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

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Child Profile</h1>
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
        <h2 className="text-xl font-semibold mb-3">Past Sessions</h2>
        {isLoading ? (
          <div>Loading...</div>
        ) : childBookings.length === 0 ? (
          <div className="text-gray-600 dark:text-gray-300">No sessions yet.</div>
        ) : (
          <div className="space-y-3">
            {childBookings.map((b: any) => (
              <div key={b.id} className="p-4 border">
                <div className="font-medium">{new Date(b.timeSlot.startTime).toLocaleString()}</div>
                <div className="text-sm">Therapist: {b.therapist?.name} ({b.therapist?.specialization})</div>
                <div className="text-sm">Status: {b.status}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ParentChildDetails


