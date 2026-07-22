import type { MetadataRoute } from 'next'
import { ROUTES, LOCALES, type RouteKey } from '@/lib/i18n'

const BASE = 'https://naseebkabab.shop'

/**
 * Sitemap with hreflang alternates on every entry, so Google serves the French
 * page to French searchers in Laval and the English one to everyone else.
 * /admin and /order are intentionally absent — neither should be indexed.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const keys = (Object.keys(ROUTES) as RouteKey[]).filter((k) => k !== 'order')

  const priority: Partial<Record<RouteKey, number>> = {
    home: 1, menu: 0.9, catering: 0.8, visit: 0.8, story: 0.6, gallery: 0.6,
  }

  return LOCALES.flatMap((locale) =>
    keys.map((key) => {
      const slug = ROUTES[key][locale]
      const url = slug ? `${BASE}/${locale}/${slug}` : `${BASE}/${locale}`
      return {
        url,
        lastModified: new Date(),
        changeFrequency: (key === 'menu' ? 'weekly' : 'monthly') as 'weekly' | 'monthly',
        priority: priority[key] ?? 0.4,
        alternates: {
          languages: Object.fromEntries(
            LOCALES.map((l) => {
              const s = ROUTES[key][l]
              return [l, s ? `${BASE}/${l}/${s}` : `${BASE}/${l}`]
            }),
          ),
        },
      }
    }),
  )
}
