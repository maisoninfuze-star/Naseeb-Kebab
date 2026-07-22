'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'

import { type Locale, path, swapLocale, type RouteKey } from '@/lib/i18n'
import { getDict } from '@/data/dictionary'
import { CONFIRMED, UNCONFIRMED } from '@/data/site'
import { cn } from '@/lib/utils'
import { track } from '@/lib/analytics'
import AfghanFlag from '@/components/ui/AfghanFlag'

const EASE = [0.22, 1, 0.36, 1] as const

type Item = { key: RouteKey; label: keyof ReturnType<typeof getDict>['nav'] }

/**
 * Desktop navigation is SPLIT around the centred wordmark.
 *
 * The previous build hid every destination behind a hamburger, which meant a
 * visitor had to click before they could learn the site even had a story page
 * or a catering page. Hospitality sites lose bookings that way. A split rail is
 * also the more expensive-looking arrangement: it gives the wordmark the
 * optical centre and keeps the two link groups short enough to stay legible.
 */
const LEFT: Item[] = [
  { key: 'menu', label: 'fullMenu' },
  { key: 'story', label: 'story' },
  { key: 'gallery', label: 'gallery' },
]

// `cateringShort` rather than the full "Traiteur et événements" — at rail
// tracking that label is wide enough to collide with the centred wordmark.
// The full name still appears in the drawer, the footer and the page heading.
const RIGHT: Item[] = [
  { key: 'catering', label: 'cateringShort' },
  { key: 'visit', label: 'visit' },
]

/** Mobile drawer shows everything, since there is no room for a rail. */
const ALL: Item[] = [
  { key: 'home', label: 'home' },
  ...LEFT,
  { key: 'catering', label: 'catering' },
  { key: 'visit', label: 'visit' },
]

export default function Nav({ locale }: { locale: Locale }) {
  const t = getDict(locale)
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [compact, setCompact] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Routes to the /order chooser rather than jumping to one platform:
  // delivery goes to DoorDash or Uber Eats, pickup is a phone call.
  const orderHref = path('order', locale)

  // Compact bar once the hero is behind us.
  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > window.innerHeight * 0.7)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [pathname])

  // Escape, focus trap and scroll lock — drawer only.
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      )
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    const id = requestAnimationFrame(() =>
      panelRef.current?.querySelector<HTMLElement>('a[href]')?.focus(),
    )

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
      cancelAnimationFrame(id)
    }
  }, [open])

  const isActive = (key: RouteKey) => {
    const href = path(key, locale)
    return key === 'home' ? pathname === href : pathname.startsWith(href)
  }

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-[100] transition-[background-color,backdrop-filter,padding] duration-500',
          compact ? 'bg-obsidian/85 py-3 backdrop-blur-xl' : 'bg-transparent py-7',
        )}
        style={{ transitionTimingFunction: 'cubic-bezier(0.22,1,0.36,1)' }}
      >
        {/* A 3-column grid on desktop rather than an absolutely-positioned
            wordmark. Taking the wordmark out of flow let the two link groups
            run underneath it — "Traiteur" sat on top of the logo at 1440px.
            Reserving a real centre column makes collision impossible at any
            width, and the side columns stay equal so the mark is optically
            centred. */}
        <div className="gutter flex items-center justify-between gap-6 lg:grid lg:grid-cols-[1fr_auto_1fr]">
          {/* ── Left: links (desktop) / burger (mobile) ── */}
          <nav className="hidden flex-1 lg:block" aria-label={t.nav.menuButton}>
            <ul className="flex items-center gap-9">
              {LEFT.map((item) => (
                <li key={item.key}>
                  <NavLink
                    href={path(item.key, locale)}
                    active={isActive(item.key)}
                    label={t.nav[item.label]}
                  />
                </li>
              ))}
            </ul>
          </nav>

          <button
            ref={triggerRef}
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-label={t.nav.openMenu}
            className="group -my-5 flex min-h-[44px] items-center gap-3 py-5 text-cream lg:hidden"
          >
            <span className="flex flex-col gap-[5px]" aria-hidden>
              <span className="block h-px w-6 bg-current transition-transform duration-500 group-hover:translate-x-1" />
              <span className="block h-px w-4 bg-current transition-transform duration-500 group-hover:translate-x-2" />
            </span>
            <span className="eyebrow hidden sm:inline">{t.nav.menuButton}</span>
          </button>

          {/* ── Centre: wordmark + flag ── */}
          <Link
            href={path('home', locale)}
            aria-label={CONFIRMED.name}
            className="flex shrink-0 flex-col items-center lg:justify-self-center lg:px-8"
          >
            <img
              src="/brand/wordmark-cream.png"
              alt={CONFIRMED.name}
              width={720}
              height={720}
              className={cn(
                'w-auto transition-all duration-500',
                compact ? 'h-9' : 'h-12 sm:h-14',
              )}
              style={{ transitionTimingFunction: 'cubic-bezier(0.22,1,0.36,1)' }}
            />
            {/* Afghanistan flag directly under the wordmark. It collapses to
                zero height once the bar goes compact on scroll, so the shrunk
                header stays tidy — the flag belongs with the full logo over
                the hero, not in the condensed scrolled bar. */}
            <AfghanFlag
              title={locale === 'fr' ? "Drapeau de l'Afghanistan" : 'Flag of Afghanistan'}
              className={cn(
                'w-auto rounded-[1px] ring-1 ring-cream/20 transition-all duration-500',
                compact ? 'mt-0 h-0 opacity-0' : 'mt-2 h-3 opacity-100',
              )}
            />
          </Link>

          {/* ── Right: links + language + order ── */}
          <div className="flex flex-1 items-center justify-end gap-6 lg:gap-8">
            <nav className="hidden lg:block" aria-label={t.nav.menuButton}>
              <ul className="flex items-center gap-9">
                {RIGHT.map((item) => (
                  <li key={item.key}>
                    <NavLink
                      href={path(item.key, locale)}
                      active={isActive(item.key)}
                      label={t.nav[item.label]}
                    />
                  </li>
                ))}
              </ul>
            </nav>

            <span className="hidden h-4 w-px bg-cream/15 lg:block" aria-hidden />

            <LangToggle locale={locale} pathname={pathname} />

            <a
              href={orderHref}
              onClick={() => track('order_online_click', { source: 'nav' })}
              className="hidden whitespace-nowrap border border-copper/50 px-6 py-3 text-[0.625rem] font-medium uppercase tracking-[0.3em] text-brass transition-colors duration-500 hover:bg-brass hover:text-obsidian sm:inline-block"
            >
              {t.nav.orderOnline}
            </a>
          </div>
        </div>
      </header>

      {/* ── MOBILE DRAWER ────────────────────────────────────────────
          Mobile only now. Nothing here depends on hover, and Order stays
          pinned at the bottom so the conversion action is never scrolled
          away inside the menu.                                          */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[150] lg:hidden"
            initial="closed"
            animate="open"
            exit="closed"
            role="dialog"
            aria-modal="true"
            aria-label={t.nav.menuButton}
          >
            <motion.div
              className="absolute inset-0 bg-obsidian/95 backdrop-blur-md"
              variants={{ closed: { opacity: 0 }, open: { opacity: 1 } }}
              transition={{ duration: 0.35 }}
              onClick={() => setOpen(false)}
            />

            <motion.div
              className="absolute inset-y-0 left-0 w-full origin-left bg-charcoal sm:w-[70%]"
              variants={{ closed: { x: '-100%' }, open: { x: '0%' } }}
              transition={{ duration: 0.6, ease: EASE }}
            />

            <div ref={panelRef} className="relative flex h-full flex-col">
              <div className="gutter flex items-center justify-between py-6">
                <span className="eyebrow text-sand">{CONFIRMED.tagline}</span>
                <button
                  onClick={() => setOpen(false)}
                  aria-label={t.nav.closeMenu}
                  className="group grid h-11 w-11 place-items-center text-cream"
                >
                  <span className="relative block h-5 w-5" aria-hidden>
                    <span className="absolute top-1/2 left-0 block h-px w-5 rotate-45 bg-current transition-transform duration-500 group-hover:rotate-[135deg]" />
                    <span className="absolute top-1/2 left-0 block h-px w-5 -rotate-45 bg-current transition-transform duration-500 group-hover:rotate-45" />
                  </span>
                </button>
              </div>

              <nav className="gutter flex-1 overflow-y-auto py-4">
                <ul>
                  {ALL.map((item, i) => (
                    <li key={item.key} className="overflow-hidden">
                      <motion.div
                        variants={{ closed: { y: '110%' }, open: { y: '0%' } }}
                        transition={{ duration: 0.6, ease: EASE, delay: 0.18 + i * 0.05 }}
                      >
                        <Link
                          href={path(item.key, locale)}
                          className={cn(
                            'flex items-baseline gap-4 py-2 font-display text-[clamp(1.9rem,8vw,2.8rem)] leading-tight transition-colors',
                            isActive(item.key) ? 'text-ember' : 'text-cream',
                          )}
                        >
                          <span className="eyebrow w-6 shrink-0 text-sand/50">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          {t.nav[item.label]}
                        </Link>
                      </motion.div>
                    </li>
                  ))}
                </ul>
              </nav>

              <motion.div
                className="gutter border-t border-cream/10 py-6"
                variants={{ closed: { opacity: 0 }, open: { opacity: 1 } }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                <a
                  href={orderHref}
                  onClick={() => track('order_online_click', { source: 'nav_drawer' })}
                  className="btn-primary block text-center hover:bg-cream hover:text-obsidian"
                >
                  {t.nav.orderOnline}
                </a>
                <div className="mt-5 space-y-1.5 text-sm text-sand">
                  <p>
                    {CONFIRMED.address.street}, {CONFIRMED.address.city}
                  </p>
                  <a href={`tel:${CONFIRMED.phone}`} className="block hover:text-ember">
                    {CONFIRMED.phoneDisplay}
                  </a>
                  {!UNCONFIRMED.hours && (
                    <p className="text-sand/60">{t.visit.hoursPending}</p>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/** Rail link. The active marker is an ember hairline, not a colour swap. */
function NavLink({
  href,
  label,
  active,
}: {
  href: string
  label: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className="group relative block whitespace-nowrap py-1 text-[0.625rem] font-medium uppercase tracking-[0.28em] text-cream/85 transition-colors duration-300 hover:text-cream"
    >
      {label}
      <span
        aria-hidden
        className={cn(
          'absolute -bottom-0.5 left-0 block h-px bg-ember transition-all duration-500',
          active ? 'w-full' : 'w-0 group-hover:w-full',
        )}
        style={{ transitionTimingFunction: 'cubic-bezier(0.22,1,0.36,1)' }}
      />
    </Link>
  )
}

function LangToggle({ locale, pathname }: { locale: Locale; pathname: string }) {
  const other: Locale = locale === 'fr' ? 'en' : 'fr'
  return (
    <div className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em]">
      <span className="text-cream" aria-current="true">
        {locale}
      </span>
      <span className="text-sand/40" aria-hidden>
        /
      </span>
      <Link
        href={swapLocale(pathname, other)}
        onClick={() => track('language_change', { to: other })}
        hrefLang={other}
        className="-my-3 py-3 text-sand/60 transition-colors hover:text-ember"
      >
        {other}
      </Link>
    </div>
  )
}
