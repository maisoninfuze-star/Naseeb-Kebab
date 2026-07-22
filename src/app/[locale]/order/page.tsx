import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { isLocale, path } from '@/lib/i18n'
import { getDict } from '@/data/dictionary'
import { CONFIRMED, DELIVERY, PICKUP_TEL } from '@/data/site'
import PageHeader from '@/components/ui/PageHeader'
import OrderChoice from '@/components/order/OrderChoice'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const fr = locale === 'fr'
  return {
    title: fr ? 'Commander' : 'Order',
    description: fr
      ? 'Livraison par DoorDash ou Uber Eats. Pour emporter, appelez le restaurant directement.'
      : 'Delivery via DoorDash or Uber Eats. For pickup, call the restaurant directly.',
  }
}

/**
 * ORDER — delivery or pickup.
 *
 * Two routes, and the split is a commercial decision rather than a layout one:
 *
 *   DELIVERY → DoorDash or Uber Eats, the two platforms the restaurant is
 *              actually listed on. Both URLs were verified against the live
 *              listings, not guessed: the DoorDash page cross-checks as the
 *              right restaurant on address, on the exact French/English
 *              category names, and on every price.
 *
 *   PICKUP   → a phone call, deliberately NOT routed through a delivery app.
 *              Pickup placed through a platform still carries commission on an
 *              order the restaurant hands across its own counter, so sending
 *              pickup traffic to DoorDash would quietly cost them margin on
 *              business they already had.
 */
export default async function OrderPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = getDict(locale)
  const fr = locale === 'fr'

  return (
    <>
      <PageHeader
        eyebrow={t.nav.order}
        title={fr ? 'Commander' : 'Order'}
        lede={
          fr
            ? 'Livraison par DoorDash ou Uber Eats. Pour une commande à emporter, appelez-nous directement.'
            : 'Delivery through DoorDash or Uber Eats. For pickup, call us directly.'
        }
        image="DSC09484"
      />

      <OrderChoice
        locale={locale}
        delivery={DELIVERY}
        pickupTel={PICKUP_TEL}
        phoneDisplay={CONFIRMED.phoneDisplay}
      />

      <section className="gutter border-t border-cream/10 py-16 text-center md:py-20">
        <p className="mx-auto max-w-md text-sm leading-relaxed text-sand/65">
          {fr
            ? 'Vous préférez voir le menu avant de commander ?'
            : 'Would you rather look at the menu first?'}
        </p>
        <div className="mt-7">
          <Link
            href={path('menu', locale)}
            className="btn-primary hover:bg-cream hover:text-obsidian"
          >
            {t.hero.cta}
          </Link>
        </div>
      </section>
    </>
  )
}
