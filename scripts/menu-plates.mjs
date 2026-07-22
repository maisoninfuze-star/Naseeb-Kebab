/**
 * Plate visuals for the PRINTED menu (layouts 5a / 5b / 3a).
 *
 * Same hard rule as fal-composite.mjs: the food never goes to a generative
 * model. We cut the plate out of the original master, generate only the empty
 * surface behind it, and composite the original pixels back on top.
 *
 * What is different here is the target. The site wanted black marble. The menu
 * needs the plate to sit on the MENU'S OWN ground so the circular slots read as
 * plates resting on the page rather than photo discs pasted onto it:
 *
 *   menu-dark  #070807  → layouts 5a / 5b
 *   menu-teal  #17322f  → layout 3a
 *
 * The generated texture is then levelled onto the exact target hex, so the
 * match is guaranteed arithmetically instead of being left to the prompt.
 *
 * Cost: two 1:1 backgrounds + one 2.08:1 hero background + segmentation for
 * the three dishes whose cached matte failed the quality gate. Every other
 * matte is reused from .cache/backgrounds.
 */
import { fal } from '@fal-ai/client'
import { mkdir, writeFile, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const SRC_DIR = '/Users/inder/Claude/Projects/Naseeb Kebab/drive-download-20260721T021114Z-1-001'
const OUT_DIR = '/Users/inder/Claude/Projects/Naseeb Kebab/menu-v2/plates'
const BG_DIR = path.resolve(process.cwd(), '.cache/backgrounds')

const GATE = 1.30           // max acceptable matte raggedness

/** Menu grounds. `hex` is lifted straight from the layout CSS. */
const GROUNDS = {
  dark: {
    hex: '#0b0d0c',
    prompt:
      'Empty dark charcoal stone surface, almost black with a faint cool ' +
      'green-grey cast, very fine matte micro-texture, soft directional light ' +
      'from the upper left grazing across the stone, deep shadows falling to ' +
      'near black toward the edges, restrained and minimal, fine-dining ' +
      'editorial photography, low key. No food, no plates, no bowls, no ' +
      'utensils, no people, no text. Completely empty flat surface.',
  },
  teal: {
    hex: '#17322f',
    prompt:
      'Empty dark teal-green stone surface, deep verdigris tone, very fine ' +
      'matte micro-texture, soft directional light from the upper left grazing ' +
      'across the stone, deep shadows falling to near black toward the edges, ' +
      'restrained and minimal, fine-dining editorial photography, low key. ' +
      'No food, no plates, no bowls, no utensils, no people, no text. ' +
      'Completely empty flat surface.',
  },
}

/**
 * Menu slug -> candidate frames, best first. The script walks the list until a
 * matte passes the gate, so a dish whose preferred frame segments badly falls
 * through to a sibling frame of the same dish rather than to a broken cutout.
 */
const DISHES = {
  'chicken-kobidah': ['DSC09459', 'DSC09458', 'DSC09460', 'DSC09461'],
  'chicken-thigh':   ['DSC09441', 'DSC09437', 'DSC09438'],
  'chicken-kabab':   ['DSC09467', 'DSC09466', 'DSC09468'],
  'tikka-kabab':     ['DSC09480', 'DSC09479', 'DSC09481'],
  'barg-kabab':      ['DSC09463', 'DSC09462', 'DSC09464'],
  'naseeb-special':  ['DSC09484', 'DSC09485', 'DSC09483'],
  'beef-kobidah':    ['DSC09454', 'DSC09455', 'DSC09456'],
  'sultan-kabab':    ['DSC09429', 'DSC09431', 'DSC09432'],
  'kobidah-mix':     ['DSC09435', 'DSC09434', 'DSC09436'],
  'mazar-kabab':     ['DSC09433', 'DSC09432', 'DSC09431'],
}

/** Which ground each layout's plates render onto. */
const RENDERS = [
  { ground: 'dark', size: 1200, plateW: 0.86 },
  { ground: 'teal', size: 1200, plateW: 0.86 },
]

const HERO = { id: 'DSC09486', w: 2448, h: 1176, plateW: 1.02, cx: 0.5, cy: 0.5 }

// ─────────────────────────────────────────────────────────────── helpers ────

async function findSource(id) {
  const files = await readdir(SRC_DIR)
  const m = files.find((f) => f.includes(id) && /\.jpe?g$/i.test(f))
  return m ? path.join(SRC_DIR, m) : null
}

/** Generate an empty surface with nano-banana, once per (ground, ratio). */
async function getBackground(ground, ratio) {
  const cached = path.join(BG_DIR, `menu-${ground}-${ratio.replace(':', 'x')}.jpg`)
  if (existsSync(cached)) return cached

  console.log(`  nano-banana: ${ground} ground @ ${ratio} …`)
  const res = await fal.subscribe('fal-ai/nano-banana', {
    input: {
      prompt: GROUNDS[ground].prompt,
      num_images: 1,
      output_format: 'jpeg',
      aspect_ratio: ratio,
    },
    logs: false,
  })

  const url = res?.data?.images?.[0]?.url
  if (!url) throw new Error(`no background for ${ground} ${ratio}`)

  await mkdir(BG_DIR, { recursive: true })
  await writeFile(cached, Buffer.from(await (await fetch(url)).arrayBuffer()))
  return cached
}

/**
 * Level a generated texture onto an exact target colour.
 *
 * Per-channel gain that moves the image's MEAN to the target, leaving the
 * texture's variance intact. This is what makes "matches the menu" a fact
 * rather than a hope — the prompt only has to produce plausible stone.
 */
async function levelTo(buf, hex) {
  const t = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
  const stats = await sharp(buf).stats()
  const gain = stats.channels.slice(0, 3).map((c, i) => (c.mean > 1 ? t[i] / c.mean : 1))
  // Cap the gain so a wildly-off generation cannot blow out to posterised mush.
  const safe = gain.map((g) => Math.max(0.25, Math.min(3.0, g)))
  return sharp(buf).linear(safe, [0, 0, 0]).toBuffer()
}

/** Matte bbox + quality metrics, in fractions of the matte's own size. */
async function matteBBox(mattePath) {
  const { data, info } = await sharp(mattePath)
    .toColourspace('b-w').raw().toBuffer({ resolveWithObject: true })
  const { width, height } = info
  let minX = width, minY = height, maxX = -1, maxY = -1, on = 0, perim = 0

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[y * width + x] <= 16) continue
      on++
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
      const edge =
        x === 0 || y === 0 || x === width - 1 || y === height - 1 ||
        data[y * width + x - 1] <= 16 || data[y * width + x + 1] <= 16 ||
        data[(y - 1) * width + x] <= 16 || data[(y + 1) * width + x] <= 16
      if (edge) perim++
    }
  }
  if (maxX < 0) return null

  return {
    left: minX / width,
    top: minY / height,
    width: (maxX - minX + 1) / width,
    height: (maxY - minY + 1) / height,
    coverage: on / (width * height),
    raggedness: perim / (2 * Math.sqrt(Math.PI * on)),
  }
}

async function getMatte(srcPath, id) {
  const cached = path.join(BG_DIR, `matte-${id}.png`)
  if (existsSync(cached)) return cached

  const small = await sharp(srcPath).resize(2048).png().toBuffer()
  const url = await fal.storage.upload(new File([small], `${id}.png`, { type: 'image/png' }))
  const res = await fal.subscribe('fal-ai/evf-sam', {
    input: { image_url: url, prompt: 'the whole ceramic plate together with all the food on it' },
    logs: false,
  })
  const out = res?.data?.image?.url
  if (!out) throw new Error(`no matte for ${id}`)
  await mkdir(BG_DIR, { recursive: true })
  await writeFile(cached, Buffer.from(await (await fetch(out)).arrayBuffer()))
  return cached
}

/** Walk a dish's candidate frames until one segments cleanly. */
async function resolvePlate(slug, ids) {
  for (const id of ids) {
    const srcPath = await findSource(id)
    if (!srcPath) continue
    let mattePath
    try { mattePath = await getMatte(srcPath, id) } catch { continue }
    const bbox = await matteBBox(mattePath)
    if (!bbox) { console.log(`    ${id}: empty matte`); continue }
    if (bbox.raggedness > GATE) {
      console.log(`    ${id}: ragged=${bbox.raggedness.toFixed(2)} > ${GATE} — trying next frame`)
      continue
    }
    console.log(`  ${slug.padEnd(17)} ${id}  ragged=${bbox.raggedness.toFixed(2)}  ok`)
    return { id, srcPath, mattePath, bbox }
  }
  console.log(`  ${slug.padEnd(17)} NO CLEAN MATTE — will fall back to graded original`)
  return null
}

/** Cut the plate out at `targetW`, returning premultiplied RGBA + its alpha. */
async function buildCutout(srcPath, mattePath, bbox, targetW) {
  const rotated = await sharp(srcPath).rotate().toBuffer()
  const meta = await sharp(rotated).metadata()
  const clamp = (v, max) => Math.max(0, Math.min(v, max))

  const bx = clamp(Math.round(bbox.left * meta.width), meta.width - 1)
  const by = clamp(Math.round(bbox.top * meta.height), meta.height - 1)
  const box = {
    left: bx, top: by,
    width: clamp(Math.round(bbox.width * meta.width), meta.width - bx),
    height: clamp(Math.round(bbox.height * meta.height), meta.height - by),
  }
  const targetH = Math.round((box.height / box.width) * targetW)

  const rgb = await sharp(rotated).extract(box)
    .resize(targetW, targetH, { fit: 'fill' }).removeAlpha().toBuffer()

  const mMeta = await sharp(mattePath).metadata()
  const mx = clamp(Math.round(bbox.left * mMeta.width), mMeta.width - 1)
  const my = clamp(Math.round(bbox.top * mMeta.height), mMeta.height - 1)
  const alpha = await sharp(mattePath).toColourspace('b-w')
    .extract({
      left: mx, top: my,
      width: clamp(Math.round(bbox.width * mMeta.width), mMeta.width - mx),
      height: clamp(Math.round(bbox.height * mMeta.height), mMeta.height - my),
    })
    .resize(targetW, targetH, { fit: 'fill' })
    .blur(Math.max(3, Math.round(targetW * 0.004)))
    .linear(2.6, -215)
    .blur(1.2)
    .toBuffer()

  return {
    cutout: await sharp(rgb).joinChannel(alpha).png().toBuffer(),
    alpha, targetW, targetH,
  }
}

async function composite({ plate, bgBuf, W, H, plateW, cx = 0.5, cy = 0.5, outPath }) {
  const targetW = Math.round(W * plateW)
  const { cutout, alpha, targetH } = await buildCutout(
    plate.srcPath, plate.mattePath, plate.bbox, targetW)

  const shadowAlpha = await sharp(alpha)
    .blur(Math.max(8, Math.round(targetW * 0.022))).linear(0.55, 0).toBuffer()
  const shadow = await sharp({
    create: { width: targetW, height: targetH, channels: 3, background: '#000000' },
  }).joinChannel(shadowAlpha).png().toBuffer()

  const left = Math.round(cx * W - targetW / 2)
  const top = Math.round(cy * H - targetH / 2)

  await sharp(await sharp(bgBuf).resize(W, H, { fit: 'cover' }).toBuffer())
    .composite([
      { input: shadow, left, top: top + Math.round(targetH * 0.035) },
      { input: cutout, left, top },
    ])
    .png()
    .toFile(outPath)
}

/** Matte failed: grade the original toward the ground instead of compositing. */
async function gradeFallback(id, W, H, hex, outPath) {
  const srcPath = await findSource(id)
  const t = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
  await sharp(await sharp(srcPath).rotate().toBuffer())
    .resize(W, H, { fit: 'cover', position: 'attention' })
    .linear([1.06, 1.04, 0.98], [-(14 - t[0] / 8), -(14 - t[1] / 8), -(10 - t[2] / 8)])
    .modulate({ saturation: 1.04 })
    .png()
    .toFile(outPath)
}

// ────────────────────────────────────────────────────────────────── main ────

if (!process.env.FAL_KEY) throw new Error('FAL_KEY not set')
fal.config({ credentials: process.env.FAL_KEY })

await mkdir(OUT_DIR, { recursive: true })

// ONLY=chicken-thigh  → resolve/composite a single dish. Rule from the last
// run: prove one item at full size before spending on the batch.
const ONLY = process.env.ONLY
const WANTED = ONLY ? { [ONLY]: DISHES[ONLY] } : DISHES
if (ONLY && !DISHES[ONLY]) throw new Error(`unknown dish: ${ONLY}`)

console.log('\nResolving plates (reusing cached mattes where they pass the gate):')
const plates = {}
for (const [slug, ids] of Object.entries(WANTED)) plates[slug] = await resolvePlate(slug, ids)

console.log('\nBackgrounds:')
const grounds = {}
for (const { ground } of RENDERS) {
  if (grounds[ground]) continue
  grounds[ground] = await levelTo(await getBackground(ground, '1:1'), GROUNDS[ground].hex)
  console.log(`  ${ground} levelled to ${GROUNDS[ground].hex}`)
}

console.log('\nCompositing plates:')
for (const { ground, size, plateW } of RENDERS) {
  for (const [slug, plate] of Object.entries(plates)) {
    const outPath = path.join(OUT_DIR, `${slug}-${ground}.png`)
    if (plate) {
      await composite({ plate, bgBuf: grounds[ground], W: size, H: size, plateW, outPath })
    } else {
      await gradeFallback(DISHES[slug][0], size, size, GROUNDS[ground].hex, outPath)
    }
    console.log(`  ${slug}-${ground}.png`)
  }
}

// The menu hero is generated separately (scripts/menu-hero.mjs) — it is a
// fully-generated scene, not a composite of the shoot. This block stays only
// for the composited-platter variant, behind an explicit flag.
if (ONLY || !process.env.WITH_HERO) {
  console.log('\nSkipping hero (see scripts/menu-hero.mjs).')
  process.exit(0)
}

console.log('\nHero:')
const heroPlate = await resolvePlate('hero', [HERO.id, 'DSC09485', 'DSC09484'])
if (heroPlate) {
  for (const ground of ['dark', 'teal']) {
    const bg = await levelTo(await getBackground(ground, '21:9'), GROUNDS[ground].hex)
    await composite({
      plate: heroPlate, bgBuf: bg, W: HERO.w, H: HERO.h,
      plateW: HERO.plateW, cx: HERO.cx, cy: HERO.cy,
      outPath: path.join(OUT_DIR, `hero-${ground}.png`),
    })
    console.log(`  hero-${ground}.png`)
  }
}

console.log(`\nDone → ${OUT_DIR}`)
