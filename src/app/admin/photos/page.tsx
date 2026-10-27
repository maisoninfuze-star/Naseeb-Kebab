import Link from 'next/link'
import { PHOTO_SLOTS } from '@/data/photo-slots'
import { AVAILABLE_FRAMES } from '@/data/frames'
import { getContent } from '@/lib/content/store'
import { resolveImages } from '@/lib/content/images'
import { resetAllPhotos } from '../actions'
import SlotPicker from './SlotPicker'

export const dynamic = 'force-dynamic'

/**
 * Photo placement — which photograph sits in which position on the site.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHAT IS NOT HERE, AND WHY
 * ═══════════════════════════════════════════════════════════════════
 * · The homepage hero. It is a pinned six-frame sequence whose frames are
 *   pre-cropped to one fixed box by scripts/build-hero-frames.mjs. Changing a
 *   frame there is a build step, not a reference swap, so a dropdown would
 *   promise something it could not deliver.
 * · Dish photographs. Those live on the Menu screen, beside the name and price
 *   they belong to.
 *
 * The owner chooses from photographs that already exist. There is no upload:
 * every frame here has pre-generated AVIF/WebP variants at each crop and size,
 * and an arbitrary upload would have none of them — it would be a slow,
 * wrongly-cropped image on a site built around that pipeline.
 */
export default async function AdminPhotos() {
  const { images } = await getContent()
  const resolved = resolveImages(images)
  const overrideCount = Object.keys(images ?? {}).filter((k) => k in resolved).length

  const sections = new Map<string, typeof PHOTO_SLOTS>()
  for (const slot of PHOTO_SLOTS) {
    if (!sections.has(slot.section)) sections.set(slot.section, [])
    sections.get(slot.section)!.push(slot)
  }

  return (
    <div className="max-w-4xl">
      <h1 className="font-body text-2xl font-semibold">Photos</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-sand/60">
        Choisissez quelle photographie occupe chaque emplacement du site. Les photos
        des plats se changent dans le{' '}
        <Link href="/admin/menu" className="text-brass hover:text-cream">
          Menu
        </Link>
        .
      </p>
      <p className="mt-3 max-w-2xl text-xs leading-relaxed text-sand/45">
        Le bandeau animé de la page d’accueil n’est pas modifiable ici : ses six images
        sont recadrées à l’avance dans un gabarit fixe, et les remplacer demande de
        régénérer ce jeu d’images.
      </p>

      {overrideCount > 0 && (
        <form action={resetAllPhotos} className="mt-5">
          <p className="text-sm text-sand/60">
            {overrideCount} emplacement{overrideCount > 1 ? 's' : ''} modifié
            {overrideCount > 1 ? 's' : ''}.{' '}
            <button
              type="submit"
              className="text-[0.65rem] uppercase tracking-wider text-sand/45 hover:text-ember"
            >
              Tout rétablir
            </button>
          </p>
        </form>
      )}

      {[...sections.entries()].map(([section, slots]) => (
        <section key={section} className="mt-10">
          <h2 className="border-b border-cream/10 pb-2 font-body text-lg font-semibold">
            {section}
          </h2>
          <ul className="mt-4 space-y-px">
            {slots.map((s) => (
              <SlotPicker
                key={s.id}
                slot={s.id}
                label={s.label}
                hint={s.hint}
                current={resolved[s.id]}
                fallback={s.fallback}
                frames={AVAILABLE_FRAMES}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
