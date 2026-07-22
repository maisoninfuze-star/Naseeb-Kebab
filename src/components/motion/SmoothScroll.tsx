'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, registerGsap, ScrollTrigger, prefersReducedMotion } from '@/lib/motion'

/**
 * Lenis + ScrollTrigger, wired so the two agree on scroll position.
 *
 * Skipped entirely under reduced motion — hijacking the scroll wheel is exactly
 * what that preference asks us not to do. Native scrolling still works and
 * every ScrollTrigger still fires.
 */
export default function SmoothScroll() {
  useEffect(() => {
    registerGsap()

    if (prefersReducedMotion()) {
      ScrollTrigger.refresh()
      return
    }

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Touch devices keep native momentum; emulating it feels worse.
      syncTouch: false,
    })

    lenis.on('scroll', ScrollTrigger.update)

    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    ScrollTrigger.refresh()

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [])

  return null
}
