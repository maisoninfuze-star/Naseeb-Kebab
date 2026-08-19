import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {isLocale, seoMeta, type Locale} from '@/lib/i18n'
import { SECTIONS } from '@/data/gallery'
import PageHeader from '@/components/ui/PageHeader'
import GalleryGrid from '@/components/gallery/GalleryGrid'
import { getResolvedDict } from '@/lib/content/dict'
import { getImages } from '@/lib/content/images'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const fr = locale === 'fr'
    const title = fr ? 'Galerie' : 'Gallery'
  const description = fr
      ? 'Les plats de Naseeb Kabab en images — kababs sur charbon de bois, currys afghans et desserts.'
      : 'Naseeb Kabab in pictures — charcoal kababs, Afghan curries and desserts.'
  return seoMeta({ key: 'gallery', locale: locale as Locale, title, description })
}

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const images = await getImages()
  const t = await getResolvedDict(locale)
  const fr = locale === 'fr'

  return (
    <>
      <PageHeader
        eyebrow={t.nav.gallery}
        title={fr ? 'La cuisine, en images' : 'The kitchen, in pictures'}
        /* This used to claim "no image here was generated", which stopped
           being true when the backgrounds were replaced. The dishes are still
           the real photographs — same food, same portion, same plate — but the
           surface behind them is generated, and the page has to say so. */
        lede={
          fr
            ? 'Chaque plat provient de la même séance en studio : la nourriture, les portions et les assiettes sont réelles. Les arrière-plans ont été recomposés.'
            : 'Every dish comes from the same studio session — the food, the portions and the plates are real. The backgrounds have been recomposed.'
        }
        image={images['page.gallery']}
      />

      <GalleryGrid sections={SECTIONS} locale={locale} />
    </>
  )
}
