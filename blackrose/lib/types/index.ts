export interface VariantSelection {
  id: string
  name: string
  priceAdjustment: number
}

export interface AddonSelection {
  id: string
  name: string
  price: number
}

export interface CartItem {
  id: string
  productId: string
  productName: string
  productImage?: string
  basePrice: number
  selectedVariant: VariantSelection | null
  selectedAddons: AddonSelection[]
  customConfig: Record<string, unknown>
  quantity: number
}

export interface CheckoutDetails {
  name: string
  email: string
  phone: string
  deliveryDate: string | null
  deliveryTimeSlot: string | null
  deliverySlotId: string | null
  deliveryAddress: string
  city: string
  postalCode: string
  notes: string
}

export const DEFAULT_CHECKOUT: CheckoutDetails = {
  name: '',
  email: '',
  phone: '',
  deliveryDate: null,
  deliveryTimeSlot: null,
  deliverySlotId: null,
  deliveryAddress: '',
  city: '',
  postalCode: '',
  notes: '',
}

export interface DeliverySlot {
  id: string
  delivery_date: string
  time_interval: string
  current_bookings: number
  max_capacity: number
}

export interface DateGroup {
  delivery_date: string
  slots: DeliverySlot[]
}

export interface Product {
  id: string
  name: string
  slug: string | null
  description: string
  base_price: number
  image_url: string | null
  collection_slug: string | null
  featured: boolean | null
  offer_text: string | null
  created_at: string
}

export interface FeaturedProduct {
  id: string
  name: string
  slug: string | null
  base_price: number
  image_url: string | null
  offer_text: string | null
}

export interface Order {
  id: string
  stripe_session_id: string
  stripe_payment_intent: string | null
  amount_total: number | null
  currency: string | null
  user_id: string | null
  customer_name: string
  customer_email: string
  customer_phone: string
  delivery_date: string
  delivery_time_slot: string
  delivery_slot_id: string | null
  delivery_address: string
  delivery_city: string
  delivery_postal: string
  notes: string
  custom_config_json: string
  order_status: 'paid' | 'delivered'
  created_at: string
}

export interface OrderLineItem {
  productId: string
  productName: string
  variant: { id: string; name: string; priceAdjustment: number } | null
  addons: { id: string; name: string; price: number }[]
  quantity: number
  unitPrice: number
}

export interface Collection {
  id: string
  slug: string
  name: string
  description: string
  image_url: string
}

export interface CheckoutSummaryItem {
  item: CartItem
  unitPrice: number
  totalPrice: number
}

export interface CheckoutSummary {
  items: CheckoutSummaryItem[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  checkoutDetails: CheckoutDetails
  customConfigJSON: string
}
