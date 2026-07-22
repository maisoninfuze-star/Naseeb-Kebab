import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Manrope } from 'next/font/google'
import { notFound } from 'next/navigation'
import '../globals.css'

import { isLocale, type Locale, LOCALES } from '@/lib/i18n'
import { getDict } from '@/data/dictionary'
import { CONFIRMED, SEO_GEO } from '@/data/site'
import SmoothScroll from '@/components/motion/SmoothScroll'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import MobileActionBar from '@/components/layout/MobileActionBar'
import ScrollProgress from '@/components/motion/ScrollProgress'
import Preloader from '@/components/layout/Preloader'

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

  return {
    metadataBase: new URL('https://naseebkabab.shop'),
    title: { default: title, template: '%s — Naseeb Kabab' },
    description,
    alternates: {
      canonical: `/${locale}`,
      languages: { fr: '/fr', en: '/en', 'x-default': '/fr' },
    },
    openGraph: {
      type: 'website',
      locale: fr ? 'fr_CA' : 'en_CA',
      alternateLocale: fr ? 'en_CA' : 'fr_CA',
      siteName: 'Naseeb Kabab',
      title,
      description,
      images: [{ url: '/brand/og-logo.jpg', width: 1200, height: 1200, alt: 'Naseeb Kabab' }],
    },
    twitter: { card: 'summary_large_image', title, description, images: ['/brand/og-logo.jpg'] },
    robots: { index: true, follow: true },
  }
}

/**
 * LocalBusiness / Restaurant schema.
 *
 * Deliberately omits `openingHoursSpecification` and `servesCuisine: halal`
 * — neither is confirmed by the restaurant, and a wrong opening hour in a
 * rich result sends customers to a locked door.
 */
function schema(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: CONFIRMED.name,
    description:
      locale === 'fr'
        ? 'Restaurant afghan à Laval — kababs sur charbon de bois et plats à partager.'
        : 'Afghan restaurant in Laval — charcoal-grilled kababs and sharing platters.',
    url: `https://naseebkabab.shop/${locale}`,
    telephone: CONFIRMED.phoneDisplay,
    email: CONFIRMED.email,
    servesCuisine: 'Afghan',
    priceRange: '$$',
    image: 'https://naseebkabab.shop/brand/og-logo.jpg',
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
  const t = getDict(locale)

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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema(locale)) }}
        />

        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-ember focus:px-4 focus:py-3 focus:text-cream"
        >
          {t.nav.skipToContent}
        </a>

        <Preloader />
        <SmoothScroll />
        <ScrollProgress />
        <Nav locale={locale} />

        <main id="main">{children}</main>

        <Footer locale={locale} />
        <MobileActionBar locale={locale} />
      </body>
    </html>
  )
}
