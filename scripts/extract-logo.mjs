/**
 * The supplied logo is black + white lettering on a solid orange square.
 * That artwork only works on orange. On charcoal the black "Naseeb" and the
 * black flame disappear; on cream the white "Kabab" disappears.
 *
 * So: treat orange as the background, everything else as the mark, and
 * re-render the mark as a single flat colour with a transparent background.
 * A one-colour wordmark is also simply better identity practice — it survives
 * being placed on photography, which the original never could.
 */
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const SRC =
  '/Users/inder/Claude/Projects/Naseeb Kebab/517965288_17843361972533574_8316071617478738583_n.jpg'
const OUT = path.resolve(process.cwd(), 'public/brand')

// Sampled from the source artwork.
const ORANGE = { r: 0xef, g: 0x5c, b: 0x2b }
// Anything within this Euclidean distance of the orange is treated as ground.
const TOLERANCE = 100

async function buildMask() {
  const { data, info } = await sharp(SRC)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const { width, height, channels } = info
  const alpha = Buffer.alloc(width * height)

  for (let i = 0, p = 0; i < data.length; i += channels, p++) {
    const dr = data[i] - ORANGE.r
    const dg = data[i + 1] - ORANGE.g
    const db = data[i + 2] - ORANGE.b
    const dist = Math.sqrt(dr * dr + dg * dg + db * db)
    // Soft ramp rather than a hard cut, so the lettering keeps its antialiasing.
    const a = Math.max(0, Math.min(1, (dist - TOLERANCE * 0.55) / (TOLERANCE * 0.75)))
    alpha[p] = Math.round(a * 255)
  }

  return { alpha, width, height }
}

async function tint(alpha, width, height, hex, name) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))

  await sharp({
    create: { width, height, channels: 3, background: { r, g, b } },
  })
    .joinChannel(await sharp(alpha, { raw: { width, height, channels: 1 } }).png().toBuffer())
    .png()
    .trim({ threshold: 1 })
    .toFile(path.join(OUT, `${name}.png`))
}

async function run() {
  await mkdir(OUT, { recursive: true })
  const { alpha, width, height } = await buildMask()

  // Full wordmark, one colour, transparent ground.
  await tint(alpha, width, height, '#F2E8D8', 'wordmark-cream')
  await tint(alpha, width, height, '#171411', 'wordmark-charcoal')
  await tint(alpha, width, height, '#F15A24', 'wordmark-ember')

  // The flame sits above the lettering; crop the top third and trim to it.
  const flameSrc = await sharp({
    create: { width, height, channels: 3, background: { r: 0xf2, g: 0xe8, b: 0xd8 } },
  })
    .joinChannel(await sharp(alpha, { raw: { width, height, channels: 1 } }).png().toBuffer())
    .extract({ left: 0, top: 0, width, height: Math.round(height * 0.42) })
    .png()
    .trim({ threshold: 1 })
    .toBuffer()

  await sharp(flameSrc).toFile(path.join(OUT, 'flame-cream.png'))
  await sharp(flameSrc)
    .composite([{ input: Buffer.from([0xf1, 0x5a, 0x24, 255]), raw: { width: 1, height: 1, channels: 4 }, tile: true, blend: 'in' }])
    .toFile(path.join(OUT, 'flame-ember.png'))

  // Keep the original as the social/OG asset — orange square is correct there.
  await sharp(SRC).resize(1200, 1200, { fit: 'cover' }).jpeg({ quality: 88 })
    .toFile(path.join(OUT, 'og-logo.jpg'))

  console.log('brand assets written to', OUT)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
