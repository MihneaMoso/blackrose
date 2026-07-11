'use client'

import { createClient } from '@/lib/supabase/client'
import type { Session, User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

interface AuthContextValue {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (
    email: string,
    password: string
  ) => Promise<{ error: string | null; user: User | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      setSession(session)
      setUser(u)
      setIsLoading(false)
      if (u) checkAdmin(u.id)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setSession(session)
      setUser(u)
      if (u) checkAdmin(u.id)
      else setIsAdmin(false)
      router.refresh()
    })

    return () => subscription.unsubscribe()
  }, [])

  async function checkAdmin(userId: string) {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()
      setIsAdmin(data?.role === 'admin')
    } catch {
      setIsAdmin(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (!error) router.refresh()
    return { error: error?.message ?? null }
  }

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/login`,
      },
    })
    if (!error) router.refresh()
    return {
      error: error
        ? typeof error.message === 'string' && error.message
          ? error.message
          : error.code === 'unexpected_failure'
            ? 'Failed to send confirmation email. Please try again later.'
            : 'An unexpected error occurred. Please try again.'
        : null,
      user: data?.user ?? null,
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <AuthContext.Provider
      value={{ user, session, isLoading, isAdmin, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
