import { CONFIRMED, UNCONFIRMED } from '@/data/site'

export const dynamic = 'force-dynamic'

/**
 * Settings.
 *
 * Split into what the restaurant HAS published (confirmed, safe on the site)
 * and what it has NOT (blank, and blank on the site too). The second list is
 * the important one — each empty value is currently a visible gap for a
 * customer, and the note says which.
 */
const PENDING: { key: keyof typeof UNCONFIRMED; label: string; impact: string }[] = [
  {
    key: 'hours',
    label: 'Heures d’ouverture',
    impact:
      'Le site affiche « Heures à confirmer — appelez-nous » au pied de page, sur la page Nous trouver et dans le menu de navigation. Aucune heure n’a été devinée.',
  },
  {
    key: 'orderingUrl',
    label: 'Lien de commande en ligne',
    impact:
      'Tous les boutons « Commander » composent le numéro de téléphone. Dès qu’un lien est fourni, ils redirigent vers la plateforme en conservant les paramètres de campagne.',
  },
  {
    key: 'instagram',
    label: 'Instagram',
    impact: 'La section « Nous suivre » du pied de page affiche un tiret.',
  },
  {
    key: 'facebook',
    label: 'Facebook',
    impact: 'La section « Nous suivre » du pied de page affiche un tiret.',
  },
  {
    key: 'halal',
    label: 'Statut halal',
    impact:
      'Aucune mention halal n’apparaît nulle part sur le site. À n’activer qu’une fois confirmé par écrit — c’est une affirmation vérifiable par le client.',
  },
  {
    key: 'parking',
    label: 'Stationnement',
    impact: 'La section stationnement est masquée sur la page Nous trouver.',
  },
  {
    key: 'foundedYear',
    label: 'Année d’ouverture',
    impact: 'La page Notre histoire indique « à compléter ».',
  },
]

export default function AdminSettings() {
  return (
    <div className="max-w-3xl">
      <h1 className="font-body text-2xl font-semibold">Réglages</h1>

      <section className="mt-10">
        <h2 className="font-body text-lg font-semibold">Confirmé</h2>
        <p className="mt-2 text-sm text-sand/60">
          Repris de naseebkabab.shop. Publié tel quel sur le site.
        </p>
        <dl className="mt-5 space-y-px">
          <Row label="Nom" value={CONFIRMED.name} />
          <Row label="Slogan" value={CONFIRMED.tagline} />
          <Row
            label="Adresse"
            value={`${CONFIRMED.address.street}, ${CONFIRMED.address.city}, ${CONFIRMED.address.province} ${CONFIRMED.address.postal}`}
          />
          <Row label="Téléphone" value={CONFIRMED.phoneDisplay} />
          <Row label="Courriel" value={CONFIRMED.email} />
        </dl>
      </section>

      <section className="mt-12">
        <h2 className="font-body text-lg font-semibold">À fournir</h2>
        <p className="mt-2 text-sm leading-relaxed text-sand/60">
          Rien de tout cela n’a été inventé. Chaque ligne décrit ce que le visiteur voit
          actuellement à la place.
        </p>

        <ul className="mt-5 space-y-px">
          {PENDING.map((p) => (
            <li key={p.key} className="bg-obsidian/50 p-4">
              <div className="flex items-baseline gap-3">
                <span className="font-medium">{p.label}</span>
                <span className="rounded bg-ember/20 px-2 py-0.5 text-[0.65rem] uppercase tracking-wider text-ember">
                  vide
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-sand/70">{p.impact}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-body text-lg font-semibold">Comment modifier</h2>
        <p className="mt-3 text-sm leading-relaxed text-sand/70">
          Ces valeurs vivent dans <code className="text-brass">src/data/site.ts</code>. Une
          fois Supabase branché, la table{' '}
          <code className="text-brass">site_settings</code> les remplace sans redéploiement
          — voir <code className="text-brass">supabase/schema.sql</code> et le guide du
          propriétaire (<code className="text-brass">DOCS/OWNER-GUIDE.md</code>).
        </p>
      </section>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap gap-x-6 bg-obsidian/50 px-4 py-3">
      <dt className="w-28 shrink-0 text-sm text-sand/50">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  )
}
