'use client'

import { useEffect, useRef } from 'react'
import { registerGsap, revealLines, revealUp } from '@/lib/motion'
import { cn } from '@/lib/utils'

/**
 * SPLIT-LINE TYPOGRAPHY REVEAL
 *
 * Lines are authored as an array rather than split at runtime: SplitType
 * re-splitting on resize causes reflow jitter and breaks screen-reader
 * continuity. Pre-authored lines keep the DOM stable and the copy readable
 * with JS disabled.
 */
export function RevealLines({
  lines,
  as: Tag = 'h2',
  className,
  lineClassName,
  delay = 0,
  immediate = false,
}: {
  lines: readonly string[]
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'div'
  className?: string
  lineClassName?: string
  delay?: number
  /** Hero use — fire on mount instead of waiting for a scroll trigger. */
  immediate?: boolean
}) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    registerGsap()
    const el = ref.current
    if (!el) return
    const spans = el.querySelectorAll('.line-mask > span')
    revealLines(spans, { delay, trigger: immediate ? undefined : el })
  }, [delay, immediate])

  return (
    // @ts-expect-error — polymorphic tag, ref type widens correctly at runtime
    <Tag ref={ref} className={className}>
      {lines.map((line, i) => (
        <span className="line-mask" key={i}>
          <span className={lineClassName}>{line}</span>
        </span>
      ))}
    </Tag>
  )
}

/** Fade-and-rise wrapper for supporting content. */
export function RevealUp({
  children,
  className,
  delay = 0,
  stagger,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  stagger?: number
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const gsap = registerGsap()
    const el = ref.current
    if (!el) return

    if (stagger) {
      // Hand the hidden state down to the children, then show the wrapper in
      // the same frame — otherwise the CSS guard would keep the wrapper at
      // opacity 0 forever while only its children animated.
      gsap.set(el.children, { opacity: 0 })
      gsap.set(el, { opacity: 1 })
      revealUp(el.children as never, { delay, stagger, trigger: el })
    } else {
      revealUp(el, { delay, trigger: el })
    }
  }, [delay, stagger])

  // `data-reveal` is what the `.js`-gated CSS rule hides. With JS disabled the
  // attribute is inert and the content renders normally.
  return (
    <div ref={ref} data-reveal className={cn(className)}>
      {children}
    </div>
  )
}
