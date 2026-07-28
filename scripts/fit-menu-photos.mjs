/**
 * Refit over-cropped menu photos so the WHOLE dish is visible.
 *
 * ═══════════════════════════════════════════════════════════════════
 * THE BUG
 * ═══════════════════════════════════════════════════════════════════
 * `process-images.mjs` builds derivatives with `fit: 'cover'` and
 * `position: 'attention'`. Going from the 3:2 master to the menu's 4:5 frame,
 * cover discards ~45% of the width, and `attention` then zooms toward whatever
 * it scores as salient — usually the middle of the food. On a wide oval plate
 * that slices both rims clean off. The dish reads as "zoomed in", which is
 * exactly what it is.
 *
 * That is fine for a full-bleed hero, where cropping is the point. It is wrong
 * for a menu, where the customer is trying to see what they are ordering.
 *
 * ═══════════════════════════════════════════════════════════════════
 * THE FIX — contain, then fill
 * ═══════════════════════════════════════════════════════════════════
 * Fit the entire frame INSIDE the target ratio, and fill the leftover margin
 * with a blurred, darkened copy of the same image. Nothing is ever cut, and
 * because the shoot's ground is a near-uniform dark slate the fill reads as
 * more of the same table rather than as letterboxing.
 *
 * Same technique already used for the combo platters, which the restaurant has
 * seen and approved — so the whole menu stays visually consistent.
 *
 * Only touches ids passed in; composited/card/rice images already fit and are
 * left alone.
 */
import { readdir, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const MASTERS = '/Users/inder/Claude/Projects/Naseeb Kebab/drive-download-20260721T021114Z-1-001'
const OUT = path.resolve(process.cwd(), 'public/img')

/** The 22 menu dishes whose derivatives came straight off the master. */
const IDS = [
  'DSC09439', 'DSC09444', 'DSC09448', 'DSC09451', 'DSC09456', 'DSC09459',
  'DSC09462', 'DSC09466', 'DSC09473', 'DSC09475', 'DSC09482', 'DSC09494',
  'DSC09497', 'DSC09508', 'DSC09515', 'DSC09518', 'DSC09521', 'DSC09526',
  'DSC09528', 'DSC09539', 'DSC09542', 'DSC09547',
]

const CANVAS = {
  ed: { w: 1400, h: 1750, widths: [1400, 900, 600] },
  sq: { w: 1200, h: 1200, widths: [900, 500] },
}

async function findMaster(id) {
  const files = await readdir(MASTERS)
  const m = files.find((f) => f.includes(id) && /\.jpe?g$/i.test(f))
  return m ? path.join(MASTERS, m) : null
}

async function fit(src, W, H) {
  // Backdrop: same image, cover-scaled, blurred and darkened so the fill is
  // always tonally continuous with the photo sitting on top of it.
  const backdrop = await sharp(src)
    .rotate()
    .resize(W, H, { fit: 'cover', position: 'attention' })
    .blur(38)
    .modulate({ brightness: 0.5 })
    .toBuffer()

  // Foreground: the COMPLETE frame, contained with a small margin.
  const fg = await sharp(src)
    .rotate()
    .resize(Math.round(W * 0.98), Math.round(H * 0.98), { fit: 'inside' })
    .toBuffer()
  const meta = await sharp(fg).metadata()

  return sharp(backdrop)
    .composite([
      {
        input: fg,
        left: Math.round((W - meta.width) / 2),
        top: Math.round((H - meta.height) / 2),
      },
    ])
    .toBuffer()
}

async function run() {
  await mkdir(OUT, { recursive: true })
  let done = 0

  for (const id of IDS) {
    const src = await findMaster(id)
    if (!src) {
      console.warn(`skip ${id}: master not found`)
      continue
    }

    for (const [crop, C] of Object.entries(CANVAS)) {
      const canvas = await fit(src, C.w, C.h)
      for (const w of C.widths) {
        const base = sharp(canvas).resize(w, null, { kernel: 'lanczos3' })
        await base.clone().webp({ quality: 80, effort: 5 })
          .toFile(path.join(OUT, `${id}-${crop}-${w}.webp`))
        await base.clone().avif({ quality: 60, effort: 2 })
          .toFile(path.join(OUT, `${id}-${crop}-${w}.avif`))
      }
    }

    // Refresh the placeholder so it matches the new framing.
    const lqip = await sharp(src).rotate().resize(20).webp({ quality: 30 }).toBuffer()
    await sharp(lqip).toFile(path.join(OUT, `${id}-lqip.webp`))

    console.log(`✓ ${id}`)
    done++
  }

  console.log(`\nRefit ${done} dishes — whole plate now visible at ed + sq.`)
  console.log('Hero crops (wide/tall) are untouched: cropping is correct there.')
}

run().catch((e) => { console.error(e); process.exit(1) })
