/**
 * Naseeb Kabab — image pipeline
 *
 * Source: 42MP originals (7952x5304) from the studio shoot.
 * Output: responsive WebP + AVIF derivatives in the crops the site actually uses.
 *
 * Crop strategy per the art direction:
 *   wide  16:9  — full-bleed hero / pinned sequences
 *   ed     4:5  — editorial portrait, collage, signature showcase
 *   sq     1:1  — menu list thumbnails, social
 *   tall   9:16 — mobile hero
 *
 * Every dish gets a `sq` (menu needs it). Only HERO frames get the full set —
 * generating four crops x two formats x three widths for all 119 files would
 * produce ~2800 derivatives for a shoot that only contains 32 distinct dishes.
 */
import sharp from 'sharp'
import { mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'

const SRC = '/Users/inder/Claude/Projects/Naseeb Kebab/drive-download-20260721T021114Z-1-001'
const OUT = path.resolve(process.cwd(), 'public/img')

// Hero frames chosen by the visual audit — one per distinct dish.
const HEROES = new Set([
  'DSC09430', 'DSC09435', 'DSC09441', 'DSC09445', 'DSC09446', 'DSC09453',
  'DSC09454', 'DSC09461', 'DSC09463', 'DSC09467', 'DSC09471', 'DSC09476',
  // DSC09487 is the platter frame used full-bleed in the Sharing Platters
  // section and the Catering page header — it needs the full crop set.
  'DSC09480', 'DSC09484', 'DSC09487', 'DSC09489', 'DSC09492', 'DSC09496', 'DSC09502',
  'DSC09506', 'DSC09509', 'DSC09513', 'DSC09517', 'DSC09522', 'DSC09524',
  'DSC09530', 'DSC09532', 'DSC09534', 'DSC09537', 'DSC09540', 'DSC09545',
  'DSC09442', 'DSC09428',
])

const CROPS = {
  wide: { ar: 16 / 9, widths: [2400, 1600, 900] },
  ed:   { ar: 4 / 5,  widths: [1400, 900, 600] },
  sq:   { ar: 1,      widths: [900, 500] },
  tall: { ar: 9 / 16, widths: [1200, 750] },
}

// The plates sit centre-frame with the garnish high; biasing the crop slightly
// above centre keeps the food centred and preserves the dark negative space.
const GRAVITY = 'attention'

async function run() {
  await mkdir(OUT, { recursive: true })
  const files = (await readdir(SRC)).filter((f) => /\.jpe?g$/i.test(f)).sort()

  let written = 0
  for (const file of files) {
    // Originals are named `{dish-slug}-DSC094xx.jpg` (see rename-originals.mjs).
    // The DSC id is the stable key used by menu.ts and every derivative in
    // public/img, so derive it from the filename rather than assuming the
    // whole basename is the id.
    const id = (file.match(/DSC\d{5}/) || [])[0]
    if (!id) {
      console.warn(`skipping ${file} — no DSC id in filename`)
      continue
    }
    const isHero = HEROES.has(id)
    const cropSet = isHero ? Object.keys(CROPS) : ['sq', 'ed']
    const src = path.join(SRC, file)

    for (const crop of cropSet) {
      const { ar, widths } = CROPS[crop]
      for (const w of widths) {
        const h = Math.round(w / ar)
        const base = sharp(src).rotate().resize(w, h, { fit: 'cover', position: GRAVITY })

        await base.clone()
          .webp({ quality: 78, effort: 5 })
          .toFile(path.join(OUT, `${id}-${crop}-${w}.webp`))

        await base.clone()
          .avif({ quality: 58, effort: 4 })
          .toFile(path.join(OUT, `${id}-${crop}-${w}.avif`))

        written += 2
      }
    }

    // Tiny blurred LQIP for the Next/Image placeholder.
    const lqip = await sharp(src).resize(20).webp({ quality: 30 }).toBuffer()
    await sharp(lqip).toFile(path.join(OUT, `${id}-lqip.webp`))
    written++

    process.stdout.write(`${id} ${isHero ? '(hero)' : ''}\n`)
  }
  console.log(`\nDone. ${written} derivatives in ${OUT}`)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
