alter table public.profiles
add column if not exists role text not null default 'customer';

alter table public.profiles
drop constraint if exists profiles_role_check;

alter table public.profiles
add constraint profiles_role_check check (role in ('customer', 'admin'));

update public.profiles
set role = 'admin'
where lower(email) in ('radhibanu@yahoo.com', 'akrad1999@gmail.com');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'plant-images',
  'plant-images',
  true,
  10485760,
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
      and policyname = 'Anyone can read plant images'
  ) then
    create policy "Anyone can read plant images"
    on storage.objects for select
    using (bucket_id = 'plant-images');
  end if;
end $$;
