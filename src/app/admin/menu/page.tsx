import { CATEGORIES } from '@/data/menu'
import { getMenu } from '@/lib/content/resolve'
import { driverName, getContent, isEphemeral } from '@/lib/content/store'
import DishEditor from './DishEditor'
import NewDishForm from './NewDishForm'

export const dynamic = 'force-dynamic'

/**
 * Menu review and editing screen.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHY THIS IS NO LONGER READ-ONLY
 * ═══════════════════════════════════════════════════════════════════
 * It used to be, on the reasoning that editing needed Supabase and no Supabase
 * project existed — and that a Save button which silently discarded changes was
 * worse than no Save button. That reasoning was right, and it expired: the
 * content store now has a file driver that is a complete backend on any host
 * with a writable disk. The button saves for real.
 *
 * The rows are rendered from `getMenu()`, not from the static `MENU`, so what
 * the owner sees here is what the site is actually serving — including their
 * own earlier edits. Reading the shipped constant instead would show them a
 * dish they had already renamed, under its old name.
 */
export default async function AdminMenu() {
  const [items, { menu: overrides, additions }] = await Promise.all([
    getMenu({ includeHidden: true }),
    getContent(),
  ])
  const ephemeral = isEphemeral()
  // Dishes the owner created here can be deleted outright; shipped ones can
  // only be hidden or reset, because deleting them would strand the photograph
  // and the price that were checked against the printed menu.
  const created = new Set(additions.map((a) => a.id))

  return (
    <div className="max-w-5xl">
      <h1 className="font-body text-2xl font-semibold">Menu</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-sand/60">
        Vérifiez que chaque photo correspond au bon plat, et corrigez ce qui doit l’être.
        Chaque enregistrement est publié sur le site sans redéploiement.
      </p>

      {ephemeral ? (
        <p className="mt-4 max-w-2xl border-l-2 border-ember pl-4 text-sm leading-relaxed text-sand/70">
          <strong className="text-cream">Les modifications ne seront pas conservées.</strong>{' '}
          Cet hébergement a un disque éphémère et aucun Supabase n’est configuré : une
          modification survit jusqu’au prochain redémarrage de l’instance, puis disparaît.
        </p>
      ) : (
        <p className="mt-4 text-[0.65rem] uppercase tracking-wider text-sand/40">
          Stockage : {driverName() === 'supabase' ? 'Supabase' : 'fichier local'}
        </p>
      )}

      {CATEGORIES.map((cat) => {
        const inCat = items
          .filter((i) => i.category === cat.id)
          .sort((a, b) => a.order - b.order)
        if (!inCat.length) return null

        return (
          <section key={cat.id} className="mt-12">
            <h2 className="border-b border-cream/10 pb-2 font-body text-lg font-semibold">
              {cat.nameFr} <span className="text-sand/40">/ {cat.nameEn}</span>
            </h2>

            <ul className="mt-4 space-y-px">
              {inCat.map((item) => (
                <DishEditor
                  key={item.id}
                  item={item}
                  edited={Boolean(overrides[item.id])}
                  created={created.has(item.id)}
                  hidden={Boolean(item.hidden)}
                />
              ))}
            </ul>
          </section>
        )
      })}

      <NewDishForm />
    </div>
  )
}
