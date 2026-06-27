import { notFound } from 'next/navigation'
import Link from 'next/link'
import ProductAddToCart from '@/components/product/ProductAddToCart'

interface VariantData {
  id: string
  name: string
  priceAdjustment: number
}

interface AddonData {
  id: string
  name: string
  price: number
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  image?: string
  variants: VariantData[]
  addons: AddonData[]
}

async function getProduct(id: string): Promise<Product | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id,
        name: 'The Obsidian Bloom',
        description:
          'Our signature arrangement featuring rare black baccara roses, dark calla lilies, and delicate smoke bush accents. Perfect for making a profound statement.',
        price: 145.0,
        variants: [
          { id: 'v1', name: 'Standard size', priceAdjustment: 0 },
          { id: 'v2', name: 'Deluxe size', priceAdjustment: 30 },
          { id: 'v3', name: 'Premium size', priceAdjustment: 60 },
        ],
        addons: [
          { id: 'a1', name: 'Hand-written Card', price: 5 },
          { id: 'a2', name: 'Silk Ribbon', price: 10 },
          { id: 'a3', name: 'Extra Black Rose Stem', price: 15 },
        ],
      })
    }, 500)
  })
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
          <div className="aspect-[4/5] bg-gray-dark relative overflow-hidden flex items-center justify-center">
            <span className="text-gray-500">[ Product Image Grid ]</span>
          </div>
        </div>

        {/* Product Details */}
        <div className="w-full lg:w-1/2 flex flex-col pt-8">
          <Link
            href="/shop"
            className="text-sm text-gray-400 hover:text-foreground uppercase tracking-widest mb-6 transition-colors"
          >
            &larr; Back to Shop
          </Link>

          <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4">
            {product.name}
          </h1>

          <p className="text-gray-400 font-light leading-relaxed mb-10">
            {product.description}
          </p>

          <ProductAddToCart
            productId={product.id}
            productName={product.name}
            basePrice={product.price}
            variants={product.variants}
            addons={product.addons}
          />
        </div>
      </div>
    </div>
  )
}
