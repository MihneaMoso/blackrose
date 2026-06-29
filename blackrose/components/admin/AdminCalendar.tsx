'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo } from 'react'
import { cn } from '@/lib/utils'

interface AdminCalendarProps {
  selectedDate: Date
  onSelectDate: (date: Date) => void
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function buildCalendarGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7
  const cells: (number | null)[] = []

  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - firstDay + 1
    cells.push(dayNum >= 1 && dayNum <= daysInMonth ? dayNum : null)
  }

  return cells
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function AdminCalendar({ selectedDate, onSelectDate }: AdminCalendarProps) {
  const year = selectedDate.getFullYear()
  const month = selectedDate.getMonth()

  const cells = useMemo(() => buildCalendarGrid(year, month), [year, month])
  const today = new Date()

  const monthLabel = selectedDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  function navigate(delta: number) {
    const next = new Date(year, month + delta, 1)
    onSelectDate(next)
  }

  function handleClick(day: number) {
    onSelectDate(new Date(year, month, day))
  }

  return (
    <div className="w-full max-w-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-200 hover:bg-white/5 transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="font-serif text-lg text-rose-200 tracking-wide">
          {monthLabel}
        </span>
        <button
          onClick={() => navigate(1)}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-200 hover:bg-white/5 transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-medium text-neutral-500 py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Date grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="aspect-square" />
          }

          const date = new Date(year, month, day)
          const isSelected = isSameDay(date, selectedDate)
          const isToday = isSameDay(date, today)

          return (
            <button
              key={`day-${day}`}
              onClick={() => handleClick(day)}
              className={cn(
                'aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-colors',
                isSelected
                  ? 'bg-rose-accent/20 text-rose-200 border border-rose-accent/40'
                  : isToday
                    ? 'text-rose-300/70 hover:bg-white/5'
                    : 'text-neutral-300 hover:bg-white/5',
              )}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}
