import { listInquiries, driverName, isEphemeral } from '@/lib/content/store'
import { removeInquiry, updateInquiry } from '../actions'

export const dynamic = 'force-dynamic'

const STATUS: { id: 'new' | 'contacted' | 'closed'; label: string }[] = [
  { id: 'new', label: 'Nouvelle' },
  { id: 'contacted', label: 'Contactée' },
  { id: 'closed', label: 'Fermée' },
]

/**
 * Catering / event inbox.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHY THIS NO LONGER READS SUPABASE DIRECTLY
 * ═══════════════════════════════════════════════════════════════════
 * It used to, and told the owner "there is no inbox" whenever Supabase was
 * absent. That was true of the old submission path — which refused enquiries
 * outright — but it is not true of the store, whose file driver accepts and
 * returns them. The page was reporting on the backend it happened to know
 * about rather than the one actually in use.
 *
 * On Supabase, reads stay gated by RLS to authenticated users: the anon key in
 * the browser bundle can insert an enquiry but never select one back, so one
 * customer's phone number is not readable by another visitor.
 */
export default async function AdminInquiries() {
  const rows = await listInquiries()
  const open = rows.filter((r) => r.status !== 'closed').length

  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="font-body text-2xl font-semibold">
          Demandes ({rows.length})
          {open > 0 && <span className="ml-3 text-sm font-normal text-ember">{open} à traiter</span>}
        </h1>
        {rows.length > 0 && (
          <a
            href="/admin/inquiries/export"
            className="bg-ember px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-cream"
          >
            Exporter en CSV
          </a>
        )}
      </div>

      {isEphemeral() && (
        <p className="mt-5 border-l-2 border-ember pl-4 text-sm leading-relaxed text-sand/70">
          <strong className="text-cream">Ces demandes ne survivront pas à un redémarrage.</strong>{' '}
          L’hébergement a un disque éphémère et aucun Supabase n’est configuré. Exportez le
          CSV régulièrement, ou branchez Supabase.
        </p>
      )}

      {!rows.length && (
        <p className="mt-8 text-sm leading-relaxed text-sand/60">
          Aucune demande pour l’instant. Le formulaire du site enregistre dans{' '}
          {driverName() === 'supabase' ? 'Supabase' : 'le fichier local'}.
        </p>
      )}

      <ul className="mt-8 space-y-px">
        {rows.map((r) => (
          <li
            key={r.id}
            className={`bg-obsidian/50 p-5 ${r.status === 'closed' ? 'opacity-55' : ''}`}
          >
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

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {STATUS.map((s) => (
                <form key={s.id} action={updateInquiry}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="status" value={s.id} />
                  <button
                    type="submit"
                    aria-pressed={r.status === s.id}
                    className={`min-h-11 px-3 text-[0.65rem] uppercase tracking-wider transition-colors ${
                      r.status === s.id
                        ? 'bg-brass/20 text-brass'
                        : 'text-sand/45 hover:text-cream'
                    }`}
                  >
                    {s.label}
                  </button>
                </form>
              ))}

              {/* Deletion is offered only once the enquiry is closed — the row
                  holds the only copy of a customer's phone number and email. */}
              {r.status === 'closed' && (
                <form action={removeInquiry} className="ml-auto">
                  <input type="hidden" name="id" value={r.id} />
                  <button
                    type="submit"
                    className="min-h-11 px-3 text-[0.65rem] uppercase tracking-wider text-sand/35 hover:text-ember"
                  >
                    Supprimer
                  </button>
                </form>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
