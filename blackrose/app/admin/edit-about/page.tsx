'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, ArrowLeft, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import AboutEditor from '@/components/admin/AboutEditor'

export default function AdminEditAboutPage() {
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
            <FileText className="h-5 w-5 text-rose-accent" />
            <h1 className="font-serif text-xl text-rose-200 tracking-wide">
              Edit About Page
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
                  className="block px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-rose-200 hover:bg-white/5 transition-colors"
                >
                  Products
                </Link>
                <Link
                  href="/admin/edit-about"
                  className="block px-3 py-2 rounded-lg bg-rose-200/10 text-rose-200 text-sm font-medium"
                >
                  Edit About
                </Link>
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <div className="p-5 rounded-xl border border-white/5 bg-zinc-900/50">
              {/* {/* SQL setup instructions
              <div className="mb-6 p-4 rounded-lg bg-amber-900/10 border border-amber-800/20 text-sm text-zinc-400">
                <p className="font-medium text-amber-200 mb-2">
                  ⚡ Database Setup Required
                </p>
                <p className="mb-2">
                  Run this SQL in your Supabase SQL Editor to create the <code className="text-amber-200 bg-zinc-800 px-1.5 py-0.5 rounded">pages</code> table:
                </p>
                <pre className="bg-zinc-950 p-4 rounded-lg overflow-x-auto text-xs text-zinc-300 mt-2">
{`CREATE TABLE IF NOT EXISTS pages (
  slug TEXT PRIMARY KEY,
  content TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read pages"
  ON pages FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can insert/update pages"
  ON pages FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Seed the about page with default content
INSERT INTO pages (slug, content)
VALUES ('about', '')
ON CONFLICT (slug) DO NOTHING;`}
                </pre>
              </div> */}

              <AboutEditor />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
