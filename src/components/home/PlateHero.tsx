'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { type Locale, path } from '@/lib/i18n'
import { getDict } from '@/data/dictionary'

import { MENU, formatPrice } from '@/data/menu'
import { registerGsap, gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/motion'
import EmberField from '@/components/motion/EmberField'
import { track } from '@/lib/analytics'
import { cn } from '@/lib/utils'

/**
 * ONE PLATTER, MANY HANDS — the pinned hero.
 *
 * The plate never moves. It stays locked in frame while the food on it changes
 * as you scroll: chopan kabab → chaplee → chicken → qabuli → mantu → firni.
 * Rim, shadow and horizon stay registered because every frame was composited
 * from the same fixed crop box (see scripts/build-hero-frames.mjs), so the
 * crossfade reads as one table being served course after course.
 *
 * That is mehmān-nawāzī as a mechanic rather than as ornament: the guest sits
 * still, and the food keeps arriving.
 *
 * THE SEQUENCE — "The Fire Journey"
 *   Scene 0  the fire: charcoal embers and Afghan spices drifting in lapis
 *            dark. A generated video, pure atmosphere, no food in frame.
 *   Scene 1+ the table: the plate arrives and the food on it changes.
 *
 * Research into ten peer sites (Dishoom, COYA, Zuma, Noma, Sexy Fish, Hutong,
 * EMP, Amazónico, Sushisamba) found nine of ten open on a muted autoplay video
 * and NONE uses a canvas image sequence. So this keeps the video opening they
 * all rely on, then does something none of them do: hands off to a plate-locked
 * morph built from real photography. The studio shoot was locked off — plate
 * centroids vary by only 2.4% across 33 masters — which is exactly the
 * registration a morph needs. The constraint became the concept.
 *
 * Borrowed from Sexy Fish: each frame carries a real dish name and price, so
 * the scroll has informational payload rather than being pure mood.
 */

/** Frame id → menu item id. Every one is a HIGH-confidence photo match. */
const FRAMES: { img: string; item: string }[] = [
  { img: 'DSC09476', item: 'chopan-kabab' },
  { img: 'DSC09471', item: 'chaplee-kabab' },
  { img: 'DSC09441', item: 'cuisses-poulet' },
  { img: 'DSC09509', item: 'jarret-agneau-qabuli' },
  { img: 'DSC09513', item: 'mantu-plat' },
  { img: 'DSC09545', item: 'firni' },
]

export default function PlateHero({ locale }: { locale: Locale }) {
  const t = getDict(locale)
  const root = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [active, setActive] = useState(0)
  const [pinned, setPinned] = useState(false)

  // Keep the ember video playing.
  //
  // Autoplay starts it, but the browser PAUSES an occluded muted video and
  // never resumes on its own — the 1.65s preloader overlay covers the hero on
  // load, so the video reliably froze a couple of seconds in. Tab-switching and
  // scrolling away do the same. This nudges play() back whenever the hero is on
  // screen and the tab is visible, which covers every one of those cases.
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const kick = () => {
      if (!document.hidden && v.paused) v.play().catch(() => {})
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && kick()),
      { threshold: 0.25 },
    )
    io.observe(v)
    document.addEventListener('visibilitychange', kick)
    // One delayed kick to cover the moment the preloader lifts.
    const t = setTimeout(kick, 1800)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', kick)
      clearTimeout(t)
    }
  }, [])

  // Routes to the /order chooser rather than jumping to one platform:
  // delivery goes to DoorDash or Uber Eats, pickup is a phone call.
  const orderHref = path('order', locale)

  const dishes = FRAMES.map((f) => {
    const item = MENU.find((m) => m.id === f.item)
    return {
      img: f.img,
      name: item ? (locale === 'fr' ? item.nameFr : item.nameEn) : '',
      price: item ? formatPrice(item.price, locale) : '',
    }
  })

  useEffect(() => {
    registerGsap()
    const section = root.current
    if (!section) return

    // Reduced motion: no pin, no scrub. Frame 1 stays, all copy visible.
    // Deliberately NOT a faster animation — for vestibular users the fix is
    // stillness, not speed.
    if (prefersReducedMotion()) {
      setActive(0)
      return
    }

    const mm = gsap.matchMedia()

    mm.add(
      {
        desktop: '(min-width: 768px)',
        mobile: '(max-width: 767px)',
      },
      (ctx) => {
        const { mobile } = ctx.conditions as { mobile: boolean }

        // Mobile gets a shorter pin and fewer stops. A long pin on a phone is
        // several screens of scrolling that appear to do nothing, and it fights
        // the browser's own address-bar collapse.
        // +1 for the ember video scene that opens the sequence.
        const steps = mobile ? 3 : FRAMES.length + 1
        const distance = mobile ? '+=180%' : '+=360%'

        const st = ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: distance,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onToggle: (self) => setPinned(self.isActive),
          onUpdate: (self) => {
            const i = Math.min(steps - 1, Math.floor(self.progress * steps))
            setActive(i)
          },
        })

        return () => st.kill()
      },
    )

    return () => {
      mm.revert()
      ScrollTrigger.refresh()
    }
  }, [])

  return (
    // Stable wrapper so GSAP's pin never reparents a node React will remove.
    //
    // `pin: true` wraps this <section> in a GSAP-created `.pin-spacer` div and
    // makes the section a child of THAT — so the section stops being a direct
    // child of <main>. On navigation React calls main.removeChild(section) and
    // throws "the node to be removed is not a child of this node", because the
    // section now lives inside the pin-spacer. React's removeChild runs in the
    // commit phase, before any effect cleanup, so reverting GSAP on unmount is
    // too late to help. With this wrapper, React only ever removes the wrapper
    // div (which GSAP does not touch), and the pin-spacer is discarded with it.
    <div>
    <section ref={root} className="relative h-[100svh] min-h-[560px] overflow-hidden">
      {/* ── SCENE 0 — the fire.
             Charcoal embers and Afghan spices (cardamom, saffron, cumin) drifting
             in lapis-blue dark. Generated as pure ATMOSPHERE — there is no food
             in it, so nothing about the product can be misrepresented, which is
             what went wrong when an earlier pass sent real dishes to an image
             model. Autoplay/muted/playsinline is the only combination iOS will
             actually start without a tap. ── */}
      <div className="absolute inset-0 -z-20">
        <video
          ref={videoRef}
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-[1100ms]',
            active === 0 ? 'opacity-100' : 'opacity-0',
          )}
          style={{ transitionTimingFunction: 'cubic-bezier(0.22,1,0.36,1)' }}
          autoPlay
          muted
          loop
          playsInline
          // The poster is the real LCP element while the 1.07MB video streams in.
          poster="/video/ember-poster-1600.webp"
          preload="metadata"
          aria-hidden
        >
          <source src="/video/ember-hero.mp4" type="video/mp4" />
        </video>
      </div>

      {/* ── Plate frames. Absolutely stacked, crossfading. Only opacity animates,
             so the compositor handles it and the main thread stays free for
             the scrub. ── */}
      <div className="absolute inset-0 -z-20">
        {dishes.map((d, i) => (
          <picture key={d.img}>
            <source
              media="(max-width: 767px)"
              type="image/avif"
              srcSet={`/img-hero/${d.img}-tall.avif`}
            />
            <source
              media="(max-width: 767px)"
              type="image/webp"
              srcSet={`/img-hero/${d.img}-tall.webp`}
            />
            <source type="image/avif" srcSet={`/img-hero/${d.img}-wide.avif`} />
            <img
              src={`/img-hero/${d.img}-wide.webp`}
              alt={i === 0 ? (locale === 'fr' ? `${d.name} servi sur une assiette Naseeb Kabab` : `${d.name} served on a Naseeb Kabab plate`) : ''}
              aria-hidden={i !== 0}
              /* Frame 1 is the LCP element — eager and high priority. The rest
                 are lazy so they never block first paint. */
              loading={i === 0 ? 'eager' : 'lazy'}
              fetchPriority={i === 0 ? 'high' : 'low'}
              decoding={i === 0 ? 'sync' : 'async'}
              className={cn(
                'absolute inset-0 h-full w-full object-cover transition-opacity duration-[900ms] motion-reduce:transition-none',
                i + 1 === active ? 'opacity-100' : 'opacity-0',
              )}
              style={{ transitionTimingFunction: 'cubic-bezier(0.22,1,0.36,1)' }}
            />
          </picture>
        ))}
      </div>

      {/* Scrims — vertical seats the type, horizontal keeps the serif's thin
          strokes off the busiest part of the plate. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(11,11,11,0.95)_0%,rgba(11,11,11,0.6)_36%,rgba(11,11,11,0.25)_64%,rgba(11,11,11,0.72)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(11,11,11,0.85)_0%,rgba(11,11,11,0.45)_40%,transparent_74%)] md:bg-[linear-gradient(to_right,rgba(11,11,11,0.88)_0%,rgba(11,11,11,0.4)_38%,transparent_70%)]"
      />

      <EmberField className="-z-10" />

      {/* ── Copy. The headline PERSISTS across the whole pin; only the dish
             label changes. That keeps the brand promise on screen while the
             scroll delivers the menu. ── */}
      <div className="gutter relative flex h-full flex-col justify-end pb-24 md:pb-28">
        <div className="max-w-5xl">
          <div className="eyebrow mb-6 flex items-center gap-3 text-sand">
            <span className="h-px w-10 bg-ember" aria-hidden />
            {t.hero.eyebrow}
          </div>

          <h1 className="text-[clamp(2.7rem,6.8vw,7rem)] text-cream">
            {t.hero.headline.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>

          <p className="mt-8 max-w-md text-[length:var(--text-lede)] font-light leading-loose text-cream/75">
            {t.hero.support}
          </p>

          <div className="mt-12 flex flex-wrap items-center gap-5">
            <Link href={path('menu', locale)} className="btn-primary hover:bg-cream hover:text-obsidian">
              {t.hero.cta}
            </Link>
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

      {/* ── Dish label. Sits opposite the copy, changes with each frame.
             aria-live so the change is announced rather than silent. ── */}
      <div
        className="pointer-events-none absolute bottom-24 right-[var(--gutter)] hidden text-right md:block"
        aria-live="polite"
      >
        <p className="font-display text-[clamp(1.3rem,2vw,1.9rem)] text-cream">
          {active > 0 ? dishes[active - 1]?.name : ""}
        </p>
        <p className="eyebrow mt-2 text-brass">
          {active > 0 ? dishes[active - 1]?.price : ""}
        </p>

        {/* Progress ticks — how far through the sequence you are. */}
        <ul className="mt-5 flex justify-end gap-1.5">
          {[{ img: "fire" }, ...dishes].map((d, i) => (
            <li
              key={d.img}
              className={cn(
                "h-px transition-all duration-500",
                i === active ? "w-7 bg-ember" : "w-3.5 bg-cream/25",
              )}
            />
          ))}
        </ul>
      </div>

      {/* Scroll cue — hidden once the pin takes over, since by then the
          instruction is redundant and it would sit on top of the sequence. */}
      <div
        aria-hidden
        className={cn(
          'absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 transition-opacity duration-500 md:flex',
          pinned ? 'opacity-0' : 'opacity-100',
        )}
      >
        <span className="eyebrow text-sand/60">{t.hero.scroll}</span>
        <span className="relative block h-12 w-px overflow-hidden bg-cream/15">
          <span className="ember-drop absolute inset-x-0 top-0 block h-4 bg-ember" />
        </span>
      </div>
    </section>
    </div>
  )
}
