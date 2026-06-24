/**
 * Seed script: insert sample products linked to collections.
 *
 * Usage:
 *   npx tsx scripts/seed-products.ts
 *
 * Requires env vars:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const products = [
  // Dark Romance
  { name: 'Obsidian Rose Bouquet', slug: 'obsidian-rose-bouquet', description: 'A dozen black baccara roses wrapped in charcoal silk.', base_price: 145.00, collection_slug: 'dark-romance' },
  { name: 'Crimson Velvet', slug: 'crimson-velvet', description: 'Deep red roses with black lace detailing and eucalyptus stems.', base_price: 120.00, collection_slug: 'dark-romance' },
  { name: 'Heart of Darkness', slug: 'heart-of-darkness', description: 'A dramatic arrangement of black dahlias, deep red peonies, and cascading ivy.', base_price: 175.00, collection_slug: 'dark-romance' },
  // Midnight Garden
  { name: 'Lunar Bloom', slug: 'lunar-bloom', description: 'Indigo hydrangeas paired with silver brunia and white moon orchids.', base_price: 130.00, collection_slug: 'midnight-garden' },
  { name: 'Stargazer', slug: 'stargazer', description: 'Deep purple lisianthus, starry white waxflower, and twilight-blue thistle.', base_price: 110.00, collection_slug: 'midnight-garden' },
  { name: 'Nocturne', slug: 'nocturne', description: 'A monochrome indigo arrangement with dusty miller and silver eucalyptus.', base_price: 155.00, collection_slug: 'midnight-garden' },
  // Shadow Bloom
  { name: 'Charcoal & Smoke', slug: 'charcoal-smoke', description: 'Sculptural dried pampas, black miscanthus, and smoked eucalyptus in a matte vessel.', base_price: 95.00, collection_slug: 'shadow-bloom' },
  { name: 'Dark Matter', slug: 'dark-matter', description: 'Minimalist black orchid stems arranged in a geometric ceramic.', base_price: 140.00, collection_slug: 'shadow-bloom' },
  { name: 'Silhouette', slug: 'silhouette', description: 'Bold black calla lilies and dark anemones with trailing ivy.', base_price: 125.00, collection_slug: 'shadow-bloom' },
  // Velvet Noir
  { name: 'Monochrome Rose', slug: 'monochrome-rose', description: 'A dozen black velvet roses in a matte black ceramic vase.', base_price: 160.00, collection_slug: 'velvet-noir' },
  { name: 'Smoke & Mirrors', slug: 'smoke-mirrors', description: 'Charcoal grey roses, dusty pink accents, and bunny tail grass.', base_price: 115.00, collection_slug: 'velvet-noir' },
  { name: 'Onyx Cascade', slug: 'onyx-cascade', description: 'Cascading black orchids and gunmetal foliage in a waterfall arrangement.', base_price: 190.00, collection_slug: 'velvet-noir' },
  // Gothic Elegance
  { name: 'Victorian Rose', slug: 'victorian-rose', description: 'Heirloom garden roses with dried lavender, preserved moss, and antique ribbon.', base_price: 135.00, collection_slug: 'gothic-elegance' },
  { name: 'Wilted Garden', slug: 'wilted-garden', description: 'Dried hydrangeas, preserved ferns, and black pearl everlasting flowers.', base_price: 98.00, collection_slug: 'gothic-elegance' },
  { name: 'Cathedral', slug: 'cathedral', description: 'Tall gothic arrangement of dark foxglove, monkshood, and trailing Amaranthus.', base_price: 180.00, collection_slug: 'gothic-elegance' },
  // Black Orchid
  { name: 'Black Orchid Stem', slug: 'black-orchid-stem', description: 'A single rare black orchid in a hand-blown glass vial.', base_price: 65.00, collection_slug: 'black-orchid' },
  { name: 'Tropical Noir', slug: 'tropical-noir', description: 'Black orchids, deep burgundy anthurium, and monstera leaves in a tropical dark arrangement.', base_price: 170.00, collection_slug: 'black-orchid' },
  { name: 'Exotic Bloom', slug: 'exotic-bloom', description: 'Rare dark heliconia, black bat flowers, and protea in an oversized ceramic.', base_price: 210.00, collection_slug: 'black-orchid' },
]

async function seed() {
  console.log(`Seeding ${products.length} products…`)

  for (const product of products) {
    const { error } = await supabase.from('products').upsert(
      { ...product, image_url: null },
      { onConflict: 'slug', ignoreDuplicates: false }
    )

    if (error) {
      console.error(`  ✗ ${product.slug}: ${error.message}`)
    } else {
      console.log(`  ✓ ${product.slug}`)
    }
  }

  console.log('Done.')
}

seed()
