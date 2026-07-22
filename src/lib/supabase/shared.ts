/**
 * Environment + types shared by both Supabase entry points.
 *
 * This module must stay free of `next/headers` and of any browser API, because
 * it is imported from server components, client components and route handlers
 * alike. That separation is the reason `client.ts` and `server.ts` exist as
 * separate files rather than one convenient module.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
export const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/**
 * The public site renders entirely from `src/data` and works with no Supabase
 * project at all. Supabase powers exactly two things: the enquiry inbox and
 * the admin's content overrides. When it is absent, every consumer degrades to
 * an honest fallback rather than failing.
 */
export const isConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON)

export type Inquiry = {
  id?: string
  created_at?: string
  name: string
  phone: string
  email: string
  event_date: string | null
  guests: number | null
  occasion: string | null
  service_type: 'catering' | 'venue' | null
  message: string | null
  locale: 'fr' | 'en'
  status?: 'new' | 'contacted' | 'closed'
}
