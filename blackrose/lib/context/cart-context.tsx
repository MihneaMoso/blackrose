'use client'

import type { CartItem, CheckoutDetails, CheckoutSummary } from '@/lib/types'
import { DEFAULT_CHECKOUT } from '@/lib/types'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

const STORAGE_KEY = 'blackrose-cart'
const CHECKOUT_KEY = 'blackrose-checkout'

interface CartContextValue {
  items: CartItem[]
  itemCount: number
  subtotal: number
  checkout: CheckoutDetails
  summary: CheckoutSummary
  isOpen: boolean
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  updateCustomConfig: (id: string, config: Record<string, unknown>) => void
  clearCart: () => void
  updateCheckout: (details: Partial<CheckoutDetails>) => void
  resetCheckout: () => void
  setIsOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

function loadCheckout(): CheckoutDetails {
  if (typeof window === 'undefined') return { ...DEFAULT_CHECKOUT }
  try {
    const raw = localStorage.getItem(CHECKOUT_KEY)
    return raw
      ? ({ ...DEFAULT_CHECKOUT, ...JSON.parse(raw) } as CheckoutDetails)
      : { ...DEFAULT_CHECKOUT }
  } catch {
    return { ...DEFAULT_CHECKOUT }
  }
}

function generateId(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function computeUnitPrice(item: CartItem): number {
  return (
    item.basePrice +
    (item.selectedVariant?.priceAdjustment ?? 0) +
    item.selectedAddons.reduce((sum, a) => sum + a.price, 0)
  )
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [checkout, setCheckout] = useState<CheckoutDetails>({ ...DEFAULT_CHECKOUT })
  const [isOpen, setIsOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
    setItems(loadCart())
    setCheckout(loadCheckout())
  }, [])

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    }
  }, [items, hydrated])

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(CHECKOUT_KEY, JSON.stringify(checkout))
    }
  }, [checkout, hydrated])

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  )

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + computeUnitPrice(item) * item.quantity,
        0
      ),
    [items]
  )

  const summary = useMemo((): CheckoutSummary => {
    const itemSummaries = items.map((item) => {
      const unitPrice = computeUnitPrice(item)
      return { item, unitPrice, totalPrice: unitPrice * item.quantity }
    })

    const sub = itemSummaries.reduce((sum, i) => sum + i.totalPrice, 0)
    const tax = sub * 0.08
    const shipping = sub >= 100 ? 0 : 12

    const customConfigJSON = JSON.stringify(
      items.reduce(
        (acc, item) => ({
          ...acc,
          [item.id]: {
            productId: item.productId,
            productName: item.productName,
            variant: item.selectedVariant,
            addons: item.selectedAddons,
            customConfig: item.customConfig,
            quantity: item.quantity,
            unitPrice: computeUnitPrice(item),
          },
        }),
        {} as Record<string, unknown>
      )
    )

    return {
      items: itemSummaries,
      subtotal: sub,
      tax,
      shipping,
      total: sub + tax + shipping,
      checkoutDetails: checkout,
      customConfigJSON,
    }
  }, [items, checkout])

  const addItem = useCallback((item: Omit<CartItem, 'id'>) => {
    const id = generateId()
    setItems((prev) => [...prev, { ...item, id }])
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) return
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    )
  }, [])

  const updateCustomConfig = useCallback(
    (id: string, config: Record<string, unknown>) => {
      setItems((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, customConfig: { ...i.customConfig, ...config } } : i
        )
      )
    },
    []
  )

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const updateCheckout = useCallback(
    (details: Partial<CheckoutDetails>) => {
      setCheckout((prev) => ({ ...prev, ...details }))
    },
    []
  )

  const resetCheckout = useCallback(() => {
    setCheckout({ ...DEFAULT_CHECKOUT })
  }, [])

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        checkout,
        summary,
        isOpen,
        addItem,
        removeItem,
        updateQuantity,
        updateCustomConfig,
        clearCart,
        updateCheckout,
        resetCheckout,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
