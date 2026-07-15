'use client'

import { useAuth } from '@/lib/supabase/auth-provider'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Save, KeyRound, User, Mail, MapPin, CheckCircle2, AlertCircle } from 'lucide-react'

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [fullName, setFullName] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ ok: boolean; text: string } | null>(null)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace('/auth/login')
      return
    }
    ;(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, address')
        .eq('id', user.id)
        .single()
      if (!error && data) {
        if (data.full_name) setFullName(data.full_name)
        if (data.address) setAddress(data.address)
      }
      setLoading(false)
    })()
  }, [user, authLoading, router, supabase])

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    setSaveMessage(null)

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName || null, address: address || null })
      .eq('id', user.id)

    setSaving(false)
    if (error) {
      setSaveMessage({ ok: false, text: error.message })
    } else {
      setSaveMessage({ ok: true, text: 'Profile saved successfully.' })
      setTimeout(() => setSaveMessage(null), 3000)
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (!currentPassword || !newPassword) return
    setChangingPassword(true)
    setPasswordMessage(null)

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    setChangingPassword(false)
    if (error) {
      setPasswordMessage({ ok: false, text: error.message })
    } else {
      setPasswordMessage({ ok: true, text: 'Password changed successfully.' })
      setCurrentPassword('')
      setNewPassword('')
      setTimeout(() => setPasswordMessage(null), 3000)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-pulse text-zinc-500 text-sm uppercase tracking-widest">Loading...</div>
      </div>
    )
  }

  if (!user) return null

  const inputClass = 'w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-zinc-200 text-sm focus:outline-none focus:border-rose-200/40 transition-colors placeholder:text-zinc-600'
  const labelClass = 'block text-xs uppercase tracking-widest text-zinc-500 mb-2'

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-rose-200 transition-colors text-sm uppercase tracking-wider mb-10"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Link>

        <h1 className="text-3xl md:text-4xl font-serif text-rose-200 tracking-wide mb-10">
          Your Profile
        </h1>

        <div className="space-y-8">
          {/* Profile Information */}
          <form onSubmit={handleSaveProfile} className="border border-zinc-800 bg-zinc-900/30 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-8">
              <User className="h-5 w-5 text-rose-200" />
              <h2 className="text-lg font-serif text-rose-200 tracking-wide">
                Profile Information
              </h2>
            </div>

            <div className="space-y-6">
              {/* Email (read-only) */}
              <div>
                <label className={labelClass}>
                  <Mail className="h-3 w-3 inline mr-1.5 -mt-0.5" />
                  Email
                </label>
                <p className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-zinc-400 text-sm">
                  {user.email}
                </p>
              </div>

              {/* Full Name */}
              <div>
                <label htmlFor="full-name" className={labelClass}>
                  Full Name
                </label>
                <input
                  id="full-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name (optional — email is used if empty)"
                  className={inputClass}
                />
              </div>

              {/* Address */}
              <div>
                <label htmlFor="address" className={labelClass}>
                  <MapPin className="h-3 w-3 inline mr-1.5 -mt-0.5" />
                  Home Address
                </label>
                <textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  placeholder="Your delivery address"
                  className={`${inputClass} resize-none`}
                />
              </div>

              {saveMessage && (
                <div className={`flex items-center gap-2 text-sm ${saveMessage.ok ? 'text-rose-200' : 'text-rose-400'}`}>
                  {saveMessage.ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  {saveMessage.text}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background font-medium tracking-widest uppercase text-sm hover:bg-rose-soft transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>

          {/* Change Password */}
          <form onSubmit={handleChangePassword} className="border border-zinc-800 bg-zinc-900/30 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-8">
              <KeyRound className="h-5 w-5 text-rose-200" />
              <h2 className="text-lg font-serif text-rose-200 tracking-wide">
                Change Password
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <label htmlFor="current-password" className={labelClass}>
                  Current Password
                </label>
                <input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="new-password" className={labelClass}>
                  New Password
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                  className={inputClass}
                />
              </div>

              {passwordMessage && (
                <div className={`flex items-center gap-2 text-sm ${passwordMessage.ok ? 'text-rose-200' : 'text-rose-400'}`}>
                  {passwordMessage.ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  {passwordMessage.text}
                </div>
              )}

              <button
                type="submit"
                disabled={changingPassword || !currentPassword || !newPassword}
                className="inline-flex items-center gap-2 px-6 py-3 border border-zinc-600 text-zinc-200 font-medium tracking-widest uppercase text-sm hover:border-rose-200/50 hover:text-rose-200 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <KeyRound className="h-4 w-4" />
                {changingPassword ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
