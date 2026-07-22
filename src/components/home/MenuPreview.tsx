'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { type Locale, path } from '@/lib/i18n'
import { getDict } from '@/data/dictionary'
import { byCategory, formatPrice, type CategoryId } from '@/data/menu'
import Picture from '@/components/ui/Picture'
import { track } from '@/lib/analytics'
import { cn, dishAlt } from '@/lib/utils'

/**
 * CROSSFADE MENU TABS
 *
 * Old items fade and rise ~10px, new items fade in, and the supporting image
 * crossfades behind a mask. ~420ms — inside the 350–500ms the brief specifies.
 *
 * Tabs are real tablist semantics (roles, aria-selected, arrow-key roving
 * focus) rather than styled buttons, so the section is usable from a keyboard.
 */
const TABS: CategoryId[] = ['entrees', 'currys', 'kababs', 'partager', 'desserts']

export default function MenuPreview({ locale }: { locale: Locale }) {
  const t = getDict(locale)
  const [active, setActive] = useState<CategoryId>('kababs')
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const items = byCategory(active).slice(0, 5)
  const image = items.find((i) => i.image)?.image ?? 'DSC09484'

  const onKeyDown = (e: React.KeyboardEvent) => {
    const i = TABS.indexOf(active)
    let next = i
    if (e.key === 'ArrowRight') next = (i + 1) % TABS.length
    else if (e.key === 'ArrowLeft') next = (i - 1 + TABS.length) % TABS.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = TABS.length - 1
    else return

    e.preventDefault()
    setActive(TABS[next])
    tabRefs.current[next]?.focus()
  }

  return (
    <section className="section-pad bg-charcoal">
      <div className="gutter">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="eyebrow flex items-center gap-3 text-ember">
              <span className="h-px w-8 bg-ember" aria-hidden />
              {t.preview.eyebrow}
            </span>
            <h2 className="mt-5 text-[length:var(--text-title)] text-cream">{t.preview.title}</h2>
          </div>
          <Link
            href={path('menu', locale)}
            className="group inline-flex items-center gap-3 text-sm text-sand transition-colors hover:text-ember"
          >
            {t.preview.viewFull}
            <span
              className="inline-block h-px w-8 bg-current transition-all duration-500 group-hover:w-12"
              aria-hidden
            />
          </Link>
        </div>

        {/* Tabs */}
        <div
          role="tablist"
          aria-label={t.preview.eyebrow}
          onKeyDown={onKeyDown}
          className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-b border-cream/12 pb-4"
        >
          {TABS.map((id, i) => {
            const cat = CAT_LABEL[id]
            const selected = active === id
            return (
              <button
                key={id}
                ref={(el) => {
                  tabRefs.current[i] = el
                }}
                role="tab"
                id={`tab-${id}`}
                aria-selected={selected}
                aria-controls={`panel-${id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => {
                  setActive(id)
                  track('menu_category_click', { category: id, source: 'home_preview' })
                }}
                className={cn(
                  // min-h-11 = 44px. These are the primary way a phone user
                  // moves between menu categories, and at 28px they were the
                  // smallest interactive targets left on the page.
                  'relative flex min-h-11 items-center pb-2 text-sm transition-colors duration-300',
                  selected ? 'text-cream' : 'text-sand/55 hover:text-cream',
                )}
              >
                {locale === 'fr' ? cat.fr : cat.en}
                {selected && (
                  <motion.span
                    layoutId="menu-tab-underline"
                    className="absolute -bottom-[17px] left-0 h-px w-full bg-ember"
                    transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
              </button>
            )
          })}
        </div>

        <div className="mt-12 grid gap-10 md:grid-cols-12 md:gap-12">
          {/* Items */}
          <div
            role="tabpanel"
            id={`panel-${active}`}
            aria-labelledby={`tab-${active}`}
            className="md:col-span-7"
          >
            <AnimatePresence mode="wait">
              <motion.ul
                key={active}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              >
                {items.map((item, i) => (
                  <motion.li
                    key={item.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-baseline gap-4 border-b border-cream/8 py-4"
                  >
                    <span className="text-cream">{item.nameFr}</span>
                    <span className="h-px flex-1 translate-y-[-3px] bg-cream/12" aria-hidden />
                    <span className="shrink-0 font-body text-sm tabular-nums text-sand/70">
                      {formatPrice(item.price, locale)}
                    </span>
                  </motion.li>
                ))}
              </motion.ul>
            </AnimatePresence>
          </div>

          {/* SOFT IMAGE CROSSFADE behind a mask. */}
          <div className="relative md:col-span-5">
            <div className="relative overflow-hidden" style={{ aspectRatio: '4 / 5' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={image}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Picture
                    id={image}
                    crop="ed"
                    alt={
                      items.find((i) => i.image === image)
                        ? dishAlt(
                            items.find((i) => i.image === image)!.nameFr,
                            items.find((i) => i.image === image)!.nameEn,
                            locale,
                          )
                        : ''
                    }
                    sizes="(max-width: 768px) 90vw, 38vw"
                    className="h-full w-full"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const CAT_LABEL: Record<CategoryId, { fr: string; en: string }> = {
  entrees: { fr: 'Entrées', en: 'Starters' },
  kababs: { fr: 'Kababs et grillades', en: 'Kababs & Grill' },
  currys: { fr: 'Currys et ragoûts', en: 'Curries & Stews' },
  partager: { fr: 'À partager', en: 'Sharing' },
  burgers: { fr: 'Burgers et wraps', en: 'Burgers & Wraps' },
  desserts: { fr: 'Desserts', en: 'Desserts' },
  boissons: { fr: 'Boissons', en: 'Drinks' },
  extras: { fr: 'Extras', en: 'Extras' },
}
