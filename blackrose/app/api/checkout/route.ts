import { type CartItem, type CheckoutDetails } from '@/lib/types'
import Stripe from 'stripe'

function computeUnitPrice(item: CartItem): number {
  return (
    item.basePrice +
    (item.selectedVariant?.priceAdjustment ?? 0) +
    item.selectedAddons.reduce((sum, a) => sum + a.price, 0)
  )
}

interface CheckoutRequest {
  items: CartItem[]
  checkoutDetails: CheckoutDetails
  userId: string | null
}

export async function POST(request: Request) {
  try {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) {
      return Response.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      )
    }
    const stripe = new Stripe(key, {
      apiVersion: '2026-06-24.dahlia',
    })

    const body: CheckoutRequest = await request.json()
    const { items, checkoutDetails, userId } = body

    if (!items || items.length === 0) {
      return Response.json({ error: 'Cart is empty' }, { status: 400 })
    }
    if (
      !checkoutDetails.deliveryDate ||
      !checkoutDetails.deliveryTimeSlot
    ) {
      return Response.json(
        { error: 'Delivery date and time slot are required' },
        { status: 400 }
      )
    }

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] =
      items.map((item) => {
        const unitPrice = computeUnitPrice(item)
        const variantLabel = item.selectedVariant
          ? ` (${item.selectedVariant.name})`
          : ''
        const addonsLabel = item.selectedAddons
          .map((a) => ` + ${a.name}`)
          .join('')

        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${item.productName}${variantLabel}`,
              description: addonsLabel || undefined,
            },
            unit_amount: Math.round(unitPrice * 100),
          },
          quantity: item.quantity,
        }
      })

    const subtotal = items.reduce(
      (sum, item) => sum + computeUnitPrice(item) * item.quantity,
      0
    )
    const shippingCost = subtotal >= 100 ? 0 : 1200

    if (shippingCost > 0) {
      line_items.push({
        price_data: {
          currency: 'usd',
          product_data: { name: 'Shipping' },
          unit_amount: shippingCost,
        },
        quantity: 1,
      })
    }

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

    const origin = request.headers.get('origin') ?? 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      customer_email: checkoutDetails.email || undefined,
      metadata: {
        user_id: userId ?? '',
        delivery_date: checkoutDetails.deliveryDate,
        delivery_time_slot: checkoutDetails.deliveryTimeSlot,
        delivery_slot_id: checkoutDetails.deliverySlotId ?? '',
        delivery_address: checkoutDetails.deliveryAddress,
        delivery_city: checkoutDetails.city,
        delivery_postal: checkoutDetails.postalCode,
        customer_name: checkoutDetails.name,
        customer_phone: checkoutDetails.phone,
        notes: checkoutDetails.notes,
        custom_config_json: customConfigJSON,
      },
      success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
    })

    return Response.json({ url: session.url })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Internal server error'
    return Response.json({ error: message }, { status: 500 })
  }
}
