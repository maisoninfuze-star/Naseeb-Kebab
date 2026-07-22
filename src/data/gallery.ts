import { MENU, CATEGORIES, type CategoryId } from './menu'

/**
 * Gallery source.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHY THIS IS DERIVED FROM THE MENU RATHER THAN LISTED BY HAND
 * ═══════════════════════════════════════════════════════════════════
 * The earlier version listed all 118 usable frames from the shoot. That looked
 * like a big gallery and was actually a bad one: the shoot contains only 32
 * DISTINCT DISHES, each photographed 3–6 times from slightly different angles.
 * So the page showed the same lamb chops four times in a row, then the same
 * bowl of mantu four times. A contact sheet, not an edit.
 *
 * Deriving from MENU gives exactly one hero frame per dish, already vetted by
 * the photo audit, already grouped by the same categories the menu uses. It
 * also means the gallery can never drift out of sync with the menu: add a dish
 * with a photo and it appears here; mark one unavailable and it leaves.
 *
 * Alternate frames still exist on disk and are used for hover states and the
 * story page — they are simply not all dumped onto one screen.
 */

export interface GallerySection {
  id: CategoryId
  titleFr: string
  titleEn: string
  images: { id: string; nameFr: string; nameEn: string }[]
}

/** Categories worth a gallery section — drinks and extras have no photography. */
const SHOWN: CategoryId[] = ['kababs', 'currys', 'entrees', 'desserts']

/**
 * Photos held out of the gallery even though they exist on a menu item.
 *
 * DSC09532 is the Qorma de poulet / "Chicken Curry" frame — removed at the
 * owner's request. The dish still appears on the menu with its photo; it just
 * doesn't earn a slot in the curated gallery grid.
 */
const GALLERY_EXCLUDE = new Set(['DSC09532'])

export const SECTIONS: GallerySection[] = SHOWN.map((id) => {
  const cat = CATEGORIES.find((c) => c.id === id)!
  const seen = new Set<string>()

  const images = MENU.filter((i) => i.category === id && i.image && i.available)
    .filter((i) => !GALLERY_EXCLUDE.has(i.image!))
    // Several menu items legitimately share one photograph — Mantu appears as
    // both a starter and a main. Show the picture once.
    .filter((i) => {
      if (seen.has(i.image!)) return false
      seen.add(i.image!)
      return true
    })
    .sort((a, b) => a.order - b.order)
    .map((i) => ({ id: i.image!, nameFr: i.nameFr, nameEn: i.nameEn }))

  return { id, titleFr: cat.nameFr, titleEn: cat.nameEn, images }
})

/** Flat list, used by anything that just wants every gallery frame. */
export const GALLERY: string[] = SECTIONS.flatMap((s) => s.images.map((i) => i.id))
