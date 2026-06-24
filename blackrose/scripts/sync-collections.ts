/**
 * Seed script: sync data/collections.json → Supabase `collections` table.
 *
 * Usage:
 *   npx tsx scripts/sync-collections.ts
 *
 * Requires env vars:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'
import collections from '../data/collections.json'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function sync() {
  console.log(`Syncing ${collections.length} collections…`)

  for (const collection of collections) {
    const { error } = await supabase.from('collections').upsert(
      {
        slug: collection.slug,
        name: collection.name,
        description: collection.description,
        image_url: collection.image_url,
      },
      { onConflict: 'slug', ignoreDuplicates: false }
    )

    if (error) {
      console.error(`  ✗ ${collection.slug}: ${error.message}`)
    } else {
      console.log(`  ✓ ${collection.slug}`)
    }
  }

  console.log('Done.')
}

sync()
