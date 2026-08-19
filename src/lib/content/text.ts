import { dict, type Dict, type Locale } from '@/data/dictionary'
import type { TextOverrides } from './types'

/**
 * SITE COPY — the shipped dictionary with the owner's edits applied.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHY DOT-PATHS AND NOT A NESTED PATCH
 * ═══════════════════════════════════════════════════════════════════
 * `dictionary.ts` is a tree of sections, strings, string ARRAYS (the hero
 * headline is two lines) and arrays of objects (the charcoal chapters). Storing
 * a nested partial of that shape would mean merging four different node kinds
 * correctly on every read, and any bug there silently corrupts brand copy.
 *
 * Flattening to `hero.headline.1` instead makes every editable thing a single
 * string at a single address. The store holds a flat `path -> string` map per
 * locale, an override touches exactly one leaf, and deleting a key restores the
 * shipped value by construction — the same override-not-replacement contract
 * the menu uses.
 *
 * Only leaves that are strings are addressable. Nothing here can add a section,
 * reorder an array, or change the shape the components destructure, so a bad
 * edit can make the copy wrong but it cannot make the site throw.
 */

/** `{a: {b: 'x'}, c: ['y']}` -> `{'a.b': 'x', 'c.0': 'y'}` */
export function flatten(node: unknown, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {}

  if (typeof node === 'string') {
    if (prefix) out[prefix] = node
    return out
  }
  if (Array.isArray(node)) {
    node.forEach((v, i) => Object.assign(out, flatten(v, prefix ? `${prefix}.${i}` : String(i))))
    return out
  }
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      Object.assign(out, flatten(v, prefix ? `${prefix}.${k}` : k))
    }
  }
  return out
}

/** Deep clone that keeps arrays as arrays — JSON round-trip is enough here. */
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T

/**
 * Write `value` at `path`, but ONLY where a string already lives.
 *
 * The guard is the safety property: an override for a path that no longer
 * exists (copy was restructured in a later deploy) is ignored rather than
 * grafting a stray key onto the dictionary, and one that points at an object
 * cannot replace a whole section with a string.
 */
function setPath(root: Record<string, unknown>, path: string, value: string): void {
  const parts = path.split('.')
  let node: unknown = root

  for (const part of parts.slice(0, -1)) {
    if (node === null || typeof node !== 'object') return
    node = (node as Record<string, unknown>)[part]
  }
  if (node === null || typeof node !== 'object') return

  const last = parts[parts.length - 1]
  const target = node as Record<string, unknown>
  if (typeof target[last] !== 'string') return
  target[last] = value
}

/** The shipped dictionary for `locale` with `overrides` applied. */
export function resolveDict(locale: Locale, overrides?: TextOverrides): Dict {
  const base = clone(dict[locale]) as Record<string, unknown>
  const patch = overrides?.[locale]
  if (patch) {
    for (const [path, value] of Object.entries(patch)) setPath(base, path, value)
  }
  return base as Dict
}

/** Every editable string in the shipped copy, as `path -> shipped value`. */
export const shippedText = (locale: Locale): Record<string, string> => flatten(dict[locale])
