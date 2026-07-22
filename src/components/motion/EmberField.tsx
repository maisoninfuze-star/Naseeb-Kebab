/**
 * Floating embers — Concept 1, Scene 1.
 *
 * Pure CSS: each particle is a 2–3px dot with its own duration, delay and
 * horizontal drift, rising and fading out. No canvas, no JS loop, no
 * requestAnimationFrame — the compositor handles it and it costs nothing on
 * the main thread, which matters because the hero also runs Ken Burns and a
 * scrub-linked parallax.
 *
 * Positions are a fixed table rather than Math.random(), for two reasons:
 * random values differ between server and client and would cause a hydration
 * mismatch, and a hand-tuned distribution avoids the clumping that uniform
 * random produces.
 *
 * Decorative, so aria-hidden. Frozen by the reduced-motion rule in globals.css.
 */
const PARTICLES = [
  { left: 6, size: 2, dur: 17, delay: 0, drift: 26, opacity: 0.55 },
  { left: 13, size: 3, dur: 22, delay: 5, drift: -18, opacity: 0.4 },
  { left: 21, size: 2, dur: 15, delay: 9, drift: 34, opacity: 0.6 },
  { left: 28, size: 2, dur: 25, delay: 2, drift: -28, opacity: 0.35 },
  { left: 35, size: 3, dur: 19, delay: 12, drift: 20, opacity: 0.5 },
  { left: 44, size: 2, dur: 21, delay: 7, drift: -34, opacity: 0.45 },
  { left: 52, size: 2, dur: 16, delay: 14, drift: 30, opacity: 0.55 },
  { left: 59, size: 3, dur: 24, delay: 3, drift: -22, opacity: 0.3 },
  { left: 67, size: 2, dur: 18, delay: 10, drift: 24, opacity: 0.5 },
  { left: 74, size: 2, dur: 23, delay: 6, drift: -30, opacity: 0.4 },
  { left: 82, size: 3, dur: 20, delay: 15, drift: 18, opacity: 0.45 },
  { left: 89, size: 2, dur: 26, delay: 1, drift: -24, opacity: 0.35 },
  { left: 95, size: 2, dur: 17, delay: 11, drift: 28, opacity: 0.5 },
]

export default function EmberField({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="ember-particle absolute rounded-full"
          style={
            {
              left: `${p.left}%`,
              bottom: '-4%',
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: 'var(--color-ember)',
              boxShadow: `0 0 ${p.size * 4}px ${p.size}px rgba(241,90,36,0.45)`,
              opacity: p.opacity,
              '--dur': `${p.dur}s`,
              '--delay': `${p.delay}s`,
              '--drift': `${p.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
