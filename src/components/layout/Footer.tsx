import Link from 'next/link'
import { type Locale, path } from '@/lib/i18n'
import { getDict } from '@/data/dictionary'
import { CONFIRMED, UNCONFIRMED, MAPS_URL } from '@/data/site'
import AfghanFlag from '@/components/ui/AfghanFlag'

export default function Footer({ locale }: { locale: Locale }) {
  const t = getDict(locale)
  const year = new Date().getFullYear()

  const explore: { key: Parameters<typeof path>[0]; label: string }[] = [
    { key: 'menu', label: t.nav.fullMenu },
    { key: 'story', label: t.nav.story },
    { key: 'catering', label: t.nav.catering },
    { key: 'gallery', label: t.nav.gallery },
    { key: 'visit', label: t.nav.visit },
  ]

  return (
    <footer className="relative overflow-hidden border-t border-cream/10 bg-obsidian">
      {/* Afghan geometric lattice, 3% opacity — grain, not decoration. */}
      <div className="geo-pattern pointer-events-none absolute inset-0" aria-hidden />

      <div className="gutter relative py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-12 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-4">
            <img
              src="/brand/wordmark-cream.png"
              alt={CONFIRMED.name}
              width={720}
              height={720}
              className="h-16 w-auto"
            />
            {/* The flag of Afghanistan, directly under the wordmark — a quiet
                marker of where the food comes from, not a decoration. */}
            <AfghanFlag
              title={locale === 'fr' ? "Drapeau de l'Afghanistan" : 'Flag of Afghanistan'}
              className="mt-4 h-5 w-auto rounded-[1px] ring-1 ring-cream/15"
            />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-sand/80">
              {t.footer.statement}
            </p>
          </div>

          {/* Explore */}
          <nav className="md:col-span-3" aria-label={t.footer.explore}>
            <h2 className="eyebrow text-ember">{t.footer.explore}</h2>
            <ul className="mt-5 space-y-2.5 text-sm">
              {explore.map((l) => (
                <li key={l.key}>
                  <Link
                    href={path(l.key, locale)}
                    className="text-cream/85 transition-colors hover:text-ember"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div className="md:col-span-3">
            <h2 className="eyebrow text-ember">{t.footer.contact}</h2>
            <address className="mt-5 space-y-2.5 text-sm not-italic text-cream/85">
              <p>
                {CONFIRMED.address.street}
                <br />
                {CONFIRMED.address.city}, {CONFIRMED.address.province}{' '}
                {CONFIRMED.address.postal}
              </p>
              <p>
                <a href={`tel:${CONFIRMED.phone}`} className="transition-colors hover:text-ember">
                  {CONFIRMED.phoneDisplay}
                </a>
              </p>
              <p>
                <a
                  href={`mailto:${CONFIRMED.email}`}
                  className="break-all transition-colors hover:text-ember"
                >
                  {CONFIRMED.email}
                </a>
              </p>
              <p>
                <a
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-ember"
                >
                  {t.visit.viewMap}
                </a>
              </p>
            </address>
          </div>

          {/* Hours + social */}
          <div className="md:col-span-2">
            <h2 className="eyebrow text-ember">{t.visit.hours}</h2>
            {UNCONFIRMED.hours ? (
              <ul className="mt-5 space-y-1.5 text-sm text-cream/85">
                {Object.entries(UNCONFIRMED.hours).map(([day, hrs]) => (
                  <li key={day} className="flex justify-between gap-3">
                    <span>{day}</span>
                    <span className="text-sand/70">{hrs}</span>
                  </li>
                ))}
              </ul>
            ) : (
              /* Not invented. The restaurant publishes no hours anywhere. */
              <p className="mt-5 text-sm text-sand/70">{t.visit.hoursPending}</p>
            )}

            <h2 className="eyebrow mt-8 text-ember">{t.footer.follow}</h2>
            {UNCONFIRMED.instagram || UNCONFIRMED.facebook ? (
              <ul className="mt-5 space-y-2 text-sm">
                {UNCONFIRMED.instagram && (
                  <li>
                    <a href={UNCONFIRMED.instagram} className="hover:text-ember">
                      Instagram
                    </a>
                  </li>
                )}
                {UNCONFIRMED.facebook && (
                  <li>
                    <a href={UNCONFIRMED.facebook} className="hover:text-ember">
                      Facebook
                    </a>
                  </li>
                )}
              </ul>
            ) : (
              <p className="mt-5 text-sm text-sand/70">—</p>
            )}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-cream/10 pt-6 text-xs text-sand/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {CONFIRMED.name}. {t.footer.rights}
          </p>

          {/* Studio credit. Sits between the copyright and the legal links so
              it reads as a signature, not a nav item — dimmer than both, and
              it only renders if the dictionary actually carries a note. */}
          {t.footer.builtNote && (
            <p className="text-sand/40 sm:order-3">{t.footer.builtNote}</p>
          )}

          <ul className="flex gap-6 sm:order-2">
            <li>
              <Link href={path('privacy', locale)} className="hover:text-ember">
                {t.footer.privacy}
              </Link>
            </li>
            <li>
              <Link href={path('terms', locale)} className="hover:text-ember">
                {t.footer.terms}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
