# SEO

## The one decision that matters most

**The restaurant is in Laval, not Montréal.** The brief listed Montréal
keywords throughout; the site targets **Laval first, Montréal second**.

This is not a detail. Google serves local restaurant results by the searcher's
actual position, and a Laval address competing for "restaurant afghan Montréal"
loses to every restaurant physically in Montréal while ignoring the people who
will actually drive over tonight — Chomedey, Sainte-Dorothée, Laval-des-Rapides,
Vimont, Pont-Viau.

Montréal is kept as secondary reach via `areaServed`, not as the primary target.

### Priority terms

| Tier | Terms |
|---|---|
| Primary | restaurant afghan Laval · cuisine afghane Laval · kabab Laval · afghan restaurant Laval |
| Secondary | Sultan Kabab · Chopan Kabab · Qabuli · Mantu · Ashak · Banjan Burani (dish-name search is high-intent and low-competition) |
| Tertiary | traiteur afghan Laval · plats à partager Laval · afghan catering Laval |
| Reach | restaurant afghan Montréal · cuisine afghane Montréal |

**Not targeted:** anything containing "halal". The restaurant has not confirmed
it. It is a strong term in this market and should be added the moment it is
confirmed in writing — but a wrong halal claim is a trust failure, not an SEO
one.

---

## Implemented

**Metadata** — unique title + description per page per locale; Open Graph and
Twitter cards; canonical URLs; `hreflang` alternates on every page with
`x-default` → `/fr`.

**Structured data**
- `Restaurant` / `LocalBusiness` on every page — name, address, geo, phone,
  email, `servesCuisine: Afghan`, `priceRange`, `areaServed`.
- `Menu` + `MenuSection` + `MenuItem` on `/menu`, generated from the real data
  with real prices in CAD.

Two things are **deliberately omitted** from the schema:

- `openingHoursSpecification` — not published by the restaurant. A wrong
  opening hour in a rich result sends a customer to a locked door, which is
  worse than no hours at all.
- Any halal marker.

Both appear automatically once the values exist.

**`sitemap.xml`** — both locales, hreflang alternates per entry, priority
weighted (home 1.0, menu 0.9, catering/visit 0.8). `/admin` and `/order` are
excluded.

**`robots.txt`** — allows everything except `/admin` (which holds customer
phone numbers and event details) and `/order` (a redirect stub).

**Images** — real alt text derived from real dish names. No invented scene
descriptions; the alt says what the dish is and that it is a studio photograph,
which is what it is.

**Language** — correct `lang` attribute per locale, and French is the default
because the restaurant is in Laval.

---

## What will move the needle more than any of this

1. **Google Business Profile.** For a neighbourhood restaurant this outranks
   the website as a traffic source. Hours, photos, menu link, and replies to
   reviews.
2. **Opening hours everywhere.** The single most-searched fact about a
   restaurant, currently missing.
3. **Dish descriptions.** 50 dishes with one or two real sentences each is 50
   pages' worth of indexable, high-intent content. Right now the menu page is
   names and prices — thin for search, and thin for a hungry customer deciding.
4. **The combo contents.** "Combo Watan $161.70" with no description will not
   convert and will not rank.
5. **Real Google reviews** surfaced on the site, once there are some to surface.
