'use client'

import { useAuth } from '@/lib/supabase/auth-provider'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function NavBarActions() {
  const { user, signOut, isLoading, isAdmin } = useAuth()
  const pathname = usePathname()

  if (isLoading) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-500 uppercase tracking-wider">
          ...
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-4">
      {user ? (
        <>
          {isAdmin && (
            <Link
              href="/admin"
              className={`text-sm uppercase tracking-wider transition-colors ${
                pathname === '/admin'
                  ? 'text-rose-soft'
                  : 'text-rose-accent/70 hover:text-rose-accent'
              }`}
            >
              Admin
            </Link>
          )}
          <Link
            href="/profile"
            className="hidden sm:block text-sm text-gray-400 hover:text-rose-soft transition-colors"
          >
            {user.email}
          </Link>
          <button
            onClick={signOut}
            className="hidden sm:block text-foreground hover:text-rose-soft transition-colors text-sm uppercase tracking-wider"
          >
            Sign Out
          </button>
        </>
      ) : (
        <Link
          href="/auth/login"
          className={`text-sm uppercase tracking-wider transition-colors ${
            pathname === '/auth/login'
              ? 'text-rose-soft'
              : 'text-foreground hover:text-rose-soft'
          }`}
        >
          Login
        </Link>
      )}
    </div>
  )
}
