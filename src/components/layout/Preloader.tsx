import { CONFIRMED } from '@/data/site'

/**
 * LOGO FLAME IGNITION — server-rendered, CSS-driven.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHY THIS IS NOT A CLIENT COMPONENT ANY MORE
 * ═══════════════════════════════════════════════════════════════════
 * It used to be `'use client'` with `useState(false)` and an effect that
 * flipped it true on mount. That produces exactly the bug reported: the
 * server sends a page with NO overlay, the browser paints it, React hydrates,
 * and only THEN does the overlay appear. You see the homepage for a split
 * second, then the intro — backwards.
 *
 * There is no way to fix that ordering from inside a client component: the
 * first paint happens before any JS runs. So the overlay now ships in the
 * server HTML, present in the very first frame, and CSS alone animates it
 * away. No JS, no hydration gap, no flash.
 *
 * Because it lives in the root layout it never re-mounts on client-side
 * navigation — so it plays once per real page load, not on every link click.
 *
 * `prefers-reduced-motion` hides it outright (see globals.css). With JS
 * disabled it still animates and still leaves, because it was never JS-driven.
 */
export default function Preloader() {
  return (
    <div className="nk-intro" aria-hidden>
      <div className="nk-intro__inner">
        {/* Ember — a single point of light that swells and seeds the flame. */}
        <span className="nk-intro__ember" />

        <img
          src="/brand/flame-ember.png"
          alt=""
          width={80}
          height={111}
          className="nk-intro__flame"
        />

        <img
          src="/brand/wordmark-cream.png"
          alt={CONFIRMED.name}
          width={720}
          height={720}
          className="nk-intro__mark"
        />
      </div>
    </div>
  )
}
