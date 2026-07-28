/**
 * Build the 3:2 `menu` crop for every image the menu page shows.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHY A DEDICATED RATIO
 * ═══════════════════════════════════════════════════════════════════
 * The menu was displaying dish photos at 4:5 portrait. The studio masters are
 * 3:2 landscape, so `cover` threw away ~45% of the width and sliced both rims
 * off a wide oval plate — the "too zoomed" complaint. Fitting them instead
 * (contain + blurred fill) showed the whole plate but left heavy bands, because
 * no amount of fitting makes a landscape photo into a portrait one.
 *
 * The actual fix is to stop fighting the source: show dish photos at 3:2, the
 * shape they were shot in. Then the 22 studio dishes fill the frame exactly —
 * no crop, no bands.
 *
 * The other sources are minority shapes and get a light blurred fill:
 *   · card-*  1:1 generated cards
 *   · rice-*  3:2 owner-supplied combos → also exact
 *   · a few 4:5 composites
 *
 * Source priority per id: composited → generated → rice/card intermediate →
 * original master. Always the largest, least-processed file available.
 */
import { readdir, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = '/Users/inder/Claude/Projects/Naseeb Kebab'
const MASTERS = path.join(ROOT, 'drive-download-20260721T021114Z-1-001')
const OUT = path.resolve(process.cwd(), 'public/img')

const W = 1500
const H = 1000 // 3:2
const WIDTHS = [1400, 900, 600]

/** Every id the menu references, read straight from the data file. */
async function menuIds() {
  const src = await import('node:fs').then((fs) =>
    fs.readFileSync(path.resolve(process.cwd(), 'src/data/menu.ts'), 'utf8'),
  )
  return [...new Set([...src.matchAll(/image: '([^']+)'/g)].map((m) => m[1]))]
}

async function resolveSource(id) {
  const candidates = [
    path.resolve(process.cwd(), `public/img-composited/${id}-ed.jpg`),
    path.resolve(process.cwd(), `public/img-generated/${id}-ed.jpg`),
  ]
  for (const c of candidates) if (existsSync(c)) return c

  // rice-* and card-* map back to the owner/menu source files.
  if (id.startsWith('rice-')) {
    const map = {
      'rice-combo-naseeb': 'naseeb.png',
      'rice-combo-dostan': 'dostan.png',
      'rice-combo-watan': 'watan.png',
      'rice-banjan-burani': 'Buran.png',
    }
    const f = path.join(ROOT, map[id] ?? '')
    if (existsSync(f)) return f
  }
  if (id.startsWith('card-')) {
    // card-<dish> → menu-v2/cards/<slug>.png, slug recorded at adopt time.
    const slugs = {
      'card-samosa': 'samosa', 'card-naan-afghan': 'naan',
      'card-salade-afghane': 'salade-afghane', 'card-salade-maison': 'salade-maison',
      'card-soupe-lentilles': 'soupe-lentilles', 'card-combo-dostan': 'combo-dostan',
      'card-combo-naseeb': 'combo-naseeb', 'card-combo-watan': 'combo-watan',
      'card-hamburger-fromage': 'cheeseburger', 'card-burger-poulet': 'burger-poulet',
      'card-wrap-boeuf': 'wrap-boeuf', 'card-wrap-poulet': 'wrap-poulet',
      'card-wrap-agneau': 'wrap-agneau', 'card-frites': 'fries',
    }
    const f = path.join(ROOT, 'menu-v2/cards', `${slugs[id] ?? ''}.png`)
    if (existsSync(f)) return f
  }

  // Fall back to the studio master.
  const files = await readdir(MASTERS)
  const m = files.find((f) => f.includes(id) && /\.jpe?g$/i.test(f))
  return m ? path.join(MASTERS, m) : null
}

async function build(src) {
  const meta = await sharp(src).rotate().metadata()
  const srcRatio = meta.width / meta.height
  const targetRatio = W / H

  // Already 3:2 (within a hair) — a plain resize, no fill, no crop.
  if (Math.abs(srcRatio - targetRatio) < 0.02) {
    return sharp(src).rotate().resize(W, H, { fit: 'fill' }).toBuffer()
  }

  const backdrop = await sharp(src)
    .rotate()
    .resize(W, H, { fit: 'cover' })
    .blur(36)
    .modulate({ brightness: 0.5 })
    .toBuffer()

  const fg = await sharp(src)
    .rotate()
    .resize(Math.round(W * 0.99), Math.round(H * 0.99), { fit: 'inside' })
    .toBuffer()
  const fm = await sharp(fg).metadata()

  return sharp(backdrop)
    .composite([
      { input: fg, left: Math.round((W - fm.width) / 2), top: Math.round((H - fm.height) / 2) },
    ])
    .toBuffer()
}

async function run() {
  await mkdir(OUT, { recursive: true })
  const ids = await menuIds()
  let exact = 0, filled = 0

  for (const id of ids) {
    const src = await resolveSource(id)
    if (!src) {
      console.warn(`skip ${id}: no source`)
      continue
    }
    const meta = await sharp(src).rotate().metadata()
    const isExact = Math.abs(meta.width / meta.height - W / H) < 0.02
    isExact ? exact++ : filled++

    const canvas = await build(src)
    for (const w of WIDTHS) {
      const base = sharp(canvas).resize(w, null, { kernel: 'lanczos3' })
      await base.clone().webp({ quality: 80, effort: 5 })
        .toFile(path.join(OUT, `${id}-menu-${w}.webp`))
      await base.clone().avif({ quality: 60, effort: 2 })
        .toFile(path.join(OUT, `${id}-menu-${w}.avif`))
    }
    console.log(`${isExact ? '● exact ' : '○ filled'}  ${id}`)
  }

  console.log(`\n${exact} fill the 3:2 frame exactly · ${filled} get a light blurred fill`)
}

run().catch((e) => { console.error(e); process.exit(1) })
