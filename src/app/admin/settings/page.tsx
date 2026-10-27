import { CONFIRMED } from '@/data/site'
import { getSettings } from '@/lib/content/resolve'
import SettingsForm from './SettingsForm'

export const dynamic = 'force-dynamic'

/**
 * Settings — everything on the public site that is not the menu.
 *
 * Still split into what the restaurant HAS published and what it has not, but
 * the second list is now the form rather than a description of a form. The
 * "how to edit" section that used to point at `src/data/site.ts` and a
 * not-yet-existing Supabase table is gone: this screen is the answer to it.
 *
 * CONFIRMED stays read-only on purpose. Name, address, phone and email are
 * wired into the JSON-LD, the sitemap and the Google Business listing; changing
 * them is a deploy, not a text field, and a typo here would silently break
 * local SEO.
 */
export default async function AdminSettings() {
  const settings = await getSettings()

  return (
    <div className="max-w-3xl">
      <h1 className="font-body text-2xl font-semibold">Réglages</h1>
      <p className="mt-2 text-sm leading-relaxed text-sand/60">
        Tout ce qui n’est pas le menu. Chaque enregistrement est publié
        immédiatement, sans redéploiement.
      </p>

      <SettingsForm settings={settings} />

      <section className="mt-14">
        <h2 className="border-b border-cream/10 pb-2 font-body text-lg font-semibold">
          Confirmé — non modifiable ici
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-sand/60">
          Ces valeurs alimentent aussi les données structurées Google et la fiche
          d’établissement. Elles se modifient dans le code, pour qu’une faute de frappe
          ne casse pas le référencement local en silence.
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
