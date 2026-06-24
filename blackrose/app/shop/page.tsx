import { ProductGrid } from '@/components/product/ProductGrid'

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif text-rose-200 tracking-wide">
              Shop
            </h1>
            <div className="h-px w-16 bg-rose-200/40 mt-3" />
          </div>
        </div>
        <ProductGrid />
      </div>
    </div>
  )
}
