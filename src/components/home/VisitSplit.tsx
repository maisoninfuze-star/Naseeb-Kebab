'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { type Locale, path } from '@/lib/i18n'
import { getDict } from '@/data/dictionary'
import { CONFIRMED, UNCONFIRMED, MAPS_DIRECTIONS, MAPS_URL } from '@/data/site'
import { registerGsap, gsap, prefersReducedMotion } from '@/lib/motion'
import Picture from '@/components/ui/Picture'
import { track } from '@/lib/analytics'

/**
 * SPLIT-SCREEN CLOSING REVEAL
 *
 * The two halves enter from opposite sides and meet in the centre; the details
 * fade up; the buttons land last. This is the final conversion moment on the
 * page, so the CTAs are the last thing to settle and the first thing you see
 * once it has.
 */
export default function VisitSplit({ locale }: { locale: Locale }) {
  const t = getDict(locale)
  const root = useRef<HTMLElement>(null)

  // Routes to the /order chooser rather than jumping to one platform:
  // delivery goes to DoorDash or Uber Eats, pickup is a phone call.
  const orderHref = path('order', locale)

  useEffect(() => {
    registerGsap()
    if (prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: 'top 74%', once: true },
      })
      tl.fromTo('[data-half="left"]', { xPercent: -8, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 1, ease: 'power3.out' }, 0)
        .fromTo('[data-half="right"]', { xPercent: 8, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 1, ease: 'power3.out' }, 0)
        .fromTo('[data-detail]', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: 'power3.out' }, 0.4)
        .fromTo('[data-cta]', { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power3.out' }, 0.85)
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className="overflow-hidden bg-charcoal">
      <div className="grid md:grid-cols-2">
        {/* Left — the practical detail */}
        <div data-half="left" className="gutter flex flex-col justify-center py-[var(--section-y)]">
          <span className="eyebrow flex items-center gap-3 text-ember">
            <span className="h-px w-8 bg-ember" aria-hidden />
            {t.visit.eyebrow}
          </span>
          <h2 className="mt-5 text-[length:var(--text-title)] text-cream">{t.visit.title}</h2>

          <dl className="mt-10 space-y-7">
            <div data-detail>
              <dt className="eyebrow text-sand/50">{t.visit.address}</dt>
              <dd className="mt-2 text-base text-cream">
                {CONFIRMED.address.street}
                <br />
                {CONFIRMED.address.city}, {CONFIRMED.address.province} {CONFIRMED.address.postal}
              </dd>
            </div>

            <div data-detail>
              <dt className="eyebrow text-sand/50">{t.visit.phone}</dt>
              <dd className="mt-2 text-base">
                <a
                  href={`tel:${CONFIRMED.phone}`}
                  onClick={() => track('phone_click', { source: 'visit_split' })}
                  className="text-cream transition-colors hover:text-ember"
                >
                  {CONFIRMED.phoneDisplay}
                </a>
              </dd>
            </div>

            <div data-detail>
              <dt className="eyebrow text-sand/50">{t.visit.hours}</dt>
              <dd className="mt-2 text-base text-sand/70">
                {/* Hours are not published anywhere. Not guessed. */}
                {UNCONFIRMED.hours
                  ? Object.entries(UNCONFIRMED.hours).map(([d, h]) => (
                      <span key={d} className="block">
                        {d} · {h}
                      </span>
                    ))
                  : t.visit.hoursPending}
              </dd>
            </div>
          </dl>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              data-cta
              href={MAPS_DIRECTIONS}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('directions_click', { source: 'visit_split' })}
              className="btn-primary hover:bg-cream hover:text-obsidian"
            >
              {t.visit.directions}
            </a>
            <a
              data-cta
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="self-center text-sm text-sand transition-colors hover:text-ember"
            >
              {t.visit.viewMap}
            </a>
          </div>
        </div>

        {/* Right — the image and the conversion actions */}
        <div data-half="right" className="relative min-h-[52svh]">
          <Picture
            id="DSC09463"
            crop="ed"
            fill
            alt={
              locale === 'fr'
                ? 'Assiette de kababs variés servie avec du riz'
                : 'Platter of assorted kababs served with rice'
            }
            sizes="(max-width: 768px) 100vw, 50vw"
            className="absolute inset-0"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(to_top,rgba(11,11,11,0.92),rgba(11,11,11,0.25)_60%)]"
          />
          <div className="gutter relative flex h-full flex-col justify-end py-14">
            <div className="flex flex-wrap gap-4">
              <a
                data-cta
                href={orderHref}
                onClick={() => track('order_online_click', { source: 'visit_split' })}
                className="btn-primary hover:bg-cream hover:text-obsidian"
              >
                {t.nav.orderOnline}
              </a>
              <Link
                data-cta
                href={path('catering', locale)}
                className="btn-ghost hover:bg-brass hover:text-obsidian"
              >
                {t.platters.cateringCta}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
