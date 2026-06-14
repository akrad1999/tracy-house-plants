create extension if not exists "pgcrypto";

create type public.order_status as enum (
  'paid',
  'preparing',
  'ready_for_pickup',
  'completed',
  'cancelled'
);

create table public.plants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  botanical_name text not null,
  price_cents integer not null check (price_cents >= 0),
  short_description text not null,
  description text not null,
  care_level text not null check (care_level in ('Easy', 'Moderate', 'Advanced')),
  light text not null,
  water text not null,
  size text not null,
  inventory integer not null default 0 check (inventory >= 0),
  featured boolean not null default false,
  tags text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.plant_images (
  id uuid primary key default gen_random_uuid(),
  plant_id uuid not null references public.plants(id) on delete cascade,
  src text not null,
  alt text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  customer_email text not null,
  customer_name text,
  pickup_notes text,
  status public.order_status not null default 'paid',
  total_cents integer not null check (total_cents >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  plant_id uuid references public.plants(id) on delete set null,
  plant_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0),
  line_total_cents integer generated always as (quantity * unit_price_cents) stored,
  created_at timestamptz not null default now()
);

create index plant_images_plant_id_sort_order_idx on public.plant_images (plant_id, sort_order);
create index plants_active_featured_idx on public.plants (active, featured);
create index orders_profile_id_created_at_idx on public.orders (profile_id, created_at desc);
create index order_items_order_id_idx on public.order_items (order_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger plants_set_updated_at
before update on public.plants
for each row execute function public.set_updated_at();

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

alter table public.plants enable row level security;
alter table public.plant_images enable row level security;
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "Anyone can read active plants"
on public.plants for select
using (active = true);

create policy "Anyone can read images for active plants"
on public.plant_images for select
using (
  exists (
    select 1
    from public.plants
    where plants.id = plant_images.plant_id
      and plants.active = true
  )
);

create policy "Users can read their own profile"
on public.profiles for select
using (auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Users can insert their own profile"
on public.profiles for insert
with check (auth.uid() = id);

create policy "Users can read their own orders"
on public.orders for select
using (auth.uid() = profile_id);

create policy "Users can read items for their own orders"
on public.order_items for select
using (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and orders.profile_id = auth.uid()
  )
);
