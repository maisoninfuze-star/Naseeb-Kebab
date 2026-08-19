import 'server-only'

import type { Dict, Locale } from '@/data/dictionary'
import { getContent } from './store'
import { resolveDict } from './text'

/**
 * The site copy a SERVER component should render.
 *
 * Client components must not call this — the store is server-only. They read
 * the same object out of `DictProvider`, which the locale layout fills from
 * this function, so both sides render identical strings and hydration matches.
 */
export async function getResolvedDict(locale: Locale): Promise<Dict> {
  const { text } = await getContent()
  return resolveDict(locale, text)
}
