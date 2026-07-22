/**
 * fal.ai — background replacement by COMPOSITE, rendered per aspect ratio.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHY THIS EXISTS
 * ═══════════════════════════════════════════════════════════════════
 * The first approach (scripts/fal-retouch.mjs) sent the whole photograph to
 * an image-editing model with a strongly-worded "do not change the food"
 * clause. The clause did not hold. On the very first test the model:
 *
 *   · turned long-grain basmati into short vermicelli-like strands
 *   · replaced the irregular speckled teal plate with a clean round one
 *   · removed the char marks from the lamb — the charcoal story, gone
 *   · returned 1248x832 from a 7952x5304 master
 *
 * A diffusion model re-draws every pixel it is given. You cannot instruct it
 * to leave some alone; you can only decline to give them to it.
 *
 * So this script never sends the food anywhere. Per dish it:
 *   1. cuts the plate out of the ORIGINAL master (alpha matte only),
 *   2. generates a background that has never seen the dish,
 *   3. composites the original pixels back on top at full resolution,
 *   4. adds a contact shadow so the plate sits in the scene.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHY IT RENDERS FOUR TIMES PER DISH
 * ═══════════════════════════════════════════════════════════════════
 * The site asks for four crops: 16:9 hero, 4:5 editorial, 1:1 menu tile,
 * 9:16 mobile hero. Producing one 3:2 frame and cover-cropping it does not
 * work — cropping a 3:2 composite to 9:16 keeps just 38% of the width, which
 * slices the plate in half, and lands at exactly 1200px with no headroom.
 *
 * So each crop is composited natively: its own canvas, its own background at
 * that ratio, and its own plate scale and position. The position is chosen to
 * leave the negative space each layout actually needs — the left third clear
 * on the wide hero for the headline, the lower half clear on the mobile hero.
 */
import { mkdir, writeFile, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const SRC_DIR = '/Users/inder/Claude/Projects/Naseeb Kebab/drive-download-20260721T021114Z-1-001'
const OUT_DIR = path.resolve(process.cwd(), 'public/img-composited')
const BG_DIR = path.resolve(process.cwd(), '.cache/backgrounds')

/**
 * Per-crop geometry.
 *
 *  w,h        canvas size — comfortably above the largest width the site asks
 *             for, so every derivative downsamples rather than upscales
 *  plateW     plate width as a fraction of canvas width
 *  cx, cy     plate centre as a fraction of the canvas
 *
 * `wide` pushes the plate right of centre because the hero headline sits on
 * the left. `tall` lifts it high because the mobile hero stacks type beneath.
 */
const CROPS = {
  wide: { w: 3200, h: 1800, plateW: 0.56, cx: 0.66, cy: 0.54 },
  ed:   { w: 1800, h: 2250, plateW: 0.86, cx: 0.5,  cy: 0.47 },
  sq:   { w: 1400, h: 1400, plateW: 0.88, cx: 0.5,  cy: 0.5  },
  tall: { w: 1500, h: 2667, plateW: 0.94, cx: 0.5,  cy: 0.36 },
}

/**
 * ONE scene for the entire set. This is the most important line in the file.
 *
 * The reference imagery showed six different treatments — black slate, copper
 * still-life, white marble, black marble, and so on. An earlier pass used four
 * of them across 33 dishes and the result looked like a stock template, because
 * mixed backgrounds are the clearest cheap-site signal there is. Consistency is
 * what reads as expensive.
 *
 * Black marble with gold veining was chosen because it matches the site's
 * obsidian ground, its veining picks up the brass already in the palette, and
 * it sits closest to the COYA register the brief cites. It also flatters the
 * teal plates, which are warm-neutral's complement.
 */
const SCENE =
  'Empty polished black marble table surface with fine restrained gold veining, ' +
  'dramatic warm directional light from the upper left falling across the stone, ' +
  'softly out-of-focus antique brass vessels and a single warm candle flame far in ' +
  'the background, deep rich shadows, shallow depth of field, medium format ' +
  'fine-dining editorial photography, moody and low key, ' +
  'no food, no plates, no dishes, no bowls, no people, no text, ' +
  'completely empty clear surface in the centre of the frame'

/** Every dish in the set. All share the single SCENE above. */
const DISHES = [
  'DSC09430', 'DSC09435', 'DSC09441', 'DSC09442', 'DSC09445', 'DSC09446',
  'DSC09453', 'DSC09454', 'DSC09461', 'DSC09463', 'DSC09467', 'DSC09471',
  'DSC09476', 'DSC09480', 'DSC09484', 'DSC09487', 'DSC09489', 'DSC09492',
  'DSC09496', 'DSC09502', 'DSC09504', 'DSC09506', 'DSC09509', 'DSC09513',
  'DSC09517', 'DSC09522', 'DSC09524', 'DSC09530', 'DSC09532', 'DSC09534',
  'DSC09537', 'DSC09540', 'DSC09545',
]

/**
 * Shots where the dish occupies more than one vessel — a rice plate beside a
 * stew bowl, a biryani with a raita cup, a platter with a second rice plate.
 *
 * The single-object segmentation prompt makes the model pick one vessel and
 * slice through the other: the first run removed entire curry bowls and left a
 * crescent of rice on a broken plate. These get a multi-object prompt.
 */
const MULTI_VESSEL = new Set([
  'DSC09487', 'DSC09489', 'DSC09492', 'DSC09517', 'DSC09524',
  'DSC09530', 'DSC09532', 'DSC09534', 'DSC09537', 'DSC09540',
])

async function findSource(id) {
  const files = await readdir(SRC_DIR)
  const m = files.find((f) => f.includes(id) && /\.jpe?g$/i.test(f))
  return m ? path.join(SRC_DIR, m) : null
}

/** One background per (scene, crop). Generated once, then cached on disk. */
async function getBackground(fal, crop) {
  const { w, h } = CROPS[crop]
  const cached = path.join(BG_DIR, `marble-${crop}.jpg`)
  if (existsSync(cached)) return cached

  // Flux wants dimensions that are multiples of 16 and not enormous; generate
  // at a manageable size and upscale on composite.
  const gw = Math.round((w / Math.max(w, h)) * 1360 / 16) * 16
  const gh = Math.round((h / Math.max(w, h)) * 1360 / 16) * 16

  console.log(`  background @ ${crop} (${gw}x${gh}) …`)
  const res = await fal.subscribe('fal-ai/flux/dev', {
    input: {
      prompt: SCENE,
      image_size: { width: gw, height: gh },
      num_inference_steps: 34,
      guidance_scale: 3.5,
      num_images: 1,
      output_format: 'jpeg',
    },
    logs: false,
  })

  const url = res?.data?.images?.[0]?.url
  if (!url) throw new Error(`no background for ${crop}`)

  await mkdir(BG_DIR, { recursive: true })
  await writeFile(cached, Buffer.from(await (await fetch(url)).arrayBuffer()))
  return cached
}

/** Text-prompted matte of the plate (and any companion bowl). */
async function getMatte(fal, srcPath, id) {
  const cached = path.join(BG_DIR, `matte-${id}.png`)
  if (existsSync(cached)) return cached

  // 2048 rather than 1600. The low-contrast plates — a dark teal rim against
  // the dark slate of the original set — produce torn, holed masks at lower
  // resolution, and no amount of edge processing recovers a mask with a chunk
  // missing. More pixels give the segmenter more edge to find.
  const small = await sharp(srcPath).resize(2048).png().toBuffer()
  const url = await fal.storage.upload(new File([small], `${id}.png`, { type: 'image/png' }))

  const prompt = MULTI_VESSEL.has(id)
    ? 'every plate, bowl and dish on the table together with all of the food, as one single connected region'
    : 'the whole ceramic plate together with all the food on it'

  const res = await fal.subscribe('fal-ai/evf-sam', {
    input: { image_url: url, prompt },
    logs: false,
  })

  const out = res?.data?.image?.url
  if (!out) throw new Error(`no matte for ${id}`)

  await mkdir(BG_DIR, { recursive: true })
  await writeFile(cached, Buffer.from(await (await fetch(out)).arrayBuffer()))
  return cached
}

/**
 * Bounding box of the matte, in fractions of its own size.
 * Computed by scanning raw pixels rather than sharp's trim(), because trim()
 * throws when a mask is empty and gives no way to inspect coverage — and
 * coverage is exactly what tells us a segmentation failed.
 */
async function matteBBox(mattePath) {
  const { data, info } = await sharp(mattePath)
    .toColourspace('b-w')
    .raw()
    .toBuffer({ resolveWithObject: true })

  const { width, height } = info
  let minX = width, minY = height, maxX = -1, maxY = -1, on = 0

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[y * width + x] > 16) {
        on++
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }

  if (maxX < 0) return null

  // Raggedness: perimeter measured against the perimeter a perfect circle of
  // the same area would have. A clean plate matte is a smooth blob and scores
  // near 1.0–1.2. A matte that has torn edges or holes — which happens where a
  // dark plate rim sits against the dark background of the original set —
  // scores far higher, and no amount of edge processing recovers it.
  let perim = 0
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[y * width + x] <= 16) continue
      const edge =
        x === 0 || y === 0 || x === width - 1 || y === height - 1 ||
        data[y * width + x - 1] <= 16 ||
        data[y * width + x + 1] <= 16 ||
        data[(y - 1) * width + x] <= 16 ||
        data[(y + 1) * width + x] <= 16
      if (edge) perim++
    }
  }
  const raggedness = perim / (2 * Math.sqrt(Math.PI * on))

  return {
    left: minX / width,
    top: minY / height,
    width: (maxX - minX + 1) / width,
    height: (maxY - minY + 1) / height,
    coverage: on / (width * height),
    raggedness,
  }
}

async function compositeCrop({ id, crop, srcPath, mattePath, bgPath, bbox }) {
  const C = CROPS[crop]

  // Bake the EXIF rotation into a buffer FIRST. sharp's metadata() reports
  // pre-rotation dimensions, so measuring before .rotate() gives a transposed
  // width/height on any portrait-flagged file and every extract then fails.
  const rotated = await sharp(srcPath).rotate().toBuffer()
  const meta = await sharp(rotated).metadata()

  // Crop both master and matte to the plate's bounding box so scaling is
  // relative to the plate itself, not to the empty frame around it.
  // Clamped: rounding a fraction near 1.0 can push left+width one pixel past
  // the edge, which sharp rejects as a bad extract area.
  const clamp = (v, max) => Math.max(0, Math.min(v, max))
  const bx = clamp(Math.round(bbox.left * meta.width), meta.width - 1)
  const by = clamp(Math.round(bbox.top * meta.height), meta.height - 1)
  const box = {
    left: bx,
    top: by,
    width: clamp(Math.round(bbox.width * meta.width), meta.width - bx),
    height: clamp(Math.round(bbox.height * meta.height), meta.height - by),
  }

  const targetW = Math.round(C.w * C.plateW)
  const targetH = Math.round((box.height / box.width) * targetW)

  const rgb = await sharp(rotated)
    .extract(box)
    .resize(targetW, targetH, { fit: 'fill' })
    .removeAlpha()
    .toBuffer()

  // Extract the matte in ITS OWN pixel space using the same fractional box,
  // rather than upscaling a 1600px mask to 42MP and cropping that. Same
  // framing, a fraction of the memory, and it avoids the resize→extract→resize
  // chain that sharp rejects.
  const mMeta = await sharp(mattePath).metadata()
  const mx = clamp(Math.round(bbox.left * mMeta.width), mMeta.width - 1)
  const my = clamp(Math.round(bbox.top * mMeta.height), mMeta.height - 1)
  const mBox = {
    left: mx,
    top: my,
    width: clamp(Math.round(bbox.width * mMeta.width), mMeta.width - mx),
    height: clamp(Math.round(bbox.height * mMeta.height), mMeta.height - my),
  }

  // Erode, then feather.
  //
  // The raw segmentation edge is ragged — on the plate-plus-bowl shots it left
  // a speckled fringe of original dark background clinging to the plate rim,
  // which reads as a cut-out artefact against the new surface.
  //
  // blur() spreads the edge into a gradient; the linear() curve then pushes
  // everything below ~60% opacity to zero, which pulls the boundary a few
  // pixels INSIDE the plate and takes the fringe with it. The final small blur
  // softens what remains so it composites without stair-stepping.
  const alpha = await sharp(mattePath)
    .toColourspace('b-w')
    .extract(mBox)
    .resize(targetW, targetH, { fit: 'fill' })
    .blur(Math.max(3, Math.round(targetW * 0.004)))
    .linear(2.6, -215)
    .blur(1.2)
    .toBuffer()

  const cutout = await sharp(rgb).joinChannel(alpha).png().toBuffer()

  const bg = await sharp(bgPath).resize(C.w, C.h, { fit: 'cover' }).toBuffer()

  // Contact shadow — the matte, blurred and darkened, offset downward.
  // Without it the plate reads as a sticker laid on the photograph.
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

  const left = Math.round(C.cx * C.w - targetW / 2)
  const top = Math.round(C.cy * C.h - targetH / 2)

  await mkdir(OUT_DIR, { recursive: true })
  await sharp(bg)
    .composite([
      { input: shadow, left, top: top + Math.round(targetH * 0.04) },
      { input: cutout, left, top },
    ])
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(path.join(OUT_DIR, `${id}-${crop}.jpg`))
}

/**
 * Fallback for dishes whose matte failed the quality gate.
 *
 * No AI, no credits, no risk of altering the food: the original frame is
 * simply graded toward the same mood as the generated set — blacks crushed a
 * little, warmth lifted, a vignette to focus the plate. The original shoot's
 * dark slate is already close in tone to black marble, so a graded original
 * sits beside a composite without looking like a different website.
 *
 * Rendered into the same four crops, using the plate's own bounding box so
 * the subject stays centred rather than being blindly cover-cropped.
 */
async function gradeFallback(id, srcPath) {
  const rotated = await sharp(srcPath).rotate().toBuffer()

  for (const [crop, C] of Object.entries(CROPS)) {
    const graded = await sharp(rotated)
      .resize(C.w, C.h, { fit: 'cover', position: 'attention' })
      // Slight contrast lift + warm tilt. Blue is pulled down hardest, which
      // deepens the background without touching the teal plate much.
      .linear([1.08, 1.05, 0.97], [-12, -12, -8])
      .modulate({ saturation: 1.04 })
      .toBuffer()

    // Radial vignette — a blurred white ellipse on grey, multiplied.
    //
    // The first version used a 78%-of-frame ellipse on PURE BLACK with a
    // heavy blur, which crushed the top and bottom edges to near-zero. On a
    // 4:5 crop that read as black letterboxing: the dish appeared to float in
    // a letterboxed box while the true composites beside it went edge to edge.
    //
    // Now: a 94% ellipse on mid-grey (#8c8c8c), so the darkest the corners can
    // go is roughly 55% rather than 0%. It shapes the light instead of
    // amputating the frame.
    const vig = await sharp({
      create: { width: C.w, height: C.h, channels: 3, background: '#8c8c8c' },
    })
      .composite([
        {
          input: await sharp({
            create: {
              width: Math.round(C.w * 0.94),
              height: Math.round(C.h * 0.94),
              channels: 3,
              background: '#ffffff',
            },
          })
            .png()
            .toBuffer(),
          gravity: 'centre',
          blend: 'over',
        },
      ])
      .blur(Math.round(Math.min(C.w, C.h) * 0.1))
      // .png() is required: a create-based pipeline has no inherent output
      // format, and toBuffer() then emits raw bytes that the next sharp() call
      // rejects with "unsupported image format".
      .png()
      .toBuffer()

    await mkdir(OUT_DIR, { recursive: true })
    await sharp(graded)
      .composite([{ input: vig, blend: 'multiply' }])
      // Compensate for the multiply, which always darkens overall.
      .modulate({ brightness: 1.18 })
      .jpeg({ quality: 92, mozjpeg: true })
      .toFile(path.join(OUT_DIR, `${id}-${crop}.jpg`))
  }
}

async function run() {
  const args = process.argv.slice(2)
  const only = args.find((a) => a.startsWith('--only='))?.split('=')[1]
  const ids = only ? [only] : DISHES

  if (!process.env.FAL_KEY) {
    console.error('FAL_KEY is not set. Add it to .env.local.')
    process.exit(1)
  }

  const { fal } = await import('@fal-ai/client')
  fal.config({ credentials: process.env.FAL_KEY })

  const suspect = []

  for (const id of ids) {
    const srcPath = await findSource(id)
    if (!srcPath) {
      console.warn(`${id}: source not found`)
      continue
    }

    try {
      console.log(id)
      const mattePath = await getMatte(fal, srcPath, id)
      const bbox = await matteBBox(mattePath)

      if (!bbox) {
        console.warn(`  ✗ empty matte — skipped`)
        suspect.push(`${id} (empty matte)`)
        continue
      }

      // A good plate matte covers roughly 25–75% of the frame. Well outside
      // that means the segmentation grabbed a fragment or the whole image, and
      // the composite would be visibly wrong. Flag rather than ship it.
      const why = []
      if (bbox.coverage < 0.14 || bbox.coverage > 0.9) {
        why.push(`coverage ${(bbox.coverage * 100).toFixed(0)}%`)
      }
      if (bbox.raggedness > 1.45) {
        why.push(`ragged edge ${bbox.raggedness.toFixed(2)}`)
      }
      if (why.length) {
        console.warn(`  ! ${why.join(', ')} — graded original instead`)
        suspect.push(`${id}: ${why.join(', ')}`)
        await gradeFallback(id, srcPath)
        continue // never write a composite we already know is broken
      }

      for (const crop of Object.keys(CROPS)) {
        const bgPath = await getBackground(fal, crop)
        await compositeCrop({ id, crop, srcPath, mattePath, bgPath, bbox })
      }
      console.log(`  ✓ ${Object.keys(CROPS).join(', ')}`)
    } catch (e) {
      console.warn(`  ✗ ${id}: ${e.message}`)
      suspect.push(`${id} (${e.message})`)
    }
  }

  if (suspect.length) {
    console.log(`\nNeeds a look before use:\n  ${suspect.join('\n  ')}`)
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
