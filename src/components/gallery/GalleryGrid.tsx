'use client'

import { useEffect, useRef } from 'react'
import { type Locale } from '@/lib/i18n'
import type { GallerySection } from '@/data/gallery'
import { registerGsap, gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/motion'
import Picture from '@/components/ui/Picture'
import { cn } from '@/lib/utils'

/**
 * GALLERY — categorised, curated, staggered.
 *
 * Replaces a 118-image dump that was really the same 32 dishes shot 3–6 times
 * each. Now: one hero frame per dish, grouped by the same categories as the
 * menu, with a sticky category label so you always know where you are.
 *
 * MOTION — clip-path inset wipe, staggered per row.
 * The technique is the one Codrops has been refining in its scroll-triggered
 * grid experiments: animate `clip-path: inset()` rather than opacity, because
 * a wipe reads as printed matter being uncovered while a fade reads as a
 * slideshow. clip-path and transform are both compositor-friendly, so a grid
 * of 30+ images still scrolls at 60fps.
 *
 * The stagger is computed from column position, not index, so the reveal
 * sweeps diagonally across the grid instead of marching in DOM order.
 */
export default function GalleryGrid({
  sections,
  locale,
}: {
  sections: GallerySection[]
  locale: Locale
}) {
  const root = useRef<HTMLDivElement>(null)
  const fr = locale === 'fr'

  useEffect(() => {
    registerGsap()

    // Reduced motion: everything is already visible in CSS, so there is simply
    // nothing to run. No "faster animation" — stillness is the accommodation.
    if (prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-gallery-figure]').forEach((el) => {
        gsap.fromTo(
          el,
          {
            clipPath: 'inset(0% 0% 100% 0%)',
            y: 34,
          },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            y: 0,
            duration: 1.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              once: true,
              // Column is measured from the element's real x position at the
              // moment it triggers, not from its DOM index. The grid is 4
              // columns on desktop, 3 on tablet and 2 on mobile, so an
              // index-derived column would give a phone the stagger pattern of
              // a desktop and the sweep would read as random.
              onEnter: (self) => {
                const parent = el.parentElement
                if (!parent) return
                const gridLeft = parent.getBoundingClientRect().left
                const colWidth = el.getBoundingClientRect().width
                const col = Math.round((el.getBoundingClientRect().left - gridLeft) / Math.max(1, colWidth))
                self.animation?.delay(col * 0.08)
              },
            },
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
      {sections.map((section) => {
        if (!section.images.length) return null

        return (
          <section key={section.id} className="gutter pb-16 pt-14 md:pb-24 md:pt-20">
            {/* Sticky category label — stays with you through a long section
                so the grid never becomes an anonymous wall of plates. */}
            <div className="sticky top-20 z-10 -mx-[var(--gutter)] mb-8 bg-obsidian/80 px-[var(--gutter)] py-3 backdrop-blur-md md:top-24">
              <h2 className="flex items-baseline gap-4">
                <span className="eyebrow text-ember">
                  {fr ? section.titleFr : section.titleEn}
                </span>
                <span className="h-px flex-1 bg-cream/10" aria-hidden />
                <span className="eyebrow text-sand/40">
                  {String(section.images.length).padStart(2, '0')}
                </span>
              </h2>
            </div>

            <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
              {section.images.map((img, i) => {
                // Every 7th frame spans two columns and switches to the
                // editorial 4:5 crop, so the grid has an accent instead of
                // being a uniform tile field.
                const wide = i % 7 === 3
                return (
                  <li
                    key={img.id}
                    data-gallery-figure
                    className={cn(
                      'group relative overflow-hidden will-change-[clip-path,transform]',
                      wide && 'col-span-2',
                    )}
                  >
                    <Picture
                      id={img.id}
                      crop={wide ? 'ed' : 'sq'}
                      alt={
                        fr
                          ? `${img.nameFr} — Naseeb Kabab`
                          : `${img.nameEn} — Naseeb Kabab`
                      }
                      sizes="(max-width: 768px) 48vw, (max-width: 1024px) 32vw, 24vw"
                      className="w-full transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                    />

                    {/* Caption rides in from the bottom on hover. Hidden from
                        assistive tech because the same text is already the
                        image's alt — announcing it twice is noise. */}
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 bg-[linear-gradient(to_top,rgba(11,11,11,0.9),transparent)] p-4 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100"
                    >
                      <p className="font-display text-base leading-tight text-cream">
                        {fr ? img.nameFr : img.nameEn}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
