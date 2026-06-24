-- ============================================================
-- Migration: Add collections support and missing columns
-- Run this in your Supabase SQL editor
-- ============================================================

-- 1. Collections table
create table if not exists collections (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  name text not null,
  description text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Add columns to products (safe — IF NOT EXISTS style via DO block)
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'products' and column_name = 'slug'
  ) then
    alter table products add column slug text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_name = 'products' and column_name = 'collection_slug'
  ) then
    alter table products add column collection_slug text;
  end if;
end $$;

-- 2b. Unique constraint on products.slug (required for ON CONFLICT)
create unique index if not exists idx_products_slug on products (slug);

-- 3. Seed collections from data/collections.json
insert into collections (slug, name, description, image_url) values
  ('dark-romance',     'Dark Romance',     'Deep crimson and black roses intertwined with velvety foliage for a love that defies convention.',       '/images/dark-romance.webp'),
  ('midnight-garden',  'Midnight Garden',  'Lunar blooms in indigo and silver — an enchanted nocturne captured in petals.',                          '/images/midnight-garden.webp'),
  ('shadow-bloom',     'Shadow Bloom',     'Dramatic silhouettes of sculptural flora for the modern minimalist aesthetic.',                          '/images/shadow-bloom.webp'),
  ('velvet-noir',      'Velvet Noir',      'Plush dark petals in monochrome, accented with touches of charcoal and smoke.',                          '/images/velvet-noir.webp'),
  ('gothic-elegance',  'Gothic Elegance',  'Victorian-inspired arrangements of dark florals, dried botanicals, and antique textures.',                 '/images/gothic-elegance.webp'),
  ('black-orchid',     'Black Orchid',     'Rare and exotic — a collection built around the enigmatic black orchid and tropical rarities.',           '/images/black-orchid.webp')
on conflict (slug) do update set
  name        = excluded.name,
  description = excluded.description,
  image_url   = excluded.image_url;

-- 4. Seed sample products for each collection
insert into products (name, slug, description, base_price, collection_slug, image_url) values
  -- Dark Romance
  ('Obsidian Rose Bouquet',    'obsidian-rose-bouquet',    'A dozen black baccara roses wrapped in charcoal silk.',                                    145.00, 'dark-romance',    null),
  ('Crimson Velvet',          'crimson-velvet',           'Deep red roses with black lace detailing and eucalyptus stems.',                             120.00, 'dark-romance',    null),
  ('Heart of Darkness',       'heart-of-darkness',        'A dramatic arrangement of black dahlias, deep red peonies, and cascading ivy.',             175.00, 'dark-romance',    null),

  -- Midnight Garden
  ('Lunar Bloom',             'lunar-bloom',              'Indigo hydrangeas paired with silver brunia and white moon orchids.',                        130.00, 'midnight-garden', null),
  ('Stargazer',               'stargazer',                'Deep purple lisianthus, starry white waxflower, and twilight-blue thistle.',                110.00, 'midnight-garden', null),
  ('Nocturne',                'nocturne',                 'A monochrome indigo arrangement with dusty miller and silver eucalyptus.',                  155.00, 'midnight-garden', null),

  -- Shadow Bloom
  ('Charcoal & Smoke',        'charcoal-smoke',           'Sculptural dried pampas, black miscanthus, and smoked eucalyptus in a matte vessel.',        95.00,  'shadow-bloom',    null),
  ('Dark Matter',             'dark-matter',              'Minimalist black orchid stems arranged in a geometric ceramic.',                             140.00, 'shadow-bloom',    null),
  ('Silhouette',              'silhouette',               'Bold black calla lilies and dark anemones with trailing ivy.',                               125.00, 'shadow-bloom',    null),

  -- Velvet Noir
  ('Monochrome Rose',         'monochrome-rose',          'A dozen black velvet roses in a matte black ceramic vase.',                                  160.00, 'velvet-noir',     null),
  ('Smoke & Mirrors',         'smoke-mirrors',            'Charcoal grey roses, dusty pink accents, and bunny tail grass.',                             115.00, 'velvet-noir',     null),
  ('Onyx Cascade',            'onyx-cascade',             'Cascading black orchids and gunmetal foliage in a waterfall arrangement.',                   190.00, 'velvet-noir',     null),

  -- Gothic Elegance
  ('Victorian Rose',          'victorian-rose',           'Heirloom garden roses with dried lavender, preserved moss, and antique ribbon.',            135.00, 'gothic-elegance', null),
  ('Wilted Garden',           'wilted-garden',            'Dried hydrangeas, preserved ferns, and black pearl everlasting flowers.',                    98.00,  'gothic-elegance', null),
  ('Cathedral',               'cathedral',                'Tall gothic arrangement of dark foxglove, monkshood, and trailing Amaranthus.',             180.00, 'gothic-elegance', null),

  -- Black Orchid
  ('Black Orchid Stem',       'black-orchid-stem',        'A single rare black orchid in a hand-blown glass vial.',                                     65.00,  'black-orchid',    null),
  ('Tropical Noir',           'tropical-noir',            'Black orchids, deep burgundy anthurium, and monstera leaves in a tropical dark arrangement.', 170.00, 'black-orchid',    null),
  ('Exotic Bloom',            'exotic-bloom',             'Rare dark heliconia, black bat flowers, and protea in an oversized ceramic.',                210.00, 'black-orchid',    null)
on conflict (slug) do nothing;

-- 5. Generate slugs for any products that are missing them
update products
set slug = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))
where slug is null;
