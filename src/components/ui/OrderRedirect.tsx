'use client'

import { useEffect, useState } from 'react'
import { type Locale } from '@/lib/i18n'
import { getDict } from '@/data/dictionary'
import { CONFIRMED } from '@/data/site'
import { track } from '@/lib/analytics'

/**
 * Clean hand-off to the third-party ordering platform.
 *
 * Preserves campaign parameters from the inbound URL so the restaurant can see
 * which channel produced the order, fires the outbound click event, and shows
 * a loading state instead of an unexplained blank moment. A manual link is
 * always rendered in case the automatic redirect is blocked.
 */
export default function OrderRedirect({ url, locale }: { url: string; locale: Locale }) {
  const t = getDict(locale)
  const [target, setTarget] = useState(url)

  useEffect(() => {
    const incoming = new URLSearchParams(window.location.search)
    const out = new URL(url)

    // Carry campaign tracking through to the ordering platform.
    for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid']) {
      const v = incoming.get(key)
      if (v) out.searchParams.set(key, v)
    }

    const href = out.toString()
    setTarget(href)
    track('order_online_click', { source: 'order_page', destination: out.hostname })

    const id = setTimeout(() => window.location.assign(href), 550)
    return () => clearTimeout(id)
  }, [url])

  return (
    <section className="grid min-h-[70svh] place-items-center px-6 text-center">
      <div>
        <span className="ember-drop mx-auto mb-8 block h-3 w-3 rounded-full bg-ember" aria-hidden />
        <p role="status" className="text-lg text-cream">
          {t.common.loading}
        </p>
        <p className="mt-6 text-sm text-sand/60">
          <a href={target} className="text-ember underline underline-offset-4">
            {t.nav.orderOnline}
          </a>
          {' · '}
          <a href={`tel:${CONFIRMED.phone}`} className="hover:text-ember">
            {CONFIRMED.phoneDisplay}
          </a>
        </p>
      </div>
    </section>
  )
}
