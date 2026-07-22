/**
 * Push approved GENERATED dish images into the site's derivative set.
 *
 * Deliberately an explicit allow-list, not a directory sweep. Six of the
 * eleven generated dishes came back factually wrong — a whole fish where the
 * restaurant serves a fillet, a breaded log where it serves minced kobidah —
 * and a sweep would have shipped them. Only ids named here are adopted.
 */
import { readdir, mkdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const IN = path.resolve(process.cwd(), 'public/img-generated')
const OUT = path.resolve(process.cwd(), 'public/img')

/**
 * Reviewed and correct. Eleven now:
 *   · the five stews (first pass)
 *   · the six grilled/platter dishes, re-generated with tighter prompts — the
 *     fish is a single fillet (was a whole head-and-tail fish), the platters
 *     are grilled kebab (were fried chicken), the kobidah is minced kebab (was
 *     a breaded stick). All factually right; the rice still reads short-grain,
 *     which the model would not give up.
 */
const APPROVED = new Set([
  'DSC09517', // Dopiaza
  'DSC09524', // Kofta Pulao
  'DSC09530', // Qorma de veau
  'DSC09532', // Qorma de poulet
  'DSC09540', // Sabzi Pulao
  'DSC09430', // Grand plateau mixte
  'DSC09461', // Kobidah de poulet
  'DSC09487', // Plateau mixte et riz
  'DSC09489', // Plateau mixte avec riz
  'DSC09492', // Biryani au poulet
  'DSC09496', // Poisson bassa
])

const WIDTHS = { ed: [1400, 900, 600], sq: [900, 500] }

async function run() {
  await mkdir(OUT, { recursive: true })
  const files = (await readdir(IN)).filter((f) => f.endsWith('.jpg'))
  let written = 0
  const adopted = new Set()

  for (const file of files) {
    const m = file.match(/^(DSC\d{5})-(ed|sq)\.jpg$/)
    if (!m) continue
    const [, id, crop] = m
    if (!APPROVED.has(id)) continue
    adopted.add(id)

    for (const w of WIDTHS[crop]) {
      const base = sharp(path.join(IN, file)).resize(w, null, { withoutEnlargement: true })
      await base.clone().webp({ quality: 78, effort: 5 }).toFile(path.join(OUT, `${id}-${crop}-${w}.webp`))
      await base.clone().avif({ quality: 58, effort: 2 }).toFile(path.join(OUT, `${id}-${crop}-${w}.avif`))
      written += 2
    }
    const lqip = await sharp(path.join(IN, file)).resize(20).webp({ quality: 30 }).toBuffer()
    await sharp(lqip).toFile(path.join(OUT, `${id}-lqip.webp`))
  }

  console.log(`Adopted ${adopted.size} generated dishes · ${written} derivatives`)
  console.log(`Revert everything: npm run images`)
}

run().catch((e) => { console.error(e); process.exit(1) })
