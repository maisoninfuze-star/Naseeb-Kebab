'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { resetText, saveText, type SaveState } from '../actions'

/**
 * One editable string of site copy.
 *
 * Long strings get a textarea and short ones an input, decided from the shipped
 * length — a paragraph typed into a one-line field is the difference between an
 * editor the owner uses and one they avoid.
 */
export default function TextRow({
  locale,
  path,
  value,
  shipped,
}: {
  locale: 'fr' | 'en'
  path: string
  /** Current value: the override if one exists, otherwise the shipped string. */
  value: string
  shipped: string
}) {
  const [state, action] = useActionState<SaveState, FormData>(saveText, {
    ok: false,
    message: null,
  })
  const [draft, setDraft] = useState(value)

  const edited = value !== shipped
  const dirty = draft !== value
  const long = shipped.length > 70

  return (
    <li className="bg-obsidian/50 p-4">
      <form action={action}>
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="path" value={path} />

        <div className="flex flex-wrap items-baseline gap-2">
          <code className="text-[0.65rem] uppercase tracking-wider text-sand/40">{path}</code>
          {edited && (
            <span className="rounded bg-brass/20 px-2 py-0.5 text-[0.6rem] uppercase tracking-wider text-brass">
              modifié
            </span>
          )}
        </div>

        {long ? (
          <textarea
            name="value"
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="mt-2 w-full resize-y bg-cream/5 p-3 text-sm leading-relaxed text-cream outline-none focus:bg-cream/10"
          />
        ) : (
          <input
            name="value"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="mt-2 min-h-11 w-full bg-cream/5 px-3 text-sm text-cream outline-none focus:bg-cream/10"
          />
        )}

        {edited && (
          <p className="mt-2 text-xs leading-relaxed text-sand/45">
            Original : <span className="text-sand/60">{shipped}</span>
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-3">
          {dirty && <Save />}
          {edited && !dirty && (
            <button
              type="submit"
              formAction={resetText}
              className="min-h-11 px-2 text-[0.65rem] uppercase tracking-wider text-sand/45 hover:text-ember"
            >
              Rétablir l’original
            </button>
          )}
          {state.message && (
            <span role="status" className={`text-xs ${state.ok ? 'text-herb' : 'text-ember'}`}>
              {state.message}
            </span>
          )}
        </div>
      </form>
    </li>
  )
}

function Save() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-11 border border-brass/60 px-4 text-[0.65rem] uppercase tracking-wider text-brass transition-colors hover:bg-brass/10 disabled:opacity-50"
    >
      {pending ? 'Enregistrement…' : 'Enregistrer'}
    </button>
  )
}
