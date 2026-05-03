-- Workbooks Storage: bucket row + RLS on storage.objects
--
-- Supabase may warn: "Query has destructive operations" — that refers only to
-- DROP POLICY IF EXISTS below (removes these three policy names if present so
-- CREATE POLICY can run again). It does NOT delete the bucket or uploaded files.
-- Safe to confirm on first run (drops are no-ops if policies never existed).

insert into storage.buckets (id, name, public)
values ('workbooks', 'workbooks', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "workbooks insert own folder" on storage.objects;
drop policy if exists "workbooks public read" on storage.objects;
drop policy if exists "workbooks delete own folder" on storage.objects;

-- Authenticated users may upload only under their user id prefix: {auth.uid()}/...
create policy "workbooks insert own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'workbooks'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "workbooks public read"
  on storage.objects for select to public
  using (bucket_id = 'workbooks');

create policy "workbooks delete own folder"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'workbooks'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
