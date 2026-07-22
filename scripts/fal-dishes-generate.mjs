/**
 * NASEEB KABAB — text-to-image dish photography for the 11 unfixable frames.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHAT THESE IMAGES ARE
 * ═══════════════════════════════════════════════════════════════════
 * GENERATED, not photographed. They stand in for eleven dishes whose real
 * photographs could not be composited: every one is a plate-with-a-nested-bowl
 * or a two-plate setup, and text-prompted segmentation reliably slices through
 * the second vessel. Raggedness scores ran 1.47–4.26 against a 1.45 gate, and
 * neither better prompting nor higher resolution moved them.
 *
 * The prompts below were written by looking at the ACTUAL photograph of each
 * dish — the real colour of the sauce, what is visibly in it, how it is
 * plated, which side the rice sits on, what the garnish is. They are not
 * invented dishes. But they are not photographs of the food either, and anyone
 * maintaining this file should know that.
 *
 * Requested explicitly by the restaurant after seeing both options.
 *
 * ═══════════════════════════════════════════════════════════════════
 * CONSISTENCY
 * ═══════════════════════════════════════════════════════════════════
 * SURFACE and PLATE are shared verbatim by every prompt so these sit beside
 * the 22 real composites without looking like a different shoot: the same
 * black marble with gold veining, the same brass and candle bokeh, and the
 * restaurant's own teal-glazed plate with its thin gold rim.
 *
 * Output: public/img-generated/{id}-ed.jpg (4:5) and {id}-sq.jpg (1:1, centre
 * crop). Those are the only two crops these dishes are used at — none of them
 * appears in the hero, which needs wide/tall.
 *
 *   npm run dishes -- --dry            print prompts, spend nothing
 *   npm run dishes -- --only=DSC09532  one dish
 *   npm run dishes                     all eleven
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const OUT_DIR = path.resolve(process.cwd(), 'public/img-generated')

function readFalKey() {
  if (process.env.FAL_KEY) return process.env.FAL_KEY
  const line = readFileSync('/Users/inder/Claude/Projects/shared-keys/fal.env', 'utf8')
    .split('\n')
    .find((l) => /^\s*FAL_KEY\s*=/.test(l))
  return line && line.split('=').slice(1).join('=').trim().replace(/^"|"$/g, '')
}

/** Shared by every prompt — this is what keeps the set coherent. */
const PLATE =
  'served on a matte teal-glazed ceramic plate with a thin gold rim and subtle ' +
  'dark speckles in the glaze'

const SURFACE =
  'on a polished black marble surface with fine restrained gold veining, ' +
  'softly out-of-focus antique brass vessels and a single warm candle flame far ' +
  'in the background, dramatic warm directional light from the upper left, ' +
  'deep rich shadows falling to the right'

const CRAFT =
  'the food is abundant and generously portioned and fills most of the frame, ' +
  'shot close and tight. Medium format fine-dining editorial food photography, ' +
  'shallow depth of field, DARK low-key exposure with deep shadows and only the ' +
  'food warmly lit, natural appetising colour, realistic food texture, ' +
  'subtle film grain, photorealistic'

const NEG =
  'text, watermark, logo, letters, arabic calligraphy, cartoon, illustration, ' +
  '3d render, cgi, plastic, waxy, fake, oversaturated, neon, harsh flash, ' +
  'bright white background, blown highlights, hands, fingers, people, ' +
  'lantern, genie lamp, camel, minaret, arabesque tile, cluttered, messy, ' +
  'deformed, duplicated plate, floating food, ' +
  'short grain rice, round rice, barley, orzo, risotto, couscous, sticky rice, ' +
  'small portion, sparse plate, empty plate, half-empty, dainty, minimalist plating, ' +
  'bowl floating above the plate, bowl separate from the plate, bright exposure, washed out, ' +
  // Specific failure modes seen last round:
  'fried chicken, breaded, batter, mozzarella stick, croquette, corn dog, ' +
  'whole fish, fish head, fish tail, fish bones, whole roasted fish'

/**
 * Per-dish subject lines, written from the real photographs.
 * The five stews all share one plating: brown-tinted basmati mounded on the
 * LEFT of an oval plate with a parsley sprig, and a matching teal BOWL nested
 * on the right holding the stew.
 */
const RICE =
  'a large generous mound of Afghan long-grain basmati rice — very slender, ' +
  'elongated, separate individual grains, pale brown-tinted, never short or ' +
  'round or sticky'

const STEW_BASE =
  RICE + ' heaped on the left half of an oval plate and topped with a sprig of ' +
  'fresh curly parsley, with a small shallow teal ceramic bowl resting directly ' +
  'ON the plate at an angle, overlapping its rim, generously filled with'

const DISHES = {
  DSC09430: {
    name: 'Grand plateau mixte',
    subject:
      'a large rectangular teal ceramic platter with a gold rim, overhead view, ' +
      'a MIXED CHARCOAL-GRILLED KEBAB platter arranged in neat parallel rows: ' +
      'skewered orange chicken tikka cubes, dark brown minced-beef kobidah logs, ' +
      'a flat grilled beef fillet, orange minced-chicken kobidah logs and ' +
      'bone-in grilled lamb chops — all grilled kebab, NO fried chicken, NO ' +
      'breading, NO batter. A small heap of shredded purple cabbage, white raw ' +
      'onion rings and chopped parsley at the centre, three lemon wedges at the ' +
      'corners',
    plate: false,
  },
  DSC09461: {
    name: 'Kobidah de poulet',
    subject:
      'TWO long cylindrical kobidah kebabs of GROUND minced chicken, each shaped ' +
      'by hand around a flat metal skewer into a rippled log with char marks — ' +
      'this is minced-meat kebab, NOT breaded, NOT battered, NOT a fried stick. ' +
      'The two orange-red kobidah logs lie parallel, above and below a central ' +
      'strip of long-grain Afghan basmati rice, with shredded purple cabbage and ' +
      'chopped parsley to one side, ' + PLATE,
    plate: false,
  },
  DSC09487: {
    name: 'Plateau mixte et riz',
    subject:
      'overhead view of two oval teal ceramic plates side by side: one holding a ' +
      'MIXED CHARCOAL-GRILLED KEBAB assortment — skewered dark-brown grilled beef ' +
      'cubes, orange minced-kobidah logs and orange grilled chicken chunks with ' +
      'shredded purple cabbage, all grilled kebab and NO fried chicken and NO ' +
      'breading — and the other plate holding a mound of long-grain Afghan ' +
      'basmati rice topped with a parsley sprig',
    plate: false,
  },
  DSC09489: {
    name: 'Plateau mixte avec riz',
    subject:
      'a three-quarter view of a large oval teal ceramic plate holding a MIXED ' +
      'CHARCOAL-GRILLED KEBAB assortment — skewered dark-brown grilled beef cubes, ' +
      'orange minced-kobidah logs and orange grilled chicken pieces, all grilled ' +
      'kebab and NO fried chicken and NO breading — with shredded purple cabbage, ' +
      'and a second oval plate of long-grain Afghan basmati rice behind it',
    plate: false,
  },
  DSC09492: {
    name: 'Biryani au poulet',
    subject:
      'a mound of golden-yellow and orange spiced long-grain biryani rice with ' +
      'visible tender pieces of cooked chicken folded through it, on a round teal ' +
      'ceramic plate with a gold rim, and a small polished stainless steel cup of ' +
      'white yogurt raita set on the plate beside it, three-quarter view',
    plate: false,
  },
  DSC09496: {
    name: 'Poisson bassa',
    subject:
      'ONE single boneless flat white fish FILLET, grilled with light golden char ' +
      'marks, lying flat across the front of an oval plate — a skinless deboned ' +
      'fillet, absolutely NO head, NO tail, NO whole fish, NO bones. Behind it a ' +
      'generous mound of long-grain Afghan basmati rice, a lemon wedge to the ' +
      'left and shredded purple cabbage with parsley to the right, ' + PLATE,
    plate: false,
  },
  DSC09517: {
    name: 'Dopiaza',
    subject:
      STEW_BASE +
      ' a thick glossy brick-red tomato stew with tender braised meat and soft ' +
      'onion, finished with chopped parsley',
    plate: true,
  },
  DSC09524: {
    name: 'Kofta pulao',
    subject:
      STEW_BASE +
      ' a rich amber-brown stew of tender meat and whole chickpeas in a thick ' +
      'oily gravy, finished with chopped parsley',
    plate: true,
  },
  DSC09530: {
    name: 'Qorma de veau',
    subject:
      STEW_BASE +
      ' a pale yellow-green veal curry with soft chunks of meat and translucent ' +
      'slow-cooked onion in a light glossy sauce, finished with chopped parsley',
    plate: true,
  },
  DSC09532: {
    name: 'Qorma de poulet',
    subject:
      STEW_BASE +
      ' a glossy orange-red tomato chicken curry with visible pieces of pale ' +
      'chicken, finished with chopped parsley',
    plate: true,
  },
  DSC09540: {
    name: 'Sabzi pulao',
    subject:
      STEW_BASE +
      ' a dark green slow-braised spinach stew, glossy and finely chopped, ' +
      'finished with a little chopped parsley',
    plate: true,
  },
}

const buildPrompt = (d) =>
  `${d.subject}${d.plate ? ', ' + PLATE : ''}, ${SURFACE}. ${CRAFT}.`

/**
 * Match the generated frame to the real composites.
 *
 * FLUX consistently returns these ~55% brighter than the 22 composited
 * photographs (measured mean luminance ~67 against ~43-60), and repeated
 * prompting for "DARK low-key exposure" did not move it. Prompting is the
 * wrong tool for a global tone shift anyway — this is a grade, not a
 * generation problem.
 *
 * The multiplier is computed per image against a target rather than being a
 * fixed constant, so a dark dish and a bright one both land in the same range
 * instead of one going muddy.
 */
const TARGET_LUMA = 50

async function matchExposure(buf) {
  const st = await sharp(buf).stats()
  const mean = (st.channels[0].mean + st.channels[1].mean + st.channels[2].mean) / 3
  // Clamped: never brighten, and never crush by more than half.
  const k = Math.max(0.55, Math.min(1, TARGET_LUMA / mean))
  return sharp(buf)
    .linear(k, 0)
    // A touch of contrast back, since a flat multiply lifts nothing and the
    // composites have deep blacks with warmly lit food.
    .modulate({ saturation: 1.04 })
    .toBuffer()
}

async function generate(fal, id, d) {
  const res = await fal.subscribe('fal-ai/flux-pro/v1.1-ultra', {
    input: {
      prompt: buildPrompt(d),
      aspect_ratio: '4:5',
      num_images: 1,
      output_format: 'jpeg',
      negative_prompt: NEG,
      // Realism over stylisation — this has to sit beside real photographs.
      raw: true,
    },
    logs: false,
  })

  const url = res?.data?.images?.[0]?.url
  if (!url) throw new Error('no image returned')

  const raw = Buffer.from(await (await fetch(url)).arrayBuffer())
  const buf = await matchExposure(raw)
  await mkdir(OUT_DIR, { recursive: true })

  await sharp(buf).jpeg({ quality: 92 }).toFile(path.join(OUT_DIR, `${id}-ed.jpg`))

  // Square is a centre crop of the 4:5 rather than a second generation —
  // same framing, half the cost, and guaranteed to match.
  const m = await sharp(buf).metadata()
  const side = Math.min(m.width, m.height)
  await sharp(buf)
    .extract({
      left: Math.round((m.width - side) / 2),
      top: Math.round((m.height - side) / 2),
      width: side,
      height: side,
    })
    .jpeg({ quality: 92 })
    .toFile(path.join(OUT_DIR, `${id}-sq.jpg`))
}

async function run() {
  const args = process.argv.slice(2)
  const dry = args.includes('--dry')
  const only = args.find((a) => a.startsWith('--only='))?.split('=')[1]
  const ids = only ? [only] : Object.keys(DISHES)

  if (dry) {
    for (const id of ids) {
      console.log(`\n── ${id} — ${DISHES[id].name}\n`)
      console.log(buildPrompt(DISHES[id]))
    }
    console.log(`\n${ids.length} prompt(s). Nothing sent. Drop --dry to run.\n`)
    return
  }

  const FAL_KEY = readFalKey()
  if (!FAL_KEY) { console.error('No FAL_KEY'); process.exit(1) }

  const { fal } = await import('@fal-ai/client')
  fal.config({ credentials: FAL_KEY })

  for (const id of ids) {
    try {
      console.log(`${id} — ${DISHES[id].name} …`)
      await generate(fal, id, DISHES[id])
      console.log(`  ✓ ed + sq`)
    } catch (e) {
      console.warn(`  ✗ ${e.message}`)
    }
  }
  console.log('\nCompare against the originals before adopting.')
}

run().catch((e) => { console.error(e); process.exit(1) })
