/**
 * NASEEB KABAB — cinematic hero video.
 *
 * Same proven two-step used on the lala masala build:
 *   1. FLUX Pro v1.1 Ultra generates the first frame (16:9)
 *   2. Kling v1.6 pro image-to-video animates it (slow dolly, 5s)
 *   3. poll the queue, download, then compress with ffmpeg
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHY THE VIDEO CONTAINS NO FOOD
 * ═══════════════════════════════════════════════════════════════════
 * Generated food misrepresents a real menu — the earlier image-to-image pass
 * on this project turned basmati into vermicelli and erased the char marks.
 * The lala masala hero solved this by filming ATMOSPHERE instead: floating
 * spices, no dishes. Nothing is claimed about a product, so nothing can be
 * misrepresented, and abstract material is exactly what diffusion is good at.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHY THESE SPECIFIC ELEMENTS — the Afghan research
 * ═══════════════════════════════════════════════════════════════════
 * Afghanistan is Persianate and Central Asian, NOT Arab. So the frame is built
 * only from things that genuinely belong to an Afghan kitchen:
 *
 *   · CHARCOAL EMBERS — charcoal is treated as an ingredient in Afghan
 *     grilling, not merely a heat source. This is the restaurant's own story.
 *   · AFGHAN SPICE PALETTE — green cardamom, cumin, coriander seed, black
 *     pepper, cinnamon bark, dried mint, saffron threads. Warm and aromatic
 *     rather than fiery; Afghan food is not chilli-forward.
 *   · LAPIS BLUE + GOLD — Sar-e-Sang in Badakhshan is the historic world
 *     source of lapis lazuli, deep ultramarine flecked with gold pyrite. It is
 *     the one colour pairing that is unmistakably Afghan rather than
 *     pan-"Middle Eastern", and it already matches the teal-and-gold plates.
 *
 * Explicitly excluded via the negative prompt, as orientalist cliché rather
 * than Afghan reality: genie lamps, lanterns, camels, minarets, scimitars,
 * arabesque tile, Arabic calligraphy (wrong language family — Afghanistan
 * writes Dari Persian and Pashto). Those signal "generic exotic" and read as
 * fake to the Afghan diaspora audience most likely to become regulars.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'

function readFalKey() {
  if (process.env.FAL_KEY) return process.env.FAL_KEY
  // Shared across every project on this machine.
  const line = readFileSync('/Users/inder/Claude/Projects/shared-keys/fal.env', 'utf8')
    .split('\n')
    .find((l) => /^\s*FAL_KEY\s*=/.test(l))
  return line && line.split('=').slice(1).join('=').trim().replace(/^"|"$/g, '')
}

const FAL_KEY = readFalKey()
if (!FAL_KEY) {
  console.error('No FAL_KEY found in env or shared-keys/fal.env')
  process.exit(1)
}
const H = { Authorization: `Key ${FAL_KEY}`, 'Content-Type': 'application/json' }

const FRAME_PROMPT =
  'Cinematic macro photograph of glowing charcoal embers and whole Afghan spices ' +
  'suspended in dark space: green cardamom pods, cumin seeds, coriander seeds, ' +
  'black peppercorns, cinnamon bark, dried mint leaves and fine saffron threads ' +
  'drifting slowly through the air. Live orange embers glow deep in the frame ' +
  'with fine ash and smoke rising. Rich deep lapis-blue shadows with warm ' +
  'ember-orange and antique gold rim light. Shallow depth of field, volumetric ' +
  'haze, subtle film grain, photorealistic, premium food advertising, moody, ' +
  'sophisticated and warm, 16:9.'

const MOTION_PROMPT =
  'Very slow forward dolly drifting through the floating spices and glowing ' +
  'charcoal embers with a premium macro lens. The whole spices turn gently with ' +
  'realistic weight. Embers pulse and breathe, tiny sparks rise and fade, fine ' +
  'ash and smoke curl slowly upward through warm light. Shallow depth of field, ' +
  'deep lapis-blue shadows, restrained gold highlights, cinematic realistic ' +
  'lighting, film grain. Calm, warm and mysterious, like a luxury fragrance film. ' +
  'No camera shake, no fast movement.'

const NEG_FRAME =
  'text, watermark, logo, letters, arabic calligraphy, cartoon, illustration, 3d render, ' +
  'cgi, plates, dishes, bowls, cooked food, meat, plated food, hands, people, ' +
  'lantern, genie lamp, oil lamp, camel, minaret, mosque, scimitar, arabesque tile, ' +
  'moroccan lamp, neon, oversaturated, cluttered, plastic, distorted, deformed'

const NEG_MOTION =
  'text, logo, distortion, warping, morphing, cartoon, oversaturation, fast motion, ' +
  'camera shake, zoom blur, people, hands, plates, food'

async function genFrame() {
  console.log('1/3  generating first frame (FLUX Pro v1.1 Ultra)…')
  const res = await fetch('https://fal.run/fal-ai/flux-pro/v1.1-ultra', {
    method: 'POST',
    headers: H,
    body: JSON.stringify({
      prompt: FRAME_PROMPT,
      aspect_ratio: '16:9',
      num_images: 1,
      output_format: 'jpeg',
      negative_prompt: NEG_FRAME,
    }),
  })
  if (!res.ok) throw new Error(`frame: HTTP ${res.status} ${await res.text()}`)
  const data = await res.json()
  const url = data.images?.[0]?.url
  if (!url) throw new Error('no frame returned')

  const buf = Buffer.from(await (await fetch(url)).arrayBuffer())
  mkdirSync('public/video', { recursive: true })
  writeFileSync('public/video/ember-hero-frame.jpg', buf)
  console.log(`     ✓ first frame saved (${(buf.length / 1024).toFixed(0)} KB)`)
  return url
}

async function submitVideo(image_url) {
  console.log('2/3  submitting image-to-video (Kling v1.6 pro)…')
  const res = await fetch(
    'https://queue.fal.run/fal-ai/kling-video/v1.6/pro/image-to-video',
    {
      method: 'POST',
      headers: H,
      body: JSON.stringify({
        prompt: MOTION_PROMPT,
        image_url,
        duration: '5',
        aspect_ratio: '16:9',
        negative_prompt: NEG_MOTION,
      }),
    },
  )
  if (!res.ok) throw new Error(`submit: HTTP ${res.status} ${await res.text()}`)
  const { request_id } = await res.json()
  writeFileSync('scripts/hero-video-request.txt', request_id)
  console.log(`     ✓ queued ${request_id}`)
  return request_id
}

async function pollDownload(request_id) {
  console.log('3/3  waiting for render…')
  const base = 'https://queue.fal.run/fal-ai/kling-video'
  for (let i = 0; i < 150; i++) {
    const s = await (
      await fetch(`${base}/requests/${request_id}/status`, { headers: H })
    ).json()

    if (s.status === 'COMPLETED') {
      const r = await (await fetch(`${base}/requests/${request_id}`, { headers: H })).json()
      const url = r.video?.url
      if (!url) throw new Error('completed but no video url')
      const buf = Buffer.from(await (await fetch(url)).arrayBuffer())
      mkdirSync('public/video', { recursive: true })
      writeFileSync('public/video/ember-hero.mp4', buf)
      console.log(`     ✓ ember-hero.mp4 (${(buf.length / 1048576).toFixed(2)} MB)`)
      return
    }
    if (s.status === 'FAILED') throw new Error(`render failed: ${JSON.stringify(s)}`)
    if (i % 4 === 0) console.log(`     … ${s.status ?? '?'}`)
    await new Promise((r) => setTimeout(r, 5000))
  }
  throw new Error('timed out — resume with scripts/hero-video-request.txt')
}

const frameUrl = await genFrame()
const reqId = await submitVideo(frameUrl)
await pollDownload(reqId)
console.log('\nDone → public/video/ember-hero.mp4')
console.log('Next: node scripts/compress-video.mjs')
