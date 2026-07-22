'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { prefersReducedMotion } from '@/lib/motion'

/**
 * Plays once per PAGE LOAD, not once per session.
 *
 * This is a module-level flag, so it resets on every hard load — including a
 * reload, which is exactly what the previous sessionStorage version got wrong:
 * a reload is the same browser session, so the intro was suppressed and the
 * page appeared to "lose" its animation. Because the flag lives in memory and
 * the Preloader is mounted in the persistent root layout, it also does NOT
 * replay on client-side (Link) navigation — the component simply never
 * re-mounts there, so the effect never runs again. Reload replays; navigating
 * between pages does not.
 */
let hasPlayedThisLoad = false

/**
 * LOGO FLAME IGNITION
 *
 * An ember rises, the flame catches, the wordmark settles, the curtain lifts.
 * Total 1.65s — under the 1.8s ceiling in the brief.
 *
 * Skipped for prefers-reduced-motion, and absent entirely with JS disabled
 * (the overlay never mounts, so the page is simply there). It never blocks:
 * the page underneath is fully rendered and the overlay lifts off it.
 */
export default function Preloader() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (prefersReducedMotion()) return
    if (hasPlayedThisLoad) return
    hasPlayedThisLoad = true

    setShow(true)
    document.documentElement.style.overflow = 'hidden'

    const done = setTimeout(() => {
      setShow(false)
      document.documentElement.style.overflow = ''
    }, 1650)

    return () => {
      clearTimeout(done)
      document.documentElement.style.overflow = ''
    }
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[300] grid place-items-center bg-obsidian"
          initial={{ opacity: 1 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
          aria-hidden
        >
          <div className="relative grid place-items-center">
            {/* The ember — a single point of light that swells, then seeds the flame. */}
            <motion.span
              className="absolute h-1.5 w-1.5 rounded-full bg-ember"
              initial={{ opacity: 0, scale: 0.4, y: 26 }}
              animate={{ opacity: [0, 1, 1, 0], scale: [0.4, 1, 2.6, 5], y: [26, 4, -6, -10] }}
              transition={{ duration: 0.85, times: [0, 0.3, 0.7, 1], ease: 'easeOut' }}
              style={{ boxShadow: '0 0 22px 8px rgba(241,90,36,0.55)' }}
            />

            {/* The flame catches from that ember. */}
            <motion.img
              src="/brand/flame-ember.png"
              alt=""
              width={80}
              height={111}
              className="h-[72px] w-auto"
              initial={{ opacity: 0, scale: 0.72, filter: 'blur(6px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.55, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            />

            {/* Wordmark settles underneath. */}
            <motion.img
              src="/brand/wordmark-cream.png"
              alt=""
              width={720}
              height={720}
              className="mt-1 w-[min(64vw,300px)]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.78, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
