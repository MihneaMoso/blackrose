import { notFound } from 'next/navigation';
import Link from 'next/link';

interface ProductVariant {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  variants: ProductVariant[];
  addons: ProductVariant[];
}

// Placeholder for fetching from E-commerce API (Square/Ecwid)
async function getProduct(id: string): Promise<Product | null> {
  // In a real app, this would use the SDK: await ecwid.products.get(id);
  // Simulating an API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id,
        name: 'The Obsidian Bloom',
        description: 'Our signature arrangement featuring rare black baccara roses, dark calla lilies, and delicate smoke bush accents. Perfect for making a profound statement.',
        price: 145.00,
        variants: [
          { id: 'v1', name: 'Standard size' },
          { id: 'v2', name: 'Deluxe size (+$30)' },
          { id: 'v3', name: 'Premium size (+$60)' }
        ],
        addons: [
          { id: 'a1', name: 'Add Hand-written Card (+$5)' },
          { id: 'a2', name: 'Silk Ribbon (+$10)' }
        ]
      });
    }, 500);
  });
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  // Assuming params.id is available, though Next.js 15 might require await
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
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
          <Link href="/shop" className="text-sm text-gray-400 hover:text-foreground uppercase tracking-widest mb-6 transition-colors">
            &larr; Back to Shop
          </Link>
          <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4">
            {product.name}
          </h1>
          <div className="text-2xl text-foreground mb-6 font-serif">
            ${product.price.toFixed(2)}
          </div>
          
          <p className="text-gray-400 font-light leading-relaxed mb-10">
            {product.description}
          </p>

          <div className="h-px w-full bg-gray-darker mb-10"></div>

          {/* Variants */}
          <div className="mb-8">
            <h3 className="text-sm uppercase tracking-widest text-gray-300 mb-4">Size</h3>
            <div className="space-y-3">
              {product.variants.map((variant: ProductVariant) => (
                <label key={variant.id} className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" name="size" value={variant.id} className="appearance-none w-4 h-4 rounded-full border border-gray-500 checked:border-rose-soft checked:bg-rose-soft transition-colors" />
                  <span className="text-gray-300 group-hover:text-foreground transition-colors">{variant.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Add-ons */}
          <div className="mb-10">
            <h3 className="text-sm uppercase tracking-widest text-gray-300 mb-4">Add-ons</h3>
            <div className="space-y-3">
              {product.addons.map((addon: ProductVariant) => (
                <label key={addon.id} className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" name="addons" value={addon.id} className="appearance-none w-4 h-4 border border-gray-500 checked:bg-rose-soft checked:border-rose-soft transition-colors" />
                  <span className="text-gray-300 group-hover:text-foreground transition-colors">{addon.name}</span>
                </label>
              ))}
            </div>
          </div>

          <button className="w-full py-4 bg-foreground text-background font-medium tracking-widest uppercase hover:bg-rose-soft hover:text-background transition-colors duration-300 mb-4">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}