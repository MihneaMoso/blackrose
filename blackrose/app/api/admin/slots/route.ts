import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  if (!date) {
    return NextResponse.json({ error: 'Missing date parameter' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('delivery_slots')
    .select('*')
    .eq('delivery_date', date)
    .order('time_interval', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { delivery_date, time_interval, max_capacity }: Record<string, unknown> = body

  if (!delivery_date || !time_interval || max_capacity == null) {
    return NextResponse.json({ error: 'Missing required fields: delivery_date, time_interval, max_capacity' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('delivery_slots')
    .insert({
      delivery_date,
      time_interval,
      max_capacity: Number(max_capacity),
      current_bookings: 0,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
