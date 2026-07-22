/**
 * NASEEB KABAB — restaurant facts and site configuration.
 *
 * CONFIRMED values were taken from naseebkabab.shop and are safe to publish.
 * UNCONFIRMED values are marked and surface in the admin dashboard with a
 * warning. They are deliberately NOT invented — an opening hour or a halal
 * claim that turns out wrong costs the restaurant real customers.
 */

export const CONFIRMED = {
  name: 'Naseeb Kabab',
  tagline: 'Cuisine Authentique Afghane',
  address: {
    street: '3485 Bd Cartier O',
    city: 'Laval',
    province: 'QC',
    postal: 'H7V 3T4',
    country: 'CA',
  },
  // Updated to the number on the restaurant's DoorDash listing (owner-confirmed
  // 2026-07). The old 450-681-2222 came from naseebkabab.shop and was superseded.
  phone: '+15147422220',
  phoneDisplay: '+1 514-742-2220',
  email: 'naseebkabab.shop@gmail.com',
  currentSite: 'https://naseebkabab.shop',
} as const

/**
 * NOT YET CONFIRMED BY THE RESTAURANT.
 * Every field here renders with a "to be confirmed" affordance rather than a
 * fabricated value, and is editable in the admin dashboard.
 */
export const UNCONFIRMED = {
  /**
   * Opening hours, from the restaurant's own DoorDash listing ("the store's
   * actual hours of operation" — merchant-declared, not a delivery window).
   * No longer null: this is real data, not a guess. It is still surfaced as
   * editable in the admin because dine-in hours can differ from the ordering
   * hours a delivery platform records — the owner should confirm.
   */
  hours: {
    'Lun–Jeu': '12:00 – 20:45',
    'Ven–Sam': '12:00 – 21:45',
    Dim: '12:00 – 20:45',
  } as null | Record<string, string>,
  /** "Follow us" exists on the current site but links were not resolvable. */
  instagram: null as string | null,
  facebook: null as string | null,
  /** No third-party ordering platform is referenced on the current site. */
  orderingUrl: null as string | null,
  /**
   * Deliberately absent. The brief flags halal as a claim that must not be
   * made until the restaurant confirms it in writing.
   */
  halal: null as boolean | null,
  /** Parking, capacity, founding date, founder story — all owner-supplied. */
  parking: null as string | null,
  foundedYear: null as number | null,
} as const

/**
 * ORDERING
 *
 * Delivery goes to the two platforms the restaurant is actually listed on.
 * Both URLs were verified against the live listings, not guessed — the
 * DoorDash page cross-checks as the right restaurant on three independent
 * signals: the address (3485 Boul Cartier O), the exact category names from
 * the menu, and every price matching (Combo Dostan 51.70, Kabab au poulet
 * 17.00, Poisson bassa 16.50, Sultan kabab 25.30). A delivery link pointing
 * at the wrong restaurant is worse than no link at all.
 *
 * PICKUP has no platform. It is a phone call, because that is how the
 * restaurant actually takes pickup orders — routing pickup through a delivery
 * app would cost them commission on an order they are handing over the counter.
 */
export const DELIVERY = {
  doordash: {
    label: 'DoorDash',
    url: 'https://www.doordash.com/en/store/naseeb-kabab-laval-34920345/',
  },
  ubereats: {
    label: 'Uber Eats',
    url: 'https://www.ubereats.com/ca/store/naseeb-kabab-laval/diw7ROT3UR2PaQ2Qm7LBlA',
  },
} as const

export type DeliveryPlatform = keyof typeof DELIVERY

/** Pickup is a phone call to the restaurant. */
export const PICKUP_TEL = `tel:${CONFIRMED.phone}`

/**
 * Every "Order" CTA across the site points here rather than jumping straight
 * to one platform: the visitor has to choose delivery vs pickup first, and
 * sending everyone to DoorDash would quietly hand the restaurant's pickup
 * business to a commission.
 */
export const ORDER_FALLBACK = '/order'

export const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=' +
  encodeURIComponent('Naseeb Kabab, 3485 Bd Cartier O, Laval, QC H7V 3T4')

export const MAPS_DIRECTIONS =
  'https://www.google.com/maps/dir/?api=1&destination=' +
  encodeURIComponent('3485 Bd Cartier O, Laval, QC H7V 3T4')

/**
 * SEO geography. The restaurant is in LAVAL, not Montreal — targeting Montreal
 * terms from a Laval address is the most common way local restaurant SEO is
 * wasted. Laval-first, with Montreal as secondary reach.
 */
export const SEO_GEO = {
  primary: 'Laval',
  secondary: 'Montréal',
  region: 'QC',
  lat: 45.5586,
  lng: -73.7565,
} as const
