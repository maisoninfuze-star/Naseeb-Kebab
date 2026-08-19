import 'server-only'

import { SLOT_FALLBACKS } from '@/data/photo-slots'
import type { ImageOverrides } from './types'
import { getContent } from './store'

/**
 * Every photo slot resolved to the frame it should render.
 *
 * An override for a slot that no longer exists is ignored rather than passed
 * through, so a slot retired in a later deploy cannot resurrect itself as a
 * stray key — the same guard `text.ts` applies to copy paths.
 */
export function resolveImages(overrides?: ImageOverrides): Record<string, string> {
  const out = { ...SLOT_FALLBACKS }
  for (const [slot, frame] of Object.entries(overrides ?? {})) {
    if (slot in out && frame) out[slot] = frame
  }
  return out
}

/** Server-side accessor. Client components read the same map from the provider. */
export async function getImages(): Promise<Record<string, string>> {
  const { images } = await getContent()
  return resolveImages(images)
}
