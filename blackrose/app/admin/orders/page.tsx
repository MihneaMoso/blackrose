'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, ArrowLeft, ShoppingBag, X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { OrderCard } from '@/components/admin/OrderCard'
import type { Order } from '@/lib/types'
import { cn } from '@/lib/utils'

type FilterTab = 'all' | 'in-progress' | 'completed'

interface Toast {
  type: 'success' | 'error'
  message: string
}

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All Orders' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
]

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-white/5 bg-zinc-900/50 overflow-hidden animate-pulse">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/10" />
          <div className="space-y-1.5">
            <div className="h-4 w-20 rounded bg-white/10" />
            <div className="h-3 w-28 rounded bg-white/10" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-4 w-16 rounded bg-white/10" />
          <div className="h-6 w-24 rounded-full bg-white/10" />
        </div>
      </div>
      <div className="px-6 py-4 border-b border-white/5">
        <div className="flex gap-6">
          <div className="space-y-1.5">
            <div className="h-3 w-20 rounded bg-white/10" />
            <div className="h-4 w-28 rounded bg-white/10" />
          </div>
          <div className="w-px bg-white/5" />
          <div className="space-y-1.5">
            <div className="h-3 w-16 rounded bg-white/10" />
            <div className="h-4 w-24 rounded bg-white/10" />
          </div>
        </div>
      </div>
      <div className="px-6 py-4 space-y-2">
        <div className="h-4 w-3/4 rounded bg-white/10" />
        <div className="h-4 w-1/2 rounded bg-white/10" />
      </div>
      <div className="px-6 py-4">
        <div className="h-3 w-12 rounded bg-white/10 mb-3" />
        <div className="h-4 w-full rounded bg-white/10" />
      </div>
      <div className="px-6 py-4 flex justify-end">
        <div className="h-9 w-40 rounded-lg bg-white/10" />
      </div>
    </div>
  )
}

export default function AdminOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [toast, setToast] = useState<Toast | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  const showToast = useCallback((t: Toast) => {
    setToast(t)
    setTimeout(() => setToast(null), 3500)
  }, [])

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw new Error(error.message)
      setOrders((data as Order[]) ?? [])
    } catch (err) {
      showToast({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to load orders',
      })
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    fetchOrders()
    const client = createClient()
    client.auth.getUser().then(({ data }) => {
      if (data?.user?.email) setUserEmail(data.user.email)
    })
  }, [fetchOrders])

  async function handleLogout() {
    const client = createClient()
    await client.auth.signOut()
    router.push('/auth/login')
  }

  function handleStatusChange(orderId: string, newStatus: 'delivered') {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, order_status: newStatus } : o
      )
    )
  }

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'in-progress') return order.order_status === 'paid'
    if (activeTab === 'completed') return order.order_status === 'delivered'
    return true
  })

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-zinc-950/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-5 w-5 text-rose-accent" />
            <h1 className="font-serif text-xl text-rose-200 tracking-wide">
              Order Management
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {userEmail && (
              <span className="text-xs text-zinc-500 hidden sm:block">
                {userEmail}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-zinc-400 hover:text-rose-200 hover:bg-white/5 transition-colors"
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
          {/* Sidebar */}
          <aside className="lg:w-80 shrink-0">
            <div className="p-5 rounded-xl border border-white/5 bg-zinc-900/50 space-y-4">
              <Link
                href="/admin"
                className="flex items-center gap-2 text-sm text-zinc-400 hover:text-rose-200 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>

              <nav className="space-y-1">
                <Link
                  href="/admin/products"
                  className="block px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-rose-200 hover:bg-white/5 transition-colors"
                >
                  Products
                </Link>
                <Link
                  href="/admin/edit-about"
                  className="block px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-rose-200 hover:bg-white/5 transition-colors"
                >
                  Edit About
                </Link>
                <Link
                  href="/admin/orders"
                  className="block px-3 py-2 rounded-lg bg-rose-200/10 text-rose-200 text-sm font-medium"
                >
                  Orders
                </Link>
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <div className="p-5 rounded-xl border border-white/5 bg-zinc-900/50">
              {/* Toast */}
              {toast && (
                <div
                  className={cn(
                    'mb-6 flex items-center gap-2 px-4 py-3 rounded-lg text-sm border',
                    toast.type === 'success'
                      ? 'bg-emerald-900/20 border-emerald-800/30 text-emerald-300'
                      : 'bg-red-900/20 border-red-800/30 text-red-300'
                  )}
                >
                  {toast.message}
                  <button
                    onClick={() => setToast(null)}
                    className="ml-auto hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 mb-6 p-1 rounded-lg bg-zinc-950 border border-white/5 w-fit">
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                      activeTab === tab.key
                        ? 'bg-rose-200/10 text-rose-200'
                        : 'text-zinc-500 hover:text-zinc-300'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Orders Grid */}
              {loading ? (
                <div className="space-y-4">
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                  <ShoppingBag className="h-10 w-10 mb-4 opacity-40" />
                  <p className="text-sm font-medium">
                    {activeTab === 'all'
                      ? 'No orders yet'
                      : activeTab === 'in-progress'
                        ? 'No orders in progress'
                        : 'No completed orders'}
                  </p>
                  <p className="text-xs mt-1 text-zinc-600">
                    {activeTab === 'all'
                      ? 'Orders will appear here once customers complete checkout'
                      : 'Try switching tabs'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onStatusChange={handleStatusChange}
                      onToast={showToast}
                    />
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
