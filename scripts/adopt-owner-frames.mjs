/**
 * Adopt the OWNER'S AUTHORITATIVE photo→dish frames (given 2026-07-22).
 *
 * The restaurant supplied the exact frame for each dish — resolving the
 * Sultan/Mazar ambiguity and every other guess. These are the REAL studio
 * photographs (teal plate, dark slate), used directly: no compositing, no
 * fal credits, no segmentation-failure risk, full fidelity. The dark-slate
 * background is identical across every frame (one shoot), so the set is
 * internally consistent.
 *
 * Three dishes are served-with-rice per the owner ("ADD RICE DSC09501"):
 * Combo Naseeb, Combo Dostan, Banjan Burani. For those, the dish frame and the
 * plain-rice frame (DSC09501) are stacked into one 4:5 image.
 *
 * Output: public/img/{DSC}-{ed|sq}-{w}.{webp,avif} + lqip, matching the crops
 * the menu and site request.
 */
import { mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const SRC_DIR = '/Users/inder/Claude/Projects/Naseeb Kebab/drive-download-20260721T021114Z-1-001'
const OUT = path.resolve(process.cwd(), 'public/img')
const WIDTHS = { ed: [1400, 900, 600], sq: [900, 500] }

/** Plain dish frames — the dish alone. */
const FRAMES = [
  'DSC09435', 'DSC09439', 'DSC09444', 'DSC09448', 'DSC09451', 'DSC09456',
  'DSC09459', 'DSC09462', 'DSC09466', 'DSC09473', 'DSC09475', 'DSC09482',
  'DSC09494', 'DSC09497', 'DSC09508', 'DSC09515', 'DSC09521', 'DSC09518',
  'DSC09526', 'DSC09528', 'DSC09534', 'DSC09539', 'DSC09542', 'DSC09547',
]

/** Served-with-rice frames → composited with DSC09501 (plain rice). */
const WITH_RICE = ['DSC09433', 'DSC09483', 'DSC09504']
const RICE = 'DSC09501'

async function findRaw(dsc) {
  const files = await readdir(SRC_DIR)
  const f = files.find((n) => n.includes(dsc) && /\.jpe?g$/i.test(n))
  return f ? path.join(SRC_DIR, f) : null
}

async function writeCrops(id, buf) {
  // ed 4:5 and sq 1:1, cover-cropped on the dish (attention gravity).
  for (const [crop, ratio] of [['ed', 4 / 5], ['sq', 1]]) {
    for (const w of WIDTHS[crop]) {
      const h = Math.round(w / ratio)
      const base = sharp(buf).resize(w, h, { fit: 'cover', position: 'attention' })
      await base.clone().webp({ quality: 80, effort: 5 }).toFile(path.join(OUT, `${id}-${crop}-${w}.webp`))
      await base.clone().avif({ quality: 60, effort: 2 }).toFile(path.join(OUT, `${id}-${crop}-${w}.avif`))
    }
  }
  const lqip = await sharp(buf).resize(20).webp({ quality: 30 }).toBuffer()
  await sharp(lqip).toFile(path.join(OUT, `${id}-lqip.webp`))
}

/** Stack dish (top) + rice (bottom) into one 4:5 frame on shared dark ground. */
async function makeWithRice(dishBuf, riceBuf) {
  const W = 1600
  const H = 2000 // 4:5
  const dishH = Math.round(H * 0.62)
  const riceH = H - dishH

  const dish = await sharp(dishBuf).resize(W, dishH, { fit: 'cover', position: 'attention' }).toBuffer()
  const rice = await sharp(riceBuf).resize(W, riceH, { fit: 'cover', position: 'attention' }).toBuffer()

  return sharp({ create: { width: W, height: H, channels: 3, background: '#0e0d0b' } })
    .composite([
      { input: dish, top: 0, left: 0 },
      { input: rice, top: dishH, left: 0 },
    ])
    .jpeg({ quality: 92 })
    .toBuffer()
}

async function run() {
  await mkdir(OUT, { recursive: true })
  let n = 0

  for (const dsc of FRAMES) {
    const raw = await findRaw(dsc)
    if (!raw) { console.warn(`${dsc}: raw missing`); continue }
    const buf = await sharp(raw).rotate().toBuffer()
    await writeCrops(dsc, buf)
    console.log(`✓ ${dsc}`)
    n++
  }

  const riceRaw = await findRaw(RICE)
  const riceBuf = riceRaw ? await sharp(riceRaw).rotate().toBuffer() : null
  for (const dsc of WITH_RICE) {
    const raw = await findRaw(dsc)
    if (!raw || !riceBuf) { console.warn(`${dsc}: skipped (missing)`); continue }
    const dishBuf = await sharp(raw).rotate().toBuffer()
    const composed = await makeWithRice(dishBuf, riceBuf)
    await writeCrops(dsc, composed)
    console.log(`✓ ${dsc} + rice`)
    n++
  }

  console.log(`\nAdopted ${n} owner frames into public/img.`)
}

run().catch((e) => { console.error(e); process.exit(1) })
