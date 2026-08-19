import { Suspense } from 'react'
import { passcodeAuthEnabled } from '@/lib/admin-auth'
import { isConfigured } from '@/lib/supabase/server'
import PasscodeForm from './PasscodeForm'
import LoginForm from './LoginForm'

/**
 * Sign-in.
 *
 * Two paths, and the deployment picks one by configuration rather than by a
 * toggle someone has to remember:
 *
 *   passcode — ADMIN_PASSCODE + ADMIN_SESSION_SECRET are set. Enforced by
 *              `src/middleware.ts` on every /admin route.
 *   supabase — a Supabase project exists. Enforced by RLS on every query.
 *
 * If neither is configured the page says so plainly instead of showing a form
 * that cannot succeed.
 *
 * Both forms read `?next=` via useSearchParams, which forces a client-side
 * bailout — hence the Suspense boundary, so the rest of the page prerenders
 * instead of failing the build.
 */
export default function AdminLoginPage() {
  if (passcodeAuthEnabled()) {
    return (
      <Suspense fallback={<Waiting />}>
        <PasscodeForm />
      </Suspense>
    )
  }

  if (isConfigured) {
    return (
      <Suspense fallback={<Waiting />}>
        <LoginForm />
      </Suspense>
    )
  }

  return (
    <div className="grid min-h-[70vh] place-items-center">
      <div className="max-w-md">
        <h1 className="font-body text-xl font-semibold">Administration</h1>
        <p className="mt-4 border-l-2 border-ember bg-ember/5 p-4 text-sm leading-relaxed text-sand/75">
          Aucune méthode de connexion n’est configurée. Ajoutez{' '}
          <code className="text-brass">ADMIN_PASSCODE</code> et{' '}
          <code className="text-brass">ADMIN_SESSION_SECRET</code> dans{' '}
          <code className="text-brass">.env.local</code>, puis redémarrez le serveur.
        </p>
      </div>
    </div>
  )
}

const Waiting = () => (
  <div className="grid min-h-[70vh] place-items-center text-sm text-sand/50">…</div>
)
