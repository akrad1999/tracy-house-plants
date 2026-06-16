alter table public.orders
add column if not exists pickup_date date,
add column if not exists pickup_time time,
add column if not exists pickup_scheduled_at timestamptz;
