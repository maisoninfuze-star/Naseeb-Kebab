'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { type Locale, path } from '@/lib/i18n'
import { getDict } from '@/data/dictionary'
import { byCategory, formatPrice } from '@/data/menu'
import { CONFIRMED } from '@/data/site'
import { registerGsap, gsap, prefersReducedMotion } from '@/lib/motion'
import Picture from '@/components/ui/Picture'
import { RevealLines } from '@/components/ui/Reveal'
import { track, trackOnce } from '@/lib/analytics'

/**
 * SHARING PLATTERS — EXPANDING TABLE REVEAL
 *
 * Opens as a narrow vertical slot and widens to full bleed as you scroll, so
 * the table appears to open out in front of you.
 *
 * IMPORTANT — what this section does NOT do: none of the three combos was
 * photographed, and the restaurant publishes no contents for any of them. So
 * the photograph here is a real Naseeb platter used as atmosphere and is
 * never captioned as a specific combo, and each combo is presented
 * typographically with its real price and an honest note that the contents
 * are still to be confirmed. Inventing a platter description for a $161 item
 * would be the single most damaging thing this page could do.
 */
export default function Platters({ locale }: { locale: Locale }) {
  const t = getDict(locale)
  const root = useRef<HTMLElement>(null)
  const frame = useRef<HTMLDivElement>(null)
  const combos = byCategory('partager')

  // Routes to the /order chooser rather than jumping to one platform:
  // delivery goes to DoorDash or Uber Eats, pickup is a phone call.
  const orderHref = path('order', locale)

  useEffect(() => {
    registerGsap()
    const el = frame.current
    const section = root.current
    if (!el || !section) return

    if (prefersReducedMotion()) {
      gsap.set(el, { width: '100%' })
      return
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { width: '38%' },
        {
          width: '100%',
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            end: 'top 18%',
            scrub: 0.7,
          },
        },
      )
    }, root)

    return () => ctx.revert()
  }, [])

  useEffect(() => {
    const el = root.current
    if (!el) return
    return trackOnce(el, 'platter_view', { section: 'home' })
  }, [])

  return (
    <section ref={root} className="section-pad relative overflow-hidden bg-obsidian">
      <div className="gutter">
        <span className="eyebrow flex items-center gap-3 text-ember">
          <span className="h-px w-8 bg-ember" aria-hidden />
          {t.platters.eyebrow}
        </span>
      </div>

      {/* The expanding crop. */}
      <div className="mt-8 flex justify-center">
        <div ref={frame} className="relative overflow-hidden" style={{ width: '38%' }}>
          <Picture
            id="DSC09453"
            crop="wide"
            alt={
              locale === 'fr'
                ? 'Grande assiette partagée de kababs variés avec du riz'
                : 'Large shared platter of assorted kababs with rice'
            }
            sizes="100vw"
            className="w-full"
            imgClassName="min-h-[46svh] object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(to_top,rgba(11,11,11,0.9),rgba(11,11,11,0.15)_55%,rgba(11,11,11,0.4))]"
          />
        </div>
      </div>

      <div className="gutter mt-12 grid gap-12 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-5">
          <RevealLines
            as="h2"
            lines={[t.platters.title]}
            className="text-[length:var(--text-title)] text-cream"
          />
          <p className="mt-6 max-w-sm text-base leading-relaxed text-cream/75">
            {t.platters.support}
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href={path('menu', locale) + '#partager'}
              className="btn-primary hover:bg-cream hover:text-obsidian"
            >
              {t.platters.explore}
            </Link>
            <a
              href={orderHref}
              onClick={() => track('order_online_click', { source: 'platters' })}
              className="btn-primary hover:bg-cream hover:text-obsidian"
            >
              {t.platters.orderGroup}
            </a>
          </div>
        </div>

        {/* The three combos, set as an editorial price list. */}
        <ul className="md:col-span-6 md:col-start-7">
          {combos.map((combo) => (
            <li
              key={combo.id}
              className="group border-t border-cream/12 py-6 first:border-t-0 md:py-7"
            >
              <div className="flex items-baseline justify-between gap-6">
                <h3 className="text-[length:var(--text-heading)] text-cream transition-colors group-hover:text-ember">
                  {combo.nameFr}
                </h3>
                <span className="shrink-0 font-body text-sm tabular-nums text-sand">
                  {formatPrice(combo.price, locale)}
                </span>
              </div>

              {/* Real contents when supplied; an honest note until then. */}
              {(locale === 'fr' ? combo.descFr : combo.descEn) ? (
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-cream/70">
                  {locale === 'fr' ? combo.descFr : combo.descEn}
                </p>
              ) : (
                <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-sand/60">
                  {t.platters.contentsPending}
                  <a
                    href={`tel:${CONFIRMED.phone}`}
                    onClick={() => track('phone_click', { source: 'platters' })}
                    className="text-ember underline-offset-4 hover:underline"
                  >
                    {t.platters.askUs}
                  </a>
                </p>
              )}
            </li>
          ))}

          <li className="pt-6">
            <Link
              href={path('catering', locale)}
              className="group inline-flex items-center gap-3 text-sm text-sand transition-colors hover:text-ember"
            >
              {t.platters.cateringCta}
              <span
                className="inline-block h-px w-8 bg-current transition-all duration-500 group-hover:w-12"
                aria-hidden
              />
            </Link>
          </li>
        </ul>
      </div>
    </section>
  )
}
