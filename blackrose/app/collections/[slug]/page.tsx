'use client'

import { ProductGrid } from '@/components/product/ProductGrid'
import type { Collection } from '@/lib/types'
import collections from '@/data/collections.json'
import { notFound } from 'next/navigation'
import { use } from 'react'

export default function CollectionProductsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const collection = (collections as Collection[]).find(
    (c) => c.slug === slug
  )

  if (!collection) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Collection header */}
        <div className="mb-14">
          <span className="text-xs uppercase tracking-widest text-neutral-500">
            Collection
          </span>
          <h1 className="text-4xl md:text-5xl font-serif text-rose-200 mt-1 tracking-wide">
            {collection.name}
          </h1>
          <p className="text-neutral-400 mt-3 max-w-2xl text-sm leading-relaxed">
            {collection.description}
          </p>
          <div className="h-px w-16 bg-rose-200/40 mt-6" />
        </div>

        {/* Product grid filtered by collection */}
        <ProductGrid
          filterColumn="collection_slug"
          filterValue={slug}
          showSort={false}
        />
      </div>
    </div>
  )
}
