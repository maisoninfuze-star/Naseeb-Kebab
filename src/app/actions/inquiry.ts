'use server'

import { serverClient, isConfigured, type Inquiry } from '@/lib/supabase/server'

export type InquiryResult =
  | { ok: true }
  | { ok: false; error: 'validation' | 'storage' | 'unconfigured'; fields?: string[] }

/**
 * Catering / event enquiry submission.
 *
 * Validated on the server as well as in the browser — client validation is a
 * convenience, not a control, and this endpoint is reachable directly.
 *
 * When Supabase is not configured the action returns `unconfigured` rather
 * than pretending to have succeeded. The form then shows the phone number,
 * which is a worse experience than a working inbox but an honest one; silently
 * dropping a customer's event enquiry is the failure mode worth avoiding.
 */
export async function submitInquiry(formData: FormData): Promise<InquiryResult> {
  const get = (k: string) => (formData.get(k)?.toString() ?? '').trim()

  const name = get('name')
  const phone = get('phone')
  const email = get('email')
  const locale = get('locale') === 'en' ? 'en' : 'fr'

  const missing: string[] = []
  if (!name) missing.push('name')
  if (!phone) missing.push('phone')
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) missing.push('email')
  if (missing.length) return { ok: false, error: 'validation', fields: missing }

  const guestsRaw = get('guests')
  const guests = guestsRaw ? Number.parseInt(guestsRaw, 10) : null

  const serviceRaw = get('service_type')
  const service_type =
    serviceRaw === 'catering' || serviceRaw === 'venue' ? serviceRaw : null

  const row: Inquiry = {
    name,
    phone,
    email,
    event_date: get('event_date') || null,
    guests: Number.isFinite(guests as number) ? guests : null,
    occasion: get('occasion') || null,
    service_type,
    message: get('message') || null,
    locale,
  }

  if (!isConfigured) return { ok: false, error: 'unconfigured' }

  const supabase = await serverClient()
  if (!supabase) return { ok: false, error: 'unconfigured' }

  const { error } = await supabase.from('inquiries').insert(row)
  if (error) {
    console.error('[inquiry] insert failed', error.message)
    return { ok: false, error: 'storage' }
  }

  return { ok: true }
}
