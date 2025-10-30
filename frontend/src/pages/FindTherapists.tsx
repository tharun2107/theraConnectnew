import React, { useMemo, useState } from 'react'
import { useQuery } from 'react-query'
import { therapistAPI, slotsAPI } from '../lib/api'
import BookSessionModal from '../components/BookSessionModal'
import { Star, Briefcase, DollarSign, User, Stethoscope } from 'lucide-react'

const FindTherapists: React.FC = () => {
  const [query, setQuery] = useState('')
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0,10))
  const [timeFilter, setTimeFilter] = useState<string>('') // HH:MM optional
  const [onlyWithAvailability, setOnlyWithAvailability] = useState<boolean>(false)

  const { data: therapists = [], isLoading } = useQuery(
    'therapistsList',
    therapistAPI.getPublicList,
    { select: (response) => response.data }
  )

  const [showBookModal, setShowBookModal] = useState(false)
  const [selectedTherapist, setSelectedTherapist] = useState<any | null>(null)

  // Availability lookups (naive N calls; acceptable for small lists)
  const { data: availabilityMap } = useQuery(
    ['therapistAvailability', date, therapists?.length, onlyWithAvailability],
    async () => {
      if (!onlyWithAvailability || !Array.isArray(therapists)) return {}
      const entries = await Promise.all(
        therapists.map(async (t: any) => {
          try {
            const res = await slotsAPI.getAvailableSlots(t.id, date)
            return [t.id, res.data as any[]]
          } catch {
            return [t.id, []]
          }
        })
      )
      return Object.fromEntries(entries)
    },
    { enabled: onlyWithAvailability && therapists.length > 0 }
  )

  const filtered = useMemo(() => {
    let list = therapists.filter((t: any) =>
      [t.name, t.specialization].join(' ').toLowerCase().includes(query.toLowerCase())
    )
    if (onlyWithAvailability) {
      list = list.filter((t: any) => {
        const slots = (availabilityMap as any)?.[t.id] || []
        if (!timeFilter) return slots.length > 0
        // Filter by approximate time match (same hour and minute)
        const [hh, mm] = timeFilter.split(':').map((v) => parseInt(v || '0', 10))
        return slots.some((s: any) => {
          const d = new Date(s.startTime)
          return d.getHours() === hh && d.getMinutes() === mm
        })
      })
    }
    return list
  }, [therapists, query, onlyWithAvailability, availabilityMap, timeFilter])

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Find Therapists</h1>
      <div className="grid gap-3 md:grid-cols-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, specialization..."
          className="input w-full"
        />
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input w-full"
          />
          <input
            type="time"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="input w-full"
          />
        </div>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={onlyWithAvailability}
            onChange={(e) => setOnlyWithAvailability(e.target.checked)}
          />
          <span>Only show with available slots</span>
        </label>
      </div>
      {isLoading ? (
        <div className="text-gray-600 dark:text-gray-300">Loading therapists...</div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-600 dark:text-gray-300">No therapists found.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((t: any) => (
            <div
              key={t.id}
              className="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm shadow-sm hover:shadow-xl transition-all duration-300"
            >
              {/* Decorative gradient bar */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 opacity-80" />

              <div className="p-5">
                {/* Header */}
                <div className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center shadow-md">
                    <span className="font-bold text-lg">{(t.name || 'U').charAt(0)}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-4 w-4 text-blue-600" />
                      <h3 className="truncate font-semibold text-gray-900 dark:text-white">{t.name}</h3>
                    </div>
                    <div className="mt-1 inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/20 px-2.5 py-0.5 text-xs text-blue-700 dark:text-blue-300">
                      {t.specialization}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 py-4">
                  <div className="flex items-center gap-2 rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2">
                    <Briefcase className="h-4 w-4 text-gray-500" />
                    <div className="min-w-0">
                      <div className="text-xs text-gray-500">Experience</div>
                      <div className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{t.experience} yrs</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <div className="min-w-0">
                      <div className="text-xs text-gray-500">Base fee</div>
                      <div className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">${t.baseCostPerSession}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2">
                    <Star className="h-4 w-4 text-amber-500" />
                    <div className="min-w-0">
                      <div className="text-xs text-gray-500">Rating</div>
                      <div className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{t.averageRating ?? 'N/A'}</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <button
                  onClick={() => { setSelectedTherapist(t); setShowBookModal(true); }}
                  className="w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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


