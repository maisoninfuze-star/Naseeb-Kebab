'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { type Locale } from '@/lib/i18n'
import { CATEGORIES, MENU, formatPrice, type CategoryId, type MenuItem } from '@/data/menu'
import Picture from '@/components/ui/Picture'
import { cn, dishAlt } from '@/lib/utils'
import { track } from '@/lib/analytics'
import { useDict } from '@/components/DictProvider'
import type { Dict } from '@/data/dictionary'

/**
 * FULL MENU — centred list, photo opens beneath the dish.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHY THIS REPLACED THE SPLIT LAYOUT
 * ═══════════════════════════════════════════════════════════════════
 * The list used to sit in a left column with one "standing" image on the right
 * that swapped on hover. Two real problems:
 *
 *  1. That frame had a fixed aspect, so every photo was cover-cropped into it —
 *     the "too zoomed" complaint. Changing the crop only moved the problem: one
 *     fixed frame can never suit every photo's shape.
 *
 *  2. Half the width was permanently reserved for a single image, which is what
 *     left the list itself cramped.
 *
 * Now: one centred column, and the photo opens INLINE under the dish you are
 * pointing at, rendered `contain` so the ENTIRE plate is visible — never
 * cropped, at any viewport, for any source shape.
 *
 * That also makes the outstanding photo↔dish check easy: open a dish and you
 * see the whole picture next to its name, which is exactly what is needed to
 * confirm the remaining mappings.
 *
 * Desktop opens on hover, touch opens on tap, keyboard opens on focus — all
 * driving the same single piece of state, so there is one code path and no
 * pointer-detection guesswork (which mis-fired on real devices before).
 */
/**
 * `items` carries the menu with the owner's admin edits already applied. It is
 * optional on purpose: the static `MENU` import stays the fallback, so a page
 * that has not been threaded yet still renders the shipped menu instead of
 * nothing, and this component keeps costing no request when it is not given
 * resolved data.
 */
export default function MenuBrowser({
  locale,
  items,
}: {
  locale: Locale
  items?: MenuItem[]
}) {
  const source = items ?? MENU
  const t = useDict(locale)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState<CategoryId | 'all'>('all')
  /** The one dish whose photo is open. */
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    track('menu_view')
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return source.filter((item) => {
      // A dish that is both unavailable AND priced 0 is a not-yet-published
      // item ("NOUVEAU … PRIX REQUIS avant publication") — keep it off the
      // public menu until the owner sets a price. A priced dish marked
      // unavailable still shows, dimmed, as temporarily out.
      if (!item.available && item.price === 0) return false
      if (active !== 'all' && item.category !== active) return false
      if (!q) return true
      return (
        item.nameFr.toLowerCase().includes(q) ||
        item.nameEn.toLowerCase().includes(q) ||
        (item.descFr ?? '').toLowerCase().includes(q) ||
        (item.descEn ?? '').toLowerCase().includes(q)
      )
    })
  }, [query, active, source])

  const grouped = useMemo(
    () =>
      CATEGORIES.map((cat) => ({
        cat,
        items: filtered.filter((i) => i.category === cat.id).sort((a, b) => a.order - b.order),
      })).filter((g) => g.items.length),
    [filtered],
  )

  return (
    <div className="gutter">
      {/* ── Search + filters ──────────────────────────────────────── */}
      {/* top-[58px] is not arbitrary: the nav collapses to exactly 60px once
          scrolled (py-3 + a 36px mark), and the nav is only ever compact when
          this bar is stuck. At 70px a 10px band opened between the two and dish
          rows slid through it half-clipped. Tucking under by 2px absorbs
          sub-pixel rounding. */}
      <div className="sticky top-[58px] z-40 -mx-[var(--gutter)] border-b border-cream/10 bg-obsidian/92 px-[var(--gutter)] py-4 backdrop-blur-lg">
        <div className="mx-auto max-w-3xl">
          <label htmlFor="menu-search" className="sr-only">
            {t.common.search}
          </label>
          <input
            id="menu-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.common.search}
            className="w-full border-b border-cream/15 bg-transparent py-2.5 text-cream placeholder:text-sand/60 focus:border-ember focus:outline-none"
          />

          <div className="mt-4 flex gap-6 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <FilterButton
              active={active === 'all'}
              onClick={() => setActive('all')}
              label={t.common.allCategories}
            />
            {CATEGORIES.map((c) => (
              <FilterButton
                key={c.id}
                active={active === c.id}
                onClick={() => {
                  setActive(c.id)
                  track('menu_category_click', { category: c.id, source: 'menu_page' })
                }}
                label={locale === 'fr' ? c.nameFr : c.nameEn}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Centred list ──────────────────────────────────────────── */}
      <div className="mx-auto max-w-3xl pb-24 pt-14">
        {grouped.length === 0 && (
          <p className="py-16 text-center text-sand/75">{t.common.noResults}</p>
        )}

        {grouped.map(({ cat, items }) => (
          <section key={cat.id} id={cat.id} className="mb-20 scroll-mt-44">
            <header className="border-b border-cream/12 pb-4 text-center">
              <h2 className="text-[length:var(--text-heading)] text-cream">
                {locale === 'fr' ? cat.nameFr : cat.nameEn}
              </h2>
              {(locale === 'fr' ? cat.blurbFr : cat.blurbEn) && (
                <p className="mt-2 text-sm text-sand/60">
                  {locale === 'fr' ? cat.blurbFr : cat.blurbEn}
                </p>
              )}
            </header>

            <ul>
              {items.map((item) => (
                <Row
                  key={item.id}
                  item={item}
                  locale={locale}
                  t={t}
                  open={openId === item.id}
                  onOpen={() => setOpenId(item.id)}
                  onClose={() => setOpenId((cur) => (cur === item.id ? null : cur))}
                  onToggle={() => setOpenId((cur) => (cur === item.id ? null : item.id))}
                />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}

function Row({
  item,
  locale,
  t,
  open,
  onOpen,
  onClose,
  onToggle,
}: {
  item: MenuItem
  locale: Locale
  t: Dict
  open: boolean
  onOpen: () => void
  onClose: () => void
  onToggle: () => void
}) {
  const hasPhoto = Boolean(item.image)
  const name = locale === 'fr' ? item.nameFr : item.nameEn
  const other = locale === 'fr' ? item.nameEn : item.nameFr
  const desc = locale === 'fr' ? item.descFr : item.descEn

  return (
    <li
      // Hover drives desktop; touch devices never fire these and fall through
      // to the click handler. Same state either way.
      onMouseEnter={hasPhoto ? onOpen : undefined}
      onMouseLeave={hasPhoto ? onClose : undefined}
      className={cn(
        'group border-b border-cream/8 transition-colors duration-300',
        !item.available && 'opacity-45',
      )}
    >
      <button
        type="button"
        onClick={hasPhoto ? onToggle : undefined}
        onFocus={hasPhoto ? onOpen : undefined}
        disabled={!hasPhoto}
        aria-expanded={hasPhoto ? open : undefined}
        aria-controls={hasPhoto ? `photo-${item.id}` : undefined}
        className="w-full cursor-pointer py-5 text-left disabled:cursor-default"
      >
        <div className="flex items-baseline gap-4">
          <h3
            className={cn(
              'text-base transition-colors duration-300',
              open ? 'text-ember' : 'text-cream group-hover:text-ember',
            )}
          >
            {name}
          </h3>

          {item.vegetarian && (
            <span
              className="shrink-0 border border-herb px-2 py-0.5 text-[0.6875rem] uppercase tracking-wider text-herb"
              title={t.common.vegetarian}
            >
              V
            </span>
          )}

          <span className="h-px flex-1 translate-y-[-3px] bg-cream/10" aria-hidden />

          <span className="shrink-0 font-body text-sm tabular-nums text-sand/75">
            {formatPrice(item.price, locale)}
          </span>

          {hasPhoto && (
            <span
              aria-hidden
              className={cn(
                'ml-1 shrink-0 text-ember transition-transform duration-500',
                open && 'rotate-45',
              )}
              style={{ transitionTimingFunction: 'cubic-bezier(0.22,1,0.36,1)' }}
            >
              +
            </span>
          )}
        </div>

        {other !== name && <p className="mt-1 text-xs text-sand/45">{other}</p>}

        {desc && <p className="mt-2 max-w-xl text-sm leading-relaxed text-cream/65">{desc}</p>}

        {!item.available && (
          <p className="mt-2 text-xs uppercase tracking-wider text-ember/80">
            {t.common.unavailable}
          </p>
        )}
      </button>

      {/* ── Photo, opened beneath the dish ────────────────────────── */}
      <AnimatePresence initial={false}>
        {hasPhoto && open && (
          <motion.div
            id={`photo-${item.id}`}
            key="photo"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            {/* `contain`, deliberately. The customer is deciding what to order,
                so the entire plate must be visible — cover would crop, which is
                the exact bug this layout replaced. */}
            <div className="mb-6 mt-1 overflow-hidden rounded-lg bg-charcoal">
              <Picture
                id={item.image!}
                crop="menu"
                fit="contain"
                alt={dishAlt(item.nameFr, item.nameEn, locale)}
                sizes="(max-width: 768px) 92vw, 720px"
                className="w-full"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}

function FilterButton({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        // min-h-11 = 44px — the primary navigation control on this page.
        'relative flex min-h-11 shrink-0 items-center whitespace-nowrap py-2 text-xs uppercase tracking-[0.14em] transition-colors duration-300',
        active ? 'text-cream' : 'text-sand/50 hover:text-cream',
      )}
    >
      {label}
      {active && (
        <motion.span
          layoutId="menu-filter-underline"
          className="absolute inset-x-0 bottom-1 h-px bg-ember"
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        />
      )}
    </button>
  )
}
