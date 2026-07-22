'use client'

import { useEffect, useState } from 'react'
import { type Locale, path } from '@/lib/i18n'
import { getDict } from '@/data/dictionary'
import { CONFIRMED, MAPS_DIRECTIONS } from '@/data/site'
import { track } from '@/lib/analytics'
import { cn } from '@/lib/utils'

/**
 * Sticky Call / Directions / Order bar on small screens.
 *
 * Appears only after the hero so it never covers the hero CTAs, and sits above
 * every decorative layer — the brief is explicit that visual effects must not
 * hide the actions that actually earn the restaurant money.
 */
export default function MobileActionBar({ locale }: { locale: Locale }) {
  const t = getDict(locale)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.9)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Routes to the /order chooser rather than jumping to one platform:
  // delivery goes to DoorDash or Uber Eats, pickup is a phone call.
  const orderHref = path('order', locale)

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-[130] grid grid-cols-3 border-t border-cream/10 bg-charcoal/95 backdrop-blur-lg transition-transform duration-500 md:hidden',
        visible ? 'translate-y-0' : 'translate-y-full',
      )}
      style={{
        transitionTimingFunction: 'cubic-bezier(0.22,1,0.36,1)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <a
        href={`tel:${CONFIRMED.phone}`}
        onClick={() => track('phone_click', { source: 'mobile_bar' })}
        className="flex min-h-14 flex-col items-center justify-center gap-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-cream"
      >
        <PhoneIcon />
        {t.visit.call}
      </a>
      <a
        href={MAPS_DIRECTIONS}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track('directions_click', { source: 'mobile_bar' })}
        className="flex min-h-14 flex-col items-center justify-center gap-1 border-x border-cream/10 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-cream"
      >
        <PinIcon />
        {t.visit.directions}
      </a>
      <a
        href={orderHref}
        onClick={() => track('order_online_click', { source: 'mobile_bar' })}
        className="flex min-h-14 flex-col items-center justify-center gap-1 bg-ember text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-cream"
      >
        <BagIcon />
        {t.nav.order}
      </a>
    </div>
  )
}

const ico = 'h-4 w-4'
const PhoneIcon = () => (
  <svg className={ico} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const PinIcon = () => (
  <svg className={ico} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)
const BagIcon = () => (
  <svg className={ico} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 6h18M16 10a4 4 0 0 1-8 0" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
