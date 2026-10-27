import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {isLocale, seoMeta, type Locale} from '@/lib/i18n'
import { CONFIRMED, MAPS_DIRECTIONS, MAPS_URL } from '@/data/site'
import { getSettings } from '@/lib/content/resolve'
import PageHeader from '@/components/ui/PageHeader'
import VisitSplit from '@/components/home/VisitSplit'
import { getResolvedDict } from '@/lib/content/dict'
import { getImages } from '@/lib/content/images'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const fr = locale === 'fr'
    const title = fr ? 'Nous trouver' : 'Visit Us'
  const description = fr
      ? `Naseeb Kabab — ${CONFIRMED.address.street}, ${CONFIRMED.address.city}. Restaurant afghan, kababs sur charbon de bois.`
      : `Naseeb Kabab — ${CONFIRMED.address.street}, ${CONFIRMED.address.city}. Afghan restaurant, charcoal-grilled kababs.`
  return seoMeta({ key: 'visit', locale: locale as Locale, title, description })
}

export default async function VisitPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const images = await getImages()
  const t = await getResolvedDict(locale)
  const fr = locale === 'fr'
  const settings = await getSettings()

  return (
    <>
      <PageHeader eyebrow={t.visit.eyebrow} title={t.visit.title} image={images['page.visit']} />

      <section className="gutter py-16 md:py-24">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <h2 className="eyebrow text-ember">{t.visit.address}</h2>
            <address className="mt-4 text-base not-italic text-cream">
              {CONFIRMED.address.street}
              <br />
              {CONFIRMED.address.city}, {CONFIRMED.address.province} {CONFIRMED.address.postal}
            </address>
            <div className="mt-4 flex gap-5 text-sm">
              <a
                href={MAPS_DIRECTIONS}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ember underline-offset-4 hover:underline"
              >
                {t.visit.directions}
              </a>
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sand/70 underline-offset-4 hover:text-ember hover:underline"
              >
                {t.visit.viewMap}
              </a>
            </div>
          </div>

          <div>
            <h2 className="eyebrow text-ember">{t.visit.phone}</h2>
            <p className="mt-4 text-base">
              <a href={`tel:${CONFIRMED.phone}`} className="text-cream hover:text-ember">
                {CONFIRMED.phoneDisplay}
              </a>
            </p>
            <p className="mt-3 text-sm">
              <a href={`mailto:${CONFIRMED.email}`} className="break-all text-sand/70 hover:text-ember">
                {CONFIRMED.email}
              </a>
            </p>
          </div>

          <div>
            <h2 className="eyebrow text-ember">{t.visit.hours}</h2>
            {/* Never guessed — unset stays the honest placeholder. This branch
                used to render an empty string when hours existed, which was
                invisible only because they never did. */}
            <div className="mt-4 text-base text-sand/70">
              {settings.hours ? (
                Object.entries(settings.hours).map(([day, hrs]) => (
                  <span key={day} className="block">
                    {day} · {hrs}
                  </span>
                ))
              ) : (
                <p>{t.visit.hoursPending}</p>
              )}
            </div>

            {settings.parking && (
              <>
                <h2 className="eyebrow mt-8 text-ember">{t.visit.parking}</h2>
                <p className="mt-4 text-sm text-sand/70">{settings.parking}</p>
              </>
            )}
          </div>
        </div>

        {/* Map — lazy iframe, no cookies until the visitor interacts. */}
        <div className="mt-14 aspect-[16/9] w-full overflow-hidden border border-cream/10 md:aspect-[21/9]">
          <iframe
            title={fr ? 'Carte — Naseeb Kabab' : 'Map — Naseeb Kabab'}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-full w-full grayscale-[0.35]"
            src={`https://www.google.com/maps?q=${encodeURIComponent(
              `${CONFIRMED.address.street}, ${CONFIRMED.address.city}, ${CONFIRMED.address.province} ${CONFIRMED.address.postal}`,
            )}&output=embed`}
          />
        </div>
      </section>

      <VisitSplit locale={locale} hours={settings.hours} />
    </>
  )
}
