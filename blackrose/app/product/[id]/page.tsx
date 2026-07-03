import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import type { Product } from '@/lib/types'
import ProductAddToCart from '@/components/product/ProductAddToCart'

async function getProduct(id: string): Promise<Product | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error || !data) return null
  return data as Product
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) {
    notFound()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex flex-col lg:flex-row gap-16">
        {/* Product Image */}
        <div className="w-full lg:w-1/2">
          <div className="aspect-[4/5] bg-zinc-900 relative overflow-hidden rounded-lg">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-zinc-600">No image</span>
              </div>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="w-full lg:w-1/2 flex flex-col pt-8">
          <Link
            href="/shop"
            className="text-sm text-zinc-400 hover:text-foreground uppercase tracking-widest mb-6 transition-colors"
          >
            &larr; Back to Shop
          </Link>

          <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4">
            {product.name}
          </h1>

          <p className="text-zinc-400 font-light leading-relaxed mb-10">
            {product.description}
          </p>

          <ProductAddToCart
            productId={product.id}
            productName={product.name}
            productImage={product.image_url ?? undefined}
            basePrice={Number(product.base_price)}
            variants={[]}
            addons={[]}
          />
        </div>
      </div>
    </div>
  )
}
