-- ═══════════════════════════════════════════════════════════════════
-- NASEEB KABAB — Supabase schema
--
-- Run this once in the Supabase SQL editor. Two concerns only:
--   1. inquiries  — catering / event enquiries from the public site
--   2. content    — owner-editable overrides for menu + site copy
--
-- The public site works with none of this present; these tables add the
-- inbox and the admin dashboard on top of it.
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. Inquiries ──────────────────────────────────────────────────
create table if not exists public.inquiries (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  name         text not null,
  phone        text not null,
  email        text not null,
  event_date   date,
  guests       integer,
  occasion     text,
  service_type text check (service_type in ('catering', 'venue')),
  message      text,
  locale       text not null default 'fr' check (locale in ('fr', 'en')),
  status       text not null default 'new' check (status in ('new', 'contacted', 'closed'))
);

create index if not exists inquiries_created_idx on public.inquiries (created_at desc);
create index if not exists inquiries_status_idx  on public.inquiries (status);

alter table public.inquiries enable row level security;

-- Anonymous visitors may SUBMIT an enquiry but may never read them back.
-- Without the explicit select policy, one customer could read another's phone
-- number and event details straight from the anon key in the page bundle.
drop policy if exists "anon can submit" on public.inquiries;
create policy "anon can submit"
  on public.inquiries for insert
  to anon, authenticated
  with check (true);

drop policy if exists "authed can read" on public.inquiries;
create policy "authed can read"
  on public.inquiries for select
  to authenticated
  using (true);

drop policy if exists "authed can update" on public.inquiries;
create policy "authed can update"
  on public.inquiries for update
  to authenticated
  using (true);

-- ── 2. Editable content ───────────────────────────────────────────
-- Overrides for anything in src/data. A row present here wins over the
-- checked-in default, so the owner can change a price or hide a dish without
-- a deploy, and an empty table means the site renders exactly as shipped.
create table if not exists public.menu_overrides (
  id           text primary key,          -- matches MenuItem.id
  name_fr      text,
  name_en      text,
  desc_fr      text,
  desc_en      text,
  price        numeric(10,2),
  image        text,
  available    boolean,
  featured     boolean,
  vegetarian   boolean,
  spicy        boolean,
  display_order integer,
  -- Cleared by the owner once they have confirmed a photo↔dish match.
  review_note  text,
  updated_at   timestamptz not null default now()
);

create table if not exists public.site_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

-- Seed the settings the restaurant has not yet confirmed, so the dashboard
-- shows them as empty fields to fill rather than hiding them.
insert into public.site_settings (key, value) values
  ('hours',         'null'::jsonb),
  ('instagram',     'null'::jsonb),
  ('facebook',      'null'::jsonb),
  ('ordering_url',  'null'::jsonb),
  ('halal',         'null'::jsonb),
  ('parking',       'null'::jsonb),
  ('announcement',  'null'::jsonb),
  ('hero_headline', 'null'::jsonb),
  ('section_visibility', '{}'::jsonb)
on conflict (key) do nothing;

alter table public.menu_overrides enable row level security;
alter table public.site_settings  enable row level security;

-- Content is public to read (the site renders it) and staff-only to write.
drop policy if exists "public read menu" on public.menu_overrides;
create policy "public read menu"
  on public.menu_overrides for select to anon, authenticated using (true);

drop policy if exists "authed write menu" on public.menu_overrides;
create policy "authed write menu"
  on public.menu_overrides for all to authenticated using (true) with check (true);

drop policy if exists "public read settings" on public.site_settings;
create policy "public read settings"
  on public.site_settings for select to anon, authenticated using (true);

drop policy if exists "authed write settings" on public.site_settings;
create policy "authed write settings"
  on public.site_settings for all to authenticated using (true) with check (true);

-- ── 3. Reviews ────────────────────────────────────────────────────
-- Empty by design. The marquee renders nothing until real reviews are added.
create table if not exists public.reviews (
  id         uuid primary key default gen_random_uuid(),
  rating     integer not null check (rating between 1 and 5),
  text       text not null,
  author     text not null,
  source     text not null default 'Google',
  dish       text,
  published  boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.reviews enable row level security;

drop policy if exists "public read published reviews" on public.reviews;
create policy "public read published reviews"
  on public.reviews for select to anon, authenticated using (published = true);

drop policy if exists "authed manage reviews" on public.reviews;
create policy "authed manage reviews"
  on public.reviews for all to authenticated using (true) with check (true);
