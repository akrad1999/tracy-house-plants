create table if not exists public.pickup_blackout_slots (
  id uuid primary key default gen_random_uuid(),
  pickup_date date not null,
  pickup_time time not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (pickup_date, pickup_time)
);

create index if not exists pickup_blackout_slots_date_time_idx
on public.pickup_blackout_slots (pickup_date, pickup_time);

drop trigger if exists pickup_blackout_slots_set_updated_at on public.pickup_blackout_slots;

create trigger pickup_blackout_slots_set_updated_at
before update on public.pickup_blackout_slots
for each row execute function public.set_updated_at();

alter table public.pickup_blackout_slots enable row level security;
