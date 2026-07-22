'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { type Locale, path } from '@/lib/i18n'
import { getDict } from '@/data/dictionary'
import { registerGsap, gsap, prefersReducedMotion } from '@/lib/motion'
import Picture from '@/components/ui/Picture'
import { RevealLines } from '@/components/ui/Reveal'

/**
 * OUR STORY teaser — CURTAIN MASK REVEAL + multi-speed parallax.
 *
 * The restaurant has supplied no founder history, no founding date and no
 * account of what the name Naseeb means to them. Rather than write a plausible
 * origin story — which is the most common and most damaging thing a restaurant
 * site does — this section states the theme and shows a clearly-marked
 * placeholder for the owner's own words.
 */
export default function StoryTeaser({ locale }: { locale: Locale }) {
  const t = getDict(locale)
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    registerGsap()
    if (prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      // CURTAIN MASK REVEAL — the panel slides off the image.
      gsap.to('[data-curtain]', {
        scaleY: 0,
        transformOrigin: 'top',
        duration: 1.2,
        ease: 'power3.inOut',
        scrollTrigger: { trigger: root.current, start: 'top 72%', once: true },
      })
      gsap.to('[data-story-img] picture', {
        yPercent: -10,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
      })
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className="section-pad overflow-hidden bg-obsidian">
      <div className="gutter grid gap-12 md:grid-cols-12 md:gap-12">
        <div data-story-img className="relative md:col-span-5 md:col-start-1">
          <div className="relative overflow-hidden">
            <Picture
              id="DSC09509"
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

        <div className="flex flex-col justify-center md:col-span-6 md:col-start-7">
          <span className="eyebrow flex items-center gap-3 text-ember">
            <span className="h-px w-8 bg-ember" aria-hidden />
            {t.story.eyebrow}
          </span>

          <RevealLines
            as="h2"
            lines={t.story.title}
            className="mt-6 text-[length:var(--text-title)] text-cream"
          />

          {/* Clearly marked as awaiting real content — never dressed up as copy. */}
          <div className="mt-8 border-l-2 border-ember/40 pl-5">
            <p className="max-w-md text-base leading-relaxed text-cream/70">
              {t.story.placeholder}
            </p>
            <p className="eyebrow mt-4 text-sand/50">{t.story.placeholderNote}</p>
          </div>

          <Link
            href={path('story', locale)}
            className="group mt-9 inline-flex items-center gap-3 self-start text-sm text-sand transition-colors hover:text-ember"
          >
            {t.nav.story}
            <span
              className="inline-block h-px w-8 bg-current transition-all duration-500 group-hover:w-12"
              aria-hidden
            />
          </Link>
        </div>
      </div>
    </section>
  )
}
