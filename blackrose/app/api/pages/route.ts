import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug') ?? 'about'

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('pages')
    .select('content')
    .eq('slug', slug)
    .single()

  if (error && error.code !== 'PGRST116') {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ content: data?.content ?? '' })
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { slug, content } = await request.json()
  if (!slug || typeof content !== 'string') {
    return Response.json({ error: 'slug and content are required' }, { status: 400 })
  }

  const { error } = await supabase.from('pages').upsert(
    { slug, content },
    { onConflict: 'slug' }
  )

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ success: true })
}
