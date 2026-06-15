alter table public.profiles
add column if not exists address_line1 text,
add column if not exists address_line2 text,
add column if not exists city text,
add column if not exists state text,
add column if not exists postal_code text,
add column if not exists country text default 'United States';

update public.profiles
set country = 'United States'
where country is null;
