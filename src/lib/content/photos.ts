import 'server-only'

import { readdir } from 'node:fs/promises'
import path from 'node:path'

/**
 * Every image id the menu can actually display.
 *
 * Derived from the files on disk rather than from a hand-kept list, because a
 * hand-kept list drifts the moment someone runs the image pipeline. An id
 * qualifies only if it has a `-menu-` derivative — that is the crop the menu
 * renders, so anything else would offer the owner a photo that 404s.
 */
export async function availablePhotoIds(): Promise<string[]> {
  try {
    const files = await readdir(path.join(process.cwd(), 'public/img'))
    const ids = new Set<string>()
    for (const f of files) {
      const m = /^(.+)-menu-\d+\.webp$/.exec(f)
      if (m) ids.add(m[1])
    }
    return [...ids].sort()
  } catch {
    return []
  }
}
