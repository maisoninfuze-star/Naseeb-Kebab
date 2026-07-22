/**
 * Compress hero video with the bundled static ffmpeg.
 * H.264 + faststart (so playback begins before the file finishes downloading),
 * audio stripped since the hero is always muted — an audio track on a muted
 * video is pure wasted bytes.
 */
import { execFileSync } from 'node:child_process'
import { statSync, renameSync, rmSync, existsSync } from 'node:fs'
import ffmpeg from 'ffmpeg-static'

const mb = (p) => (statSync(p).size / 1048576).toFixed(2)

// [file, width, crf] — 1280 is plenty for a background layer under a scrim.
const JOBS = [['public/video/ember-hero.mp4', 1280, 26]]

for (const [file, width, crf] of JOBS) {
  if (!existsSync(file)) { console.log(`skip (missing): ${file}`); continue }
  const before = mb(file)
  const tmp = file.replace(/\.mp4$/, '.tmp.mp4')
  execFileSync(ffmpeg, [
    '-y', '-i', file,
    '-vf', `scale=${width}:-2`,
    '-c:v', 'libx264', '-crf', String(crf), '-preset', 'slow',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    '-an',
    tmp,
  ], { stdio: 'ignore' })
  rmSync(file); renameSync(tmp, file)
  console.log(`${file}: ${before} MB → ${mb(file)} MB`)
}
