import { createAdminClient } from '@/lib/supabase/admin'
import Stripe from 'stripe'

export async function POST(request: Request) {
  try {
    const key = process.env.STRIPE_SECRET_KEY
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!key || !webhookSecret) {
      return new Response('Stripe is not configured', { status: 500 })
    }
    const stripe = new Stripe(key, {
      apiVersion: '2026-05-27.dahlia',
    })

    const rawBody = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return new Response('Missing stripe-signature header', { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret
      )
    } catch {
      return new Response('Invalid signature', { status: 400 })
    }

    if (event.type !== 'checkout.session.completed') {
      return new Response('Unhandled event type', { status: 200 })
    }

    const session = event.data.object as Stripe.Checkout.Session
    const metadata = session.metadata ?? {}

    const userId = metadata.user_id || null
    const deliveryDate = metadata.delivery_date ?? ''
    const deliveryTimeSlot = metadata.delivery_time_slot ?? ''
    const deliverySlotId = metadata.delivery_slot_id ?? ''
    const deliveryAddress = metadata.delivery_address ?? ''
    const deliveryCity = metadata.delivery_city ?? ''
    const deliveryPostal = metadata.delivery_postal ?? ''
    const customerName = metadata.customer_name ?? ''
    const customerPhone = metadata.customer_phone ?? ''
    const notes = metadata.notes ?? ''
    const customConfigJSON = metadata.custom_config_json ?? '{}'

    const supabase = createAdminClient()

    const { error: orderError } = await supabase.from('orders').insert({
      stripe_session_id: session.id,
      stripe_payment_intent: session.payment_intent,
      amount_total: session.amount_total,
      currency: session.currency,
      user_id: userId,
      customer_name: customerName,
      customer_email: session.customer_details?.email ?? '',
      customer_phone: customerPhone,
      delivery_date: deliveryDate,
      delivery_time_slot: deliveryTimeSlot,
      delivery_slot_id: deliverySlotId || null,
      delivery_address: deliveryAddress,
      delivery_city: deliveryCity,
      delivery_postal: deliveryPostal,
      notes,
      custom_config_json: customConfigJSON,
      order_status: 'paid',
      created_at: new Date().toISOString(),
    })

    if (orderError) {
      return new Response(
        `Failed to create order: ${orderError.message}`,
        { status: 500 }
      )
    }

    if (deliverySlotId) {
      const { error: rpcError } = await supabase.rpc(
        'increment_slot_bookings',
        { slot_id: deliverySlotId }
      )

      if (rpcError) {
        const { data: slot, error: fetchError } = await supabase
          .from('delivery_slots')
          .select('current_bookings')
          .eq('id', deliverySlotId)
          .single()

        if (fetchError) {
          return new Response(
            `Order created but failed to fetch slot: ${fetchError.message}`,
            { status: 500 }
          )
        }

        const { error: updateError } = await supabase
          .from('delivery_slots')
          .update({
            current_bookings: (slot.current_bookings ?? 0) + 1,
          })
          .eq('id', deliverySlotId)

        if (updateError) {
          return new Response(
            `Order created but failed to update slot: ${updateError.message}`,
            { status: 500 }
          )
        }
      }
    }

    return new Response('OK', { status: 200 })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Internal server error'
    return new Response(`Webhook error: ${message}`, { status: 500 })
  }
}
