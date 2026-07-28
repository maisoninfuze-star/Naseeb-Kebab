/**
 * NASEEB KABAB — real customer reviews.
 *
 * ═══════════════════════════════════════════════════════════════════
 * EVERY REVIEW HERE IS REAL AND VERBATIM
 * ═══════════════════════════════════════════════════════════════════
 * Sourced from the restaurant's public review listings (restomontreal.ca and
 * restoenligne.com, both aggregating the Google listing), fetched 2026-07-28.
 * Nothing is written, embellished or composed. Names are as published.
 *
 * Fabricated testimonials are not merely a trust problem — in Canada they are
 * a deceptive marketing practice under the Competition Act. If a review cannot
 * be traced to a real customer, it does not go in this file.
 *
 * The aggregate below is likewise measured, not chosen: 4.8 across 174
 * evaluations (restoenligne). DoorDash independently shows 4.6 across 49.
 * The lower, larger-sample figure is NOT used to inflate — we cite the source
 * we quote from and the count that belongs to it.
 *
 * TO ADD A REVIEW: paste it verbatim, keep the author's published name, and
 * set `source`. Do not translate — a French review stays French.
 */

export interface Review {
  id: string
  /** 1–5, as published. */
  rating: number
  /** Verbatim. Never edited for tone, length or grammar. */
  text: string
  author: string
  /** Where it was published, shown to the reader. */
  source: string
}

/** Aggregate, as published by the source we quote. Do not round up. */
export const REVIEW_AGGREGATE = {
  rating: 4.8,
  count: 174,
  source: 'Google',
} as const

/**
 * Ordered for reading, not by score: a strong opener, then variety of voice
 * (French and English, first-timers and regulars, food and service).
 */
export const REVIEWS: Review[] = [
  {
    id: 'christophe',
    rating: 5,
    text: 'Naseeb Kabab is currently the best kabab spot in Laval — no other restaurant comes close to this level of craft.',
    author: 'Christophe Fadainia',
    source: 'Google',
  },
  {
    id: 'frozan',
    rating: 5,
    text: 'The food was absolutely delicious—fresh, flavorful, and cooked to perfection. Every dish was packed with authentic taste and generous portions.',
    author: 'Frozan Liaqat',
    source: 'Google',
  },
  {
    id: 'sear',
    rating: 5,
    text: 'This place has a taste of Kabul jaan, specially the lamb shank and all other foods. It is an amazing restaurant, full of flavours.',
    author: 'Sear',
    source: 'Google',
  },
  {
    id: 'susan',
    rating: 5,
    text: 'Our first time trying this restaurant and it was amazing. The staff were friendly and service was top notch.',
    author: 'Susan Tran',
    source: 'Google',
  },
  {
    id: 'sharbel',
    rating: 5,
    text: 'Bon service et bonne nourriture.',
    author: 'Sharbel-Atnasius',
    source: 'Google',
  },
  {
    id: 'omar',
    rating: 5,
    text: 'The food quality is really amazing. Also the prices are really good — try it once and you will definitely go again and again.',
    author: 'Omar',
    source: 'Google',
  },
  {
    id: 'paka',
    rating: 5,
    text: 'I was happy to learn that this restaurant is owned and operated by women.',
    author: 'Paka-T',
    source: 'Google',
  },
]
