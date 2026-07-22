/**
 * Privacy-conscious analytics.
 *
 * No cookies, no fingerprinting, no personal data — events carry a name and a
 * small set of non-identifying properties, nothing else. That keeps the site
 * out of consent-banner territory under Québec's Law 25, which is the whole
 * reason for not reaching for GA4 here.
 *
 * The transport is deliberately pluggable and currently a no-op beyond a dev
 * console line. Point `send` at Plausible / Fathom / Umami when the restaurant
 * picks one; nothing else in the codebase has to change.
 */

export type AnalyticsEvent =
  | 'order_online_click'
  /** Outbound to a delivery platform. `platform` is 'doordash' | 'ubereats',
   *  so the restaurant can see which channel the site actually drives — and
   *  weigh that against what each platform's commission costs them. */
  | 'order_delivery_click'
  | 'menu_view'
  | 'menu_category_click'
  | 'phone_click'
  | 'directions_click'
  | 'catering_form_start'
  | 'catering_form_submit'
  | 'event_inquiry_submit'
  | 'language_change'
  | 'platter_view'
  | 'signature_dish_view'
  | 'social_click'
  | 'review_interaction'

type Props = Record<string, string | number | boolean | undefined>

declare global {
  interface Window {
    plausible?: (event: string, opts?: { props?: Props }) => void
  }
}

export function track(event: AnalyticsEvent, props?: Props) {
  if (typeof window === 'undefined') return

  // Plausible is the intended destination — it is cookie-free and Law 25 safe.
  if (typeof window.plausible === 'function') {
    window.plausible(event, props ? { props } : undefined)
    return
  }

  if (process.env.NODE_ENV === 'development') {
    console.debug('[analytics]', event, props ?? '')
  }
}

/** Fire once when an element scrolls into view. Used for dish/platter views. */
export function trackOnce(el: Element, event: AnalyticsEvent, props?: Props) {
  let fired = false
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && !fired) {
          fired = true
          track(event, props)
          io.disconnect()
        }
      }
    },
    { threshold: 0.4 },
  )
  io.observe(el)
  return () => io.disconnect()
}
