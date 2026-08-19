import type { CategoryId, Confidence } from '@/data/menu'

/**
 * Owner-editable content.
 *
 * ═══════════════════════════════════════════════════════════════════
 * OVERRIDES, NOT A REPLACEMENT
 * ═══════════════════════════════════════════════════════════════════
 * The menu that ships in `src/data/menu.ts` stays the source of truth. The
 * admin writes a PATCH per dish — only the fields the owner actually changed.
 * Two consequences that matter:
 *
 *  · An empty store means the site renders exactly as shipped. Nothing about
 *    the public site depends on the admin existing, being reachable, or having
 *    ever been opened.
 *  · "Reset" is a delete, not a re-type. The owner can always get back to the
 *    photographed, price-checked original.
 *
 * `undefined` means "not overridden". `null` is a real value for the nullable
 * fields (description, image) and means "the owner cleared this" — which is why
 * the two are never collapsed.
 */
export interface MenuOverride {
  nameFr?: string
  nameEn?: string
  descFr?: string | null
  descEn?: string | null
  price?: number
  image?: string | null
  imageConfidence?: Confidence | null
  category?: CategoryId
  available?: boolean
  featured?: boolean
  vegetarian?: boolean
  spicy?: boolean
  order?: number
  /** Cleared by the owner once they have confirmed a photo↔dish match. */
  needsReview?: string | null
  /** Removes the dish from the public site entirely, without deleting it. */
  hidden?: boolean
  updatedAt: string
}

/** Dishes the owner created in the admin, which have no shipped counterpart. */
export interface MenuAddition {
  id: string
  category: CategoryId
  nameFr: string
  nameEn: string
  descFr: string | null
  descEn: string | null
  price: number
  image: string | null
  available: boolean
  featured: boolean
  vegetarian: boolean
  spicy: boolean
  order: number
  createdAt: string
}

/**
 * Settings the restaurant had not confirmed at build time.
 *
 * Every one of these renders as an honest gap on the public site until it is
 * filled — see `src/data/site.ts`. Nothing here is ever guessed on the owner's
 * behalf, so an empty value stays empty.
 */
export interface SiteSettings {
  hours?: Record<string, string> | null
  instagram?: string | null
  facebook?: string | null
  orderingUrl?: string | null
  halal?: boolean | null
  parking?: string | null
  foundedYear?: number | null
  /** Site-wide banner. Empty string and null both mean "no banner". */
  announcement?: string | null
  announcementEn?: string | null
}

export interface StoredInquiry {
  id: string
  created_at: string
  name: string
  phone: string
  email: string
  event_date: string | null
  guests: number | null
  occasion: string | null
  service_type: 'catering' | 'venue' | null
  message: string | null
  locale: 'fr' | 'en'
  status: 'new' | 'contacted' | 'closed'
}

/**
 * Brand copy overrides, flat `dot.path -> string` per locale.
 *
 * Flat rather than a nested partial of the dictionary because the dictionary
 * mixes objects, strings, string arrays and arrays of objects — see
 * `content/text.ts`. An absent key means "shipped value", so clearing an edit
 * is a delete, never a re-type.
 */
export type TextOverrides = Partial<Record<'fr' | 'en', Record<string, string>>>

/** Photo slot id -> chosen frame id. Absent means "the shipped choice". */
export type ImageOverrides = Record<string, string>

export interface ContentDoc {
  menu: Record<string, MenuOverride>
  additions: MenuAddition[]
  settings: SiteSettings
  text: TextOverrides
  images: ImageOverrides
  inquiries: StoredInquiry[]
}

export const EMPTY_DOC: ContentDoc = {
  menu: {},
  additions: [],
  settings: {},
  text: {},
  images: {},
  inquiries: [],
}
