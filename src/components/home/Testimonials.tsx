'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { type Locale } from '@/lib/i18n'
import { REVIEWS, REVIEW_AGGREGATE } from '@/data/reviews'
import { prefersReducedMotion } from '@/lib/motion'
import Picture from '@/components/ui/Picture'
import { cn } from '@/lib/utils'

/**
 * TESTIMONIALS SLIDER
 *
 * Layout follows the supplied reference: blurred photographic ground, headline
 * left with arrows right, then a horizontal track of cards where the next card
 * peeks in from the edge. Everything else is rebuilt on this project's tokens —
 * obsidian/charcoal ground, cream card, Cormorant display, Manrope eyebrow,
 * ember and brass accents — so it reads as part of the site rather than a
 * pasted-in block.
 *
 * Two deliberate departures from the reference:
 *
 * · NO AVATAR PHOTOS. The reference pairs each quote with a portrait. We have
 *   no photographs of these customers, and putting a stock face next to a real
 *   person's name misattributes them. Initials in a brass ring instead.
 *
 * · The card image is a DISH, not a person — the only honest photography we
 *   have. Each review is paired with a real plate from the shoot.
 *
 * Every quote in `reviews.ts` is verbatim from the restaurant's public Google
 * listing. Nothing here is written copy.
 */

/** Dish frames paired with each review, cycled if reviews outnumber them. */
const CARD_IMAGES = [
  'DSC09444', // Sultan platter
  'DSC09509', // Qabuli lamb shank
  'DSC09476', // Chopan kabab
  'DSC09513', // Mantu
  'DSC09463', // Barg kabab
  'DSC09471', // Chaplee
  'DSC09545', // Firni
]

const COPY = {
  fr: {
    eyebrow: 'Avis',
    title: ['Ce que les gens', 'disent de nous'],
    aggregate: (r: number, c: number) => `${r} sur 5 · ${c} avis Google`,
    prev: 'Avis précédent',
    next: 'Avis suivant',
    goTo: (n: number) => `Aller à l’avis ${n}`,
    verified: 'Avis Google vérifié',
  },
  en: {
    eyebrow: 'Reviews',
    title: ['What people', 'say about us'],
    aggregate: (r: number, c: number) => `${r} out of 5 · ${c} Google reviews`,
    prev: 'Previous review',
    next: 'Next review',
    goTo: (n: number) => `Go to review ${n}`,
    verified: 'Verified Google review',
  },
}

export default function Testimonials({ locale }: { locale: Locale }) {
  const t = COPY[locale]
  const [index, setIndex] = useState(0)
  const [step, setStep] = useState(0)
  /**
   * Starts TRUE — visible by default.
   *
   * The blur-in is decoration; a readable headline is not. Starting at
   * `false` means any failure of the observer (a collapsed container, a
   * throttled/background tab that never advances the transition, a browser
   * that skips the callback) leaves a blank headline on a live page. Starting
   * visible makes the worst case "the animation didn't play", which nobody
   * notices, instead of "the headline is missing", which everybody does.
   *
   * The effect below sets it to false only once it has confirmed the element
   * is off-screen and can therefore genuinely animate in.
   */
  const [headingIn, setHeadingIn] = useState(true)

  const trackRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)

  const last = REVIEWS.length - 1

  /**
   * Heading entrance — blur-to-sharp, matching the site's reveal language.
   *
   * `threshold: 0.1` alone is not safe here. If the element has zero area when
   * the observer starts — a collapsed container, a hidden ancestor, a viewport
   * that has not resolved — a 10% ratio can never be satisfied, the callback
   * never fires, and the heading stays invisible forever. That is a blank
   * headline on a live page, so it needs a floor, not just a trigger:
   *
   *   · threshold 0 fires on any intersection at all
   *   · an explicit bounds check catches the case where it is already in view
   *     at mount (observers do not retroactively report that reliably)
   *   · a timeout reveals it regardless after 1.2s
   *
   * The animation is the enhancement; being readable is not negotiable.
   */
  useEffect(() => {
    const el = headingRef.current
    if (!el) return
    if (prefersReducedMotion()) {
      setHeadingIn(true)
      return
    }

    // Only arm the animation if the heading is genuinely below the fold. If
    // it is already on screen we leave it visible and skip the effect — there
    // is nothing to animate in, and hiding it first would cause a flash.
    const r = el.getBoundingClientRect()
    const offscreen = r.top >= window.innerHeight
    if (!offscreen) return

    setHeadingIn(false)

    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setHeadingIn(true)
          obs.disconnect()
        }
      },
      { threshold: 0 },
    )
    obs.observe(el)

    // Belt and braces: reveal regardless after 2.5s, so a throttled tab or a
    // missed callback can never leave the headline permanently blank.
    const failsafe = window.setTimeout(() => setHeadingIn(true), 2500)

    return () => {
      obs.disconnect()
      window.clearTimeout(failsafe)
    }
  }, [])

  /**
   * Measure one card + gap so the track translates by real pixels.
   *
   * A plain measure-on-mount is not enough here: the card is `w-[88%]` of a
   * container that is itself still resolving when the effect first runs, so
   * offsetWidth reads 0 and the track would never move. A ResizeObserver on
   * the card catches the real width the moment layout settles — and doubles
   * as the breakpoint handler, replacing a window resize listener.
   */
  useEffect(() => {
    const track = trackRef.current
    const card = track?.firstElementChild as HTMLElement | null
    if (!track || !card) return

    const measure = () => {
      const gap = parseFloat(getComputedStyle(track).columnGap || '0') || 0
      const w = card.getBoundingClientRect().width
      if (w > 0) setStep(w + gap)
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(card)
    return () => ro.disconnect()
  }, [])

  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), [])
  const next = useCallback(() => setIndex((i) => Math.min(last, i + 1)), [last])

  /* Arrow keys when the slider has focus — expected of a carousel. */
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); prev() }
    if (e.key === 'ArrowRight') { e.preventDefault(); next() }
  }

  return (
    <section className="relative overflow-hidden bg-charcoal py-24 md:py-32">
      {/* Blurred photographic ground. Heavily darkened so cream type over it
          keeps contrast — the reference sits on a mid-brown, ours on obsidian. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <Picture
          id="DSC09444"
          crop="wide"
          fill
          alt=""
          sizes="100vw"
          className="absolute inset-0 h-full w-full"
          imgClassName="scale-110 blur-2xl"
        />
        <div className="absolute inset-0 bg-obsidian/85" />
      </div>

      <div className="gutter relative">
        {/* ── Headline + arrows ── */}
        <div className="mb-12 flex items-end justify-between gap-8 md:mb-16">
          <div>
            <span className="eyebrow flex items-center gap-3 text-ember">
              <span className="h-px w-8 bg-ember" aria-hidden />
              {t.eyebrow}
            </span>

            {/* Reveal is driven by INLINE style, not utility classes.
                Tailwind v4 composes `filter` from a `--tw-blur` custom property,
                and `blur-0` does not reliably reset a value another class set —
                the computed filter stayed at blur(16px) while the class list
                already read `blur-0`, leaving the headline permanently
                invisible. Inline styles are unambiguous and win outright. */}
            <h2
              ref={headingRef}
              className="mt-6 text-[length:var(--text-title)] text-cream motion-reduce:transition-none"
              style={{
                opacity: headingIn ? 1 : 0,
                filter: headingIn ? 'blur(0px)' : 'blur(16px)',
                transition: 'opacity 1s cubic-bezier(0.22,1,0.36,1), filter 1s cubic-bezier(0.22,1,0.36,1)',
              }}
            >
              {t.title.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>

            {/* Aggregate — measured, from the source we quote. */}
            <p className="mt-6 flex flex-wrap items-center gap-3 text-sm text-sand/70">
              <Stars value={REVIEW_AGGREGATE.rating} />
              <span>{t.aggregate(REVIEW_AGGREGATE.rating, REVIEW_AGGREGATE.count)}</span>
            </p>
          </div>

          <div className="hidden shrink-0 items-center gap-3 md:flex">
            <Arrow dir="prev" label={t.prev} onClick={prev} disabled={index === 0} />
            <Arrow dir="next" label={t.next} onClick={next} disabled={index === last} />
          </div>
        </div>

        {/* ── Track ── */}
        <div
          className="overflow-hidden"
          role="group"
          aria-roledescription="carousel"
          aria-label={t.eyebrow}
          tabIndex={0}
          onKeyDown={onKeyDown}
        >
          <div
            ref={trackRef}
            className="flex gap-4 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
            style={{ transform: `translate3d(-${index * step}px,0,0)` }}
          >
            {REVIEWS.map((r, i) => (
              <article
                key={r.id}
                aria-hidden={i !== index}
                className="w-[88%] shrink-0 lg:w-[82%]"
              >
                <div className="grid h-full gap-8 bg-cream p-5 text-charcoal md:grid-cols-[1fr_1.4fr] md:gap-12 md:p-6">
                  {/* Dish, not a face — see the note at the top of this file. */}
                  <div className="hidden overflow-hidden md:block">
                    <Picture
                      id={CARD_IMAGES[i % CARD_IMAGES.length]}
                      crop="ed"
                      alt=""
                      sizes="(max-width: 1024px) 40vw, 32vw"
                      className="h-full w-full"
                    />
                  </div>

                  <div className="flex flex-col justify-between gap-10 md:py-4 md:pr-4">
                    <div>
                      <Stars value={r.rating} tone="dark" />
                      <blockquote className="mt-6 font-display text-[clamp(1.4rem,2.6vw,2.3rem)] leading-[1.18] tracking-[-0.01em] text-charcoal">
                        {r.text}
                      </blockquote>
                    </div>

                    <footer className="flex items-center gap-4">
                      {/* Initials, not a stock portrait. */}
                      <span
                        aria-hidden
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-copper-deep/40 font-body text-xs font-medium tracking-wider text-copper-deep"
                      >
                        {initials(r.author)}
                      </span>
                      <span className="flex flex-col">
                        <cite className="font-body text-sm font-medium not-italic text-charcoal">
                          {r.author}
                        </cite>
                        <span className="text-xs text-charcoal/55">{t.verified}</span>
                      </span>
                    </footer>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* ── Dots (mobile) ── */}
        <div className="mt-6 flex items-center justify-center gap-2 md:hidden">
          {REVIEWS.map((r, i) => (
            <button
              key={r.id}
              onClick={() => setIndex(i)}
              aria-label={t.goTo(i + 1)}
              aria-current={i === index}
              className="-my-3 py-3"
            >
              <span
                className={cn(
                  'block h-1 rounded-full transition-all duration-500',
                  i === index ? 'w-6 bg-ember' : 'w-2 bg-cream/30',
                )}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── helpers ─────────────────────────────────────────────────────── */

function initials(name: string) {
  return name
    .split(/[\s-]+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

/** Rating as filled/empty marks. Rounds to the nearest half for the aggregate. */
function Stars({ value, tone = 'light' }: { value: number; tone?: 'light' | 'dark' }) {
  return (
    <span
      className="inline-flex items-center gap-1"
      role="img"
      aria-label={`${value} / 5`}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <svg
          key={i}
          width="13"
          height="13"
          viewBox="0 0 24 24"
          aria-hidden
          className={cn(
            i < Math.round(value)
              ? 'text-ember'
              : tone === 'dark'
                ? 'text-charcoal/20'
                : 'text-cream/25',
          )}
        >
          <path
            fill="currentColor"
            d="M12 2.6l2.7 5.9 6.3.7-4.7 4.3 1.3 6.3L12 16.6 6.4 19.8l1.3-6.3L3 9.2l6.3-.7z"
          />
        </svg>
      ))}
    </span>
  )
}

function Arrow({
  dir,
  label,
  onClick,
  disabled,
}: {
  dir: 'prev' | 'next'
  label: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        'grid h-12 w-12 place-items-center rounded-full border backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
        'border-cream/20 bg-cream/10 text-cream',
        disabled
          ? 'cursor-default opacity-30'
          : 'hover:border-cream hover:bg-cream hover:text-obsidian active:scale-90',
      )}
    >
      <svg width="11" height="20" viewBox="0 0 11 20" fill="none" aria-hidden>
        <path
          d={dir === 'prev' ? 'M9.7 2L1.7 10l8 8' : 'M1.3 18l8-8-8-8'}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="square"
        />
      </svg>
    </button>
  )
}
