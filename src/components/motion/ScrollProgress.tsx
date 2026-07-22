'use client'

import { motion, useScroll, useSpring } from 'framer-motion'

/**
 * SCROLL PROGRESS EMBER — a 2px ember hairline across the top of the viewport.
 * Purely decorative, so it is hidden from assistive tech.
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const width = useSpring(scrollYProgress, { stiffness: 180, damping: 30, mass: 0.4 })

  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[120] h-0.5 origin-left bg-ember"
      style={{ scaleX: width }}
    />
  )
}
