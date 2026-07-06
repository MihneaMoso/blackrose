'use client'

import DeliveryScheduler from '@/components/checkout/DeliveryScheduler'
import { useCart } from '@/lib/context/cart-context'
import Link from 'next/link'
import { useState } from 'react'

export default function CartPage() {
  const {
    items,
    itemCount,
    summary,
    checkout,
    removeItem,
    updateQuantity,
    updateCheckout,
  } = useCart()

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deliveryReady = !!(checkout.deliveryDate && checkout.deliveryTimeSlot)

  // ── Empty state ────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <svg
              viewBox="0 0 80 80"
              fill="none"
              className="w-20 h-20 mx-auto text-zinc-800"
              stroke="currentColor"
              strokeWidth="0.5"
            >
              <circle cx="40" cy="40" r="36" stroke="currentColor" fill="none" />
              <path d="M30 35 Q40 25 50 35" stroke="currentColor" fill="none" strokeLinecap="round" />
              <path d="M28 45 Q40 55 52 45" stroke="currentColor" fill="none" strokeLinecap="round" />
              <line x1="35" y1="50" x2="35" y2="55" stroke="currentColor" strokeLinecap="round" />
              <line x1="45" y1="50" x2="45" y2="55" stroke="currentColor" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-serif text-rose-200 mb-3 tracking-wide">
            Your basket is empty
          </h1>
          <p className="text-neutral-500 text-sm mb-10 leading-relaxed">
            It seems you haven&apos;t added any blooms yet. Explore our collection
            and find the perfect arrangement.
          </p>
          <Link
            href="/shop"
            className="inline-block px-8 py-4 border border-zinc-700 text-neutral-200 text-xs uppercase tracking-widest hover:border-rose-200/50 hover:text-rose-200 transition-colors duration-300"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  // ── Cart layout ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl md:text-4xl font-serif text-rose-200 tracking-wide">
            Your Cart
          </h1>
          <span className="text-neutral-500 text-xs uppercase tracking-widest">
            {itemCount} item{itemCount !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
          {/* ── Left: Cart Items ───────────────────────────── */}
          <div className="lg:col-span-3 space-y-5">
            {items.map((item) => {
              const unitPrice =
                summary.items.find((i) => i.item.id === item.id)
                  ?.unitPrice ?? item.basePrice
              const totalPrice = unitPrice * item.quantity

              const variantText = item.selectedVariant?.name
              const addonsText = item.selectedAddons.map((a) => a.name)

              return (
                <div
                  key={item.id}
                  className="flex gap-5 p-5 border border-zinc-800 bg-zinc-900/30"
                >
                  {/* Image */}
                  <div className="w-20 h-24 sm:w-24 sm:h-28 bg-zinc-800 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {item.productImage ? (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-zinc-700 text-[10px] uppercase tracking-widest text-center px-1 leading-relaxed">
                        {item.productName}
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <Link
                        href={`/product/${item.productId}`}
                        className="text-neutral-200 font-serif text-base hover:text-rose-200 transition-colors"
                      >
                        {item.productName}
                      </Link>
                      {variantText && (
                        <p className="text-neutral-500 text-xs mt-1">
                          {variantText}
                        </p>
                      )}
                      {addonsText.length > 0 && (
                        <p className="text-neutral-500 text-xs mt-0.5">
                          Add-on: {addonsText.join(', ')}
                        </p>
                      )}
                    </div>

                    {/* Controls row */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-zinc-700">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          className="px-3 py-1.5 text-neutral-400 hover:text-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm leading-none"
                        >
                          −
                        </button>
                        <span className="px-3 py-1.5 text-neutral-200 text-sm min-w-[2rem] text-center tabular-nums leading-none">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="px-3 py-1.5 text-neutral-400 hover:text-neutral-200 transition-colors text-sm leading-none"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-neutral-200 text-sm font-mono">
                          ${totalPrice.toFixed(2)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-neutral-600 text-[10px] mt-0.5">
                            ${unitPrice.toFixed(2)} each
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="self-start mt-2 text-[10px] uppercase tracking-widest text-neutral-600 hover:text-rose-200 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── Right: Checkout Summary ────────────────────── */}
          <div className="lg:col-span-2 lg:sticky lg:top-24 space-y-6">
            {/* Summary box */}
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 sm:p-8">
              <h2 className="text-lg font-serif text-rose-200 mb-6 tracking-wide">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-neutral-400">
                  <span>
                    Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})
                  </span>
                  <span className="text-neutral-200 font-mono">
                    ${summary.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Shipping</span>
                  <span className="font-mono">
                    {summary.shipping === 0 ? (
                      <span className="text-rose-200">FREE</span>
                    ) : (
                      `$${summary.shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Estimated Tax</span>
                  <span className="text-neutral-200 font-mono">
                    ${summary.tax.toFixed(2)}
                  </span>
                </div>
                <div className="h-px bg-zinc-800 my-3" />
                <div className="flex justify-between text-neutral-200 font-serif text-lg">
                  <span>Total</span>
                  <span className="font-mono">
                    ${summary.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Scheduler */}
            <DeliveryScheduler />

            {/* Order Notes */}
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 sm:p-8">
              <label
                htmlFor="order-notes"
                className="block text-sm font-serif text-rose-200 mb-3 tracking-wide"
              >
                Order Notes
              </label>
              <textarea
                id="order-notes"
                value={checkout.notes}
                onChange={(e) =>
                  updateCheckout({ notes: e.target.value })
                }
                rows={3}
                placeholder="Special instructions, delivery preferences, or anything else we should know..."
                className="w-full px-4 py-3 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm placeholder-zinc-600 focus:outline-none focus:border-rose-200/40 transition-colors resize-none"
              />
              <p className="text-xs text-zinc-600 mt-2">
                Optional — add any extra information for your order.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="border border-rose-200/20 bg-rose-200/5 px-5 py-4">
                <p className="text-rose-200 text-sm">{error}</p>
              </div>
            )}

            {/* Proceed button */}
            <button
              onClick={handleCheckout}
              disabled={!deliveryReady || submitting}
              className="w-full py-4 bg-foreground text-background font-medium tracking-widest uppercase text-sm hover:bg-rose-soft hover:text-background transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {submitting ? (
                <>
                  <span className="inline-block w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                'Proceed to Payment'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // ── Checkout handler ───────────────────────────────────────
  async function handleCheckout() {
    if (!deliveryReady || submitting) return
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          checkoutDetails: checkout,
          userId: null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong')
        setSubmitting(false)
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      setError('A network error occurred. Please try again.')
      setSubmitting(false)
    }
  }
}
