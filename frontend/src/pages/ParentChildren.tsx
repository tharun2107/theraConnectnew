import React from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { parentAPI } from '../lib/api'

const ParentChildren: React.FC = () => {
  const { data: children = [], isLoading } = useQuery('children', parentAPI.getChildren, {
    select: (r) => r.data,
  })

  if (isLoading) return <div className="p-6">Loading...</div>

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">My Children</h1>
      {children.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300">No children yet.</p>
      ) : (
        <div className="space-y-3">
          {children.map((c: any) => (
            <Link key={c.id} to={`/parent/children/${c.id}`} className="block p-4 border hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="font-medium">{c.name}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Age: {c.age}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default ParentChildren


