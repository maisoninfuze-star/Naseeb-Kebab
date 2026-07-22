import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n'
import { getDict } from '@/data/dictionary'
import { CONFIRMED } from '@/data/site'
import PageHeader from '@/components/ui/PageHeader'
import CateringForm from '@/components/ui/CateringForm'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const fr = locale === 'fr'
  return {
    title: 'Contact',
    description: fr
      ? 'Joindre Naseeb Kabab à Laval — téléphone, courriel et demandes de groupe.'
      : 'Get in touch with Naseeb Kabab in Laval — phone, email and group enquiries.',
  }
}

export default async function ContactPage({
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
        eyebrow="Contact"
        title={fr ? 'Écrivez-nous' : 'Get in touch'}
        lede={
          fr
            ? 'Pour une réservation de groupe, une commande spéciale ou une question — le téléphone reste le plus rapide.'
            : 'For a group booking, a special order or a question — the phone is still fastest.'
        }
        image="DSC09513"
      />

      <section className="gutter grid gap-14 py-16 md:grid-cols-12 md:py-24">
        <div className="md:col-span-4">
          <h2 className="eyebrow text-ember">{t.visit.phone}</h2>
          <p className="mt-4 text-[length:var(--text-heading)] text-cream">
            <a href={`tel:${CONFIRMED.phone}`} className="hover:text-ember">
              {CONFIRMED.phoneDisplay}
            </a>
          </p>

          <h2 className="eyebrow mt-10 text-ember">Courriel</h2>
          <p className="mt-4 text-sm">
            <a href={`mailto:${CONFIRMED.email}`} className="break-all text-cream hover:text-ember">
              {CONFIRMED.email}
            </a>
          </p>

          <h2 className="eyebrow mt-10 text-ember">{t.visit.address}</h2>
          <address className="mt-4 text-sm not-italic text-cream/85">
            {CONFIRMED.address.street}
            <br />
            {CONFIRMED.address.city}, {CONFIRMED.address.province} {CONFIRMED.address.postal}
          </address>
        </div>

        <div className="md:col-span-7 md:col-start-6">
          <h2 className="text-[length:var(--text-heading)] text-cream">
            {fr ? 'Une demande de groupe ?' : 'A group enquiry?'}
          </h2>
          <div className="mt-10">
            <CateringForm locale={locale} />
          </div>
        </div>
      </section>
    </>
  )
}
