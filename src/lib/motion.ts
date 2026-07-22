'use client'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Single registration point. GSAP owns everything scroll-driven; Framer Motion
 * owns menus, modals and UI state. The two never animate the same element —
 * that split is the whole reason this file exists.
 */
let registered = false
export function registerGsap() {
  if (registered || typeof window === 'undefined') return gsap
  gsap.registerPlugin(ScrollTrigger)
  registered = true
  return gsap
}

export { gsap, ScrollTrigger }

/** The one easing used across the site. */
export const EASE = 'power3.out'
export const EASE_CSS = 'cubic-bezier(0.22, 1, 0.36, 1)'

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Desktop-only effects (cursor previews, magnetic hover, heavy parallax). */
export const isFinePointer = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches

/**
 * Reveal a set of masked lines.
 *
 * Under reduced motion this does NOT simply skip — it snaps the lines to their
 * final position immediately, because the CSS ships them translated 105% out
 * of view. Skipping would leave the text invisible.
 */
export function revealLines(
  lines: Element[] | NodeListOf<Element>,
  opts: { delay?: number; stagger?: number; trigger?: Element } = {},
) {
  const targets = Array.from(lines)
  if (!targets.length) return

  if (prefersReducedMotion()) {
    gsap.set(targets, { y: '0%' })
    return
  }

  gsap.to(targets, {
    y: '0%',
    duration: 1.05,
    ease: EASE,
    stagger: opts.stagger ?? 0.085,
    delay: opts.delay ?? 0,
    ...(opts.trigger
      ? { scrollTrigger: { trigger: opts.trigger, start: 'top 82%', once: true } }
      : {}),
  })
}

/** Fade-and-rise for supporting content. Always ends at opacity 1. */
export function revealUp(
  targets: Element[] | NodeListOf<Element> | Element,
  opts: { delay?: number; stagger?: number; trigger?: Element; y?: number } = {},
) {
  const els = targets instanceof Element ? [targets] : Array.from(targets)
  if (!els.length) return

  if (prefersReducedMotion()) {
    gsap.set(els, { opacity: 1, y: 0 })
    return
  }

  gsap.fromTo(
    els,
    { opacity: 0, y: opts.y ?? 22 },
    {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: EASE,
      stagger: opts.stagger ?? 0.07,
      delay: opts.delay ?? 0,
      scrollTrigger: opts.trigger
        ? { trigger: opts.trigger, start: 'top 84%', once: true }
        : undefined,
    },
  )
}
