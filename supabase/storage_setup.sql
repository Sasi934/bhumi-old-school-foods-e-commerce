-- ============================================================
-- SUPABASE STORAGE SETUP
-- Run this in Supabase SQL Editor AFTER schema_v2.sql
-- ============================================================

-- Create product-images storage bucket (public)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Allow public read access
create policy "Public can view product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- Allow admin to upload images
create policy "Admins can upload product images"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and auth.role() = 'authenticated'
  );

-- Allow admin to update/delete images
create policy "Admins can update product images"
  on storage.objects for update
  using (
    bucket_id = 'product-images'
    and auth.role() = 'authenticated'
  );

create policy "Admins can delete product images"
  on storage.objects for delete
  using (
    bucket_id = 'product-images'
    and auth.role() = 'authenticated'
  );
