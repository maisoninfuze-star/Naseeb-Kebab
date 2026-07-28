'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { type Locale } from '@/lib/i18n'
import { getDict } from '@/data/dictionary'
import { CATEGORIES, MENU, formatPrice, type CategoryId, type MenuItem } from '@/data/menu'
import Picture from '@/components/ui/Picture'
import { cn, dishAlt } from '@/lib/utils'
import { isFinePointer, prefersReducedMotion } from '@/lib/motion'
import { track } from '@/lib/analytics'

/**
 * FULL MENU — list on the left, editorial image on the right.
 *
 * Desktop gets CURSOR IMAGE PREVIEW: hovering a row swaps the standing image
 * and floats a small frame near the pointer. Touch and coarse pointers get
 * neither — instead every row that has a photograph renders it inline, because
 * a hover-only image is an image mobile users can never see.
 *
 * Search and category filters are plain client state over static data — no
 * network, no debounce needed, instant on every keystroke.
 */
export default function MenuBrowser({ locale }: { locale: Locale }) {
  const t = getDict(locale)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState<CategoryId | 'all'>('all')
  const [hovered, setHovered] = useState<MenuItem | null>(null)
  const [fine, setFine] = useState(false)
  /** Which dish has its photo open below `lg`. Null = none. */
  const [openDish, setOpenDish] = useState<string | null>(null)

  useEffect(() => {
    setFine(isFinePointer() && !prefersReducedMotion())
    track('menu_view')
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return MENU.filter((item) => {
      if (active !== 'all' && item.category !== active) return false
      if (!q) return true
      return (
        item.nameFr.toLowerCase().includes(q) ||
        item.nameEn.toLowerCase().includes(q) ||
        (item.descFr ?? '').toLowerCase().includes(q) ||
        (item.descEn ?? '').toLowerCase().includes(q)
      )
    })
  }, [query, active])

  const grouped = useMemo(() => {
    return CATEGORIES.map((cat) => ({
      cat,
      items: filtered
        .filter((i) => i.category === cat.id)
        .sort((a, b) => a.order - b.order),
    })).filter((g) => g.items.length)
  }, [filtered])

  // The standing image: whatever is hovered, else the first photographed dish.
  const standing = hovered ?? filtered.find((i) => i.image) ?? null

  return (
    <div className="gutter">
      {/* Search + filters */}
      <div className="sticky top-[70px] z-40 -mx-[var(--gutter)] border-b border-cream/10 bg-obsidian/92 px-[var(--gutter)] py-4 backdrop-blur-lg">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <label className="relative flex-1 basis-56">
            <span className="sr-only">{t.common.search}</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.common.search}
              className="w-full border-b border-cream/20 bg-transparent py-2 text-sm text-cream placeholder:text-sand/40 focus:border-ember focus:outline-none"
            />
          </label>

          {/* Category tabs — horizontally scrollable on small screens. */}
          <div
            className="-mx-1 flex max-w-full gap-x-5 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="group"
            aria-label={t.common.allCategories}
          >
            <FilterChip
              active={active === 'all'}
              onClick={() => setActive('all')}
              label={t.common.allCategories}
            />
            {CATEGORIES.map((c) => (
              <FilterChip
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

      <div className="grid gap-12 pb-24 pt-12 lg:grid-cols-12 lg:gap-16">
        {/* The list */}
        <div className="lg:col-span-7">
          {grouped.length === 0 && (
            <p className="py-16 text-center text-sand/60">{t.common.noResults}</p>
          )}

          {grouped.map(({ cat, items }) => (
            <section key={cat.id} id={cat.id} className="mb-16 scroll-mt-40">
              <header className="border-b border-cream/12 pb-4">
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
                  <li
                    key={item.id}
                    onMouseEnter={() => fine && item.image && setHovered(item)}
                    onFocus={() => item.image && setHovered(item)}
                    className={cn(
                      'group border-b border-cream/8 py-5 transition-colors duration-300',
                      !item.available && 'opacity-45',
                    )}
                  >
                    {/*
                      Below `lg` the whole row is a button that reveals the
                      dish photo. Above `lg` it is inert and hovering the row
                      drives the standing image instead.

                      Gated on the BREAKPOINT, not on pointer detection.
                      `isFinePointer()` reports fine on plenty of touch devices
                      and on every emulator, so a pointer-gated photo is one
                      real phone users may never see — which was the bug here.
                    */}
                    <button
                      type="button"
                      onClick={() =>
                        item.image && setOpenDish(openDish === item.id ? null : item.id)
                      }
                      aria-expanded={item.image ? openDish === item.id : undefined}
                      aria-controls={item.image ? `dish-photo-${item.id}` : undefined}
                      disabled={!item.image}
                      // -my-5 py-5 pulls the row's own vertical padding INTO the
                    // button, so the whole ~67px row is the tap target (WCAG
                    // 44px) instead of just the 27px text line. Visual layout
                    // is unchanged. Above lg the row isn't a button (hover
                    // drives the standing image), so pointer-events are off.
                    className="-my-5 w-full cursor-pointer py-5 text-left disabled:cursor-default lg:pointer-events-none lg:my-0 lg:py-0"
                    >
                    <div className="flex items-baseline gap-4">
                      <h3 className="text-base text-cream transition-colors duration-300 group-hover:text-ember">
                        {locale === 'fr' ? item.nameFr : item.nameEn}
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

                      {/* Affordance: without a visible cue nobody discovers
                          that a menu row is tappable. Rotates when open. */}
                      {item.image && (
                        <span
                          aria-hidden
                          className={cn(
                            'ml-1 shrink-0 text-ember transition-transform duration-500 lg:hidden',
                            openDish === item.id && 'rotate-45',
                          )}
                          style={{ transitionTimingFunction: 'cubic-bezier(0.22,1,0.36,1)' }}
                        >
                          +
                        </span>
                      )}
                    </div>
                    </button>

                    {/* The other language's name, as a quiet secondary line. */}
                    {item.nameFr !== item.nameEn && (
                      <p className="mt-1 text-xs text-sand/45">
                        {locale === 'fr' ? item.nameEn : item.nameFr}
                      </p>
                    )}

                    {/* Real descriptions only. The restaurant publishes none yet. */}
                    {(locale === 'fr' ? item.descFr : item.descEn) && (
                      <p className="mt-2 max-w-md text-sm leading-relaxed text-cream/65">
                        {locale === 'fr' ? item.descFr : item.descEn}
                      </p>
                    )}

                    {!item.available && (
                      <p className="mt-2 text-xs uppercase tracking-wider text-ember/80">
                        {t.common.unavailable}
                      </p>
                    )}

                    {/* Tap-revealed photo. Replaces a permanent 128px
                        thumbnail on every single row, which made the menu
                        enormous to scroll and showed the food at a size too
                        small to be appetising. Now it opens large, one at a
                        time, and only when asked for. */}
                    <AnimatePresence initial={false}>
                      {item.image && openDish === item.id && (
                        <motion.div
                          id={`dish-photo-${item.id}`}
                          key="photo"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden lg:hidden"
                        >
                          <Picture
                            id={item.image}
                            crop="menu"
                            alt={dishAlt(item.nameFr, item.nameEn, locale)}
                            sizes="(max-width: 1024px) 88vw, 320px"
                            className="mt-5 w-full"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {/* Standing editorial image — desktop only, by breakpoint. */}
        {(
          <div className="hidden lg:col-span-5 lg:block">
            <div className="sticky top-40">
              <div className="relative overflow-hidden" style={{ aspectRatio: '4 / 5' }}>
                <AnimatePresence mode="wait">
                  {standing?.image && (
                    <motion.div
                      key={standing.image}
                      className="absolute inset-0"
                      initial={{ opacity: 0, scale: 1.04 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Picture
                        id={standing.image}
                        crop="menu"
                        alt={dishAlt(standing.nameFr, standing.nameEn, locale)}
                        sizes="40vw"
                        className="h-full w-full"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {standing && (
                <div className="mt-4 flex items-baseline justify-between gap-4">
                  <p className="text-sm text-cream">{standing.nameFr}</p>
                  <p className="text-sm tabular-nums text-sand/70">
                    {formatPrice(standing.price, locale)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function FilterChip({
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
        // min-h-11 = 44px. These are the primary navigation control on the
        // menu page; at 32px they were the smallest targets on the site.
        'relative flex min-h-11 shrink-0 items-center whitespace-nowrap py-2 text-xs uppercase tracking-[0.14em] transition-colors duration-300',
        active ? 'text-cream' : 'text-sand/50 hover:text-cream',
      )}
    >
      {label}
      {active && (
        <motion.span
          layoutId="menu-filter-underline"
          className="absolute inset-x-0 -bottom-[17px] h-px bg-ember"
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        />
      )}
    </button>
  )
}
