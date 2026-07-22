import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))

/**
 * Responsive source set for a processed image.
 *
 * The pipeline writes `{id}-{crop}-{width}.{webp|avif}`. Only HERO frames get
 * the full crop set — everything else has `sq` and `ed` only, so asking for a
 * `wide` crop of a non-hero silently 404s. `hasWide` guards that at the call
 * site rather than at runtime.
 */
export type Crop = 'wide' | 'ed' | 'sq' | 'tall'

const WIDTHS: Record<Crop, number[]> = {
  wide: [2400, 1600, 900],
  ed: [1400, 900, 600],
  sq: [900, 500],
  tall: [1200, 750],
}

export const ASPECT: Record<Crop, string> = {
  wide: '16 / 9',
  ed: '4 / 5',
  sq: '1 / 1',
  tall: '9 / 16',
}

export function srcSet(id: string, crop: Crop, ext: 'webp' | 'avif') {
  return WIDTHS[crop].map((w) => `/img/${id}-${crop}-${w}.${ext} ${w}w`).join(', ')
}

/** Largest derivative, used as the <img src> fallback. */
export function fallbackSrc(id: string, crop: Crop) {
  return `/img/${id}-${crop}-${WIDTHS[crop][0]}.webp`
}

export const lqip = (id: string) => `/img/${id}-lqip.webp`

/**
 * Alt text. Real dish names only — never a fabricated scene description.
 * The photography is all one studio setup, so the alt describes the dish and
 * says so, rather than inventing "rustic wooden table" atmosphere.
 */
export function dishAlt(nameFr: string, nameEn: string, locale: 'fr' | 'en') {
  return locale === 'fr'
    ? `${nameFr} — photographié en studio pour Naseeb Kabab`
    : `${nameEn} — studio photograph for Naseeb Kabab`
}
