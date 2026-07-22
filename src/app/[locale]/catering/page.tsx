import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n'
import { getDict } from '@/data/dictionary'
import PageHeader from '@/components/ui/PageHeader'
import CateringForm from '@/components/ui/CateringForm'
import Picture from '@/components/ui/Picture'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const fr = locale === 'fr'
  return {
    title: fr ? 'Traiteur et événements' : 'Catering & Events',
    description: fr
      ? 'Service traiteur afghan à Laval : anniversaires, réunions de famille, repas d’entreprise et grandes commandes.'
      : 'Afghan catering in Laval: birthdays, family gatherings, corporate meals and large group orders.',
  }
}

export default async function CateringPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = getDict(locale)

  return (
    <>
      <PageHeader
        eyebrow={t.catering.eyebrow}
        title={t.catering.title}
        lede={t.catering.support}
        image="DSC09446"
      />

      <section className="section-pad gutter grid gap-14 md:grid-cols-12 md:gap-12">
        <div className="md:col-span-5">
          <h2 className="text-[length:var(--text-heading)] text-cream">
            {locale === 'fr' ? 'Ce que nous faisons' : 'What we do'}
          </h2>

          <ul className="mt-8 space-y-0">
            {t.catering.services.map((s) => (
              <li
                key={s}
                className="border-b border-cream/10 py-4 text-base text-cream/85"
              >
                {s}
              </li>
            ))}
          </ul>

          <div className="mt-10">
            <Picture
              id="DSC09453"
              crop="ed"
              alt={
                locale === 'fr'
                  ? 'Grande assiette partagée pour un groupe'
                  : 'Large shared platter for a group'
              }
              sizes="(max-width: 768px) 90vw, 38vw"
              className="w-full"
            />
          </div>
        </div>

        <div className="md:col-span-6 md:col-start-7">
          <h2 className="text-[length:var(--text-heading)] text-cream">{t.catering.cta}</h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-sand/70">
            {locale === 'fr'
              ? 'Dites-nous la date, le nombre de personnes et l’occasion. Nous vous rappelons avec une proposition.'
              : 'Tell us the date, how many people, and the occasion. We’ll call you back with a proposal.'}
          </p>

          <div className="mt-10">
            <CateringForm locale={locale} />
          </div>
        </div>
      </section>
    </>
  )
}
