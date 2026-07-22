/**
 * Adopt the owner-supplied "ADD RICE" combo images.
 *
 * Four finished images arrived from the owner's side (project root:
 * naseeb.png, dostan.png, watan.png, Buran.png), already in the exact
 * presentation their menu mockups specify: teal ceramic platter with the gold
 * rim, a SEPARATE round teal rice bowl placed behind the main dish, overhead
 * camera, dark textured ground, premium lighting. These replace the interim
 * stone-plate cards on the three combos, and give Banjan Burani the
 * rice-accompanied presentation the owner's menu mapping marks as "ADD RICE".
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHY BLUR-EXTEND RATHER THAN CROP
 * ═══════════════════════════════════════════════════════════════════
 * The sources are 3:2 landscape; the menu page displays 4:5 portrait. A centre
 * crop to 4:5 keeps just 55% of the width — it amputates the rice bowl, which
 * is the entire point of this composition. So instead the full image floats on
 * a canvas filled with a blurred, darkened cover-scale of itself: nothing is
 * lost at any ratio, and because the ground is already a near-uniform dark
 * texture, the blurred fill reads as more of the same table.
 *
 * Keys are prefixed `rice-` so they can never be clobbered by the menu-card
 * adopters (`card-*`) or the studio pipeline (`DSC*`).
 */
import { mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = '/Users/inder/Claude/Projects/Naseeb Kebab'
const OUT = path.resolve(process.cwd(), 'public/img')

/** image key → owner file. */
const MAP = {
  'rice-combo-naseeb': 'naseeb.png',
  'rice-combo-dostan': 'dostan.png',
  'rice-combo-watan': 'watan.png',
  'rice-banjan-burani': 'Buran.png',
}

/** Canvas per crop — sized to cover the largest width the site requests. */
const CANVAS = {
  // wide included so these can serve full-bleed sections (homepage Platters).
  // 3:2 source inside a 16:9 canvas leaves only slim side margins for the
  // blurred fill — the least-stretched of the three ratios.
  wide: { w: 2400, h: 1350, widths: [2400, 1600, 900] },
  ed: { w: 1400, h: 1750, widths: [1400, 900, 600] },
  sq: { w: 1400, h: 1400, widths: [900, 500] },
}

async function blurExtend(src, W, H) {
  // Backdrop: the image itself, cover-scaled, heavily blurred and darkened —
  // so the fill is always tonally continuous with the photo it frames.
  const backdrop = await sharp(src)
    .resize(W, H, { fit: 'cover' })
    .blur(40)
    .modulate({ brightness: 0.55 })
    .toBuffer()

  // Foreground: the complete composition, fit inside with a small margin.
  const fg = await sharp(src)
    .resize(Math.round(W * 0.94), Math.round(H * 0.94), { fit: 'inside' })
    .toBuffer()
  const fgMeta = await sharp(fg).metadata()

  return sharp(backdrop)
    .composite([
      {
        input: fg,
        left: Math.round((W - fgMeta.width) / 2),
        top: Math.round((H - fgMeta.height) / 2),
      },
    ])
    .toBuffer()
}

async function run() {
  await mkdir(OUT, { recursive: true })

  for (const [key, file] of Object.entries(MAP)) {
    const src = path.join(ROOT, file)
    if (!existsSync(src)) {
      console.warn(`skip ${key}: ${file} not found`)
      continue
    }

    for (const [crop, C] of Object.entries(CANVAS)) {
      const canvas = await blurExtend(src, C.w, C.h)
      for (const w of C.widths) {
        const base = sharp(canvas).resize(w, null, { kernel: 'lanczos3' })
        await base.clone().webp({ quality: 82, effort: 5 }).toFile(path.join(OUT, `${key}-${crop}-${w}.webp`))
        await base.clone().avif({ quality: 62, effort: 2 }).toFile(path.join(OUT, `${key}-${crop}-${w}.avif`))
      }
    }

    const lqip = await sharp(src).resize(20).webp({ quality: 30 }).toBuffer()
    await sharp(lqip).toFile(path.join(OUT, `${key}-lqip.webp`))
    console.log(`✓ ${key} ← ${file}`)
  }
}

run().catch((e) => { console.error(e); process.exit(1) })
