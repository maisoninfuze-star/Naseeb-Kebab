import type { Metadata } from 'next'
import Link from 'next/link'
import { Manrope } from 'next/font/google'
import '../globals.css'

const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'swap' })

export const metadata: Metadata = {
  title: 'Naseeb Kabab — Administration',
  // The admin must never be indexed, and it is deliberately absent from the
  // public navigation and the sitemap.
  robots: { index: false, follow: false, nocache: true },
}

const NAV = [
  { href: '/admin', label: 'Aperçu / Overview' },
  { href: '/admin/menu', label: 'Menu' },
  { href: '/admin/inquiries', label: 'Demandes / Inquiries' },
  { href: '/admin/settings', label: 'Réglages / Settings' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={manrope.variable} suppressHydrationWarning>
      <body className="bg-charcoal font-body text-cream antialiased">
        <div className="flex min-h-screen flex-col md:flex-row">
          <aside className="shrink-0 border-b border-cream/10 md:w-60 md:border-b-0 md:border-r">
            <div className="p-6">
              <img
                src="/brand/wordmark-cream.png"
                alt="Naseeb Kabab"
                width={534}
                height={240}
                className="h-8 w-auto"
              />
              <p className="eyebrow mt-3 text-sand/50">Administration</p>
            </div>

            <nav className="px-3 pb-6">
              <ul className="space-y-1">
                {NAV.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="block rounded px-3 py-2 text-sm text-cream/80 transition-colors hover:bg-cream/5 hover:text-cream"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <Link
                href="/fr"
                className="mt-6 block px-3 text-xs text-sand/50 transition-colors hover:text-ember"
              >
                ← Voir le site
              </Link>
            </nav>
          </aside>

          <main className="flex-1 p-6 md:p-10">{children}</main>
        </div>
      </body>
    </html>
  )
}
