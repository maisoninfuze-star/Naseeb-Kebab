import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isLocale, type Locale } from '@/lib/i18n'
import { getDict } from '@/data/dictionary'
import { MENU, CATEGORIES } from '@/data/menu'
import MenuBrowser from '@/components/menu/MenuBrowser'
import PageHeader from '@/components/ui/PageHeader'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const fr = locale === 'fr'
  return {
    title: fr ? 'Le menu' : 'Menu',
    description: fr
      ? 'Le menu complet de Naseeb Kabab : kababs grillés sur charbon, currys afghans, plats à partager et desserts. Laval.'
      : 'The full Naseeb Kabab menu: charcoal-grilled kababs, Afghan curries, sharing platters and desserts. Laval.',
    alternates: { canonical: `/${locale}/menu`, languages: { fr: '/fr/menu', en: '/en/menu' } },
  }
}

/**
 * Menu schema. Only fields the restaurant actually publishes are emitted —
 * no `description` is faked, and `suitableForDiet` appears only where the
 * dish is confirmed vegetarian.
 */
function menuSchema(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    name: locale === 'fr' ? 'Menu Naseeb Kabab' : 'Naseeb Kabab Menu',
    inLanguage: locale === 'fr' ? 'fr-CA' : 'en-CA',
    hasMenuSection: CATEGORIES.map((cat) => ({
      '@type': 'MenuSection',
      name: locale === 'fr' ? cat.nameFr : cat.nameEn,
      hasMenuItem: MENU.filter((i) => i.category === cat.id && i.available).map((item) => ({
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
  const t = getDict(locale)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(menuSchema(locale)) }}
      />
      <PageHeader
        eyebrow={t.preview.eyebrow}
        title={locale === 'fr' ? 'Le menu complet' : 'The full menu'}
        image="DSC09467"
      />
      <MenuBrowser locale={locale} />
    </>
  )
}
