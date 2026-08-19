'use server'

import { headers } from 'next/headers'
import { addInquiry } from '@/lib/content/store'
import { rateLimit, clientIp } from '@/lib/rate-limit'

export type InquiryResult =
  | { ok: true }
  | { ok: false; error: 'validation' | 'storage' | 'unconfigured' | 'rate'; fields?: string[] }

/** Max field lengths — an enquiry, not an essay. Enforced server-side so an
 * automated flood cannot inflate the store (each write rewrites the whole
 * content.json on the file driver) with multi-megabyte bodies. */
const CAP = { name: 120, phone: 40, email: 160, occasion: 120, message: 2000, event: 40 }

/**
 * Catering / event enquiry submission.
 *
 * Validated on the server as well as in the browser — client validation is a
 * convenience, not a control, and this endpoint is reachable directly.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHY THIS NO LONGER TALKS TO SUPABASE DIRECTLY
 * ═══════════════════════════════════════════════════════════════════
 * It used to, and returned `unconfigured` without it — refusing the enquiry and
 * showing the phone number instead. That was the honest answer while Supabase
 * was the only backend. It is now the wrong one: the content store has a file
 * driver, so an enquiry CAN be accepted and read back in the admin with no
 * database at all. Going through the store means whichever driver is live gets
 * used, and `unconfigured` is returned only when neither can accept a write.
 *
 * Silently dropping a customer's event enquiry remains the failure mode worth
 * avoiding, so a storage failure is still reported rather than swallowed.
 */
export async function submitInquiry(formData: FormData): Promise<InquiryResult> {
  // 5 enquiries per 10 min per IP — comfortably above any real submitter,
  // well below a flood. Applies before any work is done.
  const ip = clientIp(await headers())
  if (!rateLimit(`inquiry:${ip}`, 5, 10 * 60_000).ok) {
    return { ok: false, error: 'rate' }
  }

  const get = (k: string, cap: number) =>
    (formData.get(k)?.toString() ?? '').trim().slice(0, cap)

  const name = get('name', CAP.name)
  const phone = get('phone', CAP.phone)
  const email = get('email', CAP.email)
  const locale = (formData.get('locale')?.toString() ?? '') === 'en' ? 'en' : 'fr'

  const missing: string[] = []
  if (!name) missing.push('name')
  if (!phone) missing.push('phone')
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) missing.push('email')
  if (missing.length) return { ok: false, error: 'validation', fields: missing }

  const guestsRaw = get('guests', 8)
  const guests = guestsRaw ? Number.parseInt(guestsRaw, 10) : null
  // Clamp to a sane party size so a huge number cannot be stored.
  const guestsSafe =
    guests != null && Number.isFinite(guests) ? Math.min(Math.max(guests, 1), 1000) : null

  const serviceRaw = get('service_type', 16)
  const service_type =
    serviceRaw === 'catering' || serviceRaw === 'venue' ? serviceRaw : null

  const result = await addInquiry({
    name,
    phone,
    email,
    event_date: get('event_date', CAP.event) || null,
    guests: guestsSafe,
    occasion: get('occasion', CAP.occasion) || null,
    service_type,
    message: get('message', CAP.message) || null,
    locale,
  })

  if (!result.ok) {
    console.error('[inquiry] save failed', result.error)
    return { ok: false, error: result.error === 'unconfigured' ? 'unconfigured' : 'storage' }
  }

  return { ok: true }
}
