alter table public.orders
add column if not exists confirmation_email_sent_at timestamptz,
add column if not exists confirmation_email_last_error text;
