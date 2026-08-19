import { listInquiries } from '@/lib/content/store'
import type { StoredInquiry } from '@/lib/content/types'

/**
 * CSV export of the enquiry inbox, for the owner's own records.
 *
 * Goes through the store rather than Supabase directly — it used to 503 without
 * a database, which under the file driver meant refusing to export enquiries
 * that existed. On an ephemeral host this export is the only way to keep them.
 */
export async function GET() {
  const rows = await listInquiries()

  const cols: (keyof StoredInquiry)[] = [
    'created_at', 'name', 'phone', 'email',
    'event_date', 'guests', 'occasion', 'service_type',
    'message', 'locale', 'status',
  ]

  // Prefixing a leading =, +, - or @ with an apostrophe stops Excel and Sheets
  // from evaluating a customer's message as a formula.
  const cell = (v: unknown) => {
    const s = v == null ? '' : String(v)
    const safe = /^[=+\-@]/.test(s) ? `'${s}` : s
    return `"${safe.replace(/"/g, '""')}"`
  }

  const csv = [
    cols.join(','),
    ...rows.map((r) => cols.map((c) => cell(r[c])).join(',')),
  ].join('\r\n')

  return new Response('﻿' + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="naseeb-demandes.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
