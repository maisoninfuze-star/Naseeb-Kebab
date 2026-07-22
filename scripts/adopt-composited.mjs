/**
 * Turn the approved composites into the derivatives the site actually serves.
 *
 * Reads public/img-composited/{id}-{crop}.jpg and writes the same
 * {id}-{crop}-{width}.{webp,avif} files that `process-images.mjs` produces
 * from the originals, into public/img — so the site picks them up with no
 * component changes at all.
 *
 * Fully reversible: `npm run images` regenerates everything from the
 * untouched masters and overwrites whatever this wrote.
 *
 * Only crops that exist are written. A dish rejected by the quality gate has
 * no composited file, so its original derivatives are simply left in place —
 * the fallback is the absence of an overwrite, which means there is no way for
 * a rejected dish to accidentally ship.
 */
import { readdir, mkdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const IN = path.resolve(process.cwd(), 'public/img-composited')
const OUT = path.resolve(process.cwd(), 'public/img')

const WIDTHS = {
  wide: [2400, 1600, 900],
  ed: [1400, 900, 600],
  sq: [900, 500],
  tall: [1200, 750],
}

async function run() {
  await mkdir(OUT, { recursive: true })
  const files = (await readdir(IN)).filter((f) => f.endsWith('.jpg'))

  const ids = new Set()
  let written = 0

  for (const file of files) {
    const m = file.match(/^(DSC\d{5})-(wide|ed|sq|tall)\.jpg$/)
    if (!m) continue
    const [, id, crop] = m
    ids.add(id)

    for (const w of WIDTHS[crop]) {
      const base = sharp(path.join(IN, file)).resize(w, null, { withoutEnlargement: true })
      await base.clone().webp({ quality: 78, effort: 5 }).toFile(path.join(OUT, `${id}-${crop}-${w}.webp`))
      // effort 2, not 4. AVIF encoding cost rises steeply with effort and at
      // 2400px effort 4 took minutes per image for a file-size gain in the low
      // single-digit percents. Not worth it for a 33-dish batch.
      await base.clone().avif({ quality: 58, effort: 2 }).toFile(path.join(OUT, `${id}-${crop}-${w}.avif`))
      written += 2
    }

    // Refresh the blur placeholder so it matches the new background.
    const lqip = await sharp(path.join(IN, file)).resize(20).webp({ quality: 30 }).toBuffer()
    await sharp(lqip).toFile(path.join(OUT, `${id}-lqip.webp`))
  }

  console.log(`Adopted ${ids.size} dishes · ${written} derivatives written to public/img`)
  console.log(`Run "npm run images" to revert everything to the originals.`)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
