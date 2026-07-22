'use client'

import { useEffect, useRef } from 'react'
import { type Locale } from '@/lib/i18n'
import { getDict } from '@/data/dictionary'
import { registerGsap, gsap, prefersReducedMotion } from '@/lib/motion'
import Picture from '@/components/ui/Picture'
import { RevealUp } from '@/components/ui/Reveal'

/**
 * AFGHAN CLASSICS — ASYMMETRICAL EDITORIAL COLLAGE REVEAL
 *
 * Irregular sizes, different entry directions, slight rotations, and each
 * plate drifting at its own parallax speed. Rotations are kept under 1.6° —
 * enough to read as a printed photograph laid on a page, not enough to look
 * like a scrapbook effect.
 *
 * Captions describe only what is verifiably in the dish (yogurt, dried mint,
 * chives, tomato, raisins, carrots). No historical or cultural claims are
 * made — the brief forbids inventing them and none were supplied.
 */
type Plate = {
  id: string
  captionFr: string
  captionEn: string
  className: string
  from: 'left' | 'right' | 'up'
  speed: number
  rotate: number
}

const PLATES: Plate[] = [
  {
    id: 'DSC09513',
    captionFr: 'Mantu — yogourt, menthe séchée, sauce tomate',
    captionEn: 'Mantu — yogurt, dried mint, tomato sauce',
    className: 'col-span-7 md:col-span-4 md:col-start-1 md:row-start-1',
    from: 'left', speed: 0.14, rotate: -1.2,
  },
  {
    id: 'DSC09522',
    captionFr: 'Ashak — la pâte plus fine, la ciboulette',
    captionEn: 'Ashak — the thinner dough, the chives',
    className: 'col-span-5 col-start-8 md:col-span-3 md:col-start-6 md:row-start-1 md:mt-24',
    from: 'right', speed: 0.22, rotate: 1.4,
  },
  {
    id: 'DSC09506',
    captionFr: 'Banjan burani — aubergine, tomate, yogourt',
    captionEn: 'Banjan burani — eggplant, tomato, yogurt',
    className: 'col-span-6 md:col-span-4 md:col-start-9 md:row-start-1 md:mt-4',
    from: 'right', speed: 0.1, rotate: -0.8,
  },
  {
    id: 'DSC09509',
    captionFr: 'Qabuli — riz, raisins secs, carottes',
    captionEn: 'Qabuli — rice, raisins, carrots',
    className: 'col-span-6 col-start-7 md:col-span-5 md:col-start-2 md:row-start-2 md:-mt-16',
    from: 'up', speed: 0.18, rotate: 1.1,
  },
  {
    id: 'DSC09537',
    captionFr: 'Sabzi — épinards mijotés',
    captionEn: 'Sabzi — slow-cooked spinach',
    className: 'col-span-6 md:col-span-4 md:col-start-8 md:row-start-2 md:mt-6',
    from: 'left', speed: 0.26, rotate: -1.5,
  },
]

export default function Classics({ locale }: { locale: Locale }) {
  const t = getDict(locale)
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    registerGsap()
    if (prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      PLATES.forEach((plate, i) => {
        const el = document.querySelector<HTMLElement>(`[data-plate="${i}"]`)
        if (!el) return

        const offset =
          plate.from === 'left' ? { x: -48, y: 0 } : plate.from === 'right' ? { x: 48, y: 0 } : { x: 0, y: 56 }

        gsap.fromTo(
          el,
          { opacity: 0, ...offset },
          {
            opacity: 1, x: 0, y: 0,
            duration: 1.1, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          },
        )

        // MULTI-SPEED IMAGE PARALLAX — each plate drifts at its own rate.
        gsap.to(el.querySelector('picture'), {
          yPercent: -plate.speed * 44,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
        })
      })
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className="section-pad relative overflow-hidden bg-cream text-charcoal">
      <div className="gutter">
        <div className="max-w-2xl">
          <span className="eyebrow flex items-center gap-3 text-ember">
            <span className="h-px w-8 bg-ember" aria-hidden />
            {t.classics.eyebrow}
          </span>
          <h2 className="mt-5 text-[length:var(--text-title)]">{t.classics.title}</h2>
          <RevealUp>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-charcoal/70">
              {t.classics.body}
            </p>
          </RevealUp>
        </div>

        <div className="mt-16 grid grid-cols-12 gap-x-4 gap-y-10 md:mt-24 md:gap-x-6 md:gap-y-0">
          {PLATES.map((plate, i) => (
            <figure
              key={plate.id}
              data-plate={i}
              className={plate.className}
              style={{ rotate: `${plate.rotate}deg` }}
            >
              <div className="overflow-hidden">
                <Picture
                  id={plate.id}
                  crop={i % 2 === 0 ? 'ed' : 'sq'}
                  alt=""
                  sizes="(max-width: 768px) 45vw, 30vw"
                  className="w-full transition-transform duration-[900ms] hover:scale-[1.03]"
                />
              </div>
              <figcaption className="mt-3 text-xs leading-relaxed text-charcoal/60">
                {locale === 'fr' ? plate.captionFr : plate.captionEn}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
