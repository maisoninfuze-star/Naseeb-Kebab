import 'server-only'

import { MENU, type MenuItem } from '@/data/menu'
import { UNCONFIRMED } from '@/data/site'
import { getContent } from './store'
import type { SiteSettings } from './types'

/**
 * The shipped data with the owner's edits applied.
 *
 * ═══════════════════════════════════════════════════════════════════
 * SERVER-ONLY, AND WHY THAT IS THE WHOLE POINT
 * ═══════════════════════════════════════════════════════════════════
 * Client components must keep importing the static `MENU` — it is compiled
 * into the bundle, costs no request, and renders instantly. What changes is
 * that the SERVER pages now resolve the menu and hand it down as a prop. The
 * client component takes `items` when given and falls back to the static
 * import otherwise, so nothing breaks if a page has not been threaded yet.
 *
 * Public pages stay statically rendered; the admin calls `revalidatePath`
 * after every save, so an edit is live within one regeneration instead of
 * making every visitor wait on a database read.
 */

/**
 * `includeHidden` is for the ADMIN only. The public site must never see a
 * hidden dish, but the admin has to — otherwise ticking "Masquer du site"
 * removes the dish from the editor too, stranding it with no way back on. A
 * `hidden` flag rides along on each returned item so the admin can render and
 * un-hide it.
 */
export async function getMenu(
  { includeHidden = false }: { includeHidden?: boolean } = {},
): Promise<(MenuItem & { hidden?: boolean })[]> {
  const { menu: overrides, additions } = await getContent()

  const patched = MENU.map((item) => {
    const o = overrides[item.id]
    const hidden = Boolean(o?.hidden)
    if (!o) return { ...item, hidden }
    const { updatedAt: _updatedAt, hidden: _hidden, ...fields } = o
    // `undefined` fields are dropped by the spread, so a patch of one field
    // touches exactly one field. `null` survives, and is a real cleared value.
    return { ...item, ...stripUndefined(fields), hidden } as MenuItem & { hidden: boolean }
  }).filter((item) => includeHidden || !item.hidden)

  const created: MenuItem[] = additions.map((a) => ({
    id: a.id,
    category: a.category,
    nameFr: a.nameFr,
    nameEn: a.nameEn,
    descFr: a.descFr,
    descEn: a.descEn,
    price: a.price,
    image: a.image,
    imageConfidence: a.image ? 'high' : null,
    available: a.available,
    featured: a.featured,
    vegetarian: a.vegetarian,
    spicy: a.spicy,
    order: a.order,
  }))

  return [...patched, ...created]
}

/**
 * `UNCONFIRMED` with the owner's answers filled in.
 *
 * Same contract as the menu: a value the owner has not supplied stays null and
 * the site keeps showing its honest placeholder. Nothing here invents an
 * opening hour or a halal claim.
 */
export async function getSettings(): Promise<typeof UNCONFIRMED & SiteSettings> {
  const { settings } = await getContent()
  return { ...UNCONFIRMED, ...stripUndefined(settings) } as typeof UNCONFIRMED & SiteSettings
}

function stripUndefined<T extends object>(o: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(o).filter(([, v]) => v !== undefined),
  ) as Partial<T>
}
