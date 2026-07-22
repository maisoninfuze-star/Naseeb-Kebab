import { CATEGORIES, MENU } from '@/data/menu'
import Picture from '@/components/ui/Picture'

export const dynamic = 'force-dynamic'

/**
 * Menu review screen.
 *
 * Read-only in this build, and deliberately so: the value the owner needs
 * first is SEEING which photograph has been attached to which dish, because
 * that is the one thing nobody could verify from the files alone. Editing
 * writes to `menu_overrides` (see supabase/schema.sql) and is wired up once a
 * Supabase project exists — until then, showing a fake "Save" button that
 * silently discards changes would be worse than showing none.
 */
export default function AdminMenu() {
  return (
    <div className="max-w-5xl">
      <h1 className="font-body text-2xl font-semibold">Menu</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-sand/60">
        Vérifiez que chaque photo correspond au bon plat. Les prix proviennent du menu
        publié sur naseebkabab.shop et n’ont pas été modifiés.
      </p>

      {CATEGORIES.map((cat) => {
        const items = MENU.filter((i) => i.category === cat.id).sort((a, b) => a.order - b.order)
        if (!items.length) return null

        return (
          <section key={cat.id} className="mt-12">
            <h2 className="border-b border-cream/10 pb-2 font-body text-lg font-semibold">
              {cat.nameFr} <span className="text-sand/40">/ {cat.nameEn}</span>
            </h2>

            <ul className="mt-4 space-y-px">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start gap-4 bg-obsidian/50 p-3"
                >
                  <div className="w-20 shrink-0">
                    {item.image ? (
                      <Picture
                        id={item.image}
                        crop="sq"
                        alt={`Photo actuellement associée à ${item.nameFr}`}
                        sizes="80px"
                        className="w-full"
                      />
                    ) : (
                      <div className="grid aspect-square w-full place-items-center bg-cream/5 text-[0.6rem] uppercase tracking-wider text-sand/40">
                        aucune
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="font-medium">{item.nameFr}</span>
                      <span className="text-xs text-sand/45">{item.nameEn}</span>
                      <span className="ml-auto text-sm tabular-nums text-sand/70">
                        {item.price.toFixed(2)} $
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[0.65rem] uppercase tracking-wider">
                      {item.image && (
                        <span className="text-sand/40">{item.image}</span>
                      )}
                      {item.imageConfidence && (
                        <span
                          className={
                            item.imageConfidence === 'high'
                              ? 'rounded bg-herb/25 px-2 py-0.5 text-cream/80'
                              : item.imageConfidence === 'medium'
                                ? 'rounded bg-brass/15 px-2 py-0.5 text-brass'
                                : 'rounded bg-ember/20 px-2 py-0.5 text-ember'
                          }
                        >
                          {item.imageConfidence}
                        </span>
                      )}
                      {item.featured && (
                        <span className="rounded bg-cream/10 px-2 py-0.5 text-sand/70">
                          en vedette
                        </span>
                      )}
                      {item.vegetarian && (
                        <span className="rounded bg-herb/25 px-2 py-0.5 text-cream/80">
                          végé
                        </span>
                      )}
                      {!item.descFr && (
                        <span className="rounded bg-cream/5 px-2 py-0.5 text-sand/50">
                          pas de description
                        </span>
                      )}
                    </div>

                    {item.needsReview && (
                      <p className="mt-2 border-l-2 border-ember/50 pl-3 text-xs leading-relaxed text-sand/65">
                        {item.needsReview}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
