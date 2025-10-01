import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from 'react-query'
import { therapistAPI } from '../lib/api'
import { X, Calendar, Clock, CheckSquare, Square } from 'lucide-react'
import toast from 'react-hot-toast'

interface CreateTimeSlotsModalProps {
  onClose: () => void
  onSuccess: () => void
}

interface TimeSlotsFormData {
  date: string
}

const CreateTimeSlotsModal: React.FC<CreateTimeSlotsModalProps> = ({ onClose, onSuccess }) => {
  const [generatedSlots, setGeneratedSlots] = useState<any[]>([])
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([])
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TimeSlotsFormData>()

  const selectedDate = watch('date')

  // Remove explicit generate button; we'll auto-generate on date change

  const activateMutation = useMutation(therapistAPI.createTimeSlots, {
    onSuccess: () => {
      toast.success('Activated selected slots!')
      onSuccess()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to activate slots')
    },
  })

  // No onGenerate; handled automatically in useEffect

  const onActivate = (data: TimeSlotsFormData) => {
    if (selectedSlotIds.length === 0) {
      toast.error('Select up to 10 slots to activate')
      return
    }
    // Normalize to YYYY-MM-DD
    data.date = data.date.slice(0, 10)
    activateMutation.mutate({ date: data.date, activateSlotIds: selectedSlotIds })
  }

  const toggleSelect = (slotId: string) => {
    setSelectedSlotIds((prev) => {
      const exists = prev.includes(slotId)
      if (exists) return prev.filter((id) => id !== slotId)
      if (prev.length >= 10) {
        toast.error('You can activate at most 10 slots')
        return prev
      }
      return [...prev, slotId]
    })
  }

  useEffect(() => {
    // Load slots when date changes, if already generated
    if (selectedDate) {
      const ymd = selectedDate.slice(0, 10)
      // Auto-generate 24 slots for the day, then fetch
      therapistAPI.createTimeSlots({ date: ymd, generate: true } as any)
        .finally(() => {
          therapistAPI.getMySlots(ymd).then((res) => {
            setGeneratedSlots(res.data || [])
          }).catch((e:any) => {
            console.error('[CreateTimeSlotsModal] slots error', e?.response?.data || e?.message)
          })
        })
      setSelectedSlotIds([])
    }
  }, [selectedDate])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Calendar className="h-5 w-5 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Create Time Slots</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form className="p-6 space-y-6">
          {/* Select Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Select Date *
            </label>
            <input
              {...register('date', { required: 'Please select a date' })}
              type="date"
              min={new Date().toISOString().split('T')[0]}
              className="input"
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
            )}
          </div>

          {/* Activate slots (auto-generated on date change) */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={!selectedDate || selectedSlotIds.length !== 10 || activateMutation.isLoading}
                onClick={handleSubmit(onActivate)}
                className="btn btn-primary"
              >
                {activateMutation.isLoading ? 'Activating...' : `Activate Selected (${selectedSlotIds.length}/10)`}
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">Slots for {selectedDate || '—'}</span>
                <span className="text-xs text-gray-500">Select exactly 10</span>
              </div>
              {(!selectedDate || generatedSlots.length === 0) ? (
                <div className="text-center py-6">
                  <Clock className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">No slots to display</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-72 overflow-auto">
                  {generatedSlots.map((slot: any) => {
                    const id = slot.id
                    const selected = selectedSlotIds.includes(id)
                    return (
                      <button
                        type="button"
                        key={id}
                        onClick={() => toggleSelect(id)}
                        className={`flex items-center gap-3 p-2 border rounded hover:bg-white text-left ${selected ? 'border-primary-300 bg-primary-50' : 'border-gray-200 bg-white'}`}
                      >
                        {selected ? <CheckSquare className="h-4 w-4 text-primary-600"/> : <Square className="h-4 w-4 text-gray-400"/>}
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {slot.isActive ? ' • Active' : ''}
                            {slot.isBooked ? ' • Booked' : ''}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Selection Summary */}
          {selectedDate && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Selection</h3>
              <div className="text-sm text-gray-600">
                <p><strong>Date:</strong> {new Date(selectedDate).toLocaleDateString()}</p>
                <p><strong>Selected:</strong> {selectedSlotIds.length} / 10</p>
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline flex-1"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit(onActivate)}
              disabled={activateMutation.isLoading || selectedSlotIds.length !== 10}
              className="btn btn-primary flex-1"
            >
              {activateMutation.isLoading ? 'Activating...' : 'Activate Selected (10/10)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateTimeSlotsModal
