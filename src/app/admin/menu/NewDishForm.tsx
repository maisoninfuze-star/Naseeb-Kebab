'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { CATEGORIES } from '@/data/menu'
import { createDish, type SaveState } from '../actions'

/**
 * Add a dish that has no shipped counterpart.
 *
 * Kept behind a disclosure rather than sitting open above 49 rows: adding a
 * dish is the rare action on this screen, and correcting an existing one is the
 * common one. `createDish` writes to `additions`, which is a separate list from
 * the per-dish overrides — so a created dish can be deleted outright, while a
 * shipped dish can only be hidden or reset.
 */
export default function NewDishForm() {
  const [open, setOpen] = useState(false)
  const [state, action] = useActionState<SaveState, FormData>(createDish, {
    ok: false,
    message: null,
  })

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-8 min-h-11 border border-brass/50 px-5 text-xs uppercase tracking-wider text-brass transition-colors hover:bg-brass/10"
      >
        + Ajouter un plat
      </button>
    )
  }

  return (
    <form action={action} className="mt-8 border border-brass/25 bg-obsidian/50 p-5">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-body text-lg font-semibold">Nouveau plat</h2>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="min-h-11 px-2 text-[0.65rem] uppercase tracking-wider text-sand/50 hover:text-cream"
        >
          Annuler
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="Nom (FR)" name="nameFr" required placeholder="ex. Kabab Koubideh" />
        <Field label="Nom (EN)" name="nameEn" placeholder="Vide = même que le français" />
        <Field label="Prix ($)" name="price" inputMode="decimal" required placeholder="0.00" />
        <label className="block">
          <span className="text-[0.65rem] uppercase tracking-wider text-sand/50">Catégorie</span>
          <select
            name="category"
            defaultValue={CATEGORIES[0]?.id}
            className="mt-1 min-h-11 w-full bg-cream/5 px-3 text-sm text-cream outline-none focus:bg-cream/10"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id} className="bg-obsidian">
                {c.nameFr}
              </option>
            ))}
          </select>
        </label>
        <Field label="Description (FR)" name="descFr" placeholder="Facultatif" />
        <Field label="Description (EN)" name="descEn" placeholder="Optional" />
        <Field
          label="Photo (id de la frame)"
          name="image"
          placeholder="ex. DSC09509 — vide = aucune photo"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
        <Check name="vegetarian" label="Végé" />
        <Check name="spicy" label="Épicé" />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <Submit />
        {state.message && (
          <span role="status" className={`text-xs ${state.ok ? 'text-herb' : 'text-ember'}`}>
            {state.message}
          </span>
        )}
      </div>
    </form>
  )
}

function Submit() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-11 border border-brass/60 px-5 text-xs uppercase tracking-wider text-brass transition-colors hover:bg-brass/10 disabled:opacity-50"
    >
      {pending ? 'Ajout…' : 'Ajouter au menu'}
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

function Check({ name, label }: { name: string; label: string }) {
  return (
    <label className="flex min-h-11 items-center gap-2 text-xs text-sand/70">
      <input type="checkbox" name={name} className="accent-brass" />
      {label}
    </label>
  )
}
