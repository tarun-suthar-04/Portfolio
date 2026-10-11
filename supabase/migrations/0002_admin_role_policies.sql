-- Restrict administrative data access to server-managed admin claims.
-- Safe to apply after the original initial schema has already been installed.

drop policy if exists "Authenticated users can insert works" on public.work;
drop policy if exists "Authenticated users can update works" on public.work;
drop policy if exists "Authenticated users can delete works" on public.work;
drop policy if exists "Admins can insert works" on public.work;
drop policy if exists "Admins can update works" on public.work;
drop policy if exists "Admins can delete works" on public.work;
drop policy if exists "Admins can read all works" on public.work;

create policy "Admins can read all works"
on public.work for select to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can insert works"
on public.work for insert to authenticated
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can update works"
on public.work for update to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can delete works"
on public.work for delete to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Replace media policies so admins can see draft media and other users cannot.
drop policy if exists "Public can read media for published works" on public.media;
drop policy if exists "Authenticated users can insert media" on public.media;
drop policy if exists "Authenticated users can update media" on public.media;
drop policy if exists "Authenticated users can delete media" on public.media;
drop policy if exists "Admins can insert media" on public.media;
drop policy if exists "Admins can update media" on public.media;
drop policy if exists "Admins can delete media" on public.media;

create policy "Public can read media for published works"
on public.media for select to anon, authenticated
using (
  exists (
    select 1 from public.work
    where public.work.id = public.media.work_id
      and public.work.status = 'published'
  )
  or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "Admins can insert media"
on public.media for insert to authenticated
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can update media"
on public.media for update to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can delete media"
on public.media for delete to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Restrict category mutations as well.
drop policy if exists "Authenticated users can insert categories" on public.category;
drop policy if exists "Authenticated users can update categories" on public.category;
drop policy if exists "Authenticated users can delete categories" on public.category;
drop policy if exists "Admins can insert categories" on public.category;
drop policy if exists "Admins can update categories" on public.category;
drop policy if exists "Admins can delete categories" on public.category;

create policy "Admins can insert categories"
on public.category for insert to authenticated
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can update categories"
on public.category for update to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can delete categories"
on public.category for delete to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
