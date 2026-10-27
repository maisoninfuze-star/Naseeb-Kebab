/**
 * Regenerate Combo Watan at its ACTUAL portion size.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHY
 * ═══════════════════════════════════════════════════════════════════
 * The Watan card was built from `watan.png` — a WhatsApp image, not from the
 * studio shoot — and it overstates the combo badly. Counted against the
 * client's own PDF (the source of truth in menu-data-v2.mjs):
 *
 *   menu says   3 kobidah bœuf · 3 kobidah poulet · 2 tikka
 *               · 4 cuisses de poulet · 1 kabab au poulet      = 13 skewers
 *   photo shows 4 rows beef kobidah · 4 rows chicken kobidah
 *               · ~7 tikka chunks · ~9 beef chunks · NO thighs  ≈ 2× the food
 *
 * So it promises more than it serves AND omits the four chicken thighs that
 * are actually in the combo — which is why composite-cards.py had to graft a
 * separate thigh plate on to make the card honest. A photo that needs a patch
 * to tell the truth is the wrong photo.
 *
 * Dostan (DSC09483) and Naseeb (DSC09433) are real shoot frames and already
 * match their specs exactly — they are NOT touched.
 *
 * Two variants because the rice sits in-frame on the Watan shot (on the other
 * combos rice is a separately composited plate, so with/without is free there):
 *   watan-portion-rice   — platter + basmati bowl
 *   watan-portion-norice — platter alone
 *
 * Style is locked to the rest of the set: overhead flat-lay, teal/verdigris
 * rectangular platter with a thin brushed-gold rim, deep near-black slate.
 * 3:2 to drop straight into composite-cards.py where watan.png sits now.
 *
 * ONLY=norice runs a single variant for full-size QA before the pair.
 */
import { fal } from '@fal-ai/client'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const OUT = '/Users/inder/Claude/Projects/Naseeb Kebab/menu-v2/themenu'

/** Shared opening + closing so both variants read as the same shoot. */
const STYLE_A =
  'Ultra high-end overhead flat-lay food photograph, shot straight down. '

/**
 * The portion itself, written to the menu spec. Counts are stated explicitly
 * and the platter is told to be readable rather than packed — an overfilled
 * tray is exactly the failure being corrected.
 */
const PLATTER =
  'A large rectangular platter of DEEP DARK TEAL verdigris matte ceramic — the ' +
  'blue-green of oxidised copper, saturated and dark, never pale sage or mint ' +
  '— with a thin brushed-gold rim, holding a neatly arranged Afghan mixed ' +
  'kabab platter laid out in nine long horizontal parallel rows. ' +
  'The top THREE rows are 3 separate long skewers of BEEF KOBIDAH — minced ' +
  'spiced ground beef moulded around a flat skewer into a long sausage-like ' +
  'log with a deeply rippled ridged surface, dark mahogany brown, charred at ' +
  'the edges. Three rows: one, two, three, stacked one above the next. ' +
  'The middle THREE rows are 3 separate long skewers of CHICKEN KOBIDAH — the ' +
  'same minced-and-moulded ridged log shape but ground chicken, pale ' +
  'golden-orange with charred flecks. Three rows: one, two, three, stacked ' +
  'one above the next. ' +
  'Below them TWO rows are 2 skewers of LAMB TIKKA — irregular thick CUBES of ' +
  'whole marinated lamb, chunky rather than minced. Two rows, one above the ' +
  'other. ' +
  'The bottom row is exactly 4 char-grilled bone-in chicken thighs — four ' +
  'pieces only, thigh portions with crisp burnished skin — beside 1 slim ' +
  'skewer of grilled chicken kabab. ' +
  'Garnished with one grilled tomato half, a few white onion rings and ' +
  'scattered chopped cilantro. The rows are laid out cleanly with the deep ' +
  'teal glaze clearly visible around and between them — a generous but ' +
  'realistic restaurant portion for six people, never an overflowing banquet ' +
  'tray'

const STYLE_B =
  ', set on a deep near-black textured dark slate surface, single soft warm ' +
  'directional light from the upper left falling off steeply into deep ' +
  'shadow, the far corners of the frame sinking to near-black, medium-format ' +
  'editorial food photography, dark moody low-key chiaroscuro, deeply ' +
  'saturated and richly appetizing, razor-sharp focus, generous dark negative ' +
  'space around the platter. Not brightly lit, not flat, not white. No text, ' +
  'no logos, no people, no hands, no utensils, no packaging.'

const VARIANTS = {
  rice:
    PLATTER +
    ', and beside the platter a separate round teal ceramic bowl of steamed ' +
    'white basmati rice topped with a small tuft of parsley',
  norice: PLATTER + ', with only the platter in frame and no rice and no side dishes',
}

const key = process.env.FAL_KEY
if (!key) throw new Error('FAL_KEY not set — source ~/Claude/Projects/shared-keys/fal.env')
fal.config({ credentials: key })
await mkdir(OUT, { recursive: true })

const ONLY = process.env.ONLY
const entries = ONLY ? [[ONLY, VARIANTS[ONLY]]] : Object.entries(VARIANTS)
if (ONLY && !VARIANTS[ONLY]) throw new Error(`unknown variant: ${ONLY}`)

for (const [name, body] of entries) {
  console.log(`\nwatan-portion-${name} …`)
  const res = await fal.subscribe('fal-ai/nano-banana', {
    input: {
      prompt: STYLE_A + body + STYLE_B,
      num_images: 1,
      output_format: 'png',
      aspect_ratio: '3:2',
    },
    logs: false,
  })
  const url = res?.data?.images?.[0]?.url
  if (!url) {
    console.log('  no image returned')
    continue
  }
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer())
  const dest = path.join(OUT, `watan-portion-${name}.png`)
  await writeFile(dest, buf)
  console.log(`  → ${dest}  (${(buf.length / 1024).toFixed(0)} KB)`)
}
