'use client'

import { useCart } from '@/lib/context/cart-context'
import { createClient } from '@/lib/supabase/client'
import type { DateGroup, DeliverySlot } from '@/lib/types'
import { useEffect, useState } from 'react'

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  return {
    weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
    month: d.toLocaleDateString('en-US', { month: 'short' }),
    day: d.getDate(),
  }
}

function isToday(dateStr: string) {
  const today = new Date()
  return dateStr === today.toISOString().split('T')[0]
}

export default function DeliveryScheduler() {
  const { checkout, updateCheckout } = useCart()
  const [groups, setGroups] = useState<DateGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>(
    checkout.deliveryDate ?? ''
  )
  const [selectedSlotId, setSelectedSlotId] = useState<string>(
    checkout.deliverySlotId ?? ''
  )

  useEffect(() => {
    let cancelled = false

    const fetchSlots = async () => {
      setLoading(true)
      setError(null)

      const supabase = createClient()
      const today = new Date().toISOString().split('T')[0]

      const { data, error: err } = await supabase
        .from('delivery_slots')
        .select('*')
        .gte('delivery_date', today)
        .order('delivery_date', { ascending: true })
        .order('time_interval', { ascending: true })

      if (cancelled) return

      if (err) {
        setError(err.message)
        setLoading(false)
        return
      }

      const available = ((data as DeliverySlot[]) ?? []).filter(
        (slot) => slot.current_bookings < slot.max_capacity
      )

      const grouped = available.reduce((acc, slot) => {
        const existing = acc.find((g) => g.delivery_date === slot.delivery_date)
        if (existing) {
          existing.slots.push(slot)
        } else {
          acc.push({ delivery_date: slot.delivery_date, slots: [slot] })
        }
        return acc
      }, [] as DateGroup[])

      setGroups(grouped)
      setLoading(false)
    }

    fetchSlots()
    return () => {
      cancelled = true
    }
  }, [])

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setSelectedSlotId('')
    updateCheckout({
      deliveryDate: date,
      deliveryTimeSlot: null,
      deliverySlotId: null,
    })
  }

  const handleSlotSelect = (slot: DeliverySlot) => {
    setSelectedSlotId(slot.id)
    updateCheckout({
      deliveryDate: slot.delivery_date,
      deliveryTimeSlot: slot.time_interval,
      deliverySlotId: slot.id,
    })
  }

  const selectedDateSlots =
    groups.find((g) => g.delivery_date === selectedDate)?.slots ?? []

  const hasSelection =
    checkout.deliveryDate && checkout.deliveryTimeSlot

  return (
    <div className="border border-gray-darker bg-card p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-serif text-foreground">
          Schedule Delivery
        </h2>
        {hasSelection && (
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-rose-soft">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-soft" />
            Selected
          </span>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4 animate-pulse">
          <div className="h-10 bg-gray-dark rounded-sm w-1/3" />
          <div className="flex gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-16 w-20 bg-gray-dark rounded-sm"
              />
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="border border-rose-accent/30 bg-rose-accent/5 px-4 py-3">
          <p className="text-rose-accent text-sm">
            Unable to load delivery slots. Please try again later.
          </p>
          <p className="text-gray-500 text-xs mt-1">{error}</p>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && groups.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-gray-400 text-sm uppercase tracking-widest">
            No delivery slots available
          </p>
          <p className="text-gray-600 text-xs mt-2">
            Please check back soon for new availability.
          </p>
        </div>
      )}

      {/* Date Grid */}
      {!loading && !error && groups.length > 0 && (
        <div className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-400 mb-3">
              Select Date
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {groups.map((g) => {
                const fmt = formatDate(g.delivery_date)
                const isSelected = selectedDate === g.delivery_date
                const isTodayDate = isToday(g.delivery_date)
                return (
                  <button
                    key={g.delivery_date}
                    onClick={() => handleDateSelect(g.delivery_date)}
                    className={`flex flex-col items-center flex-shrink-0 w-[72px] py-3 border transition-colors ${
                      isSelected
                        ? 'border-rose-soft bg-rose-soft/10 text-rose-soft'
                        : 'border-gray-darker text-gray-400 hover:border-foreground hover:text-foreground'
                    }`}
                  >
                    <span className="text-[10px] uppercase tracking-wider">
                      {fmt.weekday}
                    </span>
                    <span className="text-lg font-serif mt-0.5 leading-none">
                      {fmt.day}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider mt-0.5">
                      {fmt.month}
                    </span>
                    {isTodayDate && (
                      <span className="text-[8px] uppercase tracking-widest mt-1 text-rose-soft">
                        Today
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Time Slots */}
          {selectedDate && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs uppercase tracking-widest text-gray-400">
                  Select Time
                </label>
                <span className="text-[10px] text-gray-500">
                  {formatDate(selectedDate).weekday},{' '}
                  {formatDate(selectedDate).month}{' '}
                  {formatDate(selectedDate).day}
                </span>
              </div>

              {selectedDateSlots.length === 0 ? (
                <p className="text-gray-600 text-sm py-4 text-center border border-dashed border-gray-darker">
                  No time slots available for this date
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {selectedDateSlots.map((slot) => {
                    const isSelected = selectedSlotId === slot.id
                    return (
                      <button
                        key={slot.id}
                        onClick={() => handleSlotSelect(slot)}
                        className={`px-4 py-3 border text-sm transition-colors ${
                          isSelected
                            ? 'border-rose-soft bg-rose-soft/10 text-rose-soft'
                            : 'border-gray-darker text-gray-400 hover:border-foreground hover:text-foreground'
                        }`}
                      >
                        {slot.time_interval}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Selected confirmation */}
          {hasSelection && (
            <div className="pt-4 border-t border-gray-darker">
              <div className="flex items-center gap-3 text-sm">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-soft/20 text-rose-soft text-xs">
                  ✓
                </span>
                <div>
                  <p className="text-foreground">
                    Delivery scheduled for{' '}
                    <span className="font-medium">
                      {formatDate(checkout.deliveryDate!).weekday},{' '}
                      {formatDate(checkout.deliveryDate!).month}{' '}
                      {formatDate(checkout.deliveryDate!).day}
                    </span>
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {checkout.deliveryTimeSlot}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
