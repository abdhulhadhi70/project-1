-- Photo storage for pieces, logos and cover photos.
--
-- Photos are resized, stripped of location data and watermarked in the
-- browser before upload, so only small WebP files arrive here. The bucket
-- is public to read (photos are on public pages anyway); writing is limited
-- to members of the shop whose folder it is, and to admins.
--
-- Paths: <shop id>/<file>.webp

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('pieces', 'pieces', true, 3145728, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

create policy "shop members add photos" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'pieces' and (
      public.is_admin()
      or (storage.foldername(name))[1] in (select shop_id::text from public.shop_members where user_id = (select auth.uid()))
    )
  );

create policy "shop members replace photos" on storage.objects for update to authenticated
  using (
    bucket_id = 'pieces' and (
      public.is_admin()
      or (storage.foldername(name))[1] in (select shop_id::text from public.shop_members where user_id = (select auth.uid()))
    )
  );

create policy "shop members remove photos" on storage.objects for delete to authenticated
  using (
    bucket_id = 'pieces' and (
      public.is_admin()
      or (storage.foldername(name))[1] in (select shop_id::text from public.shop_members where user_id = (select auth.uid()))
    )
  );
