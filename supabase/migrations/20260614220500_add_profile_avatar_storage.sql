insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-avatars',
  'profile-avatars',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Anyone can read profile avatars'
  ) then
    create policy "Anyone can read profile avatars"
    on storage.objects for select
    using (bucket_id = 'profile-avatars');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Users can upload their own profile avatar'
  ) then
    create policy "Users can upload their own profile avatar"
    on storage.objects for insert
    with check (
      bucket_id = 'profile-avatars'
      and auth.uid()::text = (storage.foldername(name))[1]
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Users can update their own profile avatar'
  ) then
    create policy "Users can update their own profile avatar"
    on storage.objects for update
    using (
      bucket_id = 'profile-avatars'
      and auth.uid()::text = (storage.foldername(name))[1]
    )
    with check (
      bucket_id = 'profile-avatars'
      and auth.uid()::text = (storage.foldername(name))[1]
    );
  end if;
end $$;
