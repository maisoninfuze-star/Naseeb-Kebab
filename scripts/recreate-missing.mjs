/**
 * Recreate the menu items we never shot (and that Uber has no photo of), in the
 * SAME style as the stone-recoloured real cards: overhead flat-lay, warm greige
 * stone plate, deep near-black ground, warm low-key light.
 *
 * These are openly AI recreations of generic versions of each dish — flagged as
 * such — because no real photo and no Uber reference exists. One consistent
 * style template, dish swapped in, so the set reads as one shoot.
 *
 * ONLY=samosa runs a single item for full-size QA before the batch.
 */
import { fal } from '@fal-ai/client'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const OUT = '/Users/inder/Claude/Projects/Naseeb Kebab/menu-v2/cards'
const RAW = '/Users/inder/Claude/Projects/Naseeb Kebab/menu-v2/cards/_recreated-raw'

const STYLE_A =
  'Ultra high-end overhead flat-lay food photograph. '
const STYLE_B =
  ', served on a warm greige matte stone ceramic plate with a thin brushed-gold rim, ' +
  'on a deep near-black textured dark stone surface, soft warm directional light from ' +
  'the upper left, deep shadows, a few scattered saffron threads and fresh herbs, ' +
  'medium-format editorial food photography, moody and low-key, richly appetizing, ' +
  'razor-sharp focus, generous dark negative space. No text, no logos, no people, ' +
  'no hands, no utensils, no packaging.'

const DISHES = {
  'soupe-lentilles': 'A rustic bowl of Afghan red-lentil soup, warm golden-orange, ' +
    'smooth and steaming, finished with a swirl and a scatter of chopped cilantro',
  'salade-maison': 'A fresh house salad of crisp lettuce, tomato wedges, cucumber, ' +
    'shredded red cabbage, lightly dressed, in a shallow bowl',
  'salade-afghane': 'An Afghan chopped salad of finely diced tomato, cucumber and ' +
    'onion tossed with fresh herbs and a squeeze of lemon',
  'samosa': 'Three crisp golden triangular vegetable samosas, flaky pastry, ' +
    'with a small ramekin of green cilantro chutney',
  'fries': 'A generous portion of crispy golden hand-cut fries, lightly salted',
  'naan': 'One long traditional Afghan naan flatbread, blistered and golden with a ' +
    'brushed sheen and a few nigella seeds, torn edge',
  'burger-poulet': 'A grilled chicken burger — juicy chicken patty, lettuce and tomato ' +
    'in a soft toasted brioche bun — beside a small pile of golden fries',
  'cheeseburger': 'A classic beef cheeseburger with melted cheese, lettuce and house ' +
    'sauce in a toasted brioche bun, beside a small pile of golden fries',
  'wrap-poulet': 'An Afghan chicken-kobidah wrap in a warm flatbread, cut in half and ' +
    'standing to show the grilled chicken, vegetables and sauce, beside golden fries',
}

// wrap-boeuf / wrap-agneau reuse the wrap image (near-identical plating)
const ALIASES = { 'wrap-boeuf': 'wrap-poulet', 'wrap-agneau': 'wrap-poulet' }

if (!process.env.FAL_KEY) throw new Error('FAL_KEY not set')
fal.config({ credentials: process.env.FAL_KEY })
await mkdir(RAW, { recursive: true })

const ONLY = process.env.ONLY
const entries = ONLY ? [[ONLY, DISHES[ONLY]]] : Object.entries(DISHES)
if (ONLY && !DISHES[ONLY]) throw new Error(`unknown dish: ${ONLY}`)

for (const [slug, desc] of entries) {
  try {
    console.log(`\n${slug} …`)
    const res = await fal.subscribe('fal-ai/nano-banana', {
      input: { prompt: STYLE_A + desc + STYLE_B, num_images: 1,
               output_format: 'jpeg', aspect_ratio: '1:1' },
      logs: false,
    })
    const url = res?.data?.images?.[0]?.url
    if (!url) { console.log('  no image'); continue }
    const buf = Buffer.from(await (await fetch(url)).arrayBuffer())
    await writeFile(path.join(RAW, `${slug}.jpg`), buf)
    // square 900 card to match build-cards.py output
    await sharp(buf).resize(900, 900, { fit: 'cover' }).png()
      .toFile(path.join(OUT, `${slug}.png`))
    console.log(`  ${slug}.png  (raw ${(buf.length / 1024 | 0)}kb)`)
  } catch (e) {
    console.log(`  ${slug} FAILED: ${e.message}`)
  }
}

if (!ONLY) {
  for (const [alias, src] of Object.entries(ALIASES)) {
    await sharp(path.join(OUT, `${src}.png`)).toFile(path.join(OUT, `${alias}.png`))
    console.log(`  ${alias}.png  (= ${src})`)
  }
}
console.log(`\nDone → ${OUT}`)
