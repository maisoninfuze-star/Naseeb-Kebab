'use client'

import { useState, useTransition } from 'react'
import { type Locale } from '@/lib/i18n'
import { getDict } from '@/data/dictionary'
import { CONFIRMED } from '@/data/site'
import { submitInquiry } from '@/app/actions/inquiry'
import { track } from '@/lib/analytics'
import { cn } from '@/lib/utils'

/**
 * Catering enquiry form.
 *
 * No account required — the brief is explicit, and asking a customer to
 * register before telling you about their daughter's birthday loses the
 * booking. Errors are announced via aria-live and each invalid field is tied
 * to its message with aria-describedby, so the failure is legible to a screen
 * reader and not only to the eye.
 */
export default function CateringForm({ locale }: { locale: Locale }) {
  const t = getDict(locale)
  const f = t.catering.form

  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<null | 'ok' | 'error' | 'unconfigured'>(null)
  const [invalid, setInvalid] = useState<string[]>([])
  const [started, setStarted] = useState(false)

  const onFirstInput = () => {
    if (started) return
    setStarted(true)
    track('catering_form_start')
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Capture the form node now — by the time the async transition resolves,
    // `e.currentTarget` is null and calling .reset() on it would throw.
    const form = e.currentTarget
    const data = new FormData(form)
    data.set('locale', locale)

    startTransition(async () => {
      const res = await submitInquiry(data)
      if (res.ok) {
        setResult('ok')
        setInvalid([])
        track('catering_form_submit')
        track('event_inquiry_submit')
        form.reset()
      } else if (res.error === 'validation') {
        setInvalid(res.fields ?? [])
        setResult(null)
      } else if (res.error === 'unconfigured') {
        setResult('unconfigured')
      } else {
        setResult('error')
      }
    })
  }

  if (result === 'ok') {
    return (
      <div role="status" className="border border-ember/40 bg-ember/5 p-8">
        <p className="text-lg text-cream">{f.success}</p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} onInput={onFirstInput} noValidate className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <Field name="name" label={f.name} required invalid={invalid.includes('name')} error={f.required} />
        <Field name="phone" label={f.phone} type="tel" required invalid={invalid.includes('phone')} error={f.required} />
      </div>

      <Field
        name="email"
        label={f.email}
        type="email"
        required
        invalid={invalid.includes('email')}
        error={f.invalidEmail}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <Field name="event_date" label={f.date} type="date" optional={f.optional} />
        <Field name="guests" label={f.guests} type="number" min={1} optional={f.optional} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field name="occasion" label={f.occasion} optional={f.optional} />

        <div>
          <label htmlFor="service_type" className="eyebrow block text-sand/60">
            {f.type}
          </label>
          <select
            id="service_type"
            name="service_type"
            defaultValue=""
            className="mt-2 w-full border-b border-cream/20 bg-transparent py-2.5 text-cream focus:border-ember focus:outline-none"
          >
            <option value="" className="bg-charcoal">
              —
            </option>
            <option value="catering" className="bg-charcoal">
              {f.typeCatering}
            </option>
            <option value="venue" className="bg-charcoal">
              {f.typeVenue}
            </option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="message" className="eyebrow block text-sand/60">
          {f.message} <span className="normal-case tracking-normal">({f.optional})</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          className="mt-2 w-full resize-y border-b border-cream/20 bg-transparent py-2.5 text-cream focus:border-ember focus:outline-none"
        />
      </div>

      {/* Live region so failures are announced, not just coloured. */}
      <div aria-live="polite" className="min-h-[1.5rem]">
        {result === 'error' && <p className="text-sm text-ember">{f.error}</p>}
        {result === 'unconfigured' && (
          <p className="text-sm text-ember">
            {f.error}{' '}
            <a href={`tel:${CONFIRMED.phone}`} className="underline underline-offset-4">
              {CONFIRMED.phoneDisplay}
            </a>
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="btn-primary hover:bg-cream hover:text-obsidian disabled:opacity-60"
      >
        {pending ? f.sending : f.submit}
      </button>
    </form>
  )
}

function Field({
  name,
  label,
  type = 'text',
  required,
  optional,
  invalid,
  error,
  min,
}: {
  name: string
  label: string
  type?: string
  required?: boolean
  optional?: string
  invalid?: boolean
  error?: string
  min?: number
}) {
  const errorId = `${name}-error`
  return (
    <div>
      <label htmlFor={name} className="eyebrow block text-sand/60">
        {label}
        {optional && <span className="normal-case tracking-normal"> ({optional})</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        min={min}
        required={required}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? errorId : undefined}
        className={cn(
          'mt-2 w-full border-b bg-transparent py-2.5 text-cream focus:outline-none',
          invalid ? 'border-ember' : 'border-cream/20 focus:border-ember',
        )}
      />
      {invalid && error && (
        <p id={errorId} className="mt-2 text-xs text-ember">
          {error}
        </p>
      )}
    </div>
  )
}
