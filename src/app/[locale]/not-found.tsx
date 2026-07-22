import Link from 'next/link'

/**
 * 404. Kept deliberately plain — a lost visitor wants a way back to the menu,
 * not a joke and not another full-screen photograph to download.
 */
export default function NotFound() {
  return (
    <section className="grid min-h-[70svh] place-items-center px-6 text-center">
      <div>
        <img
          src="/brand/flame-ember.png"
          alt=""
          width={80}
          height={111}
          className="mx-auto h-16 w-auto opacity-80"
        />
        <h1 className="mt-8 font-display text-[length:var(--text-title)] text-cream">
          Page introuvable
        </h1>
        <p className="mt-3 text-sm text-sand/65">Page not found</p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/fr/menu"
            className="btn-primary hover:bg-cream hover:text-obsidian"
          >
            Voir le menu
          </Link>
          <Link
            href="/fr"
            className="border border-cream/30 px-7 py-3.5 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-cream transition-colors hover:bg-cream hover:text-charcoal"
          >
            Accueil
          </Link>
        </div>
      </div>
    </section>
  )
}
