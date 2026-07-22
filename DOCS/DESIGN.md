# Creative direction & design system
### Naseeb Kabab

---

## 1 · The idea

> **Charcoal first, orange last.**

The brief asked for Dishoom's editorial storytelling and COYA's dark luxury
without copying either. The thing that keeps this from being a pastiche of both
is a single decision: **the site is lit like a grill, not like a nightclub.**

COYA's darkness is nocturnal — cold, glamorous, a room after midnight. Naseeb's
darkness is the darkness *around a fire*: warm black, ember glow, everything
legible because heat is a light source. That is why the palette runs on
`#0E0D0B` (warm black) rather than a true black, and why the only glows in the
build are radial ember fields, never neon.

Dishoom's contribution is structure, not styling: the homepage is one narrative
with a rhythm of dark → paper → dark, and the interior pages behave like pages
of a magazine rather than screens of an app.

The identity is Naseeb's own because of one asset decision. The supplied logo
is black and white lettering on an orange square. Rather than place that square
on the site, the mark was extracted to a **single-colour wordmark on a
transparent ground**, so it can sit on photography. Orange stopped being a
background and became an accent — which is exactly what the brief asked for,
achieved by changing the artwork rather than by using less of it.

---

## 2 · Colour

| Token | Hex | Role |
|---|---|---|
| `warmblack` | `#0E0D0B` | Page ground |
| `charcoal` | `#171411` | Raised surfaces, nav bar |
| `smoked` | `#30251F` | Rare — deep panels |
| `cream` | `#F2E8D8` | Body text on dark; paper sections |
| `sand` | `#D8C7AD` | Secondary text, labels |
| `ember` | `#F15A24` | The flame, CTAs, active states, rules |
| `ember-deep` | `#C9431A` | CTA hover |
| `saffron` | `#C99A42` | Editorial emphasis, admin warnings |
| `herb` | `#52604B` | Vegetarian marker only |

**Distribution, as built:** ~40% charcoal + warm black, ~30% cream + sand,
~15% photography, ~10% ember, ~5% saffron + herb.

**The rule that keeps orange premium:** ember is never a section background.
It appears as a hairline, a 1.5px marker, a button, a hover state, or a glow —
never a fill larger than a button. The two cream sections (Brand Statement,
Afghan Classics) are what make the dark sections read as deliberate rather than
default.

---

## 3 · Type

| | Family | Use |
|---|---|---|
| Display | **Instrument Serif** 400 | All headings, prices in the hero |
| Body | **Manrope** 350–600 | Everything else |

Two families, no more. Instrument Serif was chosen over Cormorant and Bodoni
because it holds up at very large sizes without becoming fragile — the hero
runs to 6.5rem and the letterforms stay warm rather than aristocratic. Bodoni
would have pushed the site toward fashion; Cormorant toward fine dining. Naseeb
is neither: it is generous and warm.

No imitation-Arabic or "ethnic" display face appears anywhere. Afghan identity
is carried by the food, the dish names in their own language, and the geometric
lattice in the footer — not by a novelty font.

**Scale** (fluid, `clamp`):

```
mega     3.2rem → 11rem     reserved
display  2.6rem → 6.5rem    hero, page titles
title    2rem   → 3.9rem    section headings
heading  1.5rem → 2.4rem    sub-sections, dish names
lede     1.05rem→ 1.4rem    supporting paragraphs
```

Headings run at `line-height: 0.94` and `letter-spacing: -0.022em` — tight
enough to feel set rather than typed. Body runs at 1.6 with a 68ch measure on
long-form pages.

**The eyebrow** is the one repeating micro-element across the site: 0.688rem,
600 weight, 0.22em tracking, uppercase, usually preceded by a 2rem ember rule.
It appears in every section and is what visually stitches the pages together.

---

## 4 · Motion

**One easing everywhere:** `cubic-bezier(0.22, 1, 0.36, 1)` (GSAP `power3.out`).
Nothing bounces. Nothing overshoots.

**Ownership is split and never overlaps.** GSAP + ScrollTrigger own everything
scroll-driven. Framer Motion owns menus, modals and UI state. No element is
ever animated by both — that collision is the most common cause of janky
scroll sites.

**One dominant idea per section.** Where the brief listed several effects for a
section, one leads and the rest are subordinate.

| # | Animation | Where | Notes |
|---|---|---|---|
| 1 | Logo Flame Ignition | Preloader | 1.65s. Once per session. Skipped under reduced motion. |
| 2 | Hero Ken Burns | Hero | 1.04 → 1.00 over 14s |
| 3 | Split-Line Typography Reveal | Hero, Statement, Story, Platters | Lines authored, not runtime-split |
| 4 | Smoke Displacement Overlay | Hero | Edges only — never over the dish |
| 5 | Magnetic CTA Hover | Hero | Desktop only, capped at ~6px |
| 6 | Scroll Indicator Loop | Hero | Ember falling down a hairline |
| 7 | Multi-Speed Image Parallax | Classics, Story | Per-plate speeds, 0.10–0.26 |
| 8 | Curtain Mask Reveal | Story, Catering | Panel slides off the image |
| 9 | Asymmetrical Collage Reveal | Classics | Rotations capped at 1.6° |
| 10 | Pinned Fire Sequence | Charcoal Story | Pinned 250vh, 3 chapters, glow rises |
| 11 | Horizontal Scroll Showcase | Signature Dishes | Desktop pin; snap-scroll on touch |
| 12 | Expanding Table Reveal | Platters | 38% → 100% width on scroll |
| 13 | Full-Screen Nav Overlay | Nav | Panel expands, labels stagger up, preview on hover |
| 14 | Crossfade Menu Tabs | Menu Preview | ~420ms, masked image crossfade |
| 15 | Infinite Testimonial Marquee | Reviews | Pauses on hover **and** focus-within |
| 16 | Split-Screen Closing Reveal | Visit | Halves meet, details rise, CTAs land last |
| 17 | Scroll Progress Ember | Global | 2px spring-damped hairline |
| 18 | Cursor Image Preview | Menu page | Fine pointers only |
| 19 | Text Link Arrow Draw | Global | Rule grows 2rem → 3rem on hover |
| 20 | Soft Image Crossfade | Menu Preview, Menu page | |

### Reduced motion is not a blanket kill

`prefers-reduced-motion: reduce` does three specific things:

1. **Lenis never initialises.** Smooth-scroll hijacking is precisely what that
   preference is asking us not to do; native scrolling takes over and every
   ScrollTrigger still fires.
2. **Reveals snap to their final state** rather than being skipped. The CSS
   ships lines translated 105% out of view — skipping would leave every
   headline permanently invisible. This is the failure mode most sites have.
3. **The preloader never runs**, and the marquee stops.

### No-JavaScript

Reveal primitives ship hidden and are released by GSAP. A `<noscript>` block in
the layout resets them, so with JS disabled every headline and paragraph is
readable. A `js` class stamped on `<html>` by an inline script was tried first
and rejected — mutating the root element before hydration *is* a hydration
mismatch.

---

## 5 · Layout

- **Gutter:** `clamp(1.25rem, 5vw, 6rem)`
- **Section rhythm:** `clamp(5rem, 13vh, 11rem)` vertical
- **Grid:** 12 columns on desktop; sections routinely start at column 2 or 7
  rather than filling the width, which is what produces the editorial feel
- **No rounded cards anywhere.** Dish rows are hairline-separated lists; images
  are hard-edged rectangles. The brief's "no generic AI patterns" is enforced
  structurally: there is not one `border-radius` on a content container in the
  build.

### Mobile is designed, not shrunk

| Desktop | Mobile |
|---|---|
| Pinned horizontal showcase | Native snap-scroll carousel |
| Pinned fire sequence | Stacked chapters, no pin |
| Cursor image preview on the menu | Image rendered inline under each dish |
| Magnetic hover | Removed |
| Nav overlay with hover preview | Full-width panel, no hover dependency |
| — | **Sticky Call / Directions / Order bar** after the hero |

The menu page's hover preview is the clearest case: on a fine pointer the image
lives in a sticky column; on a coarse pointer that column disappears and each
photographed dish renders its own image inline. A hover-only image is an image
mobile users can never see.

---

## 6 · Photography

All 119 frames come from one studio session: teal gold-rimmed ceramic, dark
slate, pickled red-onion garnish, consistent warm key light. That consistency is
an asset — the site never has to reconcile two visual worlds.

Four crops are generated per hero frame (16:9, 4:5, 1:1, 9:16) in AVIF and
WebP. **Art direction is by viewport shape, not orientation:** a 3:4 tablet and
a 9:19.5 phone are both "portrait" but want very different crops, so the
breakpoints are `max-aspect-ratio: 0.7` → 9:16 and `max-aspect-ratio: 1.3` →
4:5.

**No image was AI-generated, and no dish was altered.** The brief allowed for
fal.ai re-treatment; it was not needed. The originals are 42MP, well lit, and
already art-directed. The premium feel comes from crop, scrim and typography —
not from re-rendering food that was photographed properly the first time.

Where imagery genuinely does not exist — the grill, the charcoal, the dining
room, the three combo platters — **the design works around the gap rather than
filling it**. The Charcoal Story tells the fire through light instead of
photographs of fire; the platters section is typographic and states plainly
that contents are still to be confirmed. Generating a platter image for a $161
item nobody has photographed would be showing customers a product that was
never cooked.
