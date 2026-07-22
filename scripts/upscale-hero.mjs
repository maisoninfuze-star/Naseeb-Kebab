/**
 * Upscale the chosen fully-AI hero to print resolution.
 *
 * aura-sr is a faithful GAN super-resolver (not a creative diffusion upscaler),
 * so it adds pixels without re-imagining the food. The hero is already a
 * generated image, so there is no real-photo fidelity rule to worry about here
 * — we just want it sharp at print size.
 */
import { fal } from '@fal-ai/client'
import { readFile, writeFile } from 'node:fs/promises'
import sharp from 'sharp'
import path from 'node:path'

const IN = process.argv[2]
const OUT = process.argv[3]
if (!IN || !OUT) throw new Error('usage: upscale-hero.mjs <in.jpg> <out.jpg>')
if (!process.env.FAL_KEY) throw new Error('FAL_KEY not set')
fal.config({ credentials: process.env.FAL_KEY })

const url = await fal.storage.upload(
  new File([await readFile(IN)], path.basename(IN), { type: 'image/jpeg' }))

console.log('aura-sr 4x …')
const res = await fal.subscribe('fal-ai/aura-sr', {
  input: { image_url: url, upscaling_factor: 4 }, logs: false,
})
const out = res?.data?.image?.url
if (!out) throw new Error('no upscaled image returned')

const buf = Buffer.from(await (await fetch(out)).arrayBuffer())
// 4x from 1536 = 6144; 3200 wide is plenty for the print band and keeps files sane.
const final = await sharp(buf).resize(3200, null, { withoutEnlargement: true })
  .jpeg({ quality: 94, mozjpeg: true }).toBuffer()
await writeFile(OUT, final)
const m = await sharp(final).metadata()
console.log(`  ${OUT}  ${m.width}x${m.height}  ${(final.length/1024|0)}kb`)
