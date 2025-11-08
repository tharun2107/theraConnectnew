import React, { useMemo, useState, memo } from 'react'
import { useQuery } from 'react-query'
import { therapistAPI, bookingAPI } from '../lib/api'
import BookMonthlySessionModal from '../components/BookMonthlySessionModal'
import { Star, Briefcase, DollarSign, User, Stethoscope } from 'lucide-react'
import { useDebounce } from '../hooks/useDebounce'
import toast from 'react-hot-toast'

// Helper function to get next weekday (skip weekends)
const getNextWeekday = (): string => {
  const today = new Date()
  let date = new Date(today)
  
  // If today is weekend, move to next Monday
  while (date.getDay() === 0 || date.getDay() === 6) {
    date.setDate(date.getDate() + 1)
  }
  
  return date.toISOString().slice(0, 10)
}

const FindTherapists: React.FC = () => {
  const [query, setQuery] = useState('')
  const [date, setDate] = useState<string>(getNextWeekday())
  const [timeFilter, setTimeFilter] = useState<string>('') // HH:MM optional
  const [filterByAvailability, setFilterByAvailability] = useState<boolean>(false)
  
  // Debounce search query to reduce API calls
  const debouncedQuery = useDebounce(query, 300)

  const { data: therapists = [], isLoading } = useQuery(
    'therapistsList',
    therapistAPI.getPublicList,
    { select: (response) => response.data }
  )

  const [showBookModal, setShowBookModal] = useState(false)
  const [selectedTherapist, setSelectedTherapist] = useState<any | null>(null)

  // Fetch availability for all therapists when filtering is enabled or time filter is set
  // Batch requests to avoid overwhelming the server
  const shouldFetchAvailability = filterByAvailability || !!timeFilter
  const { data: availabilityMap, isLoading: isLoadingAvailability } = useQuery(
    ['therapistAvailability', date, therapists?.length, filterByAvailability, timeFilter],
    async () => {
      if (!shouldFetchAvailability || !Array.isArray(therapists) || therapists.length === 0) return {}
      
      // Batch requests in chunks of 5 to avoid overwhelming the server
      const chunkSize = 5
      const chunks = []
      for (let i = 0; i < therapists.length; i += chunkSize) {
        chunks.push(therapists.slice(i, i + chunkSize))
      }
      
      const allEntries = []
      for (const chunk of chunks) {
        const chunkEntries = await Promise.all(
          chunk.map(async (t: any) => {
            try {
              const res = await bookingAPI.getAvailableSlots(t.id, date)
              return [t.id, res.data as any[]]
            } catch {
              return [t.id, []]
            }
          })
        )
        allEntries.push(...chunkEntries)
        // Small delay between chunks to prevent overwhelming the server
        if (chunks.indexOf(chunk) < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
      
      return Object.fromEntries(allEntries)
    },
    { 
      enabled: shouldFetchAvailability && therapists.length > 0,
      staleTime: 30000, // Cache for 30 seconds
    }
  )

  const filtered = useMemo(() => {
    let list = therapists.filter((t: any) =>
      [t.name, t.specialization].join(' ').toLowerCase().includes(debouncedQuery.toLowerCase())
    )
    
    // Filter by availability and/or time slot
    if (shouldFetchAvailability && availabilityMap) {
      list = list.filter((t: any) => {
        const slots = (availabilityMap as any)?.[t.id] || []
        
        // If filterByAvailability is enabled, therapist must have available slots
        if (filterByAvailability && slots.length === 0) {
          return false
        }
        
        // If time filter is set, check if any slot matches the time
        if (timeFilter) {
          // Parse the time filter (HH:MM format from time input)
          const [filterHour, filterMinute] = timeFilter.split(':').map((v) => parseInt(v || '0', 10))
          
          // Check if any slot matches the time filter
          // Slots are stored in UTC with literal hours/minutes
          const hasMatchingSlot = slots.some((s: any) => {
            const slotDate = new Date(s.startTime)
            // Extract UTC hours/minutes (these represent the literal display time)
            const slotUTCHours = slotDate.getUTCHours()
            const slotUTCMinutes = slotDate.getUTCMinutes()
            
            // Match the time filter to the slot's UTC hours/minutes
            return slotUTCHours === filterHour && slotUTCMinutes === filterMinute
          })
          
          return hasMatchingSlot
        }
        
        // If only filterByAvailability is enabled without time filter, just check if slots exist
        return slots.length > 0
      })
    }
    
    return list
  }, [therapists, debouncedQuery, filterByAvailability, availabilityMap, timeFilter, shouldFetchAvailability])

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <h1 className="text-xl sm:text-2xl font-semibold">Find Therapists</h1>
      <div className="space-y-4">
        {/* Search Bar */}
        <div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, specialization..."
            className="input w-full"
          />
        </div>

        {/* Filters Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 items-end">
          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => {
                const value = e.target.value
                if (value) {
                  // Check if selected date is a weekend
                  const dateObj = new Date(value + 'T00:00:00')
                  const dayOfWeek = dateObj.getDay()
                  if (dayOfWeek === 0 || dayOfWeek === 6) {
                    toast.error('Bookings are not available on weekends (Saturday and Sunday). Please select a weekday.')
                    return
                  }
                  setDate(value)
                } else {
                  setDate(new Date().toISOString().slice(0,10))
                }
              }}
              min={new Date().toISOString().split('T')[0]}
              className="input w-full"
            />
          </div>

          {/* Time Slot Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Filter by Time Slot
            </label>
            <input
              type="time"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="input w-full"
              placeholder="Select time (optional)"
            />
            {timeFilter && (
              <button
                onClick={() => setTimeFilter('')}
                className="text-xs text-blue-600 dark:text-blue-400 mt-1 hover:underline"
              >
                Clear time filter
              </button>
            )}
          </div>

          {/* Availability Filter */}
          <div className="flex items-center">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filterByAvailability}
                onChange={(e) => setFilterByAvailability(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Only show with available slots
              </span>
            </label>
          </div>

          {/* Clear All Filters */}
          {(debouncedQuery || timeFilter || filterByAvailability) && (
            <div>
              <button
                onClick={() => {
                  setQuery('')
                  setTimeFilter('')
                  setFilterByAvailability(false)
                }}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-white bg-gray-100 dark:bg-black dark:border dark:border-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-900 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Filter Status */}
        {(timeFilter || filterByAvailability) && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {isLoadingAvailability ? (
              <span>Loading availability...</span>
            ) : (
              <span>
                Showing {filtered.length} therapist{filtered.length !== 1 ? 's' : ''} 
                {timeFilter && (() => {
                  // Convert 24-hour format (HH:MM) to 12-hour format (AM/PM)
                  const [hours, minutes] = timeFilter.split(':').map(Number)
                  const displayDate = new Date(2000, 0, 1, hours, minutes)
                  const time12h = displayDate.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })
                  return ` with slots at ${time12h}`
                })()}
                {filterByAvailability && ' with available slots'}
                {date && ` on ${new Date(date).toLocaleDateString()}`}
              </span>
            )}
          </div>
        )}
      </div>
      {isLoading ? (
        <div className="text-gray-600 dark:text-gray-300">Loading therapists...</div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-600 dark:text-gray-300">No therapists found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filtered.map((t: any) => (
            <div
              key={t.id}
              className="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-black backdrop-blur-sm shadow-sm hover:shadow-xl transition-all duration-300"
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
                  <div className="flex items-center gap-2 rounded-lg bg-gray-50 dark:bg-black dark:border dark:border-gray-700 px-3 py-2">
                    <Briefcase className="h-4 w-4 text-gray-500" />
                    <div className="min-w-0">
                      <div className="text-xs text-gray-500">Experience</div>
                      <div className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{t.experience} yrs</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-gray-50 dark:bg-black dark:border dark:border-gray-700 px-3 py-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <div className="min-w-0">
                      <div className="text-xs text-gray-500">Base fee</div>
                      <div className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">${t.baseCostPerSession}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-gray-50 dark:bg-black dark:border dark:border-gray-700 px-3 py-2">
                    <Star className="h-4 w-4 text-amber-500" />
                    <div className="min-w-0">
                      <div className="text-xs text-gray-500">Rating</div>
                      <div className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{t.averageRating ?? 'N/A'}</div>
                    </div>
                  </div>
                </div>

                {/* Available Slots Count (if filtering by availability) */}
                {shouldFetchAvailability && availabilityMap && (
                  <div className="pb-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Available slots on {new Date(date).toLocaleDateString()}:</span>
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        {(availabilityMap as any)?.[t.id]?.length || 0} slot{((availabilityMap as any)?.[t.id]?.length || 0) !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <button
                  onClick={() => { setSelectedTherapist(t); setShowBookModal(true); }}
                  className="w-full items-center justify-center rounded-xl bg-black hover:bg-[#1A1A1A] px-4 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showBookModal && selectedTherapist && (
        <BookMonthlySessionModal
          onClose={() => { setShowBookModal(false); setSelectedTherapist(null); }}
          onSuccess={() => { setShowBookModal(false); setSelectedTherapist(null); }}
          therapistId={selectedTherapist.id}
        />
      )}
    </div>
  )
}

export default memo(FindTherapists)


