'use client'

/*
 * ── Supabase Storage Setup ──────────────────────────────────────────
 * Create the `product-images` bucket using the Supabase Dashboard:
 *
 *   1. Go to https://supabase.com/dashboard/project/<ref>/storage
 *   2. Click "New bucket"
 *   3. Name: product-images
 *   4. Public bucket: ✅ enabled
 *   5. Click "Create bucket"
 *   6. Go to the "Policies" tab for the bucket
 *   7. Click "New policy" and create these two:
 *
 *   ─ Policy for authenticated uploads:
 *     Policy name:  "Admin can upload images"
 *     Allowed operations: INSERT, UPDATE
 *     Target roles:       authenticated
 *     USING expression:   bucket_id = 'product-images'
 *     WITH CHECK expression: bucket_id = 'product-images'
 *
 *   ─ Policy for public viewing:
 *     Policy name:  "Anyone can view images"
 *     Allowed operations: SELECT
 *     Target roles:       public
 *     USING expression:   bucket_id = 'product-images'
 *
 * Alternatively, if your SQL user has the correct grants, use:
 *
 *   INSERT INTO storage.buckets (id, name, public)
 *   VALUES ('product-images', 'product-images', true)
 *   ON CONFLICT (id) DO NOTHING;
 *
 *   CREATE POLICY "Admin upload images" ON storage.objects FOR INSERT
 *     TO authenticated WITH CHECK (bucket_id = 'product-images');
 *   CREATE POLICY "Admin update images"  ON storage.objects FOR UPDATE
 *     TO authenticated USING (bucket_id = 'product-images');
 *   CREATE POLICY "Public view images"   ON storage.objects FOR SELECT
 *     TO public USING (bucket_id = 'product-images');
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, ArrowLeft, Package } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ProductList } from '@/components/admin/ProductList'

export default function AdminProductsPage() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const client = createClient()
    client.auth.getUser().then(({ data }) => {
      if (data?.user?.email) setUserEmail(data.user.email)
    })
  }, [])

  async function handleLogout() {
    const client = createClient()
    await client.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-zinc-950/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-rose-accent" />
            <h1 className="font-serif text-xl text-rose-200 tracking-wide">
              Product Management
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {userEmail && (
              <span className="text-xs text-zinc-500 hidden sm:block">
                {userEmail}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-zinc-400 hover:text-rose-200 hover:bg-white/5 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar */}
          <aside className="lg:w-80 shrink-0">
            <div className="p-5 rounded-xl border border-white/5 bg-zinc-900/50 space-y-4">
              <Link
                href="/admin"
                className="flex items-center gap-2 text-sm text-zinc-400 hover:text-rose-200 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>

              <nav className="space-y-1">
                <Link
                  href="/admin/products"
                  className="block px-3 py-2 rounded-lg bg-rose-200/10 text-rose-200 text-sm font-medium"
                >
                  Products
                </Link>
                <Link
                  href="/admin/edit-about"
                  className="block px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-rose-200 hover:bg-white/5 transition-colors"
                >
                  Edit About
                </Link>
                <Link
                  href="/admin/orders"
                  className="block px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-rose-200 hover:bg-white/5 transition-colors"
                >
                  Orders
                </Link>
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <div className="p-5 rounded-xl border border-white/5 bg-zinc-900/50">
              <ProductList />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
