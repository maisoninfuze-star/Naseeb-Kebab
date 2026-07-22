import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n'

import PlateHero from '@/components/home/PlateHero'
import Statement from '@/components/home/Statement'
import CharcoalStory from '@/components/home/CharcoalStory'
import Platters from '@/components/home/Platters'
import MenuPreview from '@/components/home/MenuPreview'
import StoryTeaser from '@/components/home/StoryTeaser'
import CateringTeaser from '@/components/home/CateringTeaser'
import VisitSplit from '@/components/home/VisitSplit'

/**
 * The homepage is one continuous narrative, not a stack of blocks:
 *
 *   fire (hero) → paper (statement) → craft (charcoal) →
 *   generosity (platters) → the offer (menu) → the people (story) →
 *   the occasion (catering) → the ask (visit)
 *
 * The dark/cream alternation gives it rhythm: every cream section is a breath
 * between two dark ones.
 *
 * ─────────────────────────────────────────────────────────────────
 * THREE SECTIONS WERE REMOVED, AND WHY
 * ─────────────────────────────────────────────────────────────────
 * · SignatureDishes — the hero now IS the signature-dish section. It shows six
 *   dishes with real names and prices as you scroll, so a horizontal carousel
 *   of the same dishes immediately underneath was the page repeating itself.
 *
 * · Classics — its content (mantu, ashak, banjan burani, naan, tea) is now
 *   covered properly on Our Story, where the dastarkhān and chai passages give
 *   it context instead of presenting it as a second dish grid.
 *
 * · Reviews — the restaurant has supplied no reviews and there is no Google
 *   integration yet, so the section rendered an empty state on the homepage.
 *   An empty "what people say" is worse than no section at all. It returns the
 *   moment real reviews exist.
 *
 * Eleven sections became eight. Every remaining one does a distinct job.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  return (
    <>
      <PlateHero locale={locale} />
      <Statement locale={locale} />
      <CharcoalStory locale={locale} />
      <Platters locale={locale} />
      <MenuPreview locale={locale} />
      <StoryTeaser locale={locale} />
      <CateringTeaser locale={locale} />
      <VisitSplit locale={locale} />
    </>
  )
}
