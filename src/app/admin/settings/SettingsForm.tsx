'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { saveSiteSettings, type SaveState } from '../actions'

type Settings = {
  hours?: Record<string, string> | null
  instagram?: string | null
  facebook?: string | null
  orderingUrl?: string | null
  halal?: boolean | null
  parking?: string | null
  foundedYear?: number | null
  announcement?: string | null
  announcementEn?: string | null
}

/** Must match DAYS in actions.ts — the action reads `hours.<day>` by name. */
const DAYS = ['Lun–Jeu', 'Ven–Sam', 'Dim'] as const

/**
 * Everything on the public site that is not the menu.
 *
 * ═══════════════════════════════════════════════════════════════════
 * EACH FIELD SAYS WHAT IT CHANGES
 * ═══════════════════════════════════════════════════════════════════
 * The old read-only screen's one genuinely useful feature was telling the owner
 * what a visitor currently sees in place of each missing value. That is kept
 * as help text under the input rather than dropped for a bare form — it is the
 * difference between "Instagram" and "leaving this blank puts a dash in the
 * footer".
 *
 * Halal is a tri-state, not a checkbox, and defaults to "not answered". A
 * customer can verify a halal claim, so an unticked box must never be storable
 * as a confident "no".
 */
export default function SettingsForm({ settings }: { settings: Settings }) {
  const [state, action] = useActionState<SaveState, FormData>(saveSiteSettings, {
    ok: false,
    message: null,
  })

  return (
    <form action={action} className="mt-6">
      <Section title="Heures d’ouverture">
        <p className="mb-3 text-sm leading-relaxed text-sand/60">
          Affichées au pied de page, sur « Nous trouver » et dans la navigation. Laisser
          vide affiche « Heures à confirmer — appelez-nous ».
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {DAYS.map((d) => (
            <Field
              key={d}
              label={d}
              name={`hours.${d}`}
              defaultValue={settings.hours?.[d] ?? ''}
              placeholder="12:00 – 20:45"
            />
          ))}
        </div>
      </Section>

      <Section title="Liens">
        {/* Ordering is intentionally not a field here: the « Commander » flow
            already routes to the restaurant's real DoorDash and Uber Eats
            listings (see DELIVERY in src/data/site.ts), so a single ordering-URL
            override would compete with that rather than help. */}
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Instagram"
            name="instagram"
            defaultValue={settings.instagram ?? ''}
            placeholder="https://instagram.com/…"
            help="Vide : le pied de page affiche un tiret."
          />
          <Field
            label="Facebook"
            name="facebook"
            defaultValue={settings.facebook ?? ''}
            placeholder="https://facebook.com/…"
            help="Vide : le pied de page affiche un tiret."
          />
        </div>
      </Section>

      <Section title="Bannière du site">
        <p className="mb-3 text-sm leading-relaxed text-sand/60">
          Affichée en haut de chaque page. Vider les deux champs retire la bannière.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Annonce (FR)"
            name="announcement"
            defaultValue={settings.announcement ?? ''}
            placeholder="ex. Fermé le 1er juillet"
          />
          <Field
            label="Annonce (EN)"
            name="announcementEn"
            defaultValue={settings.announcementEn ?? ''}
            placeholder="e.g. Closed July 1st"
          />
        </div>
      </Section>

      <Section title="Le restaurant">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-[0.65rem] uppercase tracking-wider text-sand/50">
              Statut halal
            </span>
            <select
              name="halal"
              defaultValue={settings.halal === true ? 'yes' : settings.halal === false ? 'no' : ''}
              className="mt-1 min-h-11 w-full bg-cream/5 px-3 text-sm text-cream outline-none focus:bg-cream/10"
            >
              <option value="" className="bg-obsidian">
                Pas encore répondu
              </option>
              <option value="yes" className="bg-obsidian">
                Oui — halal
              </option>
              <option value="no" className="bg-obsidian">
                Non
              </option>
            </select>
            <span className="mt-1 block text-xs leading-relaxed text-sand/45">
              À confirmer par écrit avant activation : le client peut le vérifier.
            </span>
          </label>
          <Field
            label="Année d’ouverture"
            name="foundedYear"
            defaultValue={settings.foundedYear ? String(settings.foundedYear) : ''}
            inputMode="numeric"
            placeholder="ex. 2019"
            help="Vide : « à compléter » sur Notre histoire."
          />
          <Field
            label="Stationnement"
            name="parking"
            defaultValue={settings.parking ?? ''}
            placeholder="ex. Gratuit devant le restaurant"
            help="Vide : la section est masquée sur Nous trouver."
          />
        </div>
      </Section>

      <div className="mt-8 flex items-center gap-4">
        <Save />
        {state.message && (
          <span role="status" className={`text-xs ${state.ok ? 'text-herb' : 'text-ember'}`}>
            {state.message}
          </span>
        )}
      </div>
    </form>
  )
}

function Save() {
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="mb-3 border-b border-cream/10 pb-2 font-body text-lg font-semibold">
        {title}
      </h2>
      {children}
    </section>
  )
}

function Field({
  label,
  help,
  ...props
}: { label: string; help?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-[0.65rem] uppercase tracking-wider text-sand/50">{label}</span>
      <input
        {...props}
        className="mt-1 min-h-11 w-full bg-cream/5 px-3 text-sm text-cream outline-none placeholder:text-sand/30 focus:bg-cream/10"
      />
      {help && <span className="mt-1 block text-xs leading-relaxed text-sand/45">{help}</span>}
    </label>
  )
}
