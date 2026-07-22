'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { type Locale, path } from '@/lib/i18n'
import { getDict } from '@/data/dictionary'
import { MENU, formatPrice, type MenuItem } from '@/data/menu'
import { registerGsap, gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/motion'
import Picture from '@/components/ui/Picture'
import { dishAlt } from '@/lib/utils'
import { trackOnce } from '@/lib/analytics'

/**
 * SIGNATURE DISHES — HORIZONTAL SCROLL SHOWCASE
 *
 * Desktop: vertical scroll drives a horizontal rail, each panel ~78vw.
 * Mobile: the rail becomes a native swipe carousel with scroll-snap. No
 * scroll hijacking on touch — the brief is explicit about that, and pinned
 * horizontal sections are genuinely unpleasant on a phone.
 *
 * The five dishes are chosen from items the audit could identify with real
 * confidence, so the most prominent section on the homepage is not resting
 * on a guess.
 */
const PICKS = [
  'jarret-agneau-qabuli',
  'chopan-kabab',
  'mantu-plat',
  'chaplee-kabab',
  'sabzi-pulao',
] as const

export default function SignatureDishes({ locale }: { locale: Locale }) {
  const t = getDict(locale)
  const root = useRef<HTMLElement>(null)
  const rail = useRef<HTMLDivElement>(null)

  const dishes = PICKS.map((id) => MENU.find((m) => m.id === id)).filter(
    (d): d is MenuItem => Boolean(d),
  )

  useEffect(() => {
    registerGsap()
    const el = rail.current
    const section = root.current
    if (!el || !section) return

    const mm = gsap.matchMedia()

    // Desktop only, and only when motion is welcome.
    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const distance = () => el.scrollWidth - window.innerWidth

      const tween = gsap.to(el, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      })

      // Each panel's image eases 0.95 → 1 as it crosses the viewport.
      const panels = gsap.utils.toArray<HTMLElement>('[data-panel] picture')
      panels.forEach((p) => {
        gsap.fromTo(
          p,
          { scale: 0.95 },
          {
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: p,
              containerAnimation: tween,
              start: 'left right',
              end: 'right left',
              scrub: true,
            },
          },
        )
      })

      return () => tween.kill()
    })

    return () => {
      mm.revert()
      ScrollTrigger.refresh()
    }
  }, [])

  useEffect(() => {
    const el = root.current
    if (!el) return
    return trackOnce(el, 'signature_dish_view', { section: 'home' })
  }, [])

  return (
    <section ref={root} className="relative overflow-hidden bg-obsidian">
      <div className="gutter pt-[var(--section-y)]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="eyebrow flex items-center gap-3 text-ember">
              <span className="h-px w-8 bg-ember" aria-hidden />
              {t.signature.eyebrow}
            </span>
            <h2 className="mt-5 max-w-xl text-[length:var(--text-title)] text-cream">
              {t.signature.title}
            </h2>
          </div>
          <Link
            href={path('menu', locale)}
            className="group inline-flex items-center gap-3 text-sm text-sand transition-colors hover:text-ember"
          >
            {t.signature.viewMenu}
            <span
              className="inline-block h-px w-8 bg-current transition-all duration-500 group-hover:w-12"
              aria-hidden
            />
          </Link>
        </div>
      </div>

      {/* The rail. Horizontal on desktop via GSAP; snap-scroll on touch. */}
      <div
        ref={rail}
        className="mt-14 flex gap-6 overflow-x-auto pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mt-20 lg:overflow-visible lg:pb-0"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {/* Leading gutter so the first panel aligns with the page margin. */}
        <span className="shrink-0" style={{ width: 'var(--gutter)' }} aria-hidden />

        {dishes.map((dish, i) => (
          <article
            key={dish.id}
            data-panel
            className="w-[86vw] shrink-0 sm:w-[62vw] lg:w-[46vw] xl:w-[38vw]"
            style={{ scrollSnapAlign: 'center' }}
          >
            <div className="relative overflow-hidden">
              {dish.image && (
                <Picture
                  id={dish.image}
                  crop="ed"
                  alt={dishAlt(dish.nameFr, dish.nameEn, locale)}
                  sizes="(max-width: 640px) 86vw, (max-width: 1024px) 62vw, 40vw"
                  className="w-full"
                />
              )}
              <span className="eyebrow absolute left-5 top-5 text-cream/70">
                {t.signature.dish} {String(i + 1).padStart(2, '0')}
              </span>
            </div>

            <div className="mt-6 flex items-start justify-between gap-6">
              <div>
                <h3 className="text-[length:var(--text-heading)] text-cream">{dish.nameFr}</h3>
                {dish.nameEn !== dish.nameFr && (
                  <p className="mt-1 text-sm text-sand/70">{dish.nameEn}</p>
                )}
              </div>
              {/* Price present but never dominant — small, sand-toned, tabular. */}
              <span className="mt-1 shrink-0 font-body text-sm tabular-nums text-sand/70">
                {formatPrice(dish.price, locale)}
              </span>
            </div>

            {/* Descriptions render only when the restaurant supplies real copy. */}
            {(locale === 'fr' ? dish.descFr : dish.descEn) && (
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-cream/70">
                {locale === 'fr' ? dish.descFr : dish.descEn}
              </p>
            )}
          </article>
        ))}

        <span className="shrink-0" style={{ width: 'var(--gutter)' }} aria-hidden />
      </div>
    </section>
  )
}
