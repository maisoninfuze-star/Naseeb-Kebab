'use client'

import { useEffect, useRef } from 'react'
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * EDITORIAL SPLIT HERO
 *
 * Text column left, cinematic video right, inside one rounded editorial frame.
 * 40/60 on desktop, 45/55 on tablet, stacked on mobile with the text first.
 *
 * ═══════════════════════════════════════════════════════════════════
 * FULLY PROP-DRIVEN, ON PURPOSE
 * ═══════════════════════════════════════════════════════════════════
 * Every word and asset is a prop. The same component serves a restaurant
 * catering section and an agency landing page with no forking — which is the
 * difference between a reusable component and a template someone copy-pastes
 * and then edits in five places.
 *
 * ═══════════════════════════════════════════════════════════════════
 * VISIBILITY IS NOT ANIMATED AWAY
 * ═══════════════════════════════════════════════════════════════════
 * Framer's `whileInView` is used with `once: true`, and every animated element
 * ends at opacity 1. Under `prefers-reduced-motion` the variants collapse to
 * their final state rather than being skipped — skipping a hidden-by-default
 * element leaves a blank hero, which is a far worse failure than a missing
 * animation. Nothing here can render invisible.
 */

export interface EditorialSplitHeroProps {
  /** Small uppercase label above the heading. */
  eyebrow: string
  /** One array entry per visual line — each reveals on its own stagger beat. */
  headingLines: string[]
  paragraph: string
  /** Desktop video (near-square panel). */
  videoSrc: string
  /** Optional portrait cut for stacked mobile. Falls back to `videoSrc`. */
  videoSrcMobile?: string
  /** Shown while the video streams — this is the LCP element. */
  poster?: string
  /**
   * Describe the footage for assistive tech. Omit for purely decorative
   * video; the element is then hidden from the a11y tree entirely.
   */
  videoLabel?: string
  /** Put the video on the left instead. Useful for alternating sections. */
  reverse?: boolean
  className?: string
  /** Rendered under the paragraph — a text link, never a button (per spec). */
  children?: React.ReactNode
}

const EASE = [0.22, 1, 0.36, 1] as const

export default function EditorialSplitHero({
  eyebrow,
  headingLines,
  paragraph,
  videoSrc,
  videoSrcMobile,
  poster,
  videoLabel,
  reverse = false,
  className,
  children,
}: EditorialSplitHeroProps) {
  const reduce = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)

  /* Subtle float as the section passes — a few pixels, not a ride. */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const floatRaw = useTransform(scrollYProgress, [0, 1], [18, -18])
  const float = useSpring(floatRaw, { stiffness: 60, damping: 20, mass: 0.4 })

  /**
   * Mouse parallax on the video — ±10px, spring-damped.
   *
   * Applied to an inner wrapper, never to the element carrying the scroll
   * float: two transforms competing for the same `y` produce a fight, not a
   * parallax. Pointer position is normalised against the panel's own box so
   * the effect is identical wherever the section sits on the page.
   */
  const px = useSpring(0, { stiffness: 90, damping: 22, mass: 0.5 })
  const py = useSpring(0, { stiffness: 90, damping: 22, mass: 0.5 })

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    // Coarse pointers report a single tap position — parallax there is jitter.
    if (reduce || e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    px.set(((e.clientX - r.left) / r.width - 0.5) * 20)
    py.set(((e.clientY - r.top) / r.height - 0.5) * 20)
  }

  const onPointerLeave = () => {
    px.set(0)
    py.set(0)
  }

  /**
   * Play only while on screen.
   *
   * `autoplay` alone keeps decoding a video nobody is looking at — real
   * battery and CPU on a phone, for a section that may be three screens away.
   * Pausing off-screen costs nothing and is invisible to the user.
   *
   * Guarded because `play()` rejects if the element is detached or the browser
   * blocks it; an unhandled rejection would surface as a console error.
   */
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const el = videoRef.current
    if (!el) return

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void el.play().catch(() => {})
        else el.pause()
      },
      { threshold: 0.1 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  /** Reduced motion: same end state, no travel. */
  const v = (from: Record<string, unknown>): Variants => ({
    hidden: reduce ? { opacity: 1 } : { opacity: 0, ...from },
    show: { opacity: 1, x: 0, y: 0, filter: 'blur(0px)' },
  })

  const viewport = { once: true, amount: 0.25 } as const

  return (
    <motion.section
      ref={sectionRef}
      style={reduce ? undefined : { y: float }}
      className={cn('gutter py-16 md:py-24', className)}
    >
      {/* The frame. `group` drives the hover states below. */}
      <div
        className={cn(
          'group relative grid min-h-[85svh] overflow-hidden rounded-[32px] bg-obsidian',
          'md:grid-cols-[45fr_55fr] lg:grid-cols-[40fr_60fr]',
          reverse && 'md:[direction:rtl]',
        )}
      >
        {/* ── Text column ─────────────────────────────────────────── */}
        <div
          className={cn(
            'order-1 flex flex-col justify-center px-7 py-16 sm:px-10 md:px-12 md:py-20 lg:px-16',
            reverse && 'md:[direction:ltr]',
          )}
        >
          <motion.p
            variants={v({ y: 18 })}
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            transition={{ duration: 0.7, ease: EASE }}
            className="text-[11px] font-medium uppercase tracking-[0.25em] text-sand/55"
          >
            {eyebrow}
          </motion.p>

          {/* Each line is its own overflow-hidden mask so the reveal reads as
              type rising off a baseline rather than a block fading in. */}
          <h2 className="mt-7 font-display text-[clamp(2.15rem,3.9vw,3.5rem)] font-light leading-[1.02] tracking-[-0.02em] text-cream [text-wrap:balance]">
            {headingLines.map((line, i) => (
              <span key={line + i} className="block overflow-hidden">
                <motion.span
                  className="block"
                  variants={v({ y: 60 })}
                  initial="hidden"
                  whileInView="show"
                  viewport={viewport}
                  transition={{ duration: 0.9, ease: EASE, delay: 0.12 + i * 0.09 }}
                >
                  {/* Non-breaking space keeps an intentionally blank line
                      (used to separate stanzas) from collapsing. */}
                  {line || ' '}
                </motion.span>
              </span>
            ))}
          </h2>

          <motion.p
            variants={v({ y: 14, filter: 'blur(8px)' })}
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            transition={{ duration: 1, ease: EASE, delay: 0.34 }}
            className="mt-9 max-w-[420px] text-lg leading-relaxed text-cream/65 md:text-xl"
          >
            {paragraph}
          </motion.p>

          {children && (
            <motion.div
              variants={v({ y: 12 })}
              initial="hidden"
              whileInView="show"
              viewport={viewport}
              transition={{ duration: 0.8, ease: EASE, delay: 0.46 }}
              className="mt-10"
            >
              {children}
            </motion.div>
          )}
        </div>

        {/* ── Video column ────────────────────────────────────────── */}
        <div
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
          className={cn(
            'relative order-2 min-h-[58svh] overflow-hidden md:min-h-0',
            reverse && 'md:[direction:ltr]',
          )}
        >
          {/* Parallax wrapper. Slightly oversized so the ±10px drift never
              exposes an edge, and it owns `x`/`y` alone — the entrance scale
              lives on the child so the two never overwrite each other. */}
          <motion.div
            className="absolute -inset-[14px]"
            style={reduce ? undefined : { x: px, y: py }}
          >
          <motion.div
            className="absolute inset-0"
            initial={reduce ? { opacity: 1 } : { opacity: 0, scale: 1.15 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={viewport}
            transition={{ duration: 1.6, ease: EASE }}
          >
            <video
              ref={videoRef}
              // Decorative unless the caller describes it.
              {...(videoLabel ? { 'aria-label': videoLabel } : { 'aria-hidden': true })}
              autoPlay
              loop
              muted
              playsInline
              // `metadata` not `auto`: the poster carries first paint, and the
              // video streams in behind it instead of competing for bandwidth.
              preload="metadata"
              poster={poster}
              className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            >
              {/* Portrait cut for stacked mobile, square/landscape above it.
                  Source order matters — the first matching media wins. */}
              {videoSrcMobile && (
                <source src={videoSrcMobile} media="(max-width: 767px)" type="video/mp4" />
              )}
              <source src={videoSrc} type="video/mp4" />
            </video>
          </motion.div>
          </motion.div>

          {/* One directional scrim, not a stack of gradients: it seats the
              video against the text column and lifts a touch on hover. */}
          <div
            aria-hidden
            className={cn(
              'pointer-events-none absolute inset-0 transition-opacity duration-700',
              'bg-[linear-gradient(to_right,rgba(11,11,11,0.55),rgba(11,11,11,0.12)_38%,transparent_70%)]',
              'opacity-100 group-hover:opacity-80',
              reverse && 'md:rotate-180',
            )}
          />
        </div>
      </div>
    </motion.section>
  )
}
