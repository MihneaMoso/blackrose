'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, CalendarDays, Package, FileText, ShoppingBag } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { AdminCalendar } from '@/components/admin/AdminCalendar'
import { SlotManager } from '@/components/admin/SlotManager'

export default function AdminPage() {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const client = createClient()
    client.auth.getUser().then(({ data }) => {
      if (data?.user?.email) setUserEmail(data.user.email)
    })
  }, [])

  async function handleLogout() {
    const client = createClient()
    await client.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-zinc-950/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-rose-accent" />
            <h1 className="font-serif text-xl text-rose-200 tracking-wide">
              Black Rose Administrative Suite
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/products"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-neutral-400 hover:text-rose-200 hover:bg-white/5 transition-colors"
            >
              <Package className="h-4 w-4" />
              Products
            </Link>
            <Link
              href="/admin/edit-about"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-neutral-400 hover:text-rose-200 hover:bg-white/5 transition-colors"
            >
              <FileText className="h-4 w-4" />
              Edit About
            </Link>
            <Link
              href="/admin/orders"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-neutral-400 hover:text-rose-200 hover:bg-white/5 transition-colors"
            >
              <ShoppingBag className="h-4 w-4" />
              Orders
            </Link>
            {userEmail && (
              <span className="text-xs text-neutral-500 hidden sm:block">
                {userEmail}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-neutral-400 hover:text-rose-200 hover:bg-white/5 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Calendar panel */}
          <aside className="lg:w-80 shrink-0">
            <div className="p-5 rounded-xl border border-white/5 bg-zinc-900/50">
              <AdminCalendar
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
            </div>
          </aside>

          {/* Slot management panel */}
          <main className="flex-1 min-w-0">
            <div className="p-5 rounded-xl border border-white/5 bg-zinc-900/50">
              <SlotManager selectedDate={selectedDate} />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
