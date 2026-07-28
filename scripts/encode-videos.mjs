/**
 * Encode the client's .mov masters into web-ready MP4 + poster.
 *
 * The masters total 417 MB (one is 4K ProRes-ish h264). Nothing that size can
 * ship — these come down to ~1–2 MB each with no visible loss at the sizes
 * they actually render.
 *
 * ART DIRECTION — which master feeds which breakpoint
 * ═══════════════════════════════════════════════════════════════════
 * The split hero's video panel is ~60% of the width at 85vh. At 1440px that
 * is roughly 864 × 765 — very nearly SQUARE, not landscape. So:
 *
 *   desktop → the 1:1 Square master   (framed for exactly this shape)
 *   mobile  → the 9:16 Reel master    (stacked, full-width, tall)
 *
 * The 4K UHD 16:9 master is deliberately unused: cover-fitting a 16:9 source
 * into a near-square panel throws away a third of the frame, and it is the
 * heaviest file by far. The client already framed a square cut — use it.
 *
 * Audio is stripped: the hero video is always muted, so an audio track is
 * pure wasted bytes.
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, existsSync, statSync } from 'node:fs'
import path from 'node:path'
import ffmpegPath from 'ffmpeg-static'

const SRC = '/Users/inder/Claude/Projects/Naseeb Kebab'
const OUT = path.resolve(process.cwd(), 'public/video')

/**
 * A background hero loops silently behind type — nobody watches 43 seconds of
 * it. Trimming to a 16s loop cuts each file by roughly two thirds with zero
 * perceptible loss, which is the single biggest performance win available
 * here. The .mov masters are untouched if the full cut is ever needed.
 */
const LOOP_SECONDS = 16

/** [source, output slug, target width, target height, crf] */
const JOBS = [
  // Catering — square master for the desktop panel.
  ['NaseebCateringShortSquare.mov', 'catering-desktop', 900, 900, 30],
  // Catering — reel master for stacked mobile.
  ['NaseebCateringShortReel.mov', 'catering-mobile', 720, 1280, 31],
  // Story — one portrait master. Desktop gets a centre-crop to square so we
  // are not shipping pixels the panel will crop away anyway.
  ['story.mov', 'story-desktop', 900, 900, 30],
  ['story.mov', 'story-mobile', 720, 1280, 31],
]

const mb = (p) => (statSync(p).size / 1048576).toFixed(2)

mkdirSync(OUT, { recursive: true })

for (const [file, slug, w, h, crf] of JOBS) {
  const src = path.join(SRC, file)
  if (!existsSync(src)) {
    console.warn(`skip ${slug}: ${file} not found`)
    continue
  }

  const mp4 = path.join(OUT, `${slug}.mp4`)
  // scale to cover, then centre-crop to the exact target box.
  const vf = `scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h}`

  execFileSync(
    ffmpegPath,
    [
      '-y', '-i', src,
      '-t', String(LOOP_SECONDS),
      '-vf', vf,
      '-c:v', 'libx264', '-crf', String(crf), '-preset', 'slow',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart', // start playing before the file finishes
      '-an',                     // muted hero — drop the audio track
      mp4,
    ],
    { stdio: 'ignore' },
  )

  // Poster = first frame. It is the LCP element while the video streams.
  const poster = path.join(OUT, `${slug}-poster.webp`)
  execFileSync(
    ffmpegPath,
    ['-y', '-i', mp4, '-frames:v', '1', '-q:v', '80', poster],
    { stdio: 'ignore' },
  )

  console.log(`${slug}.mp4  ${mb(mp4)} MB   poster ${(statSync(poster).size / 1024).toFixed(0)} KB`)
}

console.log('\nDone →', OUT)
