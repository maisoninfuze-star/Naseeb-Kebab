'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { useSearchParams } from 'next/navigation'
import { signIn, type LoginState } from '../actions'

/**
 * Passcode sign-in.
 *
 * The passcode never leaves the server: it is posted once, compared there, and
 * exchanged for a signed httpOnly cookie. Nothing is kept in localStorage and
 * nothing is readable from JavaScript, so an XSS anywhere on the site cannot
 * lift the session.
 */
export default function PasscodeForm() {
  const next = useSearchParams().get('next') ?? '/admin'
  const [state, action] = useActionState<LoginState, FormData>(signIn, { error: null })

  return (
    <div className="grid min-h-[70vh] place-items-center">
      <form action={action} className="w-full max-w-sm">
        <h1 className="font-body text-xl font-semibold">Administration</h1>
        <p className="mt-2 text-sm text-sand/60">Naseeb Kabab</p>

        <input type="hidden" name="next" value={next} />

        <label className="mt-8 block">
          <span className="text-xs uppercase tracking-wider text-sand/50">Code d’accès</span>
          <input
            type="password"
            name="passcode"
            required
            autoFocus
            autoComplete="current-password"
            className="mt-2 w-full border-b border-cream/20 bg-transparent py-2.5 focus:border-ember focus:outline-none"
          />
        </label>

        <div aria-live="polite" className="min-h-6">
          {state.error && <p className="mt-4 text-sm text-ember">{state.error}</p>}
        </div>

        <Submit />
      </form>
    </div>
  )
}

/**
 * Split out because `useFormStatus` reports the status of the form it is
 * rendered INSIDE — reading it in the parent that owns the <form> always
 * returns pending: false.
 */
function Submit() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-4 w-full bg-ember py-3 text-xs font-semibold uppercase tracking-[0.16em] text-cream disabled:opacity-50"
    >
      {pending ? 'Connexion…' : 'Se connecter'}
    </button>
  )
}
