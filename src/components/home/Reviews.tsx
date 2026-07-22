'use client'

import { type Locale } from '@/lib/i18n'
import { getDict } from '@/data/dictionary'

/**
 * INFINITE EDITORIAL TESTIMONIAL MARQUEE
 *
 * The marquee itself is built and styled, but it renders NOTHING until real
 * reviews exist. No placeholder testimonials, no lorem, no invented names —
 * fabricated reviews are both a trust problem and, in Canada, a deceptive
 * marketing practice under the Competition Act.
 *
 * Feed it real Google reviews (via the Places API or a paste from the admin)
 * and the rail comes alive with no further work.
 */
export type Review = {
  id: string
  rating: number
  text: string
  author: string
  source: string
  dish?: string
}

export default function Reviews({
  locale,
  reviews = [],
}: {
  locale: Locale
  reviews?: Review[]
}) {
  const t = getDict(locale)

  if (!reviews.length) {
    return (
      <section className="border-y border-cream/10 bg-obsidian py-16">
        <div className="gutter">
          <span className="eyebrow text-ember">{t.reviews.eyebrow}</span>
          <p className="mt-4 max-w-md text-sm text-sand/60">{t.reviews.empty}</p>
        </div>
      </section>
    )
  }

  // Duplicated once so the -50% translate loops seamlessly.
  const rail = [...reviews, ...reviews]

  return (
    <section className="section-pad overflow-hidden bg-obsidian">
      <div className="gutter">
        <span className="eyebrow flex items-center gap-3 text-ember">
          <span className="h-px w-8 bg-ember" aria-hidden />
          {t.reviews.eyebrow}
        </span>
        <h2 className="mt-5 text-[length:var(--text-title)] text-cream">{t.reviews.title}</h2>
      </div>

      <div className="marquee-wrap mt-12 overflow-hidden">
        <ul className="marquee-track flex w-max gap-6">
          {rail.map((r, i) => (
            <li
              key={`${r.id}-${i}`}
              className="w-[78vw] shrink-0 border border-cream/10 p-7 sm:w-[36vw] lg:w-[26vw]"
              aria-hidden={i >= reviews.length}
            >
              <div className="flex items-center gap-1 text-ember" aria-label={`${r.rating} / 5`}>
                {Array.from({ length: 5 }).map((_, s) => (
                  <span key={s} className={s < r.rating ? 'opacity-100' : 'opacity-25'} aria-hidden>
                    ★
                  </span>
                ))}
              </div>
              <blockquote className="mt-5 text-base leading-relaxed text-cream/85">
                {r.text}
              </blockquote>
              <footer className="mt-5 text-xs text-sand/60">
                {r.author} · {r.source}
                {r.dish && ` · ${r.dish}`}
              </footer>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
