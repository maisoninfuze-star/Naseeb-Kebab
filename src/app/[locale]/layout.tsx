import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Manrope } from 'next/font/google'
import { notFound } from 'next/navigation'
import '../globals.css'

import { isLocale, seoMeta, type Locale, LOCALES } from '@/lib/i18n'
import { ldjson } from '@/lib/ldjson'
import { CONFIRMED, SEO_GEO } from '@/data/site'
import { getSettings } from '@/lib/content/resolve'
import SmoothScroll from '@/components/motion/SmoothScroll'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import MobileActionBar from '@/components/layout/MobileActionBar'
import ScrollProgress from '@/components/motion/ScrollProgress'
import Preloader from '@/components/layout/Preloader'
import { getResolvedDict } from '@/lib/content/dict'
import { DictProvider, ImagesProvider } from '@/components/DictProvider'
import { getImages } from '@/lib/content/images'

/**
 * Cormorant Garamond replaced Instrument Serif for the display face.
 * The reason is stroke contrast: Cormorant has a very high thick-to-thin
 * ratio, which is what reads as "editorial" at 8rem+. Instrument Serif is
 * warmer but more even, and at hero scale it read closer to a friendly
 * bistro than to the Michelin-adjacent register the brief asked for.
 * 300 weight is deliberate — Cormorant's regular is heavy for display sizes.
 */
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})

export const generateStaticParams = () => LOCALES.map((locale) => ({ locale }))

export const viewport: Viewport = {
  themeColor: '#0B0B0B',
  colorScheme: 'dark',
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const fr = locale === 'fr'

  const title = fr
    ? 'Naseeb Kabab — Cuisine afghane à Laval'
    : 'Naseeb Kabab — Afghan cuisine in Laval'

  const description = fr
    ? 'Kababs grillés sur charbon de bois, plats afghans traditionnels et grandes assiettes à partager. Boulevard Cartier Ouest, Laval.'
    : 'Charcoal-grilled kababs, traditional Afghan dishes and generous sharing platters. Boulevard Cartier Ouest, Laval.'

  // seoMeta gives the home route its canonical/hreflang/OG; the title is
  // overridden to the default/template form so interior pages get the
  // "%s — Naseeb Kabab" suffix.
  const { title: _plainTitle, ...seo } = seoMeta({ key: 'home', locale: locale as Locale, title, description })

  return {
    metadataBase: new URL('https://naseebkabab.shop'),
    ...seo,
    title: { default: title, template: '%s — Naseeb Kabab' },
    robots: { index: true, follow: true },
  }
}

/**
 * LocalBusiness / Restaurant schema.
 *
 * `openingHoursSpecification` is emitted only when hours are actually set — and
 * when they are, the public pages already display them, so hiding them from the
 * schema would just forfeit the "Open now" rich result while making no honest
 * difference. `servesCuisine: halal` is still never emitted (unconfirmed).
 *
 * The `@id` gives the restaurant a stable entity the Menu schema links back to
 * via `hasMenu`, so Google can associate the two.
 */

/** Map the settings' French day-range labels to schema.org day arrays. */
const DAY_MAP: Record<string, string[]> = {
  'Lun–Jeu': ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
  'Ven–Sam': ['Friday', 'Saturday'],
  Dim: ['Sunday'],
}

function openingHours(hours: Record<string, string> | null | undefined) {
  if (!hours) return undefined
  const specs: object[] = []
  for (const [label, range] of Object.entries(hours)) {
    const days = DAY_MAP[label]
    // "12:00 – 20:45" → opens/closes; tolerate hyphen or en-dash and stray spaces.
    const m = range.match(/(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})/)
    if (!days || !m) continue
    specs.push({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: days,
      opens: m[1],
      closes: m[2],
    })
  }
  return specs.length ? specs : undefined
}

function schema(locale: Locale, hours: Record<string, string> | null | undefined) {
  const spec = openingHours(hours)
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': 'https://naseebkabab.shop/#restaurant',
    name: CONFIRMED.name,
    description:
      locale === 'fr'
        ? 'Restaurant afghan à Laval — kababs sur charbon de bois et plats à partager.'
        : 'Afghan restaurant in Laval — charcoal-grilled kababs and sharing platters.',
    url: `https://naseebkabab.shop/${locale}`,
    telephone: CONFIRMED.phone,
    email: CONFIRMED.email,
    servesCuisine: 'Afghan',
    priceRange: '$$',
    image: 'https://naseebkabab.shop/brand/og-logo.jpg',
    hasMenu: `https://naseebkabab.shop/${locale}/menu`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: CONFIRMED.address.street,
      addressLocality: CONFIRMED.address.city,
      addressRegion: CONFIRMED.address.province,
      postalCode: CONFIRMED.address.postal,
      addressCountry: CONFIRMED.address.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: SEO_GEO.lat, longitude: SEO_GEO.lng },
    areaServed: [SEO_GEO.primary, SEO_GEO.secondary],
    ...(spec ? { openingHoursSpecification: spec } : {}),
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = await getResolvedDict(locale)
  const { hours, announcement, announcementEn } = await getSettings()
  const images = await getImages()
  // Site-wide banner. Empty string and null both mean "no banner".
  const banner = (locale === 'fr' ? announcement : announcementEn) || null

  return (
    <html lang={locale} className={`${cormorant.variable} ${manrope.variable}`}>
      <head>
        {/* Reveal primitives ship hidden and are released by GSAP. With JS
            disabled nothing would release them, so undo the hidden state here.
            A <noscript> block is used rather than a script that stamps a `js`
            class on <html>, because mutating the root element before hydration
            is itself a hydration mismatch. */}
        <noscript>
          <style>{`
            .line-mask > span { transform: none !important; }
            [data-reveal] { opacity: 1 !important; }
          `}</style>
        </noscript>
      </head>
      <body className="bg-obsidian text-cream antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: ldjson(schema(locale, hours)) }}
        />

        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-ember focus:px-4 focus:py-3 focus:text-cream"
        >
          {t.nav.skipToContent}
        </a>

        <Preloader />
        {banner && (
          <div
            role="status"
            className="relative z-[120] bg-ember px-4 py-2 text-center text-sm font-medium text-cream"
          >
            {banner}
          </div>
        )}
        {/* Every client component below reads its copy from here, so the
            owner's edits and the server render agree and hydration matches. */}
        <DictProvider dict={t}>
          <ImagesProvider images={images}>
          <SmoothScroll />
          <ScrollProgress />
          <Nav locale={locale} hours={hours} />

          <main id="main">{children}</main>

          <Footer locale={locale} />
          <MobileActionBar locale={locale} />
          </ImagesProvider>
        </DictProvider>
      </body>
    </html>
  )
}
