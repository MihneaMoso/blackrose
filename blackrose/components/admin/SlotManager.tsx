'use client'

import { useEffect, useState, useCallback } from 'react'
import { Trash2, Loader2, Plus, X } from 'lucide-react'
import type { DeliverySlot } from '@/lib/types'
import { cn } from '@/lib/utils'

interface Toast {
  type: 'success' | 'error'
  message: string
}

interface SlotManagerProps {
  selectedDate: Date
}

function formatDateKey(d: Date) {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 animate-pulse">
      <div className="space-y-2">
        <div className="h-4 w-36 rounded bg-white/10" />
        <div className="h-3 w-24 rounded bg-white/10" />
      </div>
      <div className="h-8 w-8 rounded bg-white/10" />
    </div>
  )
}

export function SlotManager({ selectedDate }: SlotManagerProps) {
  const [slots, setSlots] = useState<DeliverySlot[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [toast, setToast] = useState<Toast | null>(null)

  // Form state
  const [timeInterval, setTimeInterval] = useState('')
  const [maxCapacity, setMaxCapacity] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const dateKey = formatDateKey(selectedDate)

  const showToast = useCallback((t: Toast) => {
    setToast(t)
    setTimeout(() => setToast(null), 3500)
  }, [])

  const fetchSlots = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/slots?date=${dateKey}`)
      if (!res.ok) throw new Error('Failed to fetch slots')
      const data: DeliverySlot[] = await res.json()
      setSlots(data)
    } catch (err) {
      showToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to load slots' })
    } finally {
      setLoading(false)
    }
  }, [dateKey, showToast])

  useEffect(() => {
    fetchSlots()
    setShowForm(false)
    setTimeInterval('')
    setMaxCapacity('')
  }, [fetchSlots])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!timeInterval.trim() || !maxCapacity.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          delivery_date: dateKey,
          time_interval: timeInterval.trim(),
          max_capacity: Number(maxCapacity),
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Failed to create slot')
      }

      const newSlot: DeliverySlot = await res.json()
      setSlots((prev) => [...prev, newSlot].sort((a, b) => a.time_interval.localeCompare(b.time_interval)))
      setTimeInterval('')
      setMaxCapacity('')
      setShowForm(false)
      showToast({ type: 'success', message: 'Slot created successfully' })
    } catch (err) {
      showToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to create slot' })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(slotId: string) {
    if (!confirm('Are you sure you want to delete this time slot?')) return

    setDeletingId(slotId)
    try {
      const res = await fetch(`/api/admin/slots/${slotId}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Failed to delete slot')
      }

      setSlots((prev) => prev.filter((s) => s.id !== slotId))
      showToast({ type: 'success', message: 'Slot deleted successfully' })
    } catch (err) {
      showToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to delete slot' })
    } finally {
      setDeletingId(null)
    }
  }

  const isFullyBooked = (slot: DeliverySlot) => slot.current_bookings >= slot.max_capacity

  return (
    <div className="relative">
      {/* Toast */}
      {toast && (
        <div
          className={cn(
            'fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all',
            toast.type === 'success'
              ? 'bg-emerald-900/80 text-emerald-200 border border-emerald-700/50'
              : 'bg-red-900/80 text-red-200 border border-red-700/50',
          )}
        >
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-2 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-serif text-lg text-rose-200">
          Slots for{' '}
          <span className="text-neutral-300">
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </h3>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-accent/10 text-rose-200 text-sm font-medium border border-rose-accent/20 hover:bg-rose-accent/20 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Slot
        </button>
      </div>

      {/* Add slot form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-5 p-4 rounded-lg border border-rose-accent/20 bg-white/5 space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-neutral-400 mb-1 font-medium">
                Time Interval
              </label>
              <input
                type="text"
                value={timeInterval}
                onChange={(e) => setTimeInterval(e.target.value)}
                placeholder="e.g. 10:00 AM – 02:00 PM"
                required
                className="w-full px-3 py-2 rounded-md bg-zinc-900 border border-white/10 text-neutral-200 text-sm placeholder-neutral-600 focus:outline-none focus:border-rose-accent/40 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1 font-medium">
                Max Capacity
              </label>
              <input
                type="number"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(e.target.value)}
                placeholder="e.g. 10"
                min={1}
                required
                className="w-full px-3 py-2 rounded-md bg-zinc-900 border border-white/10 text-neutral-200 text-sm placeholder-neutral-600 focus:outline-none focus:border-rose-accent/40 transition-colors"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-rose-accent/20 text-rose-200 text-sm font-medium border border-rose-accent/30 hover:bg-rose-accent/30 disabled:opacity-50 transition-colors"
            >
              {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {submitting ? 'Creating…' : 'Create Slot'}
            </button>
          </div>
        </form>
      )}

      {/* Slot list */}
      <div className="space-y-2">
        {loading ? (
          <>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </>
        ) : slots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
            <p className="text-sm font-medium">No slots configured for this date</p>
            <p className="text-xs mt-1">Click &quot;Add Slot&quot; to create one</p>
          </div>
        ) : (
          slots.map((slot) => (
            <div
              key={slot.id}
              className={cn(
                'flex items-center justify-between p-4 rounded-lg border transition-colors',
                isFullyBooked(slot)
                  ? 'bg-red-950/20 border-red-800/30'
                  : 'bg-white/5 border-white/10 hover:border-white/20',
              )}
            >
              <div className="space-y-1">
                <p className="text-sm font-medium text-neutral-200">
                  {slot.time_interval}
                </p>
                <div className="flex items-center gap-3 text-xs text-neutral-500">
                  <span>
                    Capacity:{' '}
                    <span className="text-neutral-300">{slot.current_bookings}</span>
                    {' / '}
                    <span className="text-neutral-300">{slot.max_capacity}</span>
                  </span>
                  {isFullyBooked(slot) && (
                    <span className="px-2 py-0.5 rounded-full bg-red-900/30 text-red-300 text-[10px] font-semibold uppercase tracking-wider">
                      Fully Booked
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(slot.id)}
                disabled={deletingId === slot.id}
                className="p-2 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-900/20 disabled:opacity-50 transition-colors"
                aria-label={`Delete slot ${slot.time_interval}`}
              >
                {deletingId === slot.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}


