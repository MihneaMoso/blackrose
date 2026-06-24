'use client'

import type { Product } from '@/lib/types'
import Link from 'next/link'
import { useState } from 'react'

export function ProductCard({ product }: { product: Product }) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  return (
    <Link
      href={`/product/${product.id}`}
      className="group block"
    >
      <div className="aspect-[4/5] relative overflow-hidden bg-zinc-800">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-zinc-800 animate-pulse" />
        )}
        {product.image_url && !imageError ? (
          <img
            src={product.image_url}
            alt={product.name}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-800">
            <span className="text-zinc-600 text-xs uppercase tracking-widest">
              {imageError ? 'No Image' : 'Black Rose'}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
          <span className="text-white/0 group-hover:text-white/90 transition-all duration-300 text-xs uppercase tracking-widest border border-white/0 group-hover:border-white/80 px-6 py-3">
            View Details
          </span>
        </div>
      </div>
      <div className="mt-4 space-y-1 px-1">
        <h3 className="text-neutral-200 font-serif text-lg leading-tight group-hover:text-rose-200 transition-colors">
          {product.name}
        </h3>
        <p className="text-neutral-400 text-sm">
          ${product.base_price.toFixed(2)}
        </p>
      </div>
    </Link>
  )
}
