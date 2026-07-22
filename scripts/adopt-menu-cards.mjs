/**
 * Adopt the dish cards generated in the sibling "menu design variants" project
 * (menu-v2/cards/*.png) to fill the 14 menu dishes that have no photograph.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHAT THESE ARE, AND THE ONE CAVEAT
 * ═══════════════════════════════════════════════════════════════════
 * Generated (fal.ai), overhead, on a STONE/grey plate over dark slate — a
 * different look from the site's 22 real composites, which are 3/4-angle on a
 * TEAL plate over black marble. On the menu page that difference is sequential,
 * not simultaneous: images show one at a time on hover/tap, so a teal dish and
 * a stone dish are never on screen together. That is what makes them usable
 * here without the two-style clash a grid would create.
 *
 * These fill dishes that were otherwise blank: samosa, naan, the salads, the
 * soup, every burger and wrap, fries, and the three combos. Drinks have no
 * card and stay imageless (a drink does not need a photo).
 *
 * Output ids are prefixed `card-` so it is always obvious in the data which
 * images came from this set rather than the studio shoot.
 */
import { mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const CARDS = '/Users/inder/Claude/Projects/Naseeb Kebab/menu-v2/cards'
const OUT = path.resolve(process.cwd(), 'public/img')

/** menu.ts dish id → card file basename (and the image key it becomes). */
const MAP = {
  samosa: 'samosa',
  'naan-afghan': 'naan',
  'salade-afghane': 'salade-afghane',
  'salade-maison': 'salade-maison',
  'soupe-lentilles': 'soupe-lentilles',
  'combo-dostan': 'combo-dostan',
  'combo-naseeb': 'combo-naseeb',
  'combo-watan': 'combo-watan',
  'hamburger-fromage': 'cheeseburger',
  'burger-poulet': 'burger-poulet',
  'wrap-boeuf': 'wrap-boeuf',
  'wrap-poulet': 'wrap-poulet',
  'wrap-agneau': 'wrap-agneau',
  frites: 'fries',
}

// Widths the site references, per crop (see lib/utils.ts).
const WIDTHS = { ed: [1400, 900, 600], sq: [900, 500] }

async function run() {
  await mkdir(OUT, { recursive: true })
  let count = 0

  for (const [dishId, cardFile] of Object.entries(MAP)) {
    const src = path.join(CARDS, `${cardFile}.png`)
    if (!existsSync(src)) {
      console.warn(`skip ${dishId}: ${cardFile}.png not found`)
      continue
    }
    const key = `card-${dishId}`
    const meta = await sharp(src).metadata()
    const side = Math.min(meta.width, meta.height)

    // ed = 4:5 centre crop. The card is a centred overhead shot, so trimming
    // equal strips off the sides keeps the dish and only loses corner garnish.
    const edW = Math.round(side * 0.8)
    const edCrop = {
      left: Math.round((meta.width - edW) / 2),
      top: Math.round((meta.height - side) / 2),
      width: edW,
      height: side,
    }
    for (const w of WIDTHS.ed) {
      const base = sharp(src).extract(edCrop).resize(w, null, { kernel: 'lanczos3' })
      await base.clone().webp({ quality: 80, effort: 5 }).toFile(path.join(OUT, `${key}-ed-${w}.webp`))
      await base.clone().avif({ quality: 60, effort: 2 }).toFile(path.join(OUT, `${key}-ed-${w}.avif`))
    }

    // sq = 1:1 centre crop.
    const sqCrop = {
      left: Math.round((meta.width - side) / 2),
      top: Math.round((meta.height - side) / 2),
      width: side,
      height: side,
    }
    for (const w of WIDTHS.sq) {
      const base = sharp(src).extract(sqCrop).resize(w, w, { kernel: 'lanczos3' })
      await base.clone().webp({ quality: 80, effort: 5 }).toFile(path.join(OUT, `${key}-sq-${w}.webp`))
      await base.clone().avif({ quality: 60, effort: 2 }).toFile(path.join(OUT, `${key}-sq-${w}.avif`))
    }

    const lqip = await sharp(src).resize(20).webp({ quality: 30 }).toBuffer()
    await sharp(lqip).toFile(path.join(OUT, `${key}-lqip.webp`))

    console.log(`✓ ${dishId} ← ${cardFile}.png  (${key})`)
    count++
  }

  console.log(`\nAdopted ${count} menu-card images into public/img.`)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
