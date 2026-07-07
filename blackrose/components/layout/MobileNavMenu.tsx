'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { Menu, X } from 'lucide-react'

const LINKS = [
  { href: '/shop', label: 'Shop' },
  { href: '/collections', label: 'Collections' },
  { href: '/about', label: 'About' },
]

export function MobileNavMenu() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div ref={menuRef} className="sm:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-foreground hover:text-rose-soft transition-colors"
        aria-label={open ? 'Close menu' : 'Open menu'}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div className="fixed inset-x-0 top-16 z-50 animate-slide-down">
          <div className="mx-4 rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden">
            {LINKS.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`block px-6 py-4 text-sm uppercase tracking-wider transition-colors border-b border-zinc-800 last:border-b-0 ${
                    isActive
                      ? 'text-rose-200 bg-rose-200/5'
                      : 'text-zinc-300 hover:text-rose-200 hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
