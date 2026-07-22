/**
 * Score the cached mattes for the ten dishes the printed menu uses, so we know
 * which can be composited and which need re-segmenting, BEFORE spending on any
 * generation. Raggedness = perimeter / (2·sqrt(pi·area)); a clean plate blob
 * scores ~1.0-1.3, a torn or holed matte scores well above 1.45.
 */
import sharp from 'sharp'
import { existsSync } from 'node:fs'
import path from 'node:path'

const BG_DIR = path.resolve(process.cwd(), '.cache/backgrounds')

const CANDIDATES = {
  'chicken-kobidah': ['DSC09461'],
  'chicken-thigh':   ['DSC09441'],
  'chicken-kabab':   ['DSC09467'],
  'tikka-kabab':     ['DSC09480'],
  'barg-kabab':      ['DSC09463'],
  'naseeb-special':  ['DSC09484', 'DSC09487'],
  'beef-kobidah':    ['DSC09454'],
  'sultan-kabab':    ['DSC09430'],
  'kobidah-mix':     ['DSC09435'],
  'mazar-kabab':     [],            // no matte cached for any 09429-33 frame
}

async function score(mattePath) {
  const { data, info } = await sharp(mattePath)
    .toColourspace('b-w').raw().toBuffer({ resolveWithObject: true })
  const { width, height } = info
  let on = 0, perim = 0
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[y * width + x] <= 16) continue
      on++
      const edge =
        x === 0 || y === 0 || x === width - 1 || y === height - 1 ||
        data[y * width + x - 1] <= 16 || data[y * width + x + 1] <= 16 ||
        data[(y - 1) * width + x] <= 16 || data[(y + 1) * width + x] <= 16
      if (edge) perim++
    }
  }
  if (!on) return null
  return { coverage: on / (width * height), raggedness: perim / (2 * Math.sqrt(Math.PI * on)) }
}

for (const [slug, ids] of Object.entries(CANDIDATES)) {
  if (!ids.length) { console.log(`${slug.padEnd(17)} —        NO MATTE — needs segmentation`); continue }
  for (const id of ids) {
    const p = path.join(BG_DIR, `matte-${id}.png`)
    if (!existsSync(p)) { console.log(`${slug.padEnd(17)} ${id}  MISSING`); continue }
    const s = await score(p)
    const verdict = !s ? 'EMPTY' : s.raggedness > 1.45 ? 'REJECT' : s.raggedness > 1.30 ? 'marginal' : 'ok'
    console.log(`${slug.padEnd(17)} ${id}  cov=${(s.coverage * 100).toFixed(1)}%  ragged=${s.raggedness.toFixed(2)}  ${verdict}`)
  }
}
