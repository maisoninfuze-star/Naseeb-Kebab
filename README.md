# Naseeb Kabab

Bilingual (FR/EN) restaurant site for Naseeb Kabab — 3485 Bd Cartier O, Laval, QC.

Next.js 16 · React 19 · TypeScript · Tailwind 4 · GSAP + ScrollTrigger · Lenis ·
Framer Motion · Supabase (optional).

---

## Quick start

```bash
npm install
npm run images      # one-time: builds public/img from the studio originals
npm run dev         # http://localhost:3000 → redirects to /fr
```

The site runs with **no environment variables and no Supabase project**. Supabase
adds two things and nothing else: the catering enquiry inbox, and the admin's
content overrides. Without it the enquiry form shows the phone number rather
than silently dropping a booking.

### Optional: Supabase

```bash
cp .env.example .env.local     # then fill in the two values
```

Run `supabase/schema.sql` once in the Supabase SQL editor. Create the owner's
account by invitation from the Supabase dashboard — there is no self-serve
sign-up.

---

## What is real and what is not

This is the single most important thing to know about this codebase.

**Real, taken from the restaurant:**

- Every dish name, in both languages, and every price — from
  `naseebkabab.shop/menu`.
- The address, phone number and email.
- All 119 photographs, from one studio session.

**Deliberately absent, because the restaurant has not published it:**

- **Dish descriptions.** There are none, anywhere. `descFr` / `descEn` are
  `null` for every item and the UI renders without them rather than inventing
  copy.
- **Opening hours.** The site says "hours to be confirmed — give us a call".
- **The contents of the three combo platters** ($51.70 / $104.50 / $161.70).
- **Social links, and any online ordering platform.**
- **Halal status.** Not claimed anywhere. It is a verifiable claim and must not
  be made until confirmed in writing.
- **The founder story**, the family history, the meaning of the name Naseeb,
  and the opening date. `/story` shows labelled placeholders.

Every gap above is listed with its customer-facing impact at `/admin`.

### Photographs

119 files resolve to **32 distinct dishes** — each was shot 3–6 times (an
overhead and a ¾ pair). `src/data/menu.ts` records the chosen frame plus an
`imageConfidence` for each match:

| Confidence | Meaning |
|---|---|
| `high` | Visually unambiguous. Safe to publish. |
| `medium` | Probable. Worth a glance from the owner. |
| `low` | **Genuinely ambiguous — confirm before publishing.** |
| `null` | Never photographed. |

The `low` cases are real. Sultan Kabab and Mazar Kabab are both large mixed
assortments, the restaurant publishes no contents for either, and they cannot
be told apart from a photograph. The same applies to several of the seven
overlapping curry/stew SKUs. Nothing was guessed silently — every uncertain
match carries a `needsReview` note that surfaces in the dashboard.

**No image on this site was AI-generated.**

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run images` | Rebuild `public/img` from the 42MP originals |
| `npm run logo` | Rebuild brand assets from the source logo |

### The image pipeline

`scripts/process-images.mjs` reads the originals from the Drive download folder
and emits AVIF + WebP in four crops:

| Crop | Ratio | Used for |
|---|---|---|
| `wide` | 16:9 | Full-bleed heroes |
| `ed` | 4:5 | Editorial, collage, signature showcase |
| `sq` | 1:1 | Menu thumbnails, social |
| `tall` | 9:16 | Mobile hero |

Only the 32 hero frames get all four; everything else gets `sq` + `ed`.
Generating the full set for all 119 would produce ~2,800 derivatives for a
shoot containing 32 dishes.

Each image also gets a 20px LQIP painted as a CSS background, so there is no
layout shift and no second request.

### The logo

The supplied artwork is black + white lettering on a solid orange square, which
only works on orange. `scripts/extract-logo.mjs` treats the orange as
background and re-renders the mark as a single flat colour with a transparent
ground, producing cream / charcoal / ember wordmarks and an isolated flame.

---

## Architecture

```
src/
  app/
    [locale]/          fr + en, one page tree
    admin/             not in navigation, not in the sitemap, noindex
    actions/           server actions
  components/
    layout/            nav, footer, preloader, mobile action bar
    home/              one file per homepage section
    menu/              the full menu browser
    ui/                shared primitives
    motion/            Lenis + scroll progress
  data/
    menu.ts            the menu — source of truth
    site.ts            CONFIRMED vs UNCONFIRMED restaurant facts
    dictionary.ts      all brand copy, FR + EN
    gallery.ts         gallery frame list
  lib/
    supabase/          shared / client / server — see note below
```

**Motion ownership is split and never overlaps:** GSAP + ScrollTrigger own
everything scroll-driven; Framer Motion owns menus, modals and UI state. No
element is animated by both.

**`lib/supabase` is three files on purpose.** `server.ts` imports `next/headers`
and is marked `server-only`; `client.ts` is safe in client components; both
share `shared.ts`. A single module breaks the build the moment a client
component imports it.

**Routing.** Both locales share one slug set (`/fr/menu`, `/en/menu`); only the
prefix changes. Localised slugs were considered and rejected — the App Router
resolves one directory per route, so supporting them means duplicated page
files or a catch-all that re-implements routing. One slug set makes the
language toggle a pure prefix swap that can never 404.

---

## Accessibility

- Full keyboard navigation; focus is trapped in the nav overlay and Escape
  closes it, returning focus to the trigger.
- The menu category tabs are a real tablist with arrow-key roving focus.
- Form errors use `aria-live` and `aria-describedby`, not colour alone.
- `prefers-reduced-motion` disables Lenis entirely (hijacking the wheel is
  precisely what that preference asks us not to do), stops the marquee, and
  snaps every reveal to its final state rather than skipping it — skipping
  would leave the text invisible.
- With JavaScript disabled, a `<noscript>` block releases the reveal
  primitives so all copy is readable.

## Performance

- AVIF + WebP with per-crop `srcset`, art-directed by viewport *shape* rather
  than a binary portrait/landscape flag.
- Only the hero is `priority`; everything else lazy-loads.
- Two font families, both `display: swap`.
- No analytics vendor, no cookie banner, no third-party JS on first load.

## Analytics

`lib/analytics.ts` is a thin, cookie-free wrapper. It targets Plausible by
default and is a no-op until one is present, which keeps the site out of
consent-banner territory under Québec's Law 25. Events fired: `order_online_click`,
`menu_view`, `menu_category_click`, `phone_click`, `directions_click`,
`catering_form_start`, `catering_form_submit`, `event_inquiry_submit`,
`language_change`, `platter_view`, `signature_dish_view`.
