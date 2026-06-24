'use client'

import { useAuth } from '@/lib/supabase/auth-provider'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function NavBarActions() {
  const { user, signOut, isLoading } = useAuth()
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
          <span className="hidden sm:block text-sm text-gray-400">
            {user.email}
          </span>
          <button
            onClick={signOut}
            className="text-foreground hover:text-rose-soft transition-colors text-sm uppercase tracking-wider"
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
