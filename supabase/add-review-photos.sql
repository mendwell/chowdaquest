-- Adds optional food photo support for reviews.
-- Run once in the Supabase SQL Editor. Safe to run again.

alter table public.reviews
  add column if not exists photo_url text,
  add column if not exists photo_path text,
  add column if not exists photo_alt text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'review-photos',
  'review-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read review photos" on storage.objects;
create policy "Public can read review photos"
on storage.objects
for select
to public
using (bucket_id = 'review-photos');

drop policy if exists "Anyone can upload review photos" on storage.objects;
create policy "Anyone can upload review photos"
on storage.objects
for insert
to anon
with check (bucket_id = 'review-photos');

select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'reviews'
  and column_name in ('photo_url', 'photo_path', 'photo_alt')
order by column_name;
