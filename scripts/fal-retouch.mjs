/**
 * fal.ai — background and lighting retouch for the dish photography.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHAT THIS DOES NOT DO, AND WHY
 * ═══════════════════════════════════════════════════════════════════
 * It does NOT recolour the plates.
 *
 * The restaurant confirmed the teal ceramic is what they actually serve on.
 * Recolouring it to the burnt orange of the reference would mean every
 * customer who arrives sees different tableware than the website promised —
 * which is the same class of error as inventing a menu description, just
 * harder to spot.
 *
 * It also does NOT touch the food. Every prompt below carries an explicit
 * preservation clause: same dish, same quantity, same skewer count, same
 * plating, same camera angle. If a result changes the food, reject it.
 *
 * What it DOES change is everything around the plate: the surface, the
 * lighting, the props, the atmosphere. That is where the reference imagery's
 * luxury actually lives.
 *
 * ═══════════════════════════════════════════════════════════════════
 * SETUP
 * ═══════════════════════════════════════════════════════════════════
 *   npm i @fal-ai/client
 *   echo 'FAL_KEY=your_key_here' >> .env.local
 *   npm run retouch -- --dry          # print the plan, spend nothing
 *   npm run retouch -- --only=DSC09484
 *   npm run retouch                   # the full set
 *
 * Output goes to public/img-retouched/ so the originals are never
 * overwritten and an A/B comparison is always possible.
 */
import { readFile, mkdir, writeFile, readdir } from 'node:fs/promises'
import path from 'node:path'

const SRC_DIR = '/Users/inder/Claude/Projects/Naseeb Kebab/drive-download-20260721T021114Z-1-001'
const OUT_DIR = path.resolve(process.cwd(), 'public/img-retouched')

/**
 * The four surfaces, chosen from the reference photography.
 *
 * Teal against warm metal is the whole idea: verdigris and copper sit almost
 * opposite each other in temperature, so the plate separates from the ground
 * without either fighting the ember accent in the UI. Against the orange
 * plates of the reference, copper would have muddied.
 */
const SURFACES = {
  /* Signature. Used for the kababs and anything that should feel like fire. */
  obsidianCopper:
    'a honed black stone surface with an extremely subtle warm sheen, ' +
    'softly out-of-focus antique copper and brass vessels in the far background, ' +
    'one small brass lantern casting a warm low glow from the upper left, ' +
    'deep shadow falling to the right',

  /* Marble. Used for the platters and the highest-value items. */
  blackMarble:
    'a polished black marble surface with fine, restrained gold veining, ' +
    'a single brushed-brass fork resting at the lower edge, ' +
    'blurred warm candlelight bokeh in the deep background',

  /* Warm stone. Used for the stews, rice and slow-cooked dishes. */
  warmStone:
    'a warm taupe limestone surface with soft natural texture, ' +
    'a folded raw-linen cloth in oatmeal at the edge of frame, ' +
    'a small hammered-copper bowl of spice just out of focus behind',

  /* Light. Used for dessert, tea and anything delicate. */
  paleMarble:
    'a pale cream marble surface with the faintest grey veining, ' +
    'soft diffused daylight from the left, ' +
    'a brushed-gold spoon resting nearby, minimal styling, generous negative space',
}

/**
 * The clause that protects the product. Repeated verbatim in every prompt —
 * this is the single most important string in the file.
 */
const PRESERVE =
  'CRITICAL — do not alter the food or the plate in any way: preserve the exact dish, ' +
  'the exact number of pieces and skewers, the exact plating and arrangement, the exact ' +
  'portion size, and the original camera angle and perspective. ' +
  'The plate is TEAL / verdigris glazed ceramic with a thin gold rim — keep it exactly ' +
  'that colour and shape, do not recolour it. Do not add, remove or substitute any ' +
  'ingredient or garnish. Photorealistic restaurant photography, not illustration.'

const LOOK =
  'Editorial fine-dining photography, medium-format look, shallow depth of field, ' +
  'warm directional key light from the upper left, deep controlled shadows, ' +
  'rich but natural colour, subtle film grain, no text, no watermark, no people.'

/** dish-id → surface. Grouped by how the dish should feel, not by category. */
const PLAN = {
  // Kababs and grill — fire, metal, shadow
  DSC09484: 'blackMarble',    DSC09487: 'blackMarble',
  DSC09489: 'blackMarble',    DSC09430: 'blackMarble',
  DSC09453: 'obsidianCopper', DSC09446: 'obsidianCopper',
  DSC09454: 'obsidianCopper', DSC09461: 'obsidianCopper',
  DSC09463: 'obsidianCopper', DSC09467: 'obsidianCopper',
  DSC09471: 'obsidianCopper', DSC09476: 'obsidianCopper',
  DSC09480: 'obsidianCopper', DSC09435: 'obsidianCopper',
  DSC09441: 'obsidianCopper', DSC09445: 'obsidianCopper',
  DSC09442: 'obsidianCopper', DSC09496: 'obsidianCopper',

  // Stews, rice, slow-cooked — warmth, linen, spice
  DSC09492: 'warmStone', DSC09504: 'warmStone', DSC09506: 'warmStone',
  DSC09509: 'warmStone', DSC09513: 'warmStone', DSC09517: 'warmStone',
  DSC09522: 'warmStone', DSC09524: 'warmStone', DSC09530: 'warmStone',
  DSC09532: 'warmStone', DSC09534: 'warmStone', DSC09537: 'warmStone',
  DSC09540: 'warmStone', DSC09502: 'warmStone',

  // Dessert — light, delicate
  DSC09545: 'paleMarble',
}

function buildPrompt(surface) {
  return `Replace only the background and surface beneath the plate with ${SURFACES[surface]}. ${LOOK} ${PRESERVE}`
}

async function findSource(id) {
  // Originals were renamed to `{dish-slug}-DSC094xx.jpg`.
  const files = await readdir(SRC_DIR)
  const match = files.find((f) => f.includes(id) && /\.jpe?g$/i.test(f))
  return match ? path.join(SRC_DIR, match) : null
}

async function run() {
  const args = process.argv.slice(2)
  const dry = args.includes('--dry')
  const only = args.find((a) => a.startsWith('--only='))?.split('=')[1]

  const ids = only ? [only] : Object.keys(PLAN)

  if (dry) {
    console.log(`\nPlan: ${ids.length} image(s)\n`)
    for (const id of ids) {
      const surface = PLAN[id] ?? 'obsidianCopper'
      console.log(`${id}  →  ${surface}`)
    }
    console.log(`\nPrompt for "${PLAN[ids[0]] ?? 'obsidianCopper'}":\n`)
    console.log(buildPrompt(PLAN[ids[0]] ?? 'obsidianCopper'))
    console.log('\nNothing was sent. Drop --dry to run.\n')
    return
  }

  if (!process.env.FAL_KEY) {
    console.error(
      'FAL_KEY is not set.\n' +
        'Add it to .env.local:  FAL_KEY=your_key_here\n' +
        'Then re-run. Use --dry to preview the plan without a key.',
    )
    process.exit(1)
  }

  const { fal } = await import('@fal-ai/client')
  fal.config({ credentials: process.env.FAL_KEY })

  await mkdir(OUT_DIR, { recursive: true })

  for (const id of ids) {
    const surface = PLAN[id] ?? 'obsidianCopper'
    const srcPath = await findSource(id)
    if (!srcPath) {
      console.warn(`${id}: source not found, skipping`)
      continue
    }

    console.log(`${id} → ${surface} …`)

    const file = new File([await readFile(srcPath)], `${id}.jpg`, { type: 'image/jpeg' })
    const url = await fal.storage.upload(file)

    const result = await fal.subscribe('fal-ai/flux-pro/kontext', {
      input: {
        prompt: buildPrompt(surface),
        image_url: url,
        guidance_scale: 3.5,
        num_images: 1,
        output_format: 'jpeg',
        safety_tolerance: '2',
      },
      logs: false,
    })

    const out = result?.data?.images?.[0]?.url
    if (!out) {
      console.warn(`${id}: no image returned`)
      continue
    }

    const bytes = Buffer.from(await (await fetch(out)).arrayBuffer())
    await writeFile(path.join(OUT_DIR, `${id}.jpg`), bytes)
    console.log(`  saved public/img-retouched/${id}.jpg`)
  }

  console.log(
    `\nDone. Compare against the originals before adopting any of them — ` +
      `reject anything where the food, the portion or the plate colour changed.`,
  )
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
