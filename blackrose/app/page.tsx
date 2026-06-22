import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-gray-darker flex items-center justify-center opacity-50">
             <span className="text-gray-500">[ Hero Image: Dark Moody Bouquet ]</span>
          </div>
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

      {/* Featured Bouquet Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-4 uppercase tracking-wider">
            Featured Creation
          </h2>
          <div className="h-px w-24 bg-rose-soft mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="aspect-[4/5] bg-gray-dark relative overflow-hidden group flex items-center justify-center">
             <span className="text-gray-500">[ Featured Product Image ]</span>
          </div>
          <div className="flex flex-col">
            <span className="text-rose-soft uppercase tracking-widest text-sm mb-2">Signature Arrangement</span>
            <h3 className="text-4xl font-serif text-foreground mb-4">The Obsidian Bloom</h3>
            <p className="text-gray-400 mb-8 font-light leading-relaxed">
              Our signature arrangement featuring rare black baccara roses, dark calla lilies, 
              and delicate smoke bush accents. Perfect for making a profound statement.
            </p>
            <div className="text-2xl text-foreground mb-8 font-serif">
              $145.00
            </div>
            <Link 
              href="/product/obsidian-bloom" 
              className="inline-block px-8 py-4 border border-foreground text-foreground text-center font-medium tracking-widest uppercase hover:bg-foreground hover:text-background transition-colors duration-300"
            >
              View Details
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}