'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { CATEGORIES, type MenuItem } from '@/data/menu'
import Picture from '@/components/ui/Picture'
import { removeDish, resetDish, saveDish, type SaveState } from '../actions'

/**
 * One editable dish row.
 *
 * ═══════════════════════════════════════════════════════════════════
 * COLLAPSED BY DEFAULT
 * ═══════════════════════════════════════════════════════════════════
 * The screen's first job is still the one it was built for — seeing at a glance
 * which photograph is attached to which dish — and 49 dishes rendered as 49
 * open forms destroys exactly that. So the summary row is unchanged and the
 * form is opened per dish, on the one being changed.
 *
 * The dirty check is against the values the row was rendered with, so "Annuler
 * les modifications" is offered only when there is something to discard, and
 * the reset button (which clears the stored override entirely) is offered only
 * on dishes that actually have one.
 */
export default function DishEditor({
  item,
  edited,
  created = false,
  hidden = false,
}: {
  item: MenuItem
  /** True when a stored override is already shaping this row. */
  edited: boolean
  /** True for a dish the owner added here, which has no shipped original. */
  created?: boolean
  /** True when this dish is currently hidden from the public site. */
  hidden?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [state, action] = useActionState<SaveState, FormData>(saveDish, {
    ok: false,
    message: null,
  })

  return (
    <li className="bg-obsidian/50">
      <div className="flex items-start gap-4 p-3">
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
            <span className={`font-medium ${hidden ? 'text-sand/50 line-through' : ''}`}>
              {item.nameFr}
            </span>
            <span className="text-xs text-sand/45">{item.nameEn}</span>
            {hidden && (
              <span className="rounded bg-ember/25 px-2 py-0.5 text-[0.6rem] uppercase tracking-wider text-ember">
                masqué
              </span>
            )}
            {created ? (
              <span className="rounded bg-herb/25 px-2 py-0.5 text-[0.6rem] uppercase tracking-wider text-cream/80">
                ajouté
              </span>
            ) : (
              edited && (
                <span className="rounded bg-brass/20 px-2 py-0.5 text-[0.6rem] uppercase tracking-wider text-brass">
                  modifié
                </span>
              )
            )}
            <span className="ml-auto text-sm tabular-nums text-sand/70">
              {item.price.toFixed(2)} $
            </span>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              className="min-h-11 shrink-0 px-2 text-[0.65rem] uppercase tracking-wider text-brass hover:text-cream"
            >
              {open ? 'Fermer' : 'Modifier'}
            </button>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-[0.65rem] uppercase tracking-wider">
            {item.image && <span className="text-sand/40">{item.image}</span>}
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
              <span className="rounded bg-cream/10 px-2 py-0.5 text-sand/70">en vedette</span>
            )}
            {item.vegetarian && (
              <span className="rounded bg-herb/25 px-2 py-0.5 text-cream/80">végé</span>
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
      </div>

      {open && (
        <form action={action} className="border-t border-cream/10 p-3 pt-4">
          <input type="hidden" name="id" value={item.id} />

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nom (FR)" name="nameFr" defaultValue={item.nameFr} required />
            <Field label="Nom (EN)" name="nameEn" defaultValue={item.nameEn} required />
            <Field
              label="Prix ($)"
              name="price"
              defaultValue={item.price.toFixed(2)}
              inputMode="decimal"
              required
            />
            <label className="block">
              <span className="text-[0.65rem] uppercase tracking-wider text-sand/50">
                Catégorie
              </span>
              <select
                name="category"
                defaultValue={item.category}
                className="mt-1 min-h-11 w-full bg-cream/5 px-3 text-sm text-cream outline-none focus:bg-cream/10"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id} className="bg-obsidian">
                    {c.nameFr}
                  </option>
                ))}
              </select>
            </label>
            <Field
              label="Description (FR)"
              name="descFr"
              defaultValue={item.descFr ?? ''}
              placeholder="Laisser vide = aucune description"
            />
            <Field
              label="Description (EN)"
              name="descEn"
              defaultValue={item.descEn ?? ''}
              placeholder="Leave empty for none"
            />
            <Field
              label="Photo (id de la frame)"
              name="image"
              defaultValue={item.image ?? ''}
              placeholder="ex. DSC09509 — vide = aucune photo"
            />
            <Field label="Ordre" name="order" defaultValue={String(item.order)} inputMode="numeric" />
          </div>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            <Check name="available" label="Disponible" defaultChecked={item.available} />
            <Check name="featured" label="En vedette" defaultChecked={item.featured} />
            <Check name="vegetarian" label="Végé" defaultChecked={item.vegetarian ?? false} />
            <Check name="spicy" label="Épicé" defaultChecked={item.spicy ?? false} />
            <Check name="hidden" label="Masquer du site" defaultChecked={hidden} />
            {item.needsReview && (
              <Check name="confirmPhoto" label="Photo confirmée — retirer l’avertissement" />
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Save />
            {created ? (
              <button
                type="submit"
                formAction={removeDish}
                className="min-h-11 px-3 text-xs uppercase tracking-wider text-sand/50 hover:text-ember"
              >
                Supprimer le plat
              </button>
            ) : (
              edited && (
                <button
                  type="submit"
                  formAction={resetDish}
                  className="min-h-11 px-3 text-xs uppercase tracking-wider text-sand/50 hover:text-ember"
                >
                  Rétablir l’original
                </button>
              )
            )}
            {state.message && (
              <span
                role="status"
                className={`text-xs ${state.ok ? 'text-herb' : 'text-ember'}`}
              >
                {state.message}
              </span>
            )}
          </div>
        </form>
      )}
    </li>
  )
}

function Save() {
  // useFormStatus reads the enclosing form, so the button knows it is mid-submit
  // without the parent tracking any state.
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-11 border border-brass/60 px-5 text-xs uppercase tracking-wider text-brass transition-colors hover:bg-brass/10 disabled:opacity-50"
    >
      {pending ? 'Enregistrement…' : 'Enregistrer'}
    </button>
  )
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-[0.65rem] uppercase tracking-wider text-sand/50">{label}</span>
      <input
        {...props}
        className="mt-1 min-h-11 w-full bg-cream/5 px-3 text-sm text-cream outline-none placeholder:text-sand/30 focus:bg-cream/10"
      />
    </label>
  )
}

function Check({
  name,
  label,
  defaultChecked,
}: {
  name: string
  label: string
  defaultChecked?: boolean
}) {
  return (
    <label className="flex min-h-11 items-center gap-2 text-xs text-sand/70">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="accent-brass" />
      {label}
    </label>
  )
}
