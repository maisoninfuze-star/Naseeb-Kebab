import { isConfigured, serverClient, type Inquiry } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * Catering / event inbox.
 *
 * Reads are gated by RLS to authenticated users — the anon key in the browser
 * bundle can insert an enquiry but can never select one back, so a customer's
 * phone number is not readable by another visitor.
 */
export default async function AdminInquiries() {
  if (!isConfigured) {
    return (
      <div className="max-w-2xl">
        <h1 className="font-body text-2xl font-semibold">Demandes</h1>
        <div className="mt-6 border-l-2 border-ember bg-ember/5 p-5 text-sm leading-relaxed text-sand/75">
          Supabase n’est pas configuré, il n’y a donc pas de boîte de réception. Le
          formulaire du site affiche le numéro de téléphone tant que ce n’est pas branché —
          aucune demande n’est perdue en silence.
        </div>
      </div>
    )
  }

  const supabase = await serverClient()
  const { data, error } = await supabase!
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  const rows = (data ?? []) as Inquiry[]

  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="font-body text-2xl font-semibold">Demandes ({rows.length})</h1>
        <a
          href="/admin/inquiries/export"
          className="bg-ember px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-cream"
        >
          Exporter en CSV
        </a>
      </div>

      {error && (
        <p className="mt-6 border-l-2 border-ember bg-ember/5 p-4 text-sm text-sand/75">
          {error.message}
        </p>
      )}

      {!rows.length && !error && (
        <p className="mt-8 text-sm text-sand/60">Aucune demande pour l’instant.</p>
      )}

      <ul className="mt-8 space-y-px">
        {rows.map((r) => (
          <li key={r.id} className="bg-obsidian/50 p-5">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="font-medium">{r.name}</span>
              <a href={`tel:${r.phone}`} className="text-sm text-ember">
                {r.phone}
              </a>
              <a href={`mailto:${r.email}`} className="text-sm text-sand/70">
                {r.email}
              </a>
              <span className="ml-auto text-xs text-sand/45">
                {r.created_at ? new Date(r.created_at).toLocaleString('fr-CA') : ''}
              </span>
            </div>

            <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-1 text-sm text-sand/70">
              {r.event_date && (
                <div>
                  <dt className="inline text-sand/45">Date : </dt>
                  <dd className="inline">{r.event_date}</dd>
                </div>
              )}
              {r.guests != null && (
                <div>
                  <dt className="inline text-sand/45">Personnes : </dt>
                  <dd className="inline">{r.guests}</dd>
                </div>
              )}
              {r.occasion && (
                <div>
                  <dt className="inline text-sand/45">Occasion : </dt>
                  <dd className="inline">{r.occasion}</dd>
                </div>
              )}
              {r.service_type && (
                <div>
                  <dt className="inline text-sand/45">Type : </dt>
                  <dd className="inline">
                    {r.service_type === 'catering' ? 'Traiteur' : 'Au restaurant'}
                  </dd>
                </div>
              )}
            </dl>

            {r.message && (
              <p className="mt-3 border-l-2 border-cream/15 pl-3 text-sm leading-relaxed text-cream/80">
                {r.message}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
