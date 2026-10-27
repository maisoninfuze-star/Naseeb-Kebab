import Link from 'next/link'
import { getMenu, getSettings } from '@/lib/content/resolve'
import { isEphemeral, listInquiries } from '@/lib/content/store'

export const dynamic = 'force-dynamic'

/**
 * Dashboard overview.
 *
 * The top of this page is a punch list, not a vanity panel. Everything the
 * build could not verify — ambiguous photo matches, missing dish photos,
 * unpublished opening hours, the absent ordering link — is surfaced here so
 * the owner can see exactly what is still unresolved on their own site.
 *
 * Every count comes from the RESOLVED content, not the shipped constants. Read
 * from `MENU` and `UNCONFIRMED` it would keep listing an item as unpriced after
 * the owner had priced it, and go on demanding hours they had already entered —
 * a punch list that never shortens is one nobody trusts.
 */
export default async function AdminHome() {
  const [items, settings, inquiries] = await Promise.all([
    getMenu(),
    getSettings(),
    listInquiries(),
  ])

  const review = items.filter((i) => i.needsReview)
  const noPhoto = items.filter((i) => !i.image)
  const lowConfidence = items.filter((i) => i.imageConfidence === 'low')
  const unpriced = items.filter((i) => !i.price)
  const newInquiries = inquiries.filter((i) => i.status === 'new').length

  const unconfirmedSettings = Object.entries(settings)
    .filter(([, v]) => v === null)
    .map(([k]) => k)

  return (
    <div className="max-w-4xl">
      <h1 className="font-body text-2xl font-semibold">Aperçu</h1>
      <p className="mt-2 text-sm text-sand/60">
        Ce qui reste à confirmer avant que le site soit complet.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Plats au menu" value={items.length} />
        <Stat label="Photos à vérifier" value={lowConfidence.length} tone="warn" />
        <Stat label="Plats sans photo" value={noPhoto.length} tone="warn" />
        <Stat
          label="Nouvelles demandes"
          value={newInquiries}
          tone={newInquiries > 0 ? 'good' : undefined}
        />
      </div>

      {unpriced.length > 0 && (
        <Callout title={`${unpriced.length} plats sans prix`}>
          {unpriced.map((i) => i.nameFr).join(', ')} — publiés avec la mention « à venir »
          plutôt qu’un prix inventé. Renseignez-les dans le Menu avant l’ouverture.
        </Callout>
      )}

      {/* Only a warning when edits will actually be LOST. The old version fired
          whenever Supabase was absent and said the inbox and content editing
          needed it — both work on the file driver, so that read as a fault when
          nothing was wrong. */}
      {isEphemeral() && (
        <Callout title="Les modifications ne seront pas conservées">
          Cet hébergement a un disque éphémère et aucun Supabase n’est configuré : les
          modifications et les demandes disparaissent au prochain redémarrage. Ajoutez{' '}
          <code className="text-brass">NEXT_PUBLIC_SUPABASE_URL</code> et{' '}
          <code className="text-brass">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, puis exécutez{' '}
          <code className="text-brass">supabase/schema.sql</code> — ou hébergez sur un
          serveur avec disque persistant.
        </Callout>
      )}

      {/* The punch list. */}
      <section className="mt-12">
        <h2 className="font-body text-lg font-semibold">
          À confirmer avec le restaurant ({review.length})
        </h2>
        <p className="mt-2 text-sm text-sand/60">
          Aucun de ces éléments n’a été inventé. Chaque ligne attend une réponse du
          propriétaire.
        </p>

        <ul className="mt-5 space-y-px">
          {review.map((item) => (
            <li key={item.id} className="bg-obsidian/50 p-4">
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="font-medium">{item.nameFr}</span>
                <span className="text-xs tabular-nums text-sand/50">
                  {item.price.toFixed(2)} $
                </span>
                {item.imageConfidence && (
                  <span
                    className={
                      item.imageConfidence === 'low'
                        ? 'rounded bg-ember/20 px-2 py-0.5 text-[0.65rem] uppercase tracking-wider text-ember'
                        : 'rounded bg-brass/15 px-2 py-0.5 text-[0.65rem] uppercase tracking-wider text-brass'
                    }
                  >
                    {item.imageConfidence}
                  </span>
                )}
                {!item.image && (
                  <span className="rounded bg-cream/10 px-2 py-0.5 text-[0.65rem] uppercase tracking-wider text-sand/70">
                    aucune photo
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-sand/70">{item.needsReview}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-body text-lg font-semibold">
          Renseignements manquants ({unconfirmedSettings.length})
        </h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {unconfirmedSettings.map((k) => (
            <li key={k} className="bg-obsidian/50 px-3 py-1.5 text-sm text-sand/75">
              {LABELS[k] ?? k}
            </li>
          ))}
        </ul>
        <Link
          href="/admin/settings"
          className="mt-5 inline-block bg-ember px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-cream"
        >
          Compléter les réglages
        </Link>
      </section>
    </div>
  )
}

const LABELS: Record<string, string> = {
  hours: 'Heures d’ouverture',
  instagram: 'Lien Instagram',
  facebook: 'Lien Facebook',
  orderingUrl: 'Lien de commande en ligne',
  halal: 'Statut halal (à confirmer par écrit)',
  parking: 'Stationnement',
  foundedYear: 'Année d’ouverture',
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: number | string
  tone?: 'warn' | 'good'
}) {
  return (
    <div className="bg-obsidian/50 p-5">
      <p className="text-xs uppercase tracking-wider text-sand/50">{label}</p>
      <p
        className={
          'mt-2 text-3xl tabular-nums ' +
          (tone === 'warn' ? 'text-ember' : tone === 'good' ? 'text-brass' : 'text-cream')
        }
      >
        {value}
      </p>
    </div>
  )
}

function Callout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8 border-l-2 border-ember bg-ember/5 p-5">
      <p className="font-medium">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-sand/75">{children}</p>
    </div>
  )
}
