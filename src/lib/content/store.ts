import 'server-only'

import { readFile, writeFile, mkdir, rename } from 'node:fs/promises'
import path from 'node:path'
import { serverClient, isConfigured } from '@/lib/supabase/server'
import {
  EMPTY_DOC,
  type ContentDoc,
  type MenuAddition,
  type MenuOverride,
  type SiteSettings,
  type StoredInquiry,
  type ImageOverrides,
  type TextOverrides,
} from './types'

/**
 * CONTENT STORE — one API, two drivers.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHY TWO DRIVERS
 * ═══════════════════════════════════════════════════════════════════
 * The admin was previously read-only for one reason: it assumed Supabase, and
 * no Supabase project existed. So the restaurant had a dashboard that could not
 * change anything — worse than no dashboard, because it implies it can.
 *
 * So this store picks a driver at runtime:
 *
 *   supabase — when NEXT_PUBLIC_SUPABASE_URL/ANON_KEY are set. The production
 *              path: durable, multi-instance, RLS-protected.
 *   file     — otherwise. A single JSON document on disk.
 *
 * The file driver is not a stub. On a Node host with a writable disk (a VPS,
 * a container, `next start` on the restaurant's own machine) it is a complete,
 * working backend, and it is what makes the admin usable the day it ships
 * rather than the day someone creates a database.
 *
 * It is NOT durable on ephemeral serverless filesystems (Vercel, Netlify) —
 * writes there survive only until the instance recycles. `driverName()` is
 * surfaced in the dashboard so the owner is never guessing which one they are
 * on, and `STORAGE_WARNING` says plainly when edits will not persist.
 *
 * Switching to Supabase later is an env change and `supabase/schema.sql` — no
 * code edits, no data model change. The shapes here mirror those tables.
 */

const DATA_DIR = path.join(process.cwd(), '.data')
const DATA_FILE = path.join(DATA_DIR, 'content.json')

export type DriverName = 'supabase' | 'file'

export const driverName = (): DriverName => (isConfigured ? 'supabase' : 'file')

/**
 * True when writes are expected to vanish: the file driver on a read-only or
 * ephemeral filesystem. Vercel sets VERCEL; most PaaS set NODE_ENV=production
 * with no writable cwd. We only claim this for the file driver, and the
 * dashboard shows it as a warning rather than blocking edits.
 */
export const isEphemeral = () =>
  driverName() === 'file' && Boolean(process.env.VERCEL || process.env.NETLIFY)

/* ─────────────────────────────────────────────────────────────────
   File driver
   ───────────────────────────────────────────────────────────────── */

async function readDoc(): Promise<ContentDoc> {
  try {
    const raw = await readFile(DATA_FILE, 'utf8')
    const parsed = JSON.parse(raw) as Partial<ContentDoc>
    // Merged against EMPTY_DOC so a document written by an older version — or
    // hand-edited — can never crash a page by missing a key.
    return {
      menu: parsed.menu ?? {},
      additions: parsed.additions ?? [],
      settings: parsed.settings ?? {},
      text: parsed.text ?? {},
      images: parsed.images ?? {},
      inquiries: parsed.inquiries ?? [],
    }
  } catch {
    return structuredClone(EMPTY_DOC)
  }
}

/**
 * Write via a temp file + rename.
 *
 * `rename` is atomic on POSIX, so a crash mid-write leaves the previous
 * document intact instead of a truncated one. Losing an edit is recoverable;
 * losing the whole menu because the process died mid-`writeFile` is not.
 */
async function writeDoc(doc: ContentDoc): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true })
  const tmp = `${DATA_FILE}.${process.pid}.tmp`
  await writeFile(tmp, JSON.stringify(doc, null, 2), 'utf8')
  await rename(tmp, DATA_FILE)
}

/* ─────────────────────────────────────────────────────────────────
   Public API
   ───────────────────────────────────────────────────────────────── */

/** Everything the site and admin need, in one read. */
export async function getContent(): Promise<ContentDoc> {
  if (driverName() === 'file') return readDoc()

  const supabase = await serverClient()
  if (!supabase) return structuredClone(EMPTY_DOC)

  const [overrides, settings, additions] = await Promise.all([
    supabase.from('menu_overrides').select('*'),
    supabase.from('site_settings').select('*'),
    supabase.from('menu_additions').select('*'),
  ])

  const menu: Record<string, MenuOverride> = {}
  for (const row of (overrides.data ?? []) as Record<string, unknown>[]) {
    menu[row.id as string] = fromRow(row)
  }

  const s: SiteSettings = {}
  for (const row of (settings.data ?? []) as { key: string; value: unknown }[]) {
    ;(s as Record<string, unknown>)[camel(row.key)] = row.value
  }

  // Copy overrides live in site_settings under a reserved key rather than in
  // their own table, so an existing Supabase project needs no migration to
  // gain editable copy.
  const text = ((s as Record<string, unknown>).siteText as TextOverrides) ?? {}
  const images = ((s as Record<string, unknown>).siteImages as ImageOverrides) ?? {}
  delete (s as Record<string, unknown>).siteText
  delete (s as Record<string, unknown>).siteImages

  return {
    menu,
    additions: (additions.data ?? []) as MenuAddition[],
    settings: s,
    text,
    images,
    inquiries: [],
  }
}

/** snake_case column names → the camelCase this codebase uses everywhere. */
const camel = (k: string) => k.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())

function fromRow(row: Record<string, unknown>): MenuOverride {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(row)) {
    if (k === 'id' || v === null || v === undefined) continue
    out[k === 'display_order' ? 'order' : k === 'review_note' ? 'needsReview' : camel(k)] = v
  }
  out.updatedAt = (row.updated_at as string) ?? new Date(0).toISOString()
  return out as unknown as MenuOverride
}

function toRow(id: string, patch: MenuOverride): Record<string, unknown> {
  const map: Record<string, string> = {
    nameFr: 'name_fr',
    nameEn: 'name_en',
    descFr: 'desc_fr',
    descEn: 'desc_en',
    order: 'display_order',
    needsReview: 'review_note',
    imageConfidence: 'image_confidence',
    updatedAt: 'updated_at',
  }
  const row: Record<string, unknown> = { id }
  for (const [k, v] of Object.entries(patch)) row[map[k] ?? k] = v
  return row
}

/** Merge a patch into the dish's existing override. */
export async function saveMenuOverride(
  id: string,
  patch: Omit<MenuOverride, 'updatedAt'>,
): Promise<void> {
  const full: MenuOverride = { ...patch, updatedAt: new Date().toISOString() }

  if (driverName() === 'file') {
    const doc = await readDoc()
    doc.menu[id] = { ...doc.menu[id], ...full }
    await writeDoc(doc)
    return
  }

  const supabase = await serverClient()
  const { error } = (await supabase?.from('menu_overrides').upsert(toRow(id, full))) ?? {}
  // Surface the failure instead of letting the action report "Enregistré." over
  // a write that never landed — the exact silent-data-loss this used to hide.
  if (error) throw new Error(`saveMenuOverride: ${error.message}`)
}

/** Drop every override for a dish — it returns to the shipped values. */
export async function resetMenuOverride(id: string): Promise<void> {
  if (driverName() === 'file') {
    const doc = await readDoc()
    delete doc.menu[id]
    await writeDoc(doc)
    return
  }
  const supabase = await serverClient()
  await supabase?.from('menu_overrides').delete().eq('id', id)
}

export async function addMenuItem(item: MenuAddition): Promise<void> {
  if (driverName() === 'file') {
    const doc = await readDoc()
    doc.additions.push(item)
    await writeDoc(doc)
    return
  }
  const supabase = await serverClient()
  const { error } = (await supabase?.from('menu_additions').insert(item)) ?? {}
  if (error) throw new Error(`addMenuItem: ${error.message}`)
}

export async function deleteMenuItem(id: string): Promise<void> {
  if (driverName() === 'file') {
    const doc = await readDoc()
    doc.additions = doc.additions.filter((a) => a.id !== id)
    delete doc.menu[id]
    await writeDoc(doc)
    return
  }
  const supabase = await serverClient()
  await supabase?.from('menu_additions').delete().eq('id', id)
  await supabase?.from('menu_overrides').delete().eq('id', id)
}

export async function saveSettings(patch: SiteSettings): Promise<void> {
  if (driverName() === 'file') {
    const doc = await readDoc()
    doc.settings = { ...doc.settings, ...patch }
    await writeDoc(doc)
    return
  }

  const supabase = await serverClient()
  const snake = (k: string) => k.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)
  const rows = Object.entries(patch).map(([k, v]) => ({
    key: snake(k),
    value: v as never,
    updated_at: new Date().toISOString(),
  }))
  if (rows.length) await supabase?.from('site_settings').upsert(rows)
}

/**
 * Set or clear one copy string.
 *
 * An empty value DELETES the override rather than storing "", so "clear this
 * edit" and "make this text empty" cannot be confused — the former restores the
 * shipped copy, and the latter is not offered, because a blank headline is
 * never what the owner meant.
 */
export async function saveTextOverride(
  locale: 'fr' | 'en',
  path: string,
  value: string,
): Promise<void> {
  const apply = (text: TextOverrides): TextOverrides => {
    const forLocale = { ...(text[locale] ?? {}) }
    if (value) forLocale[path] = value
    else delete forLocale[path]
    return { ...text, [locale]: forLocale }
  }

  if (driverName() === 'file') {
    const doc = await readDoc()
    doc.text = apply(doc.text ?? {})
    await writeDoc(doc)
    return
  }

  const { text } = await getContent()
  await saveSettings({ siteText: apply(text) } as unknown as SiteSettings)
}

/** Drop every copy override, restoring the shipped dictionary. */
/**
 * Clear copy overrides. With a `locale` it clears only that language — the
 * admin's "Tout rétablir" is shown next to a per-locale count, so resetting
 * from the French view must not also wipe the English overrides. With no
 * locale it clears both.
 */
export async function resetAllText(locale?: 'fr' | 'en'): Promise<void> {
  const next = (text: TextOverrides): TextOverrides => {
    if (!locale) return {}
    const copy = { ...text }
    delete copy[locale]
    return copy
  }

  if (driverName() === 'file') {
    const doc = await readDoc()
    doc.text = next(doc.text ?? {})
    await writeDoc(doc)
    return
  }
  const { text } = await getContent()
  await saveSettings({ siteText: next(text) } as unknown as SiteSettings)
}

/**
 * Point one photo slot at a different frame.
 *
 * An empty value CLEARS the slot back to the shipped choice, matching the
 * copy and menu editors — every override in this store is a delete-to-restore.
 */
export async function saveImageOverride(slot: string, frame: string): Promise<void> {
  const apply = (images: ImageOverrides): ImageOverrides => {
    const next = { ...images }
    if (frame) next[slot] = frame
    else delete next[slot]
    return next
  }

  if (driverName() === 'file') {
    const doc = await readDoc()
    doc.images = apply(doc.images ?? {})
    await writeDoc(doc)
    return
  }

  const { images } = await getContent()
  await saveSettings({ siteImages: apply(images) } as unknown as SiteSettings)
}

/** Restore every photo slot to its shipped frame. */
export async function resetAllImages(): Promise<void> {
  if (driverName() === 'file') {
    const doc = await readDoc()
    doc.images = {}
    await writeDoc(doc)
    return
  }
  await saveSettings({ siteImages: {} } as unknown as SiteSettings)
}

/* ── Inquiries ──────────────────────────────────────────────────── */

export async function addInquiry(
  input: Omit<StoredInquiry, 'id' | 'created_at' | 'status'>,
): Promise<{ ok: boolean; error?: string }> {
  if (driverName() === 'file') {
    const doc = await readDoc()
    doc.inquiries.unshift({
      ...input,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      status: 'new',
    })
    await writeDoc(doc)
    return { ok: true }
  }

  const supabase = await serverClient()
  if (!supabase) return { ok: false, error: 'unconfigured' }
  const { error } = await supabase.from('inquiries').insert(input)
  return error ? { ok: false, error: error.message } : { ok: true }
}

export async function listInquiries(): Promise<StoredInquiry[]> {
  if (driverName() === 'file') {
    const doc = await readDoc()
    return [...doc.inquiries].sort((a, b) => b.created_at.localeCompare(a.created_at))
  }

  const supabase = await serverClient()
  if (!supabase) return []
  const { data } = await supabase
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false })
  return (data ?? []) as StoredInquiry[]
}

export async function setInquiryStatus(
  id: string,
  status: StoredInquiry['status'],
): Promise<void> {
  if (driverName() === 'file') {
    const doc = await readDoc()
    const row = doc.inquiries.find((i) => i.id === id)
    if (row) row.status = status
    await writeDoc(doc)
    return
  }
  const supabase = await serverClient()
  await supabase?.from('inquiries').update({ status }).eq('id', id)
}

export async function deleteInquiry(id: string): Promise<void> {
  if (driverName() === 'file') {
    const doc = await readDoc()
    doc.inquiries = doc.inquiries.filter((i) => i.id !== id)
    await writeDoc(doc)
    return
  }
  const supabase = await serverClient()
  await supabase?.from('inquiries').delete().eq('id', id)
}
