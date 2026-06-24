'use client'

import { useAuth } from '@/lib/supabase/auth-provider'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type Mode = 'login' | 'signup'

export default function LoginPage() {
  const { user, isLoading: authLoading, signIn, signUp } = useAuth()
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const result =
      mode === 'login'
        ? await signIn(email, password)
        : await signUp(email, password)

    if (result.error) {
      setError(result.error)
      setSubmitting(false)
      return
    }

    if (mode === 'signup') {
      setConfirmed(true)
      setSubmitting(false)
      return
    }

    setSubmitting(false)
  }

  const toggleMode = () => {
    setMode((prev) => (prev === 'login' ? 'signup' : 'login'))
    setError(null)
    setConfirmed(false)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-foreground text-sm uppercase tracking-widest">
          Loading...
        </div>
      </div>
    )
  }

  if (user) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link
            href="/"
            className="font-serif text-3xl tracking-widest text-foreground"
          >
            BLACK ROSE
          </Link>
          <div className="h-px w-16 bg-rose-soft mx-auto mt-4" />
        </div>

        <div className="border border-gray-darker rounded-sm p-8 bg-card">
          {confirmed ? (
            <div className="text-center py-8">
              <p className="text-foreground font-serif text-xl mb-4">
                Check Your Email
              </p>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                A confirmation link has been sent to{' '}
                <span className="text-foreground">{email}</span>.
                Please check your inbox and follow the instructions.
              </p>
              <button
                onClick={toggleMode}
                className="text-rose-soft hover:text-rose-accent text-sm uppercase tracking-wider transition-colors"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <>
              <div className="flex mb-8 border-b border-gray-darker">
                <button
                  onClick={() => setMode('login')}
                  className={`flex-1 pb-3 text-sm uppercase tracking-widest transition-colors ${
                    mode === 'login'
                      ? 'text-foreground border-b border-foreground'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setMode('signup')}
                  className={`flex-1 pb-3 text-sm uppercase tracking-widest transition-colors ${
                    mode === 'signup'
                      ? 'text-foreground border-b border-foreground'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  Create Account
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs uppercase tracking-widest text-gray-400 mb-2"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full bg-transparent border border-gray-darker px-4 py-3 text-foreground text-sm focus:outline-none focus:border-rose-soft transition-colors placeholder:text-gray-600"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-xs uppercase tracking-widest text-gray-400 mb-2"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    className="w-full bg-transparent border border-gray-darker px-4 py-3 text-foreground text-sm focus:outline-none focus:border-rose-soft transition-colors placeholder:text-gray-600"
                    placeholder="••••••••"
                  />
                </div>

                {error && (
                  <div className="border border-rose-accent/30 bg-rose-accent/5 px-4 py-3">
                    <p className="text-rose-accent text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-foreground text-background font-medium tracking-widest uppercase text-sm hover:bg-rose-soft hover:text-background transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? 'Please wait...'
                    : mode === 'login'
                      ? 'Sign In'
                      : 'Create Account'}
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-gray-500">
                {mode === 'login' ? (
                  <>
                    Don&apos;t have an account?{' '}
                    <button
                      onClick={toggleMode}
                      className="text-rose-soft hover:text-rose-accent transition-colors uppercase tracking-wider"
                    >
                      Sign Up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      onClick={toggleMode}
                      className="text-rose-soft hover:text-rose-accent transition-colors uppercase tracking-wider"
                    >
                      Sign In
                    </button>
                  </>
                )}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
