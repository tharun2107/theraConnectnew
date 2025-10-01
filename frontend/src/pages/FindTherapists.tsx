import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { therapistAPI } from '../lib/api'
import BookSessionModal from '../components/BookSessionModal'

const FindTherapists: React.FC = () => {
  const [query, setQuery] = useState('')

  const { data: therapists = [], isLoading } = useQuery(
    'therapistsList',
    therapistAPI.getPublicList,
    { select: (response) => response.data }
  )

  const [showBookModal, setShowBookModal] = useState(false)
  const [selectedTherapist, setSelectedTherapist] = useState<any | null>(null)

  const filtered = therapists.filter((t: any) =>
    [t.name, t.specialization].join(' ').toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Find Therapists</h1>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name, specialization..."
        className="input w-full max-w-xl"
      />
      {isLoading ? (
        <div className="text-gray-600 dark:text-gray-300">Loading therapists...</div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-600 dark:text-gray-300">No therapists found.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t: any) => (
            <div key={t.id} className="border p-4 hover:shadow-md transition">
              <div className="font-medium">{t.name}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{t.specialization}</div>
              <div className="text-sm">Experience: {t.experience} years</div>
              <div className="text-sm">Base fee: ${t.baseCostPerSession}</div>
              <div className="text-sm">Rating: {t.averageRating || 'N/A'}</div>
              <div className="pt-3">
                <button
                  onClick={() => { setSelectedTherapist(t); setShowBookModal(true); }}
                  className="btn btn-primary w-full"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showBookModal && selectedTherapist && (
        <BookSessionModal
          onClose={() => { setShowBookModal(false); setSelectedTherapist(null); }}
          onSuccess={() => { setShowBookModal(false); setSelectedTherapist(null); }}
          therapistId={selectedTherapist.id}
        />
      )}
    </div>
  )
}

export default FindTherapists


