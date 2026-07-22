import { Suspense } from 'react'
import LoginForm from './LoginForm'

/**
 * The form reads `?next=` via useSearchParams, which forces a client-side
 * bailout. Wrapping it in Suspense lets the rest of the page prerender
 * normally instead of failing the whole build.
 */
export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="grid min-h-[70vh] place-items-center text-sm text-sand/50">…</div>}>
      <LoginForm />
    </Suspense>
  )
}
