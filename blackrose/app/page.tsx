import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import type { FeaturedProduct } from "@/lib/types"

export default async function Home() {
  const supabase = await createClient()

  const { data: featured } = await supabase
    .from("products")
    .select("id, name, slug, base_price, image_url, offer_text")
    .eq("featured", true)
    .order("created_at", { ascending: false })

  const featuredProducts = (featured ?? []) as FeaturedProduct[]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: "url('/images/blackrose-logo.jpeg')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-zinc-950" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
          <h1 className="text-5xl md:text-7xl font-serif text-foreground mb-6 tracking-wide uppercase">
            Elegance in Shadows
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl font-light">
            Discover our exclusive collection of luxury dark-themed floral arrangements,
            designed for those who find beauty in the unconventional.
          </p>
          <Link
            href="/shop"
            className="px-8 py-4 bg-foreground text-background font-medium tracking-widest uppercase hover:bg-rose-soft hover:text-background transition-colors duration-300"
          >
            Shop Collection
          </Link>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-4 uppercase tracking-wider">
            Featured
          </h2>
          <div className="h-px w-24 bg-rose-soft mx-auto" />
        </div>

        {featuredProducts.length === 0 ? (
          <div className="text-center text-zinc-500 py-16">
            <p className="font-light">No featured products yet.</p>
            <p className="text-sm mt-2 text-zinc-600">
              The admin can mark products as featured in the admin panel.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {featuredProducts.map((product) => (
              <div key={product.id} className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="aspect-[4/5] bg-zinc-900 relative overflow-hidden group flex items-center justify-center rounded-xl border border-white/5">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <span className="text-zinc-600 text-sm">No image</span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-rose-soft uppercase tracking-widest text-sm mb-2">
                    Featured Arrangement
                  </span>
                  <h3 className="text-3xl md:text-4xl font-serif text-foreground mb-4">
                    {product.name}
                  </h3>
                  {product.offer_text && (
                    <p className="text-zinc-400 mb-6 font-light leading-relaxed border-l-2 border-rose-200/30 pl-4 italic">
                      {product.offer_text}
                    </p>
                  )}
                  <div className="text-2xl text-foreground mb-8 font-serif">
                    ${Number(product.base_price).toFixed(2)}
                  </div>
                  <Link
                    href={`/product/${product.id ?? product.slug}`}
                    className="inline-block px-8 py-4 border border-foreground text-foreground text-center font-medium tracking-widest uppercase hover:bg-foreground hover:text-background transition-colors duration-300"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
