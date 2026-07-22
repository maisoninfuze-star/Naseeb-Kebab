# Deployment

## Vercel

```bash
npm i -g vercel
vercel            # preview
vercel --prod     # production
```

Framework is detected automatically. No build configuration is needed.

### Environment variables

Optional. Set both or neither.

| Variable | Where |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same page |

Both are `NEXT_PUBLIC_` and ship in the browser bundle. **That is safe here
because Row Level Security does the actual work** — see below.

### The repository is large

`public/img` is roughly 130 MB of generated derivatives, and the 42MP originals
are ~1 GB. Two options:

1. **Commit `public/img`** (simplest; Vercel handles it fine at this size) and
   keep the originals out of git.
2. Move `public/img` to Supabase Storage or a CDN and point `lib/utils.ts` at
   it. Only worth doing if the shoot grows substantially.

Add to `.gitignore` either way:

```
drive-download-*/
*.CR2
```

---

## Supabase

1. Create a project (choose a **Canadian region** if available — it simplifies
   the Law 25 disclosure in the privacy policy).
2. Run `supabase/schema.sql` in the SQL editor.
3. Create the owner's account: **Authentication → Users → Invite user**.
   There is deliberately no self-serve sign-up.

### Why the anon key in the bundle is safe

The `inquiries` table has RLS enabled with a deliberate asymmetry:

- **anon may `INSERT`** — so the public form works.
- **anon may not `SELECT`** — so one customer cannot read another customer's
  phone number, email and event details straight out of the page bundle.

Reads require an authenticated session. If you ever add a policy here, keep
that asymmetry.

---

## Before going live

- [ ] Point the domain at Vercel and confirm `https://naseebkabab.shop` resolves
- [ ] Verify `/robots.txt` and `/sitemap.xml`
- [ ] Confirm `/admin` returns **503** in production until Supabase auth is
      configured — this is intentional; an unauthenticated admin is worse than
      no admin
- [ ] Submit the sitemap in Google Search Console
- [ ] Claim / update the **Google Business Profile** — for a local restaurant
      this drives more traffic than the website itself
- [ ] Work through `DOCS/OWNER-GUIDE.md` with the restaurant

### Analytics (optional)

`lib/analytics.ts` targets Plausible and is a no-op until a script is present.
Add to the layout `<head>`:

```html
<script defer data-domain="naseebkabab.shop" src="https://plausible.io/js/script.js"></script>
```

Plausible is cookie-free, which is why no consent banner is needed under
Québec's Law 25. Swapping in GA4 would require one.

---

## Rebuilding images

The pipeline reads from an absolute path in `scripts/process-images.mjs`:

```
/Users/inder/Claude/Projects/Naseeb Kebab/drive-download-20260721T021114Z-1-001
```

Update that constant if the originals move. The originals are **not** required
to build or deploy — only to regenerate `public/img`.
