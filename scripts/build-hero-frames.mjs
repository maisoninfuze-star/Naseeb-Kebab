/**
 * Hero frames for "ONE PLATTER, MANY HANDS".
 *
 * ═══════════════════════════════════════════════════════════════════
 * THE IDEA
 * ═══════════════════════════════════════════════════════════════════
 * A pinned hero where the PLATE NEVER MOVES. It stays locked in place while
 * the food on it changes as you scroll — platter, kabab, pulao, mantu, firni.
 * The rim, the shadow and the horizon stay registered, so it reads as one
 * table being served course after course by an unseen host.
 *
 * That is Afghan hospitality — mehmān-nawāzī — expressed as a mechanic rather
 * than as decoration: the guest sits still, and the food keeps arriving.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHY A FIXED CROP BOX, NOT PER-DISH
 * ═══════════════════════════════════════════════════════════════════
 * fal-composite.mjs scales each dish by its own matte bounding box. That is
 * right for standalone photos — every dish fills its frame — but wrong here.
 * Measured across the sequence, bbox aspect ranges 1.35–1.65 because food
 * overflows the rim by different amounts (lamb chops hang over; firni is a
 * small bowl). Scaling by bbox would make the PLATE jump between frames even
 * though the food is what should change.
 *
 * The shoot was locked off: plate centroids vary by only 2.4% horizontally and
 * 4.4% vertically across all 33 masters. So every frame uses the SAME crop
 * region and the SAME placement, and the plate registers by construction.
 *
 * Costs nothing to run: mattes and the marble background are already cached.
 */
import { mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const SRC_DIR = '/Users/inder/Claude/Projects/Naseeb Kebab/drive-download-20260721T021114Z-1-001'
const BG_DIR = path.resolve(process.cwd(), '.cache/backgrounds')
const OUT_DIR = path.resolve(process.cwd(), 'public/img-hero')

/**
 * The sequence, ordered as a meal is actually served in an Afghan house:
 * the shared platter arrives first, then the grill, then rice, then the
 * slow-cooked dish, then sweet. Six is deliberate — the research found that
 * long scroll-pins read as scroll-jacking, and every extra frame is another
 * ~130KB the visitor pays for.
 */
/**
 * Every dish here is HIGH confidence in the photo audit. The hero labels each
 * frame with a real name and a real price, so a LOW-confidence match — the
 * mixed platters, where Sultan and Mazar are visually indistinguishable and
 * the menu publishes no contents — cannot be used here at any cost. A wrong
 * price on the first screen is worse than a less dramatic opening shot.
 */
export const SEQUENCE = [
  'DSC09476', // Chopan Kabab — the grill
  'DSC09471', // Chaplee Kabab
  'DSC09441', // Cuisses de poulet (4x)
  'DSC09509', // Jarret d'agneau Qabuli — rice and shank
  'DSC09513', // Mantu — the slow dish
  'DSC09545', // Firni — sweet
]

/** Identical for every frame. This is the whole trick. */
const CROP_BOX = { left: 0.06, top: 0.06, width: 0.88, height: 0.88 }

const FRAMES = {
  // Desktop: plate right-of-centre, headline occupies the left third.
  wide: { w: 2400, h: 1350, plateW: 0.54, cx: 0.68, cy: 0.54, bg: 'marble-wide.jpg' },
  // Mobile: plate high, copy stacks beneath.
  tall: { w: 1200, h: 2133, plateW: 0.92, cx: 0.5, cy: 0.34, bg: 'marble-tall.jpg' },
}

async function findSource(id) {
  const files = await readdir(SRC_DIR)
  const m = files.find((f) => f.includes(id) && /\.jpe?g$/i.test(f))
  return m ? path.join(SRC_DIR, m) : null
}

const clamp = (v, max) => Math.max(0, Math.min(v, max))

async function buildFrame(id, srcPath, mattePath, frameKey) {
  const F = FRAMES[frameKey]

  const rotated = await sharp(srcPath).rotate().toBuffer()
  const meta = await sharp(rotated).metadata()

  const box = (w, h) => {
    const l = clamp(Math.round(CROP_BOX.left * w), w - 1)
    const t = clamp(Math.round(CROP_BOX.top * h), h - 1)
    return {
      left: l,
      top: t,
      width: clamp(Math.round(CROP_BOX.width * w), w - l),
      height: clamp(Math.round(CROP_BOX.height * h), h - t),
    }
  }

  const targetW = Math.round(F.w * F.plateW)
  const targetH = Math.round(targetW * (CROP_BOX.height * meta.height) / (CROP_BOX.width * meta.width))

  const rgb = await sharp(rotated)
    .extract(box(meta.width, meta.height))
    .resize(targetW, targetH, { fit: 'fill' })
    .removeAlpha()
    .toBuffer()

  const mMeta = await sharp(mattePath).metadata()
  const alpha = await sharp(mattePath)
    .toColourspace('b-w')
    .extract(box(mMeta.width, mMeta.height))
    .resize(targetW, targetH, { fit: 'fill' })
    // Erode then feather — pulls the boundary just inside the rim so no
    // fringe of the original dark ground survives onto the marble.
    .blur(Math.max(3, Math.round(targetW * 0.004)))
    .linear(2.6, -215)
    .blur(1.2)
    .toBuffer()

  const cutout = await sharp(rgb).joinChannel(alpha).png().toBuffer()
  const bg = await sharp(path.join(BG_DIR, F.bg)).resize(F.w, F.h, { fit: 'cover' }).toBuffer()

  const shadowAlpha = await sharp(alpha)
    .blur(Math.max(8, Math.round(targetW * 0.02)))
    .linear(0.5, 0)
    .toBuffer()
  const shadow = await sharp({
    create: { width: targetW, height: targetH, channels: 3, background: '#000000' },
  })
    .joinChannel(shadowAlpha)
    .png()
    .toBuffer()

  const left = Math.round(F.cx * F.w - targetW / 2)
  const top = Math.round(F.cy * F.h - targetH / 2)

  await sharp(bg)
    .composite([
      { input: shadow, left, top: top + Math.round(targetH * 0.04) },
      { input: cutout, left, top },
    ])
    .toBuffer()
    .then(async (buf) => {
      for (const [ext, opts] of [
        ['webp', { quality: 80, effort: 5 }],
        ['avif', { quality: 60, effort: 2 }],
      ]) {
        await sharp(buf)[ext](opts).toFile(path.join(OUT_DIR, `${id}-${frameKey}.${ext}`))
      }
      // Tiny placeholder so the crossfade never flashes empty.
      await sharp(buf).resize(24).webp({ quality: 40 }).toFile(path.join(OUT_DIR, `${id}-lqip.webp`))
    })
}

async function run() {
  await mkdir(OUT_DIR, { recursive: true })

  for (const id of SEQUENCE) {
    const srcPath = await findSource(id)
    const mattePath = path.join(BG_DIR, `matte-${id}.png`)
    if (!srcPath) {
      console.warn(`${id}: source missing`)
      continue
    }
    for (const key of Object.keys(FRAMES)) {
      await buildFrame(id, srcPath, mattePath, key)
    }
    console.log(`✓ ${id}`)
  }
  console.log(`\n${SEQUENCE.length} frames × 2 ratios → public/img-hero`)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
