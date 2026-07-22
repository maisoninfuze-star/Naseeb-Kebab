'use client'

import { useEffect, useRef } from 'react'
import { type Locale } from '@/lib/i18n'
import { getDict } from '@/data/dictionary'
import { registerGsap, gsap, ScrollTrigger } from '@/lib/motion'
import Picture from '@/components/ui/Picture'

/**
 * PINNED FIRE SEQUENCE
 *
 * Pinned for ~2.5 screen heights while three text chapters pass through and
 * the ember glow rises with scroll progress.
 *
 * A note on the imagery: no photograph of the grill, the charcoal or the
 * kitchen exists in the supplied shoot. Rather than fabricate a grill scene,
 * the three chapters use real plated frames that genuinely read as
 * preparation → grilled → served, and the fire itself is expressed through
 * light: an ember glow that intensifies as you scroll. When the restaurant
 * supplies real charcoal photography, swap `CHAPTER_IMAGES` and nothing else
 * needs to change.
 */
const CHAPTER_IMAGES = ['DSC09467', 'DSC09476', 'DSC09453']

export default function CharcoalStory({ locale }: { locale: Locale }) {
  const t = getDict(locale)
  const root = useRef<HTMLElement>(null)
  const glow = useRef<HTMLDivElement>(null)

  useEffect(() => {
    registerGsap()
    const section = root.current
    if (!section) return

    const mm = gsap.matchMedia()

    // Desktop only. Pinning 2.5 screen-heights on a phone means two and a half
    // screens of scrolling that appear to do nothing, and it fights the
    // browser's own address-bar collapse. On mobile the three chapters simply
    // stack and reveal as you pass them.
    mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=250%',
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      })

      // Ember glow swells across the whole sequence.
      tl.fromTo(glow.current, { opacity: 0.18, scale: 0.9 }, { opacity: 0.5, scale: 1.25, ease: 'none' }, 0)

      // Cross-fade the three visuals and their chapters.
      CHAPTER_IMAGES.forEach((_, i) => {
        const at = i / CHAPTER_IMAGES.length
        if (i > 0) {
          tl.to(`[data-fig="${i - 1}"]`, { opacity: 0, duration: 0.12 }, at)
          tl.to(`[data-chapter="${i - 1}"]`, { opacity: 0, y: -18, duration: 0.12 }, at)
        }
        tl.fromTo(
          `[data-fig="${i}"]`,
          { opacity: i === 0 ? 1 : 0, scale: 1.05 },
          { opacity: 1, scale: 1, duration: 0.16, ease: 'none' },
          at,
        )
        tl.fromTo(
          `[data-chapter="${i}"]`,
          { opacity: i === 0 ? 1 : 0, y: i === 0 ? 0 : 24 },
          { opacity: 1, y: 0, duration: 0.16 },
          at,
        )
      })

      return () => tl.kill()
    })

    // ── MOBILE ────────────────────────────────────────────────────────────
    // The pin stays desktop-only — 2.5 screen-heights of "scrolling that does
    // nothing" is miserable on a phone and fights the address-bar collapse.
    // But that previously left mobile with NO motion at all: three images
    // stacked flat while desktop got a whole cinematic sequence.
    //
    // So mobile gets the same four ideas, re-staged as per-chapter reveals
    // that fire as you pass each one:
    //   · ember glow tracks scroll through the section (was: swells over pin)
    //   · image uncovers with a curtain wipe + settles from 1.06 (was: crossfade)
    //   · image drifts against the text as you scroll (multi-speed parallax)
    //   · chapter number, title and body rise in sequence (was: crossfade)
    mm.add('(max-width: 767px) and (prefers-reduced-motion: no-preference)', () => {
      const ctx = gsap.context(() => {
        // Glow follows scroll progress through the whole section.
        gsap.fromTo(
          glow.current,
          { opacity: 0.12, scale: 0.85 },
          {
            opacity: 0.42,
            scale: 1.15,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          },
        )

        CHAPTER_IMAGES.forEach((_, i) => {
          const fig = section.querySelector<HTMLElement>(`[data-fig="${i}"]`)
          const chap = section.querySelector<HTMLElement>(`[data-chapter="${i}"]`)

          if (fig) {
            // Curtain wipe + settle.
            gsap.fromTo(
              fig,
              { clipPath: 'inset(0% 0% 100% 0%)', scale: 1.06 },
              {
                clipPath: 'inset(0% 0% 0% 0%)',
                scale: 1,
                duration: 1.2,
                ease: 'power3.out',
                scrollTrigger: { trigger: fig, start: 'top 85%', once: true },
              },
            )
            // Gentle drift so the image and its text move at different speeds.
            gsap.fromTo(
              fig,
              { yPercent: 4 },
              {
                yPercent: -4,
                ease: 'none',
                scrollTrigger: { trigger: fig, start: 'top bottom', end: 'bottom top', scrub: true },
              },
            )
          }

          if (chap) {
            gsap.fromTo(
              chap.children,
              { opacity: 0, y: 22 },
              {
                opacity: 1,
                y: 0,
                duration: 0.85,
                ease: 'power3.out',
                stagger: 0.09,
                scrollTrigger: { trigger: chap, start: 'top 88%', once: true },
              },
            )
          }
        })
      }, section)

      return () => ctx.revert()
    })

    // Reduced motion: neither branch registers, so the chapters simply stack
    // and are all visible. Stillness is the accommodation, not a faster tween.
    return () => {
      mm.revert()
      ScrollTrigger.refresh()
    }
  }, [])

  return (
    // Stable wrapper — see the same note in PlateHero. GSAP's pin reparents
    // this section into a `.pin-spacer`; the wrapper keeps React removing a
    // node it still owns, so navigating away can't throw removeChild NotFound.
    <div>
    <section
      ref={root}
      className="relative overflow-hidden bg-obsidian motion-reduce:h-auto md:h-[100svh]"
    >
      {/* Ember field behind everything. */}
      <div
        ref={glow}
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[70vmax] w-[70vmax] -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            'radial-gradient(circle, rgba(241,90,36,0.35) 0%, rgba(201,67,26,0.14) 34%, transparent 66%)',
          filter: 'blur(70px)',
        }}
      />

      <div className="gutter flex h-full flex-col justify-center py-[var(--section-y)]">
        <h2 className="max-w-2xl text-[length:var(--text-title)] text-cream">
          {t.charcoal.title.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h2>

        {/*
          Image and its chapter are SIBLINGS inside one wrapper per chapter.

          They used to live in two separate columns — all three images in one,
          all three chapters in the other. On desktop that is correct, because
          both columns are absolutely stacked and cross-faded. On mobile the
          grid collapsed to a single column and rendered image, image, image,
          then text, text, text: every photo was divorced from its own words,
          with "La marinade" landing ~1300px below the picture it describes.

          `md:contents` dissolves the per-chapter wrapper at the md breakpoint
          so the figure and the copy become direct grid children again and the
          desktop pinned layout is completely unchanged.
        */}
        <div className="mt-12 md:mt-16 md:grid md:grid-cols-2 md:items-center md:gap-16">
          {t.charcoal.chapters.map((c, i) => (
            <div key={c.n} className="mb-16 last:mb-0 md:contents">
              {/* Desktop stacking is done with GRID PLACEMENT, not absolute
                  positioning: every figure is assigned col 1 / row 1 and every
                  chapter col 2 / row 1, so same-cell items overlap natively.
                  That removes the need for a positioned ancestor — which
                  `md:contents` has just dissolved — and keeps the cell sized by
                  its content instead of collapsing to zero height. */}
              <div
                data-fig={i}
                className="overflow-hidden will-change-[clip-path,transform] md:col-start-1 md:row-start-1 md:aspect-[4/5]"
                style={{ opacity: i === 0 ? 1 : undefined }}
              >
                <Picture
                  id={CHAPTER_IMAGES[i]}
                  crop="ed"
                  alt=""
                  sizes="(max-width: 768px) 90vw, 45vw"
                  className="h-full w-full"
                />
              </div>

              <div
                data-chapter={i}
                className="mt-7 md:col-start-2 md:row-start-1 md:mt-0 md:min-h-[16rem] md:self-center"
                style={{ opacity: i === 0 ? 1 : undefined }}
              >
                <span className="eyebrow block text-ember">{c.n}</span>
                <h3 className="mt-4 text-[length:var(--text-heading)] text-cream">{c.title}</h3>
                <p className="mt-4 max-w-sm text-base leading-relaxed text-cream/75">{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
    </div>
  )
}
