alter table public.orders
add column if not exists checkout_success_viewed_at timestamptz,
add column if not exists schedule_reminder_due_at timestamptz,
add column if not exists schedule_reminder_email_sent_at timestamptz,
add column if not exists schedule_reminder_email_last_error text,
add column if not exists admin_notification_email_sent_at timestamptz,
add column if not exists admin_notification_email_last_error text,
add column if not exists pickup_confirmation_email_last_error text;

create index if not exists orders_schedule_reminder_due_idx
on public.orders (schedule_reminder_due_at)
where schedule_reminder_email_sent_at is null
  and pickup_date is null
  and status <> 'cancelled';
