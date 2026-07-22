/**
 * Repair the 11 torn segmentation mattes — no AI, no credits.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHY NOT JUST REGENERATE THE DISHES WITH FAL
 * ═══════════════════════════════════════════════════════════════════
 * Because the photographs are not the problem. The food, the portions and the
 * plates are all real and correctly shot — only the MASK is broken, and only
 * on the plate-plus-bowl platings where the segmenter picks one vessel and
 * slices through the other.
 *
 * Generating those dishes from a text prompt would replace real photographs of
 * food a customer can actually order with invented food that was never cooked.
 * That is a different and much worse failure than an inconsistent background.
 *
 * So: repair the mask instead of replacing the dish.
 *
 * ═══════════════════════════════════════════════════════════════════
 * THE REPAIR
 * ═══════════════════════════════════════════════════════════════════
 * Two morphological passes on the existing (already paid for) matte:
 *
 *   1. CLOSE — dilate then erode with a large kernel. Bridges the tears and
 *      fills the pinholes that made `raggedness` blow past the 1.45 gate,
 *      while leaving the true outer boundary roughly where it was.
 *   2. HOLE FILL — flood from the border; anything unreached is an interior
 *      hole and gets filled. This is what recovers a bowl that the segmenter
 *      punched straight through.
 *
 * Both are implemented on the raw alpha buffer. Blur+threshold is used as the
 * dilate/erode primitive: blurring spreads the edge into a gradient and the
 * threshold decides how far out (dilate) or in (erode) the new boundary sits.
 *
 * Writes to matte-{id}-repaired.png so the originals stay for comparison.
 */
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const BG_DIR = path.resolve(process.cwd(), '.cache/backgrounds')

/** The 11 that failed the quality gate. */
const TORN = [
  'DSC09430', 'DSC09461', 'DSC09487', 'DSC09489', 'DSC09492', 'DSC09496',
  'DSC09517', 'DSC09524', 'DSC09530', 'DSC09532', 'DSC09540',
]

/** Morphological close: dilate by `r`, then erode back by `r`. */
async function close(buf, w, h, r) {
  const dilated = await sharp(buf, { raw: { width: w, height: h, channels: 1 } })
    .blur(r)
    // Low threshold => boundary moves OUTWARD (dilate).
    .linear(6, -60)
    .raw()
    .toBuffer()

  return sharp(dilated, { raw: { width: w, height: h, channels: 1 } })
    .blur(r)
    // High threshold => boundary moves back INWARD (erode).
    .linear(6, -700)
    .raw()
    .toBuffer()
}

/**
 * Fill interior holes: flood the OUTSIDE from the border, then anything still
 * unvisited and dark is enclosed and must be filled.
 */
function fillHoles(data, w, h) {
  const outside = new Uint8Array(w * h)
  const stack = []

  const push = (x, y) => {
    const i = y * w + x
    if (x < 0 || y < 0 || x >= w || y >= h) return
    if (outside[i] || data[i] > 16) return
    outside[i] = 1
    stack.push(i)
  }

  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1) }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y) }

  while (stack.length) {
    const i = stack.pop()
    const x = i % w
    const y = (i / w) | 0
    push(x - 1, y); push(x + 1, y); push(x, y - 1); push(x, y + 1)
  }

  let filled = 0
  for (let i = 0; i < data.length; i++) {
    if (data[i] <= 16 && !outside[i]) { data[i] = 255; filled++ }
  }
  return filled
}

/** Same raggedness metric the quality gate uses, so results are comparable. */
function raggedness(data, w, h) {
  let on = 0, perim = 0
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[y * w + x] <= 16) continue
      on++
      if (
        x === 0 || y === 0 || x === w - 1 || y === h - 1 ||
        data[y * w + x - 1] <= 16 || data[y * w + x + 1] <= 16 ||
        data[(y - 1) * w + x] <= 16 || data[(y + 1) * w + x] <= 16
      ) perim++
    }
  }
  return { ragged: perim / (2 * Math.sqrt(Math.PI * on)), coverage: on / (w * h) }
}

async function run() {
  console.log('id          before   after    coverage   verdict')
  console.log('─'.repeat(56))

  for (const id of TORN) {
    const src = path.join(BG_DIR, `matte-${id}.png`)
    const { data, info } = await sharp(src)
      .toColourspace('b-w')
      .raw()
      .toBuffer({ resolveWithObject: true })

    const { width: w, height: h } = info
    const before = raggedness(data, w, h)

    // Kernel scales with image size so behaviour is resolution-independent.
    const r = Math.max(6, Math.round(Math.min(w, h) * 0.012))
    const closed = await close(Buffer.from(data), w, h, r)
    fillHoles(closed, w, h)

    const after = raggedness(closed, w, h)
    const ok = after.ragged <= 1.45 && after.coverage > 0.14 && after.coverage < 0.9

    await sharp(closed, { raw: { width: w, height: h, channels: 1 } })
      .png()
      .toFile(path.join(BG_DIR, `matte-${id}-repaired.png`))

    console.log(
      `${id}  ${before.ragged.toFixed(2).padStart(5)}   ${after.ragged.toFixed(2).padStart(5)}   ` +
      `${(after.coverage * 100).toFixed(0).padStart(6)}%    ${ok ? 'PASS' : 'still failing'}`,
    )
  }
}

run().catch((e) => { console.error(e); process.exit(1) })
