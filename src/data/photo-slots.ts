/**
 * PHOTO SLOTS — every changeable photograph on the public site.
 *
 * ═══════════════════════════════════════════════════════════════════
 * NAMED SLOTS, NOT FREE PLACEMENT
 * ═══════════════════════════════════════════════════════════════════
 * A slot is one fixed position in the design — the banner of the Menu page, the
 * photo beside the catering copy — and the owner chooses WHICH frame fills it.
 * They cannot add, move or remove a photo, because each position is built for a
 * particular crop and aspect and an arbitrary image would break the layout it
 * sits in.
 *
 * `id` is stored, so renaming a label is free and never orphans an override.
 * `fallback` is the shipped choice and what "rétablir" restores.
 *
 * NOT here, deliberately:
 *  · the homepage hero — it is a pinned six-frame sequence with its own build
 *    step (scripts/build-hero-frames.mjs) that crops every frame to one fixed
 *    box. Swapping a frame there means regenerating that set, not changing a
 *    reference, so exposing it as a dropdown would be a lie.
 *  · dish photographs — those belong to the dish and are set on the Menu screen,
 *    where they sit next to the name and price they describe.
 */

export interface PhotoSlot {
  id: string
  /** What the owner would call this position. */
  label: string
  /** Which screen it appears on, for grouping. */
  section: string
  /** The shipped frame id. */
  fallback: string
  /** Shape the position renders at, so the picker can warn about odd crops. */
  hint?: string
}

export const PHOTO_SLOTS: PhotoSlot[] = [
  // ── Page banners ────────────────────────────────────────────────
  { id: 'page.menu', label: 'Bannière — Le menu', section: 'Bannières de page', fallback: 'DSC09467', hint: 'large' },
  { id: 'page.story', label: 'Bannière — Notre histoire', section: 'Bannières de page', fallback: 'DSC09509', hint: 'large' },
  { id: 'page.catering', label: 'Bannière — Traiteur', section: 'Bannières de page', fallback: 'DSC09446', hint: 'large' },
  { id: 'page.gallery', label: 'Bannière — Galerie', section: 'Bannières de page', fallback: 'DSC09545', hint: 'large' },
  { id: 'page.visit', label: 'Bannière — Nous trouver', section: 'Bannières de page', fallback: 'DSC09476', hint: 'large' },
  { id: 'page.contact', label: 'Bannière — Contact', section: 'Bannières de page', fallback: 'DSC09513', hint: 'large' },
  { id: 'page.order', label: 'Bannière — Commander', section: 'Bannières de page', fallback: 'DSC09484', hint: 'large' },

  // ── Homepage sections ───────────────────────────────────────────
  { id: 'home.charcoal.1', label: 'Charbon de bois — 1er chapitre', section: 'Accueil', fallback: 'DSC09467' },
  { id: 'home.charcoal.2', label: 'Charbon de bois — 2e chapitre', section: 'Accueil', fallback: 'DSC09476' },
  { id: 'home.charcoal.3', label: 'Charbon de bois — 3e chapitre', section: 'Accueil', fallback: 'DSC09453' },
  { id: 'home.story', label: 'Aperçu « Notre histoire »', section: 'Accueil', fallback: 'DSC09509' },
  { id: 'home.catering', label: 'Aperçu « Traiteur »', section: 'Accueil', fallback: 'DSC09446' },
  { id: 'home.visit', label: 'Section « Nous trouver »', section: 'Accueil', fallback: 'DSC09463' },

  // ── Other in-page photographs ───────────────────────────────────
  { id: 'catering.inline', label: 'Traiteur — photo dans le texte', section: 'Autres pages', fallback: 'DSC09453' },
  { id: 'testimonials.feature', label: 'Témoignages — grande photo', section: 'Accueil', fallback: 'DSC09444' },
]

/** Slot id -> shipped frame id. */
export const SLOT_FALLBACKS: Record<string, string> = Object.fromEntries(
  PHOTO_SLOTS.map((s) => [s.id, s.fallback]),
)
