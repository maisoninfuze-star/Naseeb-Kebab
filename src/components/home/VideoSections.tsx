import Link from 'next/link'
import { type Locale, path } from '@/lib/i18n'
import { getDict } from '@/data/dictionary'
import EditorialSplitHero from '@/components/ui/EditorialSplitHero'

/**
 * The two client-supplied films, each in an editorial split frame.
 *
 * They MIRROR each other — catering has the video on the right, story on the
 * left. Two identical split layouts stacked on one page reads as a template;
 * alternating the axis makes it read as an edit.
 *
 * Copy comes from the existing dictionary rather than being rewritten, so the
 * FR/EN wording the restaurant already approved is preserved verbatim.
 */

export function CateringFilm({ locale }: { locale: Locale }) {
  const t = getDict(locale)
  const fr = locale === 'fr'

  return (
    <EditorialSplitHero
      eyebrow={t.catering.eyebrow}
      // Split at the comma so the line break lands on a natural breath.
      headingLines={
        fr
          ? ['Les célébrations', 'sont plus chaleureuses', 'autour de notre table.']
          : ['Celebrations feel', 'warmer around', 'our table.']
      }
      paragraph={t.catering.support}
      videoSrc="/video/catering-desktop.mp4"
      videoSrcMobile="/video/catering-mobile.mp4"
      poster="/video/catering-desktop-poster.webp"
      videoLabel={
        fr
          ? 'Film du service traiteur de Naseeb Kabab'
          : 'Naseeb Kabab catering film'
      }
    >
      <Link
        href={path('catering', locale)}
        className="group inline-flex items-center gap-3 text-sm text-sand transition-colors hover:text-ember"
      >
        {t.catering.cta}
        <span
          aria-hidden
          className="inline-block h-px w-8 bg-current transition-all duration-500 group-hover:w-12"
        />
      </Link>
    </EditorialSplitHero>
  )
}

export function StoryFilm({ locale }: { locale: Locale }) {
  const t = getDict(locale)

  return (
    <EditorialSplitHero
      reverse
      eyebrow={t.story.eyebrow}
      headingLines={[...t.story.title]}
      paragraph={t.statement.sub}
      videoSrc="/video/story-desktop.mp4"
      videoSrcMobile="/video/story-mobile.mp4"
      poster="/video/story-desktop-poster.webp"
      videoLabel={
        locale === 'fr'
          ? 'Film du restaurant Naseeb Kabab'
          : 'Naseeb Kabab restaurant film'
      }
    >
      <Link
        href={path('story', locale)}
        className="group inline-flex items-center gap-3 text-sm text-sand transition-colors hover:text-ember"
      >
        {t.nav.story}
        <span
          aria-hidden
          className="inline-block h-px w-8 bg-current transition-all duration-500 group-hover:w-12"
        />
      </Link>
    </EditorialSplitHero>
  )
}
