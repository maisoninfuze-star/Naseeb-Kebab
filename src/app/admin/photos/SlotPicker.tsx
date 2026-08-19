'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import Picture from '@/components/ui/Picture'
import { resetSlotImage, saveSlotImage, type SaveState } from '../actions'

/**
 * One photo position, with a visual picker.
 *
 * ═══════════════════════════════════════════════════════════════════
 * PICK A PICTURE, DO NOT TYPE AN ID
 * ═══════════════════════════════════════════════════════════════════
 * The frames are named `DSC09467` and nothing else — nobody can choose between
 * 119 of those from a dropdown. So the current photo is shown at size, and the
 * chooser is a grid of thumbnails opened on demand. The id still appears, small,
 * because it is what the Menu screen asks for when attaching a photo to a dish.
 *
 * The grid is only mounted once opened. Rendering 119 thumbnails for each of 15
 * slots on load is ~1,800 images for a page where the owner will change one.
 */
export default function SlotPicker({
  slot,
  label,
  hint,
  current,
  fallback,
  frames,
}: {
  slot: string
  label: string
  hint?: string
  current: string
  fallback: string
  frames: string[]
}) {
  const [open, setOpen] = useState(false)
  const [state, action] = useActionState<SaveState, FormData>(saveSlotImage, {
    ok: false,
    message: null,
  })

  const edited = current !== fallback

  return (
    <li className="bg-obsidian/50 p-4">
      <div className="flex items-start gap-4">
        <div className="w-28 shrink-0">
          <Picture
            id={current}
            crop={hint === 'large' ? 'ed' : 'sq'}
            alt={`Photo actuelle : ${label}`}
            sizes="112px"
            className="w-full"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="font-medium">{label}</span>
            {edited && (
              <span className="rounded bg-brass/20 px-2 py-0.5 text-[0.6rem] uppercase tracking-wider text-brass">
                modifié
              </span>
            )}
            <code className="ml-auto text-[0.65rem] uppercase tracking-wider text-sand/40">
              {current}
            </code>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              className="min-h-11 border border-brass/50 px-4 text-[0.65rem] uppercase tracking-wider text-brass transition-colors hover:bg-brass/10"
            >
              {open ? 'Fermer' : 'Changer la photo'}
            </button>

            {edited && (
              <form action={resetSlotImage}>
                <input type="hidden" name="slot" value={slot} />
                <button
                  type="submit"
                  className="min-h-11 px-2 text-[0.65rem] uppercase tracking-wider text-sand/45 hover:text-ember"
                >
                  Rétablir l’original
                </button>
              </form>
            )}

            {state.message && (
              <span role="status" className={`text-xs ${state.ok ? 'text-herb' : 'text-ember'}`}>
                {state.message}
              </span>
            )}
          </div>
        </div>
      </div>

      {open && (
        <form action={action} className="mt-4 border-t border-cream/10 pt-4">
          <input type="hidden" name="slot" value={slot} />
          <Status />
          <ul className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
            {frames.map((f) => (
              <li key={f}>
                <button
                  type="submit"
                  name="frame"
                  value={f}
                  title={f}
                  aria-current={f === current}
                  className={`block w-full overflow-hidden border-2 transition-colors ${
                    f === current
                      ? 'border-brass'
                      : 'border-transparent hover:border-cream/30'
                  }`}
                >
                  <Picture id={f} crop="sq" alt={f} sizes="120px" className="w-full" />
                </button>
              </li>
            ))}
          </ul>
        </form>
      )}
    </li>
  )
}

function Status() {
  const { pending } = useFormStatus()
  if (!pending) return null
  return <p className="text-xs text-brass">Enregistrement…</p>
}
