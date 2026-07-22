import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n'
import { getDict } from '@/data/dictionary'
import { CHAPTERS, LAPIS, OWNER_FIELDS } from '@/data/story'
import PageHeader from '@/components/ui/PageHeader'
import StoryChapters from '@/components/story/StoryChapters'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const fr = locale === 'fr'
  return {
    title: fr ? 'Notre histoire' : 'Our Story',
    description: fr
      ? 'La table afghane : le dastarkhān, le thé, le pain et le charbon de bois. Naseeb Kabab, Laval.'
      : 'The Afghan table: the dastarkhān, the tea, the bread and the charcoal. Naseeb Kabab, Laval.',
  }
}

/**
 * OUR STORY
 *
 * Two clearly separated halves, and the separation is the point:
 *
 *   1. What is TRUE about Afghan hospitality and cooking — documented,
 *      verifiable, and true regardless of who runs the kitchen.
 *   2. What only the restaurant can tell us, left as labelled empty fields.
 *
 * Nothing in the first half is dressed up as this family's history, and
 * nothing in the second half is filled in with plausible-sounding invention.
 */
export default async function StoryPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = getDict(locale)
  const fr = locale === 'fr'

  return (
    <>
      <PageHeader
        eyebrow={t.story.eyebrow}
        title={t.story.title.join(' ')}
        image="DSC09509"
      />

      {/* ── Opening statement — cream paper, generous air ── */}
      <section className="section-pad bg-cream text-charcoal">
        <div className="gutter grid gap-10 md:grid-cols-12">
          <div className="md:col-span-7 md:col-start-2">
            <p className="font-display text-[length:var(--text-title)] leading-[1.08]">
              {fr
                ? 'La cuisine afghane a sa propre voix : le charbon de bois, le riz long parfumé, les épices douces et le pain toujours au centre de la table.'
                : 'Afghan cooking has its own voice: charcoal fire, fragrant long-grain rice, gentle spices and bread always at the centre of the table.'}
            </p>
            <p className="mt-8 max-w-xl text-base leading-relaxed text-charcoal/70">
              {fr
                ? 'Ce n’est pas une cuisine du Moyen-Orient et ce n’est pas une cuisine indienne. Elle est afghane — de Kaboul à Hérat, de Mazar-e-Charif à Kandahar. On y parle dari et pachto, et chaque région apporte son plat.'
                : 'It is not Middle Eastern food and it is not Indian food. It is Afghan — from Kabul to Herat, from Mazar-i-Sharif to Kandahar. The languages are Dari and Pashto, and every region brings its own dish.'}
            </p>
          </div>
        </div>
      </section>

      {/* ── Four chapters, alternating, with parallax ── */}
      <StoryChapters chapters={CHAPTERS} locale={locale} />

      {/* ── The blue ── */}
      <section className="section-pad relative overflow-hidden bg-charcoal">
        {/* Gul lattice — the octagonal medallion that repeats across Afghan
            tribal carpets, used as GEOMETRY only at 4% opacity. No caption
            explaining its symbolism: the popular "elephant's foot" readings
            are the outsider ones. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 50%, transparent 34%, var(--color-brass) 34%, var(--color-brass) 35%, transparent 35%), radial-gradient(circle at 0% 0%, transparent 34%, var(--color-brass) 34%, var(--color-brass) 35%, transparent 35%)',
            backgroundSize: '120px 120px',
          }}
        />
        <div className="gutter relative grid gap-10 md:grid-cols-12">
          <div className="md:col-span-6 md:col-start-4">
            <span className="eyebrow flex items-center gap-3 text-ember">
              <span className="h-px w-8 bg-ember" aria-hidden />
              {fr ? LAPIS.eyebrowFr : LAPIS.eyebrowEn}
            </span>
            <h2 className="mt-6 text-[length:var(--text-title)] text-cream">
              {fr ? LAPIS.titleFr : LAPIS.titleEn}
            </h2>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-cream/75">
              {fr ? LAPIS.bodyFr : LAPIS.bodyEn}
            </p>
          </div>
        </div>
      </section>

      {/* ── What only the restaurant can tell us ── */}
      <section className="section-pad gutter">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4 md:col-start-2">
            <h2 className="text-[length:var(--text-heading)] text-cream">
              {fr ? 'Ce que seul le restaurant peut raconter' : 'What only the restaurant can tell'}
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-sand/65">
              {fr
                ? 'Rien de ce qui suit n’a été inventé. Chaque élément correspond à un champ du tableau de bord, à remplir par le restaurant.'
                : 'None of the following has been invented. Each maps to a field in the admin dashboard, to be filled in by the restaurant.'}
            </p>
          </div>

          <ul className="md:col-span-5 md:col-start-7">
            {OWNER_FIELDS.map((f) => (
              <li
                key={f.key}
                className="flex items-center gap-4 border-b border-cream/10 py-4"
              >
                <span className="h-1.5 w-1.5 shrink-0 bg-ember" aria-hidden />
                <span className="text-base text-cream/80">{fr ? f.fr : f.en}</span>
                <span className="eyebrow ml-auto shrink-0 text-sand/35">
                  {fr ? 'à venir' : 'to come'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
