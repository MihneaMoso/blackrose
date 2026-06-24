'use client'

import type { Collection } from '@/lib/types'
import Link from 'next/link'
import { useState } from 'react'
import collections from '@/data/collections.json'

function CollectionCard({ collection }: { collection: Collection }) {
  const [imgError, setImgError] = useState(false)

  return (
    <Link
      href={`/collections/${collection.slug}`}
      className="group relative overflow-hidden aspect-[4/3] md:aspect-[3/2] bg-zinc-900 block"
    >
      {!imgError ? (
        <img
          src={collection.image_url}
          alt={collection.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-zinc-900">
          <span className="text-zinc-700 text-xs uppercase tracking-widest">
            {collection.name}
          </span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-serif text-rose-200">
          {collection.name}
        </h2>
        <p className="text-neutral-400 text-sm mt-2 leading-relaxed max-w-lg">
          {collection.description}
        </p>
        <span className="inline-block mt-4 text-xs uppercase tracking-widest text-neutral-300 group-hover:text-rose-200 transition-colors border-b border-neutral-600 group-hover:border-rose-200/50 pb-0.5">
          Explore Collection
        </span>
      </div>
    </Link>
  )
}

export default function CollectionsPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-14">
          <h1 className="text-4xl md:text-5xl font-serif text-rose-200 tracking-wide">
            Collections
          </h1>
          <p className="text-neutral-400 mt-3 max-w-xl text-sm leading-relaxed">
            Curated arrangements designed around a mood, a moment, or a memory.
            Explore each collection to find your signature bloom.
          </p>
          <div className="h-px w-16 bg-rose-200/40 mt-6" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {(collections as Collection[]).map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      </div>
    </div>
  )
}
