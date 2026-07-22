'use client'

import { useEffect, useRef } from 'react'
import { type Locale } from '@/lib/i18n'
import { PULL_QUOTE, type StoryChapter } from '@/data/story'
import { registerGsap, gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/motion'
import Picture from '@/components/ui/Picture'
import { cn } from '@/lib/utils'

/**
 * MULTI-SPEED IMAGE PARALLAX + CURTAIN MASK REVEAL
 *
 * Chapters alternate sides. Each image drifts at a slightly different rate to
 * its text, and is uncovered by a curtain wiping upward rather than fading —
 * a wipe reads as printed matter, a fade reads as a slideshow.
 *
 * One chapter carries no image on purpose (the tea passage). A page where
 * every block has a picture beside it becomes a rhythm with no accent; the
 * text-only chapter is the rest between phrases.
 */
export default function StoryChapters({
  chapters,
  locale,
}: {
  chapters: StoryChapter[]
  locale: Locale
}) {
  const root = useRef<HTMLDivElement>(null)
  const fr = locale === 'fr'

  useEffect(() => {
    registerGsap()
    if (prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      // Curtain wipe — scaleY from the top, revealing the image beneath.
      gsap.utils.toArray<HTMLElement>('[data-curtain]').forEach((el) => {
        gsap.to(el, {
          scaleY: 0,
          duration: 1.15,
          ease: 'power3.inOut',
          scrollTrigger: { trigger: el.parentElement, start: 'top 78%', once: true },
        })
      })

      // Multi-speed drift. Small values — exaggerated parallax on a text page
      // makes reading feel unstable.
      gsap.utils.toArray<HTMLElement>('[data-drift]').forEach((el, i) => {
        gsap.fromTo(
          el,
          { yPercent: i % 2 === 0 ? 5 : 7 },
          {
            yPercent: i % 2 === 0 ? -5 : -7,
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          },
        )
      })

      gsap.utils.toArray<HTMLElement>('[data-chapter-copy]').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 26 },
          {
            opacity: 1,
            y: 0,
            duration: 0.95,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 82%', once: true },
          },
        )
      })
    }, root)

    return () => {
      ctx.revert()
      ScrollTrigger.refresh()
    }
  }, [])

  return (
    <div ref={root}>
      {chapters.map((c, i) => {
        const flip = i % 2 === 1
        return (
        <div key={c.n}>
          <section className="section-pad gutter">
            <div
              className={cn(
                'grid items-center gap-10 md:grid-cols-12 md:gap-16',
                !c.image && 'md:gap-0',
              )}
            >
              {/* Copy */}
              <div
                data-chapter-copy
                className={cn(
                  'flex flex-col justify-center',
                  c.image
                    ? flip
                      ? 'md:col-span-5 md:col-start-8'
                      : 'md:col-span-5 md:col-start-2'
                    : 'md:col-span-6 md:col-start-4',
                )}
              >
                <span className="eyebrow flex items-center gap-3 text-ember">
                  <span className="h-px w-8 bg-ember" aria-hidden />
                  {c.n}
                </span>
                <h2 className="mt-6 text-[length:var(--text-title)] text-cream">
                  {fr ? c.titleFr : c.titleEn}
                </h2>
                <p className="mt-6 max-w-lg text-base leading-relaxed text-cream/75">
                  {fr ? c.bodyFr : c.bodyEn}
                </p>
              </div>

              {/* Image */}
              {c.image && (
                <div
                  data-drift
                  className={cn(
                    'relative',
                    flip ? 'md:col-span-5 md:col-start-2 md:row-start-1' : 'md:col-span-5 md:col-start-8',
                  )}
                >
                  <div className="relative overflow-hidden">
                    <Picture
                      id={c.image}
                      crop="ed"
                      alt=""
                      sizes="(max-width: 768px) 90vw, 40vw"
                      className="w-full"
                    />
                    <span
                      data-curtain
                      aria-hidden
                      className="absolute inset-0 origin-top bg-obsidian"
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Full-bleed break after the hospitality chapter. Four chapters of
              alternating image-and-text is a rhythm with no accent; this is
              the accent. Ember hairlines top and bottom rather than a box —
              a rule reads as editorial, a card reads as a component. */}
          {i === 1 && (
            <section
              data-quote
              className="relative overflow-hidden border-y border-cream/10 bg-charcoal py-24 md:py-36"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.05]"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 50% 50%, transparent 34%, var(--color-brass) 34%, var(--color-brass) 35%, transparent 35%)',
                  backgroundSize: '104px 104px',
                }}
              />
              <blockquote className="gutter relative mx-auto max-w-4xl text-center">
                <span
                  aria-hidden
                  className="mx-auto mb-8 block h-px w-14 bg-ember"
                />
                <p className="font-display text-[clamp(1.6rem,3.4vw,2.9rem)] leading-[1.22] text-cream">
                  {fr ? PULL_QUOTE.fr : PULL_QUOTE.en}
                </p>
                <footer className="eyebrow mt-8 text-sand/45">
                  mehmān-nawāzī
                </footer>
              </blockquote>
            </section>
          )}
        </div>
        )
      })}
    </div>
  )
}
