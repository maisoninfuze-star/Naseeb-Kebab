import 'server-only'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { SUPABASE_URL, SUPABASE_ANON, isConfigured } from './shared'

export { isConfigured }
export type { Inquiry } from './shared'

/**
 * Server-side client for Server Components, Server Actions and route handlers.
 *
 * `server-only` makes an accidental client import a build error rather than a
 * confusing runtime failure — which is exactly how the original single-module
 * version broke.
 */
export async function serverClient() {
  if (!isConfigured) return null
  const store = await cookies()

  return createServerClient(SUPABASE_URL!, SUPABASE_ANON!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options))
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // Session refresh is handled by the middleware instead.
        }
      },
    },
  })
}
