/**
 * NASEEB KABAB — canonical menu data model.
 *
 * SOURCE OF TRUTH: naseebkabab.shop/menu (scraped 2026-07-20).
 * Every `nameFr`, `nameEn` and `price` below is verbatim from that menu.
 * NOTHING here is invented. Where the restaurant publishes no description,
 * `descFr` / `descEn` are null — the UI renders the dish without one rather
 * than filling the gap with copywriting.
 *
 * `image` is the hero frame identified in the visual audit of the 119-photo
 * studio shoot. `imageConfidence` records how certain that match is:
 *   'high'   — visually unambiguous, safe to publish
 *   'medium' — probable, worth a glance from the owner
 *   'low'    — genuine ambiguity, MUST be confirmed before publishing
 *   null     — never photographed
 *
 * Anything below 'high' surfaces in the admin dashboard under
 * "Photos to verify" so the owner can correct it without touching code.
 */

export type Confidence = 'high' | 'medium' | 'low'

export type CategoryId =
  | 'entrees'
  | 'kababs'
  | 'currys'
  | 'partager'
  | 'burgers'
  | 'desserts'
  | 'boissons'
  | 'extras'

export interface MenuItem {
  /** Stable internal id — never shown, safe to reference from the admin. */
  id: string
  category: CategoryId
  nameFr: string
  nameEn: string
  /** Null until the restaurant supplies real copy. Never auto-generated. */
  descFr: string | null
  descEn: string | null
  price: number
  /** Hero frame id, e.g. 'DSC09509'. Null = no photograph exists. */
  image: string | null
  imageConfidence: Confidence | null
  /** Alternate frames of the same dish, for galleries and hover states. */
  altImages?: string[]
  available: boolean
  featured: boolean
  /** Only set where the restaurant has confirmed it. Undefined = unknown. */
  vegetarian?: boolean
  spicy?: boolean
  /**
   * Set when the photo→dish match needs owner sign-off, or when the dish
   * shares a photo with another SKU. Rendered as a warning in the admin only.
   */
  needsReview?: string
  order: number
}

export interface Category {
  id: CategoryId
  nameFr: string
  nameEn: string
  /** Short editorial line for the menu page section header. */
  blurbFr: string
  blurbEn: string
  order: number
}

export const CATEGORIES: Category[] = [
  {
    id: 'entrees',
    nameFr: 'Entrées',
    nameEn: 'Starters',
    blurbFr: 'Pour commencer — à partager, toujours.',
    blurbEn: 'To begin — always shared.',
    order: 1,
  },
  {
    id: 'kababs',
    nameFr: 'Kababs et grillades',
    nameEn: 'Kababs & Grill',
    blurbFr: 'Marinés la veille, grillés sur charbon de bois.',
    blurbEn: 'Marinated overnight, grilled over charcoal.',
    order: 2,
  },
  {
    id: 'currys',
    nameFr: 'Currys et ragoûts',
    nameEn: 'Curries & Stews',
    blurbFr: 'Mijotés lentement, servis avec du riz.',
    blurbEn: 'Slow-cooked, served with rice.',
    order: 3,
  },
  {
    id: 'partager',
    nameFr: 'Plats à partager',
    nameEn: 'Sharing Platters',
    blurbFr: 'Pour la famille, les amis, les grandes tablées.',
    blurbEn: 'For family, for friends, for the long table.',
    order: 4,
  },
  {
    id: 'burgers',
    nameFr: 'Burgers et wraps',
    nameEn: 'Burgers & Wraps',
    blurbFr: 'La même viande grillée, format rapide.',
    blurbEn: 'The same grilled meat, made quick.',
    order: 5,
  },
  {
    id: 'desserts',
    nameFr: 'Desserts',
    nameEn: 'Desserts',
    blurbFr: 'Doux, parfumé, léger.',
    blurbEn: 'Sweet, fragrant, light.',
    order: 6,
  },
  {
    id: 'boissons',
    nameFr: 'Boissons',
    nameEn: 'Drinks',
    blurbFr: 'Thé afghan, dogh, et le reste.',
    blurbEn: 'Afghan tea, dogh, and the rest.',
    order: 7,
  },
  {
    id: 'extras',
    nameFr: 'Extras',
    nameEn: 'Extras',
    blurbFr: '',
    blurbEn: '',
    order: 8,
  },
]

export const MENU: MenuItem[] = [
  // ─────────────────────────── ENTRÉES ───────────────────────────
  {
    id: 'samosa', category: 'entrees',
    nameFr: 'Samosa', nameEn: 'Samosa',
    descFr: null, descEn: null, price: 8.8,
    image: null, imageConfidence: null,
    available: true, featured: false, order: 1,
    needsReview: 'Appetizers show no photo (owner directive).',
  },
  {
    id: 'naan-afghan', category: 'entrees',
    nameFr: 'Naan Afghan', nameEn: 'Afghan Naan',
    descFr: null, descEn: null, price: 1.1,
    image: null, imageConfidence: null,
    available: true, featured: false, order: 2,
    needsReview: 'Appetizers show no photo (owner directive).',
  },
  {
    id: 'ashak-entree', category: 'entrees',
    nameFr: 'Ashak', nameEn: 'Ashak',
    descFr: null, descEn: null, price: 8.8,
    image: null, imageConfidence: null,
    available: true, featured: false, order: 3,
  },
  {
    id: 'banjan-burani-entree', category: 'entrees',
    nameFr: 'Banjan Burani', nameEn: 'Banjan Burani',
    descFr: null, descEn: null, price: 8.8,
    image: null, imageConfidence: null,
    available: true, featured: false, vegetarian: true, order: 4,
  },
  {
    id: 'qorma-poulet', category: 'entrees',
    nameFr: 'Qorma De Poulet', nameEn: 'Chicken Curry',
    descFr: null, descEn: null, price: 8.8,
    image: null, imageConfidence: null,
    available: true, featured: false, order: 5,
    needsReview: 'Appetizers show no photo (owner directive).',
  },
  {
    id: 'qorma-veau', category: 'entrees',
    nameFr: 'Qorma De Veau', nameEn: 'Veal Curry',
    descFr: null, descEn: null, price: 8.8,
    image: null, imageConfidence: null,
    available: true, featured: false, order: 6,
    needsReview: 'Appetizers show no photo (owner directive).',
  },
  {
    id: 'salade-afghane', category: 'entrees',
    nameFr: 'Salade Afghane', nameEn: 'Afghan Salad',
    descFr: null, descEn: null, price: 7.15,
    image: null, imageConfidence: null,
    available: true, featured: false, vegetarian: true, order: 7,
    needsReview: 'Appetizers show no photo (owner directive).',
  },
  {
    id: 'mantu-entree', category: 'entrees',
    nameFr: 'Mantu', nameEn: 'Mantu',
    descFr: null, descEn: null, price: 8.8,
    image: null, imageConfidence: null,
    available: true, featured: false, order: 8,
  },
  {
    id: 'salade-maison', category: 'entrees',
    nameFr: 'Salade Maison', nameEn: 'Homemade Salad',
    descFr: null, descEn: null, price: 5.5,
    image: null, imageConfidence: null,
    available: true, featured: false, vegetarian: true, order: 9,
    needsReview: 'Appetizers show no photo (owner directive).',
  },
  {
    id: 'soupe-lentilles', category: 'entrees',
    nameFr: 'Soupe Aux Lentilles', nameEn: 'Lentil Soup',
    descFr: null, descEn: null, price: 5.0,
    image: null, imageConfidence: null,
    available: true, featured: false, vegetarian: true, order: 10,
    needsReview: 'Appetizers show no photo (owner directive).',
  },

  // ─────────────────────── KABABS ET GRILLADES ───────────────────────
  {
    id: 'sultan-kabab', category: 'kababs',
    nameFr: 'Sultan Kabab', nameEn: 'Sultan Kabab',
    descFr: null, descEn: null, price: 25.3,
    image: 'DSC09444', imageConfidence: 'high',
    available: true, featured: true, order: 1,
  },
  {
    id: 'mazar-kabab', category: 'kababs',
    nameFr: 'Mazar Kabab', nameEn: 'Mazar Kabab',
    descFr: null, descEn: null, price: 23.1,
    image: 'DSC09448', imageConfidence: 'high',
    altImages: ['DSC09450', 'DSC09451', 'DSC09452'],
    available: true, featured: true, order: 2,
  },
  {
    id: 'bamyan-kabab', category: 'kababs',
    nameFr: 'Bamyan Kabab', nameEn: 'Bamyan Kabab',
    descFr: null, descEn: null, price: 0,
    image: 'DSC09451', imageConfidence: 'high',
    // NEW dish from the owner's photo list (2026-07-22). Photo confirmed;
    // available:false until the owner supplies a price — a real dish must never
    // show a fabricated or 0,00 $ price.
    available: false, featured: false, order: 3,
    needsReview: 'NOUVEAU (liste du propriétaire) — photo confirmée, PRIX REQUIS avant publication.',
  },
  {
    id: 'barg-kabab', category: 'kababs',
    nameFr: 'Barg Kabab', nameEn: 'Barg Kabab',
    descFr: null, descEn: null, price: 26.4,
    image: 'DSC09462', imageConfidence: 'high',
    altImages: ['DSC09462', 'DSC09464', 'DSC09465'],
    available: true, featured: false, order: 3,
  },
  {
    id: 'kobidah-boeuf', category: 'kababs',
    nameFr: 'Kobidah De Bœuf', nameEn: 'Kobidah Of Beef',
    descFr: null, descEn: null, price: 19.8,
    image: 'DSC09456', imageConfidence: 'high',
    altImages: ['DSC09455', 'DSC09456', 'DSC09457'],
    available: true, featured: false, order: 4,
  },
  {
    id: 'kobidah-poulet', category: 'kababs',
    nameFr: 'Kobidah De Poulet', nameEn: 'Kobidah Of Chicken',
    descFr: null, descEn: null, price: 19.8,
    image: 'DSC09459', imageConfidence: 'high',
    altImages: ['DSC09458', 'DSC09459', 'DSC09460'],
    available: true, featured: false, order: 5,
  },
  {
    id: 'kobidah-mixte', category: 'kababs',
    nameFr: 'Kobidah Mixte', nameEn: 'Mixed Kobidah',
    descFr: null, descEn: null, price: 19.8,
    image: 'DSC09435', imageConfidence: 'high',
    altImages: ['DSC09434', 'DSC09436'],
    available: true, featured: false, order: 6,
  },
  {
    id: 'tikka-kabab', category: 'kababs',
    nameFr: 'Tikka Kabab', nameEn: 'Tikka Kabab',
    descFr: null, descEn: null, price: 19.0,
    image: 'DSC09482', imageConfidence: 'high',
    altImages: ['DSC09466', 'DSC09468', 'DSC09469'],
    available: true, featured: false, order: 7,
  },
  {
    id: 'tikka-agneau', category: 'kababs',
    nameFr: "Tikka D'agneau", nameEn: 'Lamb Tikka',
    descFr: null, descEn: null, price: 22.0,
    image: 'DSC09480', imageConfidence: 'medium',
    altImages: ['DSC09479', 'DSC09481', 'DSC09482'],
    available: true, featured: false, order: 8,
  },
  {
    id: 'kabab-poulet', category: 'kababs',
    nameFr: 'Kabab Au Poulet', nameEn: 'Chicken Kebab',
    descFr: null, descEn: null, price: 17.0,
    image: 'DSC09466', imageConfidence: 'high',
    altImages: ['DSC09447', 'DSC09448', 'DSC09449'],
    available: true, featured: false, order: 9,
  },
  {
    id: 'jarret-agneau-qabuli', category: 'kababs',
    nameFr: "Jarret D'agneau Qabuli", nameEn: 'Qabuli Lamb Shank',
    descFr: null, descEn: null, price: 22.0,
    image: 'DSC09508', imageConfidence: 'high',
    altImages: ['DSC09508', 'DSC09510', 'DSC09511'],
    available: true, featured: true, order: 10,
  },
  {
    id: 'chopan-kabab', category: 'kababs',
    nameFr: 'Chopan Kabab', nameEn: 'Chopan Kabab',
    descFr: null, descEn: null, price: 22.0,
    image: 'DSC09475', imageConfidence: 'high',
    altImages: ['DSC09475', 'DSC09477', 'DSC09478'],
    available: true, featured: true, order: 11,
  },
  {
    id: 'chaplee-kabab', category: 'kababs',
    nameFr: 'Chaplee Kabab', nameEn: 'Chaplee Kabab',
    descFr: null, descEn: null, price: 19.8,
    image: 'DSC09473', imageConfidence: 'high',
    altImages: ['DSC09470', 'DSC09472', 'DSC09473'],
    available: true, featured: false, order: 12,
  },
  {
    id: 'cuisses-poulet', category: 'kababs',
    nameFr: 'Cuisses De Poulet (4x)', nameEn: 'Chicken Thighs (4x)',
    descFr: null, descEn: null, price: 19.8,
    image: 'DSC09439', imageConfidence: 'high',
    altImages: ['DSC09437', 'DSC09438', 'DSC09439', 'DSC09440'],
    available: true, featured: false, order: 13,
  },
  {
    id: 'biryani-poulet', category: 'kababs',
    nameFr: 'Biryani Au Poulet', nameEn: 'Chicken Biryani',
    descFr: null, descEn: null, price: 15.4,
    image: 'DSC09494', imageConfidence: 'high',
    altImages: ['DSC09493', 'DSC09494', 'DSC09495'],
    available: true, featured: false, order: 14,
  },
  {
    id: 'poisson-bassa', category: 'kababs',
    nameFr: 'Poisson Bassa', nameEn: 'Bassa Fish',
    descFr: null, descEn: null, price: 16.5,
    image: 'DSC09497', imageConfidence: 'high',
    altImages: ['DSC09497', 'DSC09498', 'DSC09499'],
    available: true, featured: false, order: 15,
  },

  // ────────────────────── CURRYS ET RAGOÛTS ──────────────────────
  {
    id: 'sabzi-pulao', category: 'currys',
    nameFr: 'Sabzi Pulao', nameEn: 'Sabzi Pulao',
    descFr: null, descEn: null, price: 16.5,
    image: 'DSC09542', imageConfidence: 'high',
    altImages: ['DSC09541', 'DSC09542', 'DSC09543'],
    available: true, featured: false, order: 1,
  },
  {
    id: 'kofta-pulao', category: 'currys',
    nameFr: 'Kofta Pulao', nameEn: 'Kofta Pulao',
    descFr: null, descEn: null, price: 16.5,
    image: 'DSC09539', imageConfidence: 'high',
    altImages: ['DSC09525', 'DSC09526', 'DSC09527'],
    available: true, featured: false, order: 2,
  },
  {
    id: 'qorma-pulao', category: 'currys',
    nameFr: 'Qorma Pulao', nameEn: 'Qorma Pulao',
    descFr: null, descEn: null, price: 17.6,
    image: 'DSC09526', imageConfidence: 'high',
    altImages: ['DSC09535'],
    available: true, featured: false, order: 3,
  },
  {
    id: 'mantu-plat', category: 'currys',
    nameFr: 'Mantu', nameEn: 'Mantu',
    descFr: null, descEn: null, price: 18.7,
    image: 'DSC09515', imageConfidence: 'high',
    altImages: ['DSC09512', 'DSC09514', 'DSC09515'],
    available: true, featured: true, order: 4,
  },
  {
    id: 'ashak-plat', category: 'currys',
    nameFr: 'Ashak', nameEn: 'Ashak',
    descFr: null, descEn: null, price: 18.7,
    image: 'DSC09521', imageConfidence: 'high',
    altImages: ['DSC09520', 'DSC09521', 'DSC09523'],
    available: true, featured: false, order: 5,
  },
  {
    id: 'banjan-burani-plat', category: 'currys',
    nameFr: 'Banjan Burani', nameEn: 'Banjan Burani',
    descFr: null, descEn: null, price: 17.6,
    image: 'rice-banjan-burani', imageConfidence: 'high',
    altImages: ['DSC09504', 'DSC09505', 'DSC09507'],
    available: true, featured: false, vegetarian: true, order: 6,
  },
  {
    id: 'dopiaza', category: 'currys',
    nameFr: 'Dopiaza', nameEn: 'Dopiaza',
    descFr: null, descEn: null, price: 18.7,
    image: 'DSC09528', imageConfidence: 'high',
    altImages: ['DSC09516', 'DSC09518', 'DSC09519'],
    available: true, featured: false, order: 7,
  },
  {
    id: 'tandoori-poulet', category: 'currys',
    nameFr: 'Tandoori Au Poulet', nameEn: 'Chicken Tandoori',
    descFr: null, descEn: null, price: 0,
    image: 'DSC09518', imageConfidence: 'high',
    available: false, featured: false, order: 8,
    needsReview: 'NOUVEAU (liste du propriétaire) — photo confirmée, PRIX REQUIS avant publication.',
  },
  {
    id: 'morgh-pulao', category: 'currys',
    nameFr: 'Morgh Pulao', nameEn: 'Morgh Pulao',
    descFr: null, descEn: null, price: 0,
    image: 'DSC09534', imageConfidence: 'high',
    available: false, featured: false, order: 9,
    needsReview: 'NOUVEAU (liste du propriétaire) — photo confirmée, PRIX REQUIS avant publication.',
  },

  // ────────────────────── PLATS À PARTAGER ──────────────────────
  // No photography exists for any combo. Combo Dostan's contents ARE published
  // (confirmed via the restaurant's DoorDash listing, 2026-07); Naseeb and
  // Watan still have no published contents, so those stay null rather than
  // invented.
  {
    id: 'combo-dostan', category: 'partager',
    nameFr: 'Combo Dostan', nameEn: 'Combo Dostan',
    // Verbatim from the restaurant's own DoorDash listing.
    descFr:
      'Combo 2 personnes : kabab de poulet, kobidah de bœuf, tikka d’agneau et kobidah de poulet. Servi avec riz et salade.',
    descEn:
      'Combo for 2: chicken kabab, beef kobidah, lamb tikka kabab and chicken kobidah. Served with rice and salad.',
    price: 51.7,
    image: 'rice-combo-dostan', imageConfidence: 'high',
    available: true, featured: true, order: 1,
  },
  {
    id: 'combo-naseeb', category: 'partager',
    nameFr: 'Naseeb Combo', nameEn: 'Naseeb Combo',
    descFr: null, descEn: null, price: 104.5,
    image: 'rice-combo-naseeb', imageConfidence: 'high',
    available: true, featured: true, order: 2,
  },
  {
    id: 'combo-watan', category: 'partager',
    nameFr: 'Watan Combo', nameEn: 'Watan Combo',
    descFr: null, descEn: null, price: 161.7,
    image: 'rice-combo-watan', imageConfidence: 'high',
    available: true, featured: true, order: 3,
    needsReview:
      'Owner-supplied styled image (teal platter + rice bowl). Contents still unpublished — confirm before listing them.',
  },

  // ────────────────────── BURGERS ET WRAPS ──────────────────────
  {
    id: 'hamburger-fromage', category: 'burgers',
    nameFr: 'Hamburger Au Fromage', nameEn: 'Cheeseburger',
    descFr: null, descEn: null, price: 14.24,
    image: null, imageConfidence: null,
    available: true, featured: false, order: 1,
    needsReview:
      'Generated menu-card image (overhead, stone plate) from the menu-design set — a stand-in, not a studio photo of this dish.',
  },
  {
    id: 'burger-poulet', category: 'burgers',
    nameFr: 'Burger Au Poulet', nameEn: 'Chicken Burger',
    descFr: null, descEn: null, price: 14.24,
    image: null, imageConfidence: null,
    available: true, featured: false, order: 2,
    needsReview:
      'Generated menu-card image (overhead, stone plate) from the menu-design set — a stand-in, not a studio photo of this dish.',
  },
  {
    id: 'wrap-boeuf', category: 'burgers',
    nameFr: 'Wrap Au Bœuf', nameEn: 'Beef Wrap',
    descFr: null, descEn: null, price: 15.4,
    image: null, imageConfidence: null,
    available: true, featured: false, order: 3,
    needsReview: 'Burgers & wraps show no photo (owner directive).',
  },
  {
    id: 'wrap-poulet', category: 'burgers',
    nameFr: 'Wrap Au Poulet', nameEn: 'Chicken Wrap',
    descFr: null, descEn: null, price: 15.4,
    image: null, imageConfidence: null,
    available: true, featured: false, order: 4,
    needsReview: 'Burgers & wraps show no photo (owner directive).',
  },
  {
    id: 'wrap-agneau', category: 'burgers',
    nameFr: "Wrap À L'agneau", nameEn: 'Lamb Wrap',
    descFr: null, descEn: null, price: 17.6,
    image: null, imageConfidence: null,
    available: true, featured: false, order: 5,
    needsReview: 'Burgers & wraps show no photo (owner directive).',
  },

  // ─────────────────────────── DESSERTS ───────────────────────────
  {
    id: 'firni', category: 'desserts',
    nameFr: 'Firni', nameEn: 'Firni',
    descFr: null, descEn: null, price: 4.4,
    image: 'DSC09547', imageConfidence: 'high',
    altImages: ['DSC09544', 'DSC09546', 'DSC09547'],
    available: true, featured: true, vegetarian: true, order: 1,
  },

  // ─────────────────────────── BOISSONS ───────────────────────────
  {
    id: 'the-afghan', category: 'boissons',
    nameFr: 'Thé Afghan', nameEn: 'Afghan Tea',
    descFr: null, descEn: null, price: 2.19,
    image: null, imageConfidence: null,
    available: true, featured: false, vegetarian: true, order: 1,
    needsReview: 'Drinks show no photo.',
  },
  {
    id: 'dogh', category: 'boissons',
    nameFr: 'Dogh (Boisson Au Yaourt)', nameEn: 'Dogh (Yogurt Drink)',
    descFr: null, descEn: null, price: 4.39,
    image: null, imageConfidence: null,
    available: true, featured: false, vegetarian: true, order: 2,
    needsReview: 'Drinks show no photo.',
  },
  {
    id: 'soda', category: 'boissons',
    nameFr: 'Soda', nameEn: 'Soda',
    descFr: null, descEn: null, price: 2.19,
    image: null, imageConfidence: null,
    available: true, featured: false, needsReview: 'Drinks show no photo.',
    order: 3,
  },
  {
    id: 'eau', category: 'boissons',
    nameFr: "Bouteille D'eau", nameEn: 'Water Bottle',
    descFr: null, descEn: null, price: 2.19,
    image: null, imageConfidence: null,
    available: true, featured: false, needsReview: 'Drinks show no photo.',
    order: 4,
  },

  // ──────────────────────────── EXTRAS ────────────────────────────
  {
    id: 'frites', category: 'extras',
    nameFr: 'Frites', nameEn: 'Fries',
    descFr: null, descEn: null, price: 6.0,
    image: 'card-frites', imageConfidence: 'medium',
    available: true, featured: false, vegetarian: true, order: 1,
  },
]

// ── helpers ────────────────────────────────────────────────────────

export const byCategory = (id: CategoryId) =>
  MENU.filter((i) => i.category === id).sort((a, b) => a.order - b.order)

export const featured = () => MENU.filter((i) => i.featured && i.available)

/** Items whose photo match or content the owner still needs to confirm. */
export const needsReview = () => MENU.filter((i) => i.needsReview)

export const formatPrice = (n: number, locale: 'fr' | 'en') => {
  // A price of 0 is the sentinel for "not yet priced" (new dishes from the
  // owner's list). Never render it as "0,00 $" — that reads as free.
  if (!n) return locale === 'fr' ? 'à venir' : 'coming soon'
  return new Intl.NumberFormat(locale === 'fr' ? 'fr-CA' : 'en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
  }).format(n)
}
