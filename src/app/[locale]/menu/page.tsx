import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isLocale, seoMeta, type Locale } from '@/lib/i18n'
import { CATEGORIES, type MenuItem } from '@/data/menu'
import { getMenu } from '@/lib/content/resolve'
import MenuBrowser from '@/components/menu/MenuBrowser'
import PageHeader from '@/components/ui/PageHeader'
import { getResolvedDict } from '@/lib/content/dict'
import { getImages } from '@/lib/content/images'
import { ldjson } from '@/lib/ldjson'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const fr = locale === 'fr'
  const title = fr ? 'Le menu' : 'Menu'
  const description = fr
    ? 'Le menu complet de Naseeb Kabab : kababs grillés sur charbon, currys afghans, plats à partager et desserts. Laval.'
    : 'The full Naseeb Kabab menu: charcoal-grilled kababs, Afghan curries, sharing platters and desserts. Laval.'
  return seoMeta({ key: 'menu', locale: locale as Locale, title, description })
}

/**
 * Menu schema. Only fields the restaurant actually publishes are emitted —
 * no `description` is faked, and `suitableForDiet` appears only where the
 * dish is confirmed vegetarian.
 */
function menuSchema(locale: Locale, menu: MenuItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    name: locale === 'fr' ? 'Menu Naseeb Kabab' : 'Naseeb Kabab Menu',
    inLanguage: locale === 'fr' ? 'fr-CA' : 'en-CA',
    // Link the menu back to the Restaurant entity declared in the root layout.
    isPartOf: { '@id': 'https://naseebkabab.shop/#restaurant' },
    hasMenuSection: CATEGORIES.map((cat) => ({
      '@type': 'MenuSection',
      name: locale === 'fr' ? cat.nameFr : cat.nameEn,
      hasMenuItem: menu.filter((i) => i.category === cat.id && i.available).map((item) => ({
        '@type': 'MenuItem',
        name: locale === 'fr' ? item.nameFr : item.nameEn,
        offers: { '@type': 'Offer', price: item.price.toFixed(2), priceCurrency: 'CAD' },
        ...(item.vegetarian ? { suitableForDiet: 'https://schema.org/VegetarianDiet' } : {}),
      })),
    })).filter((s) => s.hasMenuItem.length),
  }
}

export default async function MenuPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const images = await getImages()
  const t = await getResolvedDict(locale)

  // Resolved once and used for BOTH the structured data and the list. Emitting
  // schema from the static MENU while the page rendered edited prices would
  // hand Google a price the visitor is not being shown.
  const menu = await getMenu()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldjson(menuSchema(locale, menu)) }}
      />
      <PageHeader
        eyebrow={t.preview.eyebrow}
        title={locale === 'fr' ? 'Le menu complet' : 'The full menu'}
        image={images['page.menu']}
      />
      <MenuBrowser locale={locale} items={menu} />
    </>
  )
}
