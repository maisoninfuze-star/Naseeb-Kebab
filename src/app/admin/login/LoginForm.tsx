'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { browserClient, isConfigured } from '@/lib/supabase/client'

/**
 * Admin sign-in.
 *
 * Email + password against Supabase Auth. Accounts are created by invitation
 * from the Supabase dashboard — there is deliberately no self-serve sign-up,
 * because the only people who should have an account are the restaurant's own
 * staff.
 */
export default function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)

    const supabase = browserClient()
    if (!supabase) {
      setError('Supabase n’est pas configuré.')
      setBusy(false)
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      // Deliberately generic — distinguishing "no such user" from "wrong
      // password" tells an attacker which emails have accounts.
      setError('Identifiants invalides.')
      setBusy(false)
      return
    }

    // Only same-origin paths, so ?next= can't be used as an open redirect.
    const next = params.get('next')
    router.push(next?.startsWith('/admin') ? next : '/admin')
    router.refresh()
  }

  return (
    <div className="grid min-h-[70vh] place-items-center">
      <form onSubmit={onSubmit} className="w-full max-w-sm">
        <h1 className="font-body text-xl font-semibold">Administration</h1>
        <p className="mt-2 text-sm text-sand/60">Naseeb Kabab</p>

        {!isConfigured && (
          <p className="mt-6 border-l-2 border-ember bg-ember/5 p-4 text-sm text-sand/75">
            Supabase n’est pas configuré. Ajoutez les variables d’environnement puis
            redémarrez.
          </p>
        )}

        <label className="mt-8 block">
          <span className="text-xs uppercase tracking-wider text-sand/50">Courriel</span>
          <input
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full border-b border-cream/20 bg-transparent py-2.5 focus:border-ember focus:outline-none"
          />
        </label>

        <label className="mt-6 block">
          <span className="text-xs uppercase tracking-wider text-sand/50">Mot de passe</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full border-b border-cream/20 bg-transparent py-2.5 focus:border-ember focus:outline-none"
          />
        </label>

        <div aria-live="polite" className="min-h-6">
          {error && <p className="mt-4 text-sm text-ember">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={busy || !isConfigured}
          className="mt-4 w-full bg-ember py-3 text-xs font-semibold uppercase tracking-[0.16em] text-cream disabled:opacity-50"
        >
          {busy ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
    </div>
  )
}
