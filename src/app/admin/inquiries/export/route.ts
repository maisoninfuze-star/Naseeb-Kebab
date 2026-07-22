import { isConfigured, serverClient, type Inquiry } from '@/lib/supabase/server'

/** CSV export of the enquiry inbox, for the owner's own records. */
export async function GET() {
  if (!isConfigured) {
    return new Response('Supabase not configured', { status: 503 })
  }

  const supabase = await serverClient()
  const { data, error } = await supabase!
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return new Response(error.message, { status: 500 })

  const rows = (data ?? []) as Inquiry[]
  const cols: (keyof Inquiry)[] = [
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
