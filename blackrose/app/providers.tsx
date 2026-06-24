'use client'

import { CartProvider } from '@/lib/context/cart-context'
import { AuthProvider } from '@/lib/supabase/auth-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  )
}
