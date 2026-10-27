import { type Locale, LOCALES, DEFAULT_LOCALE } from '@/data/dictionary'

export { LOCALES, DEFAULT_LOCALE }
export type { Locale }

export const isLocale = (v: string): v is Locale =>
  (LOCALES as string[]).includes(v)

/**
 * Route slugs are shared across both locales; only the /fr or /en prefix
 * changes.
 *
 * Localised slugs (/fr/notre-histoire vs /en/our-story) were considered and
 * rejected: the App Router resolves one directory per route, so supporting
 * them means either duplicated page files or a catch-all that re-implements
 * routing. The cost is real and the benefit is small — visitors reach these
 * pages by link, not by typing. One slug set keeps every URL stable and makes
 * the language toggle a pure prefix swap that can never 404.
 */
export const ROUTES = {
  home: { fr: '', en: '' },
  menu: { fr: 'menu', en: 'menu' },
  story: { fr: 'story', en: 'story' },
  catering: { fr: 'catering', en: 'catering' },
  gallery: { fr: 'gallery', en: 'gallery' },
  visit: { fr: 'visit', en: 'visit' },
  contact: { fr: 'contact', en: 'contact' },
  order: { fr: 'order', en: 'order' },
  privacy: { fr: 'privacy', en: 'privacy' },
  terms: { fr: 'terms', en: 'terms' },
} as const

export type RouteKey = keyof typeof ROUTES

export const path = (key: RouteKey, locale: Locale) => {
  const slug = ROUTES[key][locale]
  return slug ? `/${locale}/${slug}` : `/${locale}`
}

/** Reverse lookup so the language toggle can stay on the same page. */
export function routeKeyFromSlug(slug: string | undefined): RouteKey {
  if (!slug) return 'home'
  for (const [key, slugs] of Object.entries(ROUTES)) {
    if (slugs.fr === slug || slugs.en === slug) return key as RouteKey
  }
  return 'home'
}

/**
 * Swap the locale on an arbitrary pathname, preserving the page AND any hash.
 * `/fr/notre-histoire#equipe` → `/en/our-story#equipe`
 */
export function swapLocale(pathname: string, next: Locale) {
  const [bare, hash] = pathname.split('#')
  const parts = bare.split('/').filter(Boolean)
  const slug = parts[1]
  const key = routeKeyFromSlug(slug)
  const rest = parts.slice(2).join('/')
  const base = path(key, next)
  const full = rest ? `${base}/${rest}` : base
  return hash ? `${full}#${hash}` : full
}

/**
 * Per-page canonical + hreflang, plus locale-correct OpenGraph/Twitter.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHY THIS EXISTS
 * ═══════════════════════════════════════════════════════════════════
 * The root locale layout used to set `alternates.canonical = /${locale}`. In
 * the App Router a layout's `alternates` is inherited verbatim by every child
 * page that does not redefine it — Next does NOT synthesise a per-route
 * canonical. So every interior page inherited the HOMEPAGE as its canonical and
 * its hreflang, telling Google eight distinct pages were all duplicates of the
 * home page. They dropped out of the index, and it contradicted the sitemap.
 *
 * Every `generateMetadata` now calls this with its own route key, so canonical
 * points at THIS page and fr/en alternates point at each other — never the
 * home page. OG title/description are localised per page too, so a shared
 * `/menu` link no longer previews with the home-page copy.
 */
export function seoMeta({
  key,
  locale,
  title,
  description,
}: {
  key: RouteKey
  locale: Locale
  title: string
  description: string
}) {
  const fr = locale === 'fr'
  return {
    title,
    description,
    alternates: {
      canonical: path(key, locale),
      languages: {
        fr: path(key, 'fr'),
        en: path(key, 'en'),
        'x-default': path(key, DEFAULT_LOCALE),
      },
    },
    openGraph: {
      type: 'website' as const,
      locale: fr ? 'fr_CA' : 'en_CA',
      alternateLocale: fr ? 'en_CA' : 'fr_CA',
      siteName: 'Naseeb Kabab',
      url: path(key, locale),
      title,
      description,
      images: [{ url: '/brand/og-logo.jpg', width: 1200, height: 1200, alt: 'Naseeb Kabab' }],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description,
      images: ['/brand/og-logo.jpg'],
    },
  }
}
