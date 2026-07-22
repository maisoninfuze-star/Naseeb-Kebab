'use client'

import { useEffect, useRef } from 'react'
import { type Locale } from '@/lib/i18n'
import { getDict } from '@/data/dictionary'
import { registerGsap, gsap, prefersReducedMotion } from '@/lib/motion'
import { RevealLines } from '@/components/ui/Reveal'

/**
 * EDITORIAL BRAND STATEMENT — the one warm-cream section on the homepage.
 *
 * This is the palette pivot: after a black hero, the page opens onto paper.
 * That contrast is doing the work, so the section holds a single thought and
 * a great deal of air. EDITORIAL TEXT WIPE draws a thin ember rule across the
 * full width, then the lines follow it in.
 */
export default function Statement({ locale }: { locale: Locale }) {
  const t = getDict(locale)
  const root = useRef<HTMLElement>(null)
  const rule = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    registerGsap()
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) {
        gsap.set(rule.current, { scaleX: 1 })
        return
      }
      gsap.fromTo(
        rule.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.4,
          ease: 'power3.inOut',
          scrollTrigger: { trigger: root.current, start: 'top 78%', once: true },
        },
      )
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className="section-pad bg-cream text-charcoal">
      <div className="gutter">
        <span
          ref={rule}
          className="block h-px w-full origin-left bg-ember"
          aria-hidden
        />

        <div className="mt-14 grid gap-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-8 md:col-start-2">
            <RevealLines
              as="p"
              delay={0.35}
              lines={splitQuote(t.statement.quote)}
              className="font-display text-[length:var(--text-title)] leading-[1.08] tracking-[-0.02em]"
            />

            <p className="mt-10 max-w-md text-base leading-relaxed text-charcoal/70">
              {t.statement.sub}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * Break the statement into typographic lines at clause boundaries.
 * Authored breaks beat runtime splitting — they survive resize and screen
 * readers still receive one continuous sentence.
 */
function splitQuote(quote: string): string[] {
  const parts = quote.split(/(?<=[:,])\s+/)
  if (parts.length >= 3) return parts
  // Fall back to thirds on word boundaries.
  const words = quote.split(' ')
  const size = Math.ceil(words.length / 3)
  return [
    words.slice(0, size).join(' '),
    words.slice(size, size * 2).join(' '),
    words.slice(size * 2).join(' '),
  ].filter(Boolean)
}
