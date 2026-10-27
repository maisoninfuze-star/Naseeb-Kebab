'use server'

import { revalidatePath } from 'next/cache'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { rateLimit, clientIp } from '@/lib/rate-limit'
import { CATEGORIES, MENU, type CategoryId } from '@/data/menu'
import {
  addMenuItem,
  getContent,
  deleteInquiry,
  deleteMenuItem,
  resetMenuOverride,
  saveMenuOverride,
  resetAllImages,
  resetAllText,
  saveImageOverride,
  saveSettings,
  saveTextOverride,
  setInquiryStatus,
} from '@/lib/content/store'
import type { MenuOverride, SiteSettings, StoredInquiry } from '@/lib/content/types'
import { shippedText } from '@/lib/content/text'
import { PHOTO_SLOTS, SLOT_FALLBACKS } from '@/data/photo-slots'
import { AVAILABLE_FRAMES } from '@/data/frames'
import {
  COOKIE_OPTIONS,
  SESSION_COOKIE,
  mintSession,
  passcodeAuthEnabled,
  passcodeMatches,
} from '@/lib/admin-auth'

/**
 * Every write the admin can perform.
 *
 * ═══════════════════════════════════════════════════════════════════
 * VALIDATED HERE, NOT IN THE FORM
 * ═══════════════════════════════════════════════════════════════════
 * Server Actions are network endpoints. The form's `required` and `type=number`
 * are conveniences for the person typing; this file is the control. A price
 * that arrives as "abc" is rejected here, not coerced to NaN and written to
 * the menu.
 *
 * Every mutation ends with `revalidatePath`, so a save is reflected on the
 * public site without a redeploy — which is the entire point of the dashboard
 * existing.
 */

/* ─────────────────────────────────────────────────────────────────
   Auth
   ───────────────────────────────────────────────────────────────── */

export type LoginState = { error: string | null }

export async function signIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!passcodeAuthEnabled()) {
    return { error: 'ADMIN_PASSCODE et ADMIN_SESSION_SECRET ne sont pas configurés.' }
  }

  // Throttle guesses so a low-entropy shared passcode is not online-brute-forceable:
  // 8 attempts per 5 min per IP. Constant-time compare defeats timing; this defeats
  // volume. See src/lib/rate-limit.ts for the per-instance caveat.
  const ip = clientIp(await headers())
  const gate = rateLimit(`login:${ip}`, 8, 5 * 60_000)
  if (!gate.ok) {
    return { error: `Trop de tentatives. Réessayez dans ${gate.retryAfter} s.` }
  }

  const input = (formData.get('passcode') ?? '').toString()
  if (!passcodeMatches(input)) {
    // No distinction between "empty" and "wrong" — both are just wrong.
    return { error: 'Code incorrect.' }
  }

  const { value, maxAge } = await mintSession()
  ;(await cookies()).set(SESSION_COOKIE, value, { ...COOKIE_OPTIONS, maxAge })

  const next = (formData.get('next') ?? '').toString()
  // Same-origin admin paths only, so `?next=` cannot become an open redirect.
  redirect(next.startsWith('/admin') && !next.startsWith('/admin/login') ? next : '/admin')
}

export async function signOut(): Promise<void> {
  ;(await cookies()).delete(SESSION_COOKIE)
  redirect('/admin/login')
}

/* ─────────────────────────────────────────────────────────────────
   Menu
   ───────────────────────────────────────────────────────────────── */

const refreshPublic = () => {
  revalidatePath('/[locale]', 'page')
  revalidatePath('/[locale]/menu', 'page')
  revalidatePath('/admin/menu')
  revalidatePath('/admin')
}

const text = (fd: FormData, k: string) => (fd.get(k) ?? '').toString().trim()
const flag = (fd: FormData, k: string) => fd.get(k) === 'on' || fd.get(k) === 'true'

/** '' → null, so clearing a description stores a real "no description". */
const nullable = (fd: FormData, k: string) => text(fd, k) || null

const isCategory = (v: string): v is CategoryId => CATEGORIES.some((c) => c.id === v)

export type SaveState = { ok: boolean; message: string | null }

export async function saveDish(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const id = text(formData, 'id')
  if (!id) return { ok: false, message: 'Identifiant manquant.' }

  const priceRaw = text(formData, 'price').replace(',', '.')
  const price = Number.parseFloat(priceRaw)
  if (!Number.isFinite(price) || price < 0) {
    return { ok: false, message: 'Prix invalide.' }
  }

  const nameFr = text(formData, 'nameFr')
  const nameEn = text(formData, 'nameEn')
  if (!nameFr || !nameEn) return { ok: false, message: 'Les deux noms sont requis.' }

  const category = text(formData, 'category')
  const orderRaw = text(formData, 'order')
  const order = Number.parseInt(orderRaw, 10)

  const patch: Omit<MenuOverride, 'updatedAt'> = {
    nameFr,
    nameEn,
    descFr: nullable(formData, 'descFr'),
    descEn: nullable(formData, 'descEn'),
    price: Math.round(price * 100) / 100,
    image: nullable(formData, 'image'),
    available: flag(formData, 'available'),
    featured: flag(formData, 'featured'),
    vegetarian: flag(formData, 'vegetarian'),
    spicy: flag(formData, 'spicy'),
    hidden: flag(formData, 'hidden'),
    ...(isCategory(category) ? { category } : {}),
    ...(Number.isFinite(order) ? { order } : {}),
  }

  // The owner confirming a photo is exactly what clears the review flag — that
  // is the whole job of the checkbox, so it is not a separate action.
  if (flag(formData, 'confirmPhoto')) patch.needsReview = null

  try {
    await saveMenuOverride(id, patch)
  } catch (e) {
    return { ok: false, message: `Échec de l’enregistrement : ${(e as Error).message}` }
  }
  refreshPublic()
  return { ok: true, message: 'Enregistré.' }
}

export async function resetDish(formData: FormData): Promise<void> {
  const id = text(formData, 'id')
  if (id) await resetMenuOverride(id)
  refreshPublic()
}

export async function createDish(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const nameFr = text(formData, 'nameFr')
  const nameEn = text(formData, 'nameEn') || nameFr
  const category = text(formData, 'category')
  const price = Number.parseFloat(text(formData, 'price').replace(',', '.'))

  if (!nameFr) return { ok: false, message: 'Le nom français est requis.' }
  if (!isCategory(category)) return { ok: false, message: 'Catégorie invalide.' }
  if (!Number.isFinite(price) || price < 0) return { ok: false, message: 'Prix invalide.' }

  const slug = nameFr
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  // Collisions and ordering must account for dishes ALREADY created in the
  // admin, not just the shipped MENU. Checking only MENU let two dishes with
  // the same French name collide to one id (duplicate React key; deleting one
  // deleted both) and stacked several created dishes at order 1 in an
  // otherwise-empty category.
  const { additions } = await getContent()
  const takenIds = new Set([...MENU.map((m) => m.id), ...additions.map((a) => a.id)])

  let id = `new-${slug}`
  if (takenIds.has(id)) id = `${id}-${Date.now().toString(36)}`

  const siblings = [
    ...MENU.filter((m) => m.category === category),
    ...additions.filter((a) => a.category === category),
  ]
  const order = siblings.length ? Math.max(...siblings.map((m) => m.order)) + 1 : 1

  try {
    await addMenuItem({
      id,
      category,
      nameFr,
      nameEn,
      descFr: nullable(formData, 'descFr'),
      descEn: nullable(formData, 'descEn'),
      price: Math.round(price * 100) / 100,
      image: nullable(formData, 'image'),
      available: true,
      featured: false,
      vegetarian: flag(formData, 'vegetarian'),
      spicy: flag(formData, 'spicy'),
      order,
      createdAt: new Date().toISOString(),
    })
  } catch (e) {
    return { ok: false, message: `Échec de l’ajout : ${(e as Error).message}` }
  }

  refreshPublic()
  return { ok: true, message: `« ${nameFr} » ajouté au menu.` }
}

export async function removeDish(formData: FormData): Promise<void> {
  const id = text(formData, 'id')
  if (id) await deleteMenuItem(id)
  refreshPublic()
}

/* ─────────────────────────────────────────────────────────────────
   Settings
   ───────────────────────────────────────────────────────────────── */

const DAYS = ['Lun–Jeu', 'Ven–Sam', 'Dim'] as const

export async function saveSiteSettings(
  _prev: SaveState,
  formData: FormData,
): Promise<SaveState> {
  const hours: Record<string, string> = {}
  for (const d of DAYS) {
    const v = text(formData, `hours.${d}`)
    if (v) hours[d] = v
  }

  const url = (k: string): string | null | { error: string } => {
    const v = text(formData, k)
    if (!v) return null
    // A link that is not a link renders as a dead button on the live site.
    if (!/^https?:\/\/\S+$/i.test(v)) return { error: k }
    return v
  }

  const links: Record<string, string | null> = {}
  for (const k of ['instagram', 'facebook', 'orderingUrl'] as const) {
    const v = url(k)
    if (v && typeof v === 'object') {
      return { ok: false, message: `Le lien « ${k} » doit commencer par https://` }
    }
    links[k] = v
  }

  const yearRaw = text(formData, 'foundedYear')
  const year = yearRaw ? Number.parseInt(yearRaw, 10) : null
  if (yearRaw && (!Number.isFinite(year as number) || (year as number) < 1900)) {
    return { ok: false, message: 'Année invalide.' }
  }

  const halalRaw = text(formData, 'halal')

  const patch: SiteSettings = {
    hours: Object.keys(hours).length ? hours : null,
    instagram: links.instagram,
    facebook: links.facebook,
    orderingUrl: links.orderingUrl,
    parking: nullable(formData, 'parking'),
    foundedYear: year,
    announcement: nullable(formData, 'announcement'),
    announcementEn: nullable(formData, 'announcementEn'),
    // Left as null unless explicitly answered. A halal claim is verifiable by
    // the customer, so it is never inferred from a blank field.
    halal: halalRaw === 'yes' ? true : halalRaw === 'no' ? false : null,
  }

  await saveSettings(patch)
  revalidatePath('/[locale]', 'layout')
  revalidatePath('/admin/settings')
  revalidatePath('/admin')
  return { ok: true, message: 'Réglages enregistrés.' }
}

/* ─────────────────────────────────────────────────────────────────
   Inquiries
   ───────────────────────────────────────────────────────────────── */

export async function updateInquiry(formData: FormData): Promise<void> {
  const id = text(formData, 'id')
  const status = text(formData, 'status') as StoredInquiry['status']
  if (id && ['new', 'contacted', 'closed'].includes(status)) {
    await setInquiryStatus(id, status)
  }
  revalidatePath('/admin/inquiries')
  revalidatePath('/admin')
}

export async function removeInquiry(formData: FormData): Promise<void> {
  const id = text(formData, 'id')
  if (id) await deleteInquiry(id)
  revalidatePath('/admin/inquiries')
  revalidatePath('/admin')
}

/* ─────────────────────────────────────────────────────────────────
   Site copy
   ───────────────────────────────────────────────────────────────── */

/**
 * Edit one string of brand copy.
 *
 * The path is validated against the SHIPPED dictionary rather than trusted, so
 * a crafted request cannot introduce a key the components never read — or, more
 * usefully, cannot leave a stale override behind after the copy is restructured
 * in a later deploy.
 */
export async function saveText(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const locale = text(formData, 'locale')
  const path = text(formData, 'path')
  const value = text(formData, 'value')

  if (locale !== 'fr' && locale !== 'en') return { ok: false, message: 'Langue invalide.' }
  if (!(path in shippedText(locale))) {
    return { ok: false, message: 'Ce texte n’existe plus dans le site.' }
  }

  // Same value as shipped -> store nothing, so the override list stays a list
  // of REAL changes and "rétablir" is meaningful.
  await saveTextOverride(locale, path, value === shippedText(locale)[path] ? '' : value)

  revalidatePath('/[locale]', 'layout')
  revalidatePath('/admin/text')
  return { ok: true, message: 'Enregistré.' }
}

export async function resetText(formData: FormData): Promise<void> {
  const locale = text(formData, 'locale')
  const path = text(formData, 'path')
  if ((locale === 'fr' || locale === 'en') && path) {
    await saveTextOverride(locale, path, '')
  }
  revalidatePath('/[locale]', 'layout')
  revalidatePath('/admin/text')
}

export async function resetAllCopy(formData: FormData): Promise<void> {
  // Scope to the locale the admin was viewing, so resetting the French copy
  // does not silently wipe the English overrides too.
  const loc = text(formData, 'locale')
  await resetAllText(loc === 'fr' || loc === 'en' ? loc : undefined)
  revalidatePath('/[locale]', 'layout')
  revalidatePath('/admin/text')
}

/* ─────────────────────────────────────────────────────────────────
   Photos
   ───────────────────────────────────────────────────────────────── */

/**
 * Point one photo slot at a different frame.
 *
 * Both the slot and the frame are checked against what actually exists — a slot
 * that is not in the registry, or a frame with no generated variants, would
 * render a broken image on the public site.
 */
export async function saveSlotImage(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const slot = text(formData, 'slot')
  const frame = text(formData, 'frame')

  if (!PHOTO_SLOTS.some((s) => s.id === slot)) {
    return { ok: false, message: 'Emplacement inconnu.' }
  }
  if (frame && !AVAILABLE_FRAMES.includes(frame)) {
    return { ok: false, message: 'Cette photo n’existe pas.' }
  }

  // Choosing the shipped frame stores nothing, so "modifié" stays truthful.
  await saveImageOverride(slot, frame === SLOT_FALLBACKS[slot] ? '' : frame)
  refreshPublic()
  revalidatePath('/admin/photos')
  return { ok: true, message: 'Photo mise à jour.' }
}

export async function resetSlotImage(formData: FormData): Promise<void> {
  const slot = text(formData, 'slot')
  if (slot) await saveImageOverride(slot, '')
  refreshPublic()
  revalidatePath('/admin/photos')
}

export async function resetAllPhotos(): Promise<void> {
  await resetAllImages()
  refreshPublic()
  revalidatePath('/admin/photos')
}
