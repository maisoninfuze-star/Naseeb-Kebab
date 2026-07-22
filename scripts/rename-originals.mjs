/**
 * Rename the studio originals from DSC094xx.jpg to dish names.
 *
 * Naming scheme:  {dish-slug}-{DSCid}.jpg
 *          or:    VERIFY-{best-guess}-{DSCid}.jpg
 *
 * Two deliberate decisions:
 *
 * 1. The DSC id STAYS in the filename. It is the only link back to the
 *    original shoot, to `menu.ts`, and to every derivative already generated
 *    in public/img. Dropping it would make the mapping unauditable.
 *
 * 2. Anything the visual audit could not confirm is prefixed `VERIFY-`, so an
 *    alphabetical listing puts every uncertain file together at the top. A
 *    filename is a claim; a file called `sultan-kabab.jpg` that is actually a
 *    Mazar Kabab is a lie that outlives this conversation.
 *
 * Run with --dry to preview. Run with --revert to undo using the embedded id.
 */
import { readdir, rename } from 'node:fs/promises'
import path from 'node:path'

const DIR = '/Users/inder/Claude/Projects/Naseeb Kebab/drive-download-20260721T021114Z-1-001'

/** [firstId, lastId, slug, confirmed] — ranges are inclusive. */
const CLUSTERS = [
  [9428, 9428, 'accessoire-assiette-vide', true],
  [9429, 9433, 'plateau-mixte-sultan-ou-mazar', false],
  [9434, 9436, 'kobidah-mixte', true],
  [9437, 9441, 'cuisses-de-poulet-4x', true],
  [9442, 9442, 'tikka-agneau-ou-boeuf', false],
  [9443, 9445, 'barg-kabab-ou-plateau-mixte', false],
  [9446, 9449, 'poulet-et-kobidah-sultan-ou-mazar', false],
  [9450, 9453, 'poulet-et-barg-mazar-ou-sultan', false],
  [9454, 9457, 'kobidah-de-boeuf', true],
  [9458, 9461, 'kobidah-de-poulet', true],
  [9462, 9465, 'barg-kabab', true],
  [9466, 9469, 'tikka-kabab-ou-kabab-au-poulet', false],
  [9470, 9473, 'chaplee-kabab', true],
  [9475, 9478, 'chopan-kabab', true],
  [9479, 9482, 'tikka-agneau', true],
  [9483, 9488, 'grand-plateau-mixte-sultan-mazar-ou-combo', false],
  [9489, 9491, 'grand-plateau-mixte-avec-riz', false],
  [9492, 9495, 'biryani-au-poulet', true],
  [9496, 9499, 'poisson-bassa', true],
  [9500, 9503, 'riz-nature-accompagnement', true],
  [9504, 9507, 'banjan-burani', true],
  [9508, 9511, 'jarret-agneau-qabuli', true],
  [9512, 9515, 'mantu', true],
  [9516, 9519, 'ragout-rouge-dopiaza-ou-qorma', false],
  [9520, 9523, 'ashak', true],
  [9524, 9527, 'kofta-pulao', true],
  [9528, 9531, 'ragout-vert-qorma-de-veau-ou-sabzi', false],
  [9532, 9533, 'qorma-de-poulet', true],
  [9534, 9535, 'qorma-pulao', true],
  [9536, 9539, 'kofta-ou-aubergine-en-sauce', false],
  [9540, 9543, 'sabzi-pulao', true],
  [9544, 9547, 'firni', true],
]

function targetName(id) {
  const n = Number(id.replace('DSC0', ''))
  const hit = CLUSTERS.find(([lo, hi]) => n >= lo && n <= hi)
  if (!hit) return null
  const [, , slug, confirmed] = hit
  return confirmed ? `${slug}-${id}.jpg` : `VERIFY-${slug}-${id}.jpg`
}

async function run() {
  const dry = process.argv.includes('--dry')
  const revert = process.argv.includes('--revert')
  const files = (await readdir(DIR)).filter((f) => /\.jpe?g$/i.test(f))

  let done = 0
  const unmapped = []

  for (const file of files) {
    const id = (file.match(/DSC\d{5}/) || [])[0]
    if (!id) continue

    const next = revert ? `${id}.jpg` : targetName(id)
    if (!next) {
      unmapped.push(file)
      continue
    }
    if (file === next) continue

    console.log(`${file}  →  ${next}`)
    if (!dry) await rename(path.join(DIR, file), path.join(DIR, next))
    done++
  }

  if (unmapped.length) {
    console.log(`\nNot in any cluster (left untouched): ${unmapped.join(', ')}`)
  }
  console.log(`\n${dry ? 'Would rename' : 'Renamed'} ${done} file(s).`)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
