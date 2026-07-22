'use client'

import { type Locale } from '@/lib/i18n'
import type { DELIVERY as DeliveryMap } from '@/data/site'
import { track } from '@/lib/analytics'

/**
 * DELIVERY vs PICKUP.
 *
 * Two panels, given deliberately unequal weight. Delivery gets two platform
 * buttons; pickup gets the phone number set at display scale, because a phone
 * number you can read across a room and tap once is the whole interaction.
 *
 * Outbound clicks are tracked per platform (`order_delivery_click` with the
 * platform name, `phone_click` for pickup) so the restaurant can see which
 * channel the site actually drives — that is the number that tells them
 * whether the commission is worth paying.
 */
export default function OrderChoice({
  locale,
  delivery,
  pickupTel,
  phoneDisplay,
}: {
  locale: Locale
  delivery: typeof DeliveryMap
  pickupTel: string
  phoneDisplay: string
}) {
  const fr = locale === 'fr'

  return (
    <section className="gutter py-16 md:py-24">
      <div className="grid gap-px overflow-hidden border border-cream/10 md:grid-cols-2">
        {/* ── DELIVERY ── */}
        <div className="bg-charcoal p-8 md:p-12">
          <span className="eyebrow flex items-center gap-3 text-ember">
            <span className="h-px w-8 bg-ember" aria-hidden />
            {fr ? 'Livraison' : 'Delivery'}
          </span>

          <h2 className="mt-6 text-[length:var(--text-heading)] text-cream">
            {fr ? 'Livré chez vous' : 'Brought to your door'}
          </h2>

          <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream/70">
            {fr
              ? 'Commandez sur la plateforme de votre choix. Les prix et les frais sont ceux de la plateforme.'
              : 'Order through whichever platform you prefer. Prices and fees are set by the platform.'}
          </p>

          <ul className="mt-9 space-y-3">
            {(Object.entries(delivery) as [string, { label: string; url: string }][]).map(
              ([key, p]) => (
                <li key={key}>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track('order_delivery_click', { platform: key })}
                    className="group flex min-h-14 items-center justify-between gap-4 border border-cream/20 px-6 py-4 transition-colors duration-500 hover:border-cream hover:bg-cream hover:text-obsidian"
                    style={{ transitionTimingFunction: 'cubic-bezier(0.22,1,0.36,1)' }}
                  >
                    <span className="text-[0.75rem] font-medium uppercase tracking-[0.24em]">
                      {p.label}
                    </span>
                    {/* Outbound arrow — draws on hover. */}
                    <span
                      aria-hidden
                      className="inline-block h-px w-6 bg-current transition-all duration-500 group-hover:w-10"
                    />
                  </a>
                </li>
              ),
            )}
          </ul>

          <p className="mt-6 text-xs text-sand/45">
            {fr
              ? 'Ces liens ouvrent un site externe.'
              : 'These links open an external site.'}
          </p>
        </div>

        {/* ── PICKUP ── */}
        <div className="bg-obsidian p-8 md:p-12">
          <span className="eyebrow flex items-center gap-3 text-brass">
            <span className="h-px w-8 bg-brass" aria-hidden />
            {fr ? 'À emporter' : 'Pickup'}
          </span>

          <h2 className="mt-6 text-[length:var(--text-heading)] text-cream">
            {fr ? 'Appelez le restaurant' : 'Call the restaurant'}
          </h2>

          <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream/70">
            {fr
              ? 'Pour une commande à emporter, appelez-nous directement. On prend la commande, on vous donne un temps, et vous passez la chercher.'
              : 'For pickup, call us directly. We take the order, give you a time, and you collect it at the counter.'}
          </p>

          {/* The number IS the interaction — set at display scale so it can be
              read across a room and tapped once on a phone. */}
          <a
            href={pickupTel}
            onClick={() => track('phone_click', { source: 'order_pickup' })}
            className="mt-9 inline-block font-display text-[clamp(2rem,5vw,3.4rem)] leading-none text-cream transition-colors duration-300 hover:text-ember"
          >
            {phoneDisplay}
          </a>

          <p className="mt-8 text-xs leading-relaxed text-sand/45">
            {fr
              ? 'Aucuns frais de service, et le restaurant reçoit le montant complet.'
              : 'No service fee, and the restaurant receives the full amount.'}
          </p>
        </div>
      </div>
    </section>
  )
}
