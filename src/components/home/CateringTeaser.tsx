'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { type Locale, path } from '@/lib/i18n'
import { getDict } from '@/data/dictionary'
import { registerGsap, gsap, prefersReducedMotion } from '@/lib/motion'
import Picture from '@/components/ui/Picture'

/** CATERING & EVENTS teaser — IMAGE CURTAIN REVEAL. */
export default function CateringTeaser({ locale }: { locale: Locale }) {
  const t = getDict(locale)
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    registerGsap()
    if (prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      gsap.to('[data-curtain-c]', {
        scaleX: 0,
        transformOrigin: 'right',
        duration: 1.25,
        ease: 'power3.inOut',
        scrollTrigger: { trigger: root.current, start: 'top 74%', once: true },
      })
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className="section-pad bg-cream text-charcoal">
      <div className="gutter grid gap-12 md:grid-cols-12 md:gap-12">
        <div className="flex flex-col justify-center md:col-span-5">
          <span className="eyebrow flex items-center gap-3 text-ember">
            <span className="h-px w-8 bg-ember" aria-hidden />
            {t.catering.eyebrow}
          </span>
          <h2 className="mt-5 text-[length:var(--text-title)]">{t.catering.title}</h2>
          <p className="mt-6 max-w-sm text-base leading-relaxed text-charcoal/70">
            {t.catering.support}
          </p>

          <ul className="mt-8 flex flex-wrap gap-x-3 gap-y-2">
            {t.catering.services.map((s) => (
              <li
                key={s}
                className="border border-charcoal/20 px-3 py-1.5 text-xs tracking-wide text-charcoal/75"
              >
                {s}
              </li>
            ))}
          </ul>

          <Link
            href={path('catering', locale)}
            className="mt-10 self-start btn-ghost border-copper-deep/60 text-copper-deep hover:bg-obsidian hover:text-cream hover:border-obsidian"
          >
            {t.catering.cta}
          </Link>
        </div>

        <div className="md:col-span-6 md:col-start-7">
          <div className="relative overflow-hidden">
            <Picture
              id="DSC09446"
              crop="ed"
              alt={
                locale === 'fr'
                  ? 'Grande assiette partagée, format groupe'
                  : 'Large shared platter, group size'
              }
              sizes="(max-width: 768px) 90vw, 45vw"
              className="w-full"
            />
            <span
              data-curtain-c
              aria-hidden
              className="absolute inset-0 origin-right bg-cream"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
