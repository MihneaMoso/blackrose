'use client'

import { useCart } from '@/lib/context/cart-context'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function NavBarCart() {
  const { itemCount } = useCart()
  const pathname = usePathname()

  return (
    <Link
      href="/cart"
      className={`text-sm uppercase tracking-wider transition-colors ${
        pathname === '/cart'
          ? 'text-rose-soft'
          : 'text-foreground hover:text-rose-soft'
      }`}
    >
      Cart ({itemCount})
    </Link>
  )
}
