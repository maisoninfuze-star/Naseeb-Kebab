import { createBrowserClient } from '@supabase/ssr'
import { SUPABASE_URL, SUPABASE_ANON, isConfigured } from './shared'

export { isConfigured }
export type { Inquiry } from './shared'

/** Browser-side client. Safe to import from client components. */
export function browserClient() {
  if (!isConfigured) return null
  return createBrowserClient(SUPABASE_URL!, SUPABASE_ANON!)
}
