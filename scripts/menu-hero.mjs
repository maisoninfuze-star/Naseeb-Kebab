/**
 * Fully-AI hero banner for the printed menu (top of layouts 5a / 5b / 3a).
 *
 * Unlike the dish cards, this is NOT a composite of the real shoot — the owner
 * asked for a fully-generated hero. It still has to obey the menu:
 *   · dark, near-black surroundings so it drops onto the dark page and leaves
 *     the lower band clear for the "Maison Naseeb" title overlay,
 *   · a wide banner ratio,
 *   · print resolution (this goes into a PDF).
 *
 * We generate candidates from two models and let a human pick:
 *   nano-banana (Google Gemini)  — the most natural-looking food
 *   flux-pro ultra               — highest native resolution, very sharp
 * The chosen candidate is then upscaled to print size.
 *
 * Nothing here depicts the restaurant's real plates as real — it is openly a
 * styled hero, the same way any restaurant menu uses a mood shot up top.
 */
import { fal } from '@fal-ai/client'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const OUT = '/Users/inder/Claude/Projects/Naseeb Kebab/menu-v2/hero-candidates'

const PROMPT =
  'Ultra high-end overhead flat-lay food photograph for a fine-dining Afghan ' +
  'kebab restaurant menu hero banner. A generous mixed-grill platter on a dark ' +
  'teal-glazed ceramic plate: long neat rows of charcoal-grilled ground-beef ' +
  'kobidah kebab with visible char marks, golden saffron-marinated chicken ' +
  'tikka, seared lamb, a mound of fluffy long-grain saffron basmati rice, a ' +
  'fire-blistered grilled tomato, fresh cilantro and sumac-dusted red onion ' +
  'slivers. Thin wisps of charcoal smoke drift across the frame catching warm ' +
  'rim light. Dramatic warm directional light from the upper left, deep ' +
  'chiaroscuro shadows, rich saffron-gold and ember-orange highlights against ' +
  'a deep near-black textured dark stone surface with generous empty negative ' +
  'space around the plate. Scattered saffron threads, whole cumin and dried ' +
  'rose petals on the stone. Medium-format editorial food photography, ' +
  'Michelin-grade, moody, low-key, cinematic, exquisitely appetizing, razor ' +
  'sharp focus. No text, no logos, no people, no hands, no utensils.'

const JOBS = [
  { tag: 'nanobanana', model: 'fal-ai/nano-banana', input: {
      prompt: PROMPT, num_images: 2, output_format: 'jpeg', aspect_ratio: '21:9' } },
  { tag: 'flux', model: 'fal-ai/flux-pro/v1.1-ultra', input: {
      prompt: PROMPT, num_images: 2, output_format: 'jpeg',
      aspect_ratio: '21:9', safety_tolerance: '5', enable_safety_checker: false } },
]

if (!process.env.FAL_KEY) throw new Error('FAL_KEY not set')
fal.config({ credentials: process.env.FAL_KEY })
await mkdir(OUT, { recursive: true })

for (const job of JOBS) {
  try {
    console.log(`\n${job.tag}: ${job.model} …`)
    const res = await fal.subscribe(job.model, { input: job.input, logs: false })
    const imgs = res?.data?.images ?? []
    let i = 0
    for (const im of imgs) {
      const buf = Buffer.from(await (await fetch(im.url)).arrayBuffer())
      const p = path.join(OUT, `hero-${job.tag}-${++i}.jpg`)
      await writeFile(p, buf)
      console.log(`  ${path.basename(p)}  (${im.width || '?'}x${im.height || '?'}, ${(buf.length/1024|0)}kb)`)
    }
  } catch (e) {
    console.log(`  ${job.tag} FAILED: ${e.message}`)
  }
}
console.log(`\nDone → ${OUT}`)
