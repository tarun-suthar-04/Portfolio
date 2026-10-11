-- ============================================================
-- Tarun Visual Works
-- Initial Supabase schema
-- ============================================================

create extension if not exists "pgcrypto";


-- ============================================================
-- CATEGORY
-- ============================================================

create table public.category (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  display_order integer not null default 0
);


-- ============================================================
-- WORK
-- ============================================================

create table public.work (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  category_id uuid not null references public.category(id)
    on update cascade
    on delete restrict,
  status text not null default 'draft'
    check (status in ('draft', 'published')),
  featured boolean not null default false,
  tools_used text[] not null default '{}',
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);


-- ============================================================
-- MEDIA
-- ============================================================

create table public.media (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references public.work(id)
    on update cascade
    on delete cascade,
  type text not null
    check (type in ('image', 'video')),
  url text not null,
  thumbnail_url text,
  public_id text not null,
  alt_text text,
  caption text,
  duration numeric,
  display_order integer not null default 0,
  aspect_ratio numeric not null
    check (aspect_ratio > 0)
);


-- ============================================================
-- INDEXES
-- ============================================================

create index idx_work_category_id
  on public.work(category_id);

create index idx_work_status
  on public.work(status);

create index idx_work_display_order
  on public.work(display_order);

create index idx_media_work_id
  on public.media(work_id);

create index idx_media_display_order
  on public.media(display_order);


-- ============================================================
-- SEED CATEGORIES
-- ============================================================

insert into public.category
  (name, slug, display_order)
values
  ('Design', 'design', 1),
  ('Poster', 'poster', 2),
  ('Photo Edit', 'photo-edit', 3),
  ('AI Image', 'ai-image', 4),
  ('AI Portrait', 'ai-portrait', 5),
  ('Video', 'video', 6),
  ('AI Video', 'ai-video', 7),
  ('Experiments', 'experiments', 8);


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.category enable row level security;
alter table public.work enable row level security;
alter table public.media enable row level security;


-- ============================================================
-- PUBLIC READ POLICIES
-- ============================================================

create policy "Public can read categories"
on public.category
for select
to anon, authenticated
using (true);


create policy "Public can read published works"
on public.work
for select
to anon, authenticated
using (status = 'published');

create policy "Admins can read all works"
on public.work
for select
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');


create policy "Public can read media for published works"
on public.media
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.work
    where public.work.id = public.media.work_id
      and public.work.status = 'published'
  )
  or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);


-- ============================================================
-- AUTHENTICATED ADMIN WRITE POLICIES
-- ============================================================

create policy "Admins can insert works"
on public.work
for insert
to authenticated
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');


create policy "Admins can update works"
on public.work
for update
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');


create policy "Admins can delete works"
on public.work
for delete
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');


create policy "Admins can insert media"
on public.media
for insert
to authenticated
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');


create policy "Admins can update media"
on public.media
for update
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');


create policy "Admins can delete media"
on public.media
for delete
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');


create policy "Admins can insert categories"
on public.category
for insert
to authenticated
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');


create policy "Admins can update categories"
on public.category
for update
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');


create policy "Admins can delete categories"
on public.category
for delete
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
