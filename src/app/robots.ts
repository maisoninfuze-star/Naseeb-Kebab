import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // The admin holds customer phone numbers and event details.
        disallow: ['/admin', '/admin/', '/fr/order', '/en/order'],
      },
    ],
    sitemap: 'https://naseebkabab.shop/sitemap.xml',
    host: 'https://naseebkabab.shop',
  }
}
