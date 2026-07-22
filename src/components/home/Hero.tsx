'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { type Locale, path } from '@/lib/i18n'
import { getDict } from '@/data/dictionary'

import { registerGsap, gsap, ScrollTrigger, prefersReducedMotion, isFinePointer } from '@/lib/motion'
import { RevealLines } from '@/components/ui/Reveal'
import Picture from '@/components/ui/Picture'
import EmberField from '@/components/motion/EmberField'
import { track } from '@/lib/analytics'

/**
 * CINEMATIC HERO
 *
 * Layers: photograph (Ken Burns) → scrim → smoke → type.
 * The photograph is DSC09484, the strongest frame in the shoot — a large mixed
 * platter with dark negative space along the left edge, which is exactly where
 * the headline sits.
 *
 * Motion: Ken Burns + split-line reveal + multi-layer parallax + magnetic CTA
 * + scroll indicator. One dominant idea (the slow push-in) with the rest kept
 * subordinate to it.
 */
export default function Hero({ locale }: { locale: Locale }) {
  const t = getDict(locale)
  const root = useRef<HTMLElement>(null)
  const media = useRef<HTMLDivElement>(null)
  const copy = useRef<HTMLDivElement>(null)

  // Routes to the /order chooser rather than jumping to one platform:
  // delivery goes to DoorDash or Uber Eats, pickup is a phone call.
  const orderHref = path('order', locale)

  useEffect(() => {
    registerGsap()
    if (prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      // MULTI-LAYER HERO PARALLAX — background drifts slower than the copy.
      gsap.to(media.current, {
        yPercent: 14,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      })
      gsap.to(copy.current, {
        yPercent: -8,
        opacity: 0.25,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      })
    }, root)

    return () => {
      ctx.revert()
      ScrollTrigger.refresh()
    }
  }, [])

  return (
    <section ref={root} className="relative h-[100svh] min-h-[560px] overflow-hidden">
      {/* Photograph */}
      <div ref={media} className="absolute inset-0 -z-20 will-change-transform">
        <Picture
          id="DSC09484"
          crop="wide"
          fill
          priority
          alt={
            locale === 'fr'
              ? 'Grande assiette de kababs grillés sur charbon de bois'
              : 'Large platter of charcoal-grilled kababs'
          }
          imgClassName="ken-burns"
          sizes="100vw"
        />
      </div>

      {/* Scrim — two gradients, not one.
          The vertical pass seats the type against the bottom of the frame.
          The horizontal pass is the one that matters: the headline lands over
          the busiest part of the platter, and without a left-side falloff the
          serif's thin strokes disappear into the grill marks. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(11,11,11,0.95)_0%,rgba(11,11,11,0.66)_34%,rgba(11,11,11,0.3)_62%,rgba(11,11,11,0.78)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(11,11,11,0.82)_0%,rgba(11,11,11,0.45)_38%,transparent_72%)]"
      />

      {/* SMOKE DISPLACEMENT OVERLAY — sits along the edges, never over the dish. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="smoke-drift absolute -inset-x-1/4 bottom-0 h-2/3"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 20% 100%, rgba(241,90,36,0.16), transparent 70%), radial-gradient(ellipse 50% 40% at 80% 90%, rgba(216,199,173,0.09), transparent 70%)',
            filter: 'blur(42px)',
          }}
        />
      </div>

      {/* Embers rising through the frame — Concept 1, Scene 1. */}
      <EmberField className="-z-10" />

      {/* Copy */}
      <div ref={copy} className="gutter relative flex h-full flex-col justify-end pb-24 md:pb-28">
        {/* Wide enough that "Rassemblez-vous" holds one line at desktop. The
            French headline is materially longer than the English, and it is
            the one that has to fit — this is the default locale. */}
        <div className="max-w-5xl">
          <div className="eyebrow mb-6 flex items-center gap-3 text-sand">
            <span className="h-px w-10 bg-ember" aria-hidden />
            {t.hero.eyebrow}
          </div>

          {/* Mega rather than display. At Cormorant 300 the headline can carry
              far more size than a heavier face before it feels shouty, and
              scale contrast against the 10px eyebrow is what makes the
              composition read as a gallery wall rather than a menu board. */}
          <RevealLines
            as="h1"
            immediate
            delay={0.15}
            lines={t.hero.headline}
            className="text-[clamp(2.7rem,6.8vw,7rem)] text-cream"
          />

          <p className="mt-10 max-w-md text-[length:var(--text-lede)] font-light leading-loose text-cream/75">
            {t.hero.support}
          </p>

          <div className="mt-14 flex flex-wrap items-center gap-5">
            <MagneticLink href={path('menu', locale)} primary>
              {t.hero.cta}
            </MagneticLink>

            {/* Brass rather than a second cream outline. Two identical
                buttons side by side give the eye nowhere to go; the metal
                tone separates the money CTA from the browse CTA without
                shouting. */}
            <a
              href={orderHref}
              onClick={() => track('order_online_click', { source: 'hero' })}
              className="btn-ghost hover:bg-brass hover:text-obsidian"
            >
              {t.hero.ctaSecondary}
            </a>

            <Link
              href={path('catering', locale)}
              className="group inline-flex items-center gap-2 text-sm text-sand transition-colors hover:text-ember"
            >
              {t.hero.tertiary}
              <span className="inline-block h-px w-6 bg-current transition-all duration-300 group-hover:w-9" aria-hidden />
            </Link>
          </div>
        </div>
      </div>

      {/* SCROLL INDICATOR LOOP — an ember falling down a hairline. */}
      <div
        aria-hidden
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex"
      >
        <span className="eyebrow text-sand/60">{t.hero.scroll}</span>
        <span className="relative block h-12 w-px overflow-hidden bg-cream/15">
          <span className="ember-drop absolute inset-x-0 top-0 block h-4 bg-ember" />
        </span>
      </div>
    </section>
  )
}

/**
 * MAGNETIC CTA HOVER — desktop only, and small (max 6px). Anything larger
 * turns a button into a moving target, which is a usability cost, not a flourish.
 */
function MagneticLink({
  href,
  children,
  primary,
}: {
  href: string
  children: React.ReactNode
  primary?: boolean
}) {
  const ref = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !isFinePointer() || prefersReducedMotion()) return

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      const x = (e.clientX - (r.left + r.width / 2)) * 0.14
      const y = (e.clientY - (r.top + r.height / 2)) * 0.14
      gsap.to(el, { x, y, duration: 0.5, ease: 'power3.out' })
    }
    const onLeave = () => gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.6)' })

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <Link
      ref={ref}
      href={href}
      className={primary ? 'btn-primary hover:bg-cream hover:text-obsidian' : 'btn-ghost'}
    >
      {children}
    </Link>
  )
}
