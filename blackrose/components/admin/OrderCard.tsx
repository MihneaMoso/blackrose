'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Order, OrderLineItem } from '@/lib/types'
import { cn } from '@/lib/utils'
import { CheckCircle, Loader2, Package } from 'lucide-react'

interface OrderCardProps {
  order: Order
  onStatusChange: (orderId: string, newStatus: 'delivered') => void
  onToast: (toast: { type: 'success' | 'error'; message: string }) => void
}

function parseLineItems(customConfigJson: string): OrderLineItem[] {
  try {
    const parsed = JSON.parse(customConfigJson) as Record<string, unknown>
    return Object.values(parsed).map((item) => item as OrderLineItem)
  } catch {
    return []
  }
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

function formatCurrency(cents: number | null): string {
  if (cents === null) return '—'
  return `$${(cents / 100).toFixed(2)}`
}

function shortenId(id: string): string {
  return id.length > 8 ? id.slice(0, 8) : id
}

export function OrderCard({ order, onStatusChange, onToast }: OrderCardProps) {
  const [marking, setMarking] = useState(false)
  const lineItems = parseLineItems(order.custom_config_json)
  const isDelivered = order.order_status === 'delivered'

  async function handleMarkDelivered() {
    setMarking(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('orders')
        .update({ order_status: 'delivered' })
        .eq('id', order.id)

      if (error) throw new Error(error.message)

      onStatusChange(order.id, 'delivered')
      onToast({ type: 'success', message: 'Order marked as delivered' })
    } catch (err) {
      onToast({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to update order',
      })
    } finally {
      setMarking(false)
    }
  }

  return (
    <div
      className={cn(
        'rounded-xl border bg-zinc-900/50 overflow-hidden transition-all',
        isDelivered ? 'border-zinc-800/60' : 'border-zinc-700/50'
      )}
    >
      {/* Card Header — Order ID, Date, Total, Status Badge */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-200/10 flex items-center justify-center">
            <Package className="h-4 w-4 text-rose-200" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-200">
              #{shortenId(order.id)}
            </p>
            <p className="text-xs text-zinc-500">{formatDate(order.created_at)}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-mono text-zinc-200">
            {formatCurrency(order.amount_total)}
          </span>

          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium',
              isDelivered
                ? 'bg-emerald-900/20 text-emerald-300 border border-emerald-800/30'
                : 'bg-amber-900/20 text-amber-300 border border-amber-800/30'
            )}
          >
            {isDelivered ? (
              <>
                <CheckCircle className="h-3 w-3" />
                Delivered
              </>
            ) : (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                In Progress
              </>
            )}
          </span>
        </div>
      </div>

      {/* Delivery Details — highlighted */}
      <div className="px-6 py-4 border-b border-white/5 bg-rose-200/[0.02]">
        <div className="flex items-center gap-6 text-sm">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
              Delivery Date
            </p>
            <p className="text-rose-200 font-medium">{order.delivery_date}</p>
          </div>
          <div className="w-px h-8 bg-white/5" />
          <div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
              Time Slot
            </p>
            <p className="text-rose-200 font-medium">{order.delivery_time_slot}</p>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="px-6 py-4 border-b border-white/5 space-y-1.5">
        <p className="text-sm text-zinc-300">
          <span className="text-zinc-500 text-xs">To: </span>
          {order.customer_name}
        </p>
        <p className="text-sm text-zinc-300">
          <span className="text-zinc-500 text-xs">Email: </span>
          {order.customer_email}
        </p>
        <p className="text-sm text-zinc-300">
          <span className="text-zinc-500 text-xs">Phone: </span>
          {order.customer_phone}
        </p>
        <p className="text-sm text-zinc-300">
          <span className="text-zinc-500 text-xs">Address: </span>
          {order.delivery_address}, {order.delivery_city}{' '}
          {order.delivery_postal}
        </p>
        {order.notes && (
          <p className="text-sm text-zinc-400 italic mt-2 border-l-2 border-rose-200/20 pl-3">
            &ldquo;{order.notes}&rdquo;
          </p>
        )}
      </div>

      {/* Items Breakdown */}
      <div className="px-6 py-4 border-b border-white/5">
        <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-3">
          Items
        </p>

        {lineItems.length === 0 ? (
          <p className="text-xs text-zinc-600">No item data available</p>
        ) : (
          <div className="space-y-2">
            {lineItems.map((item, idx) => (
              <div key={idx} className="text-sm text-zinc-300">
                <span className="text-zinc-100">
                  {item.quantity}x {item.productName}
                </span>
                {item.variant && (
                  <span className="text-zinc-500">
                    {' '}— {item.variant.name}
                  </span>
                )}
                {item.addons.length > 0 && (
                  <p className="text-xs text-zinc-500 mt-0.5 pl-4">
                    Add-on:{' '}
                    {item.addons.map((a) => a.name).join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="px-6 py-4 flex items-center justify-end">
        {!isDelivered && (
          <button
            onClick={handleMarkDelivered}
            disabled={marking}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-900/10 text-emerald-300 text-sm font-medium border border-emerald-800/30 hover:bg-emerald-900/20 disabled:opacity-50 transition-colors"
          >
            {marking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            {marking ? 'Updating...' : 'Mark as Delivered'}
          </button>
        )}
        {isDelivered && (
          <div className="flex items-center gap-2 text-xs text-zinc-600">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
            Delivered
          </div>
        )}
      </div>
    </div>
  )
}
