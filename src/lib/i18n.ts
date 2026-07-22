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
