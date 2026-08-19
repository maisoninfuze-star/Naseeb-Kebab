import Link from 'next/link'
import { getContent } from '@/lib/content/store'
import { flatten, resolveDict, shippedText } from '@/lib/content/text'

import { resetAllCopy } from '../actions'
import TextRow from './TextRow'

export const dynamic = 'force-dynamic'

const LOCALES = ['fr', 'en'] as const
type Loc = (typeof LOCALES)[number]

/** Section key -> what the owner would call it. */
const SECTIONS: Record<string, string> = {
  nav: 'Navigation',
  hero: 'Accueil — bandeau principal',
  statement: 'Accueil — citation',
  signature: 'Accueil — incontournables',
  charcoal: 'Accueil — charbon de bois',
  platters: 'Accueil — plats à partager',
  preview: 'Accueil — aperçu du menu',
  story: 'Notre histoire',
  catering: 'Traiteur et événements',
  gallery: 'Galerie',
  visit: 'Nous trouver',
  order: 'Commander',
  contact: 'Contact',
  form: 'Formulaire',
  footer: 'Pied de page',
  common: 'Éléments communs',
  reviews: 'Avis',
  testimonials: 'Témoignages',
}

/**
 * Site copy editor — every brand string on the public site.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHAT IS AND IS NOT HERE
 * ═══════════════════════════════════════════════════════════════════
 * Everything in `dictionary.ts`: headings, buttons, labels, paragraphs, alt
 * text, both languages. NOT dish names, prices or descriptions — those are the
 * Menu screen, because they carry a photo and a category and belong with it.
 *
 * Grouped by section and shown one language at a time. Showing FR and EN side
 * by side doubles the rows and makes neither easy to read; the owner is editing
 * one language at a sitting.
 */
export default async function AdminText({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string; q?: string }>
}) {
  const { lang, q } = await searchParams
  const locale: Loc = lang === 'en' ? 'en' : 'fr'
  const query = (q ?? '').trim().toLowerCase()

  const { text } = await getContent()
  const current = flatten(resolveDict(locale, text))
  const shipped = shippedText(locale)
  const overrideCount = Object.keys(text?.[locale] ?? {}).length

  const paths = Object.keys(shipped).filter((p) => {
    if (!query) return true
    return p.toLowerCase().includes(query) || (current[p] ?? '').toLowerCase().includes(query)
  })

  const groups = new Map<string, string[]>()
  for (const p of paths) {
    const section = p.split('.')[0]
    if (!groups.has(section)) groups.set(section, [])
    groups.get(section)!.push(p)
  }

  return (
    <div className="max-w-3xl">
      <h1 className="font-body text-2xl font-semibold">Textes du site</h1>
      <p className="mt-2 text-sm leading-relaxed text-sand/60">
        Chaque texte du site public, dans les deux langues. Les noms, prix et
        descriptions des plats se modifient dans le{' '}
        <Link href="/admin/menu" className="text-brass hover:text-cream">
          Menu
        </Link>
        .
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {LOCALES.map((l) => (
          <Link
            key={l}
            href={`/admin/text?lang=${l}${query ? `&q=${encodeURIComponent(query)}` : ''}`}
            aria-current={l === locale}
            className={`min-h-11 px-4 py-2.5 text-xs uppercase tracking-wider transition-colors ${
              l === locale ? 'bg-brass/20 text-brass' : 'text-sand/50 hover:text-cream'
            }`}
          >
            {l === 'fr' ? 'Français' : 'English'}
          </Link>
        ))}

        <form className="ml-auto">
          <input type="hidden" name="lang" value={locale} />
          <input
            name="q"
            defaultValue={query}
            placeholder="Rechercher un texte…"
            className="min-h-11 w-56 bg-cream/5 px-3 text-sm text-cream outline-none placeholder:text-sand/30 focus:bg-cream/10"
          />
        </form>
      </div>

      {overrideCount > 0 && (
        <form action={resetAllCopy} className="mt-5">
          <input type="hidden" name="locale" value={locale} />
          <p className="text-sm text-sand/60">
            {overrideCount} texte{overrideCount > 1 ? 's' : ''} modifié
            {overrideCount > 1 ? 's' : ''} en {locale === 'fr' ? 'français' : 'anglais'}.{' '}
            <button
              type="submit"
              className="text-[0.65rem] uppercase tracking-wider text-sand/45 hover:text-ember"
            >
              Rétablir ({locale === 'fr' ? 'français' : 'anglais'})
            </button>
          </p>
        </form>
      )}

      {!paths.length && (
        <p className="mt-10 text-sm text-sand/60">Aucun texte ne correspond à « {query} ».</p>
      )}

      {[...groups.entries()].map(([section, keys]) => (
        <section key={section} className="mt-10">
          <h2 className="border-b border-cream/10 pb-2 font-body text-lg font-semibold">
            {SECTIONS[section] ?? section}
          </h2>
          <ul className="mt-4 space-y-px">
            {keys.map((p) => (
              <TextRow
                key={p}
                locale={locale}
                path={p}
                value={current[p] ?? ''}
                shipped={shipped[p] ?? ''}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
