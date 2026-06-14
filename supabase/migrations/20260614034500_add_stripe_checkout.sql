alter table public.orders
add column if not exists stripe_session_id text,
add column if not exists stripe_payment_intent_id text,
add column if not exists pickup_status text not null default 'Preparing'
  check (pickup_status in ('Paid', 'Preparing', 'Ready for Pickup', 'Completed', 'Cancelled'));

create unique index if not exists orders_stripe_session_id_key
on public.orders (stripe_session_id)
where stripe_session_id is not null;

create or replace function public.finalize_stripe_checkout_order(
  p_stripe_session_id text,
  p_stripe_payment_intent_id text,
  p_profile_id uuid,
  p_customer_email text,
  p_customer_name text,
  p_total_cents integer,
  p_items jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_order_id uuid;
  new_order_id uuid;
  checkout_item record;
  changed_rows integer;
begin
  select id into existing_order_id
  from public.orders
  where stripe_session_id = p_stripe_session_id;

  if existing_order_id is not null then
    return existing_order_id;
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Order items are required';
  end if;

  if p_profile_id is not null then
    insert into public.profiles (id, email, full_name)
    values (p_profile_id, p_customer_email, p_customer_name)
    on conflict (id) do update
    set
      email = excluded.email,
      full_name = coalesce(public.profiles.full_name, excluded.full_name);
  end if;

  -- Inventory is decremented only inside this payment-confirmed transaction.
  for checkout_item in
    select *
    from jsonb_to_recordset(p_items) as item(
      plant_id uuid,
      plant_name text,
      quantity integer,
      unit_price_cents integer
    )
  loop
    if checkout_item.quantity <= 0 then
      raise exception 'Invalid quantity for %', checkout_item.plant_id;
    end if;

    update public.plants
    set inventory = inventory - checkout_item.quantity
    where id = checkout_item.plant_id
      and active = true
      and inventory >= checkout_item.quantity;

    get diagnostics changed_rows = row_count;

    if changed_rows <> 1 then
      raise exception 'Insufficient inventory for %', checkout_item.plant_id;
    end if;
  end loop;

  insert into public.orders (
    profile_id,
    customer_email,
    customer_name,
    status,
    pickup_status,
    total_cents,
    stripe_session_id,
    stripe_payment_intent_id
  )
  values (
    p_profile_id,
    p_customer_email,
    p_customer_name,
    'paid',
    'Preparing',
    p_total_cents,
    p_stripe_session_id,
    p_stripe_payment_intent_id
  )
  returning id into new_order_id;

  for checkout_item in
    select *
    from jsonb_to_recordset(p_items) as item(
      plant_id uuid,
      plant_name text,
      quantity integer,
      unit_price_cents integer
    )
  loop
    insert into public.order_items (order_id, plant_id, plant_name, quantity, unit_price_cents)
    values (new_order_id, checkout_item.plant_id, checkout_item.plant_name, checkout_item.quantity, checkout_item.unit_price_cents);
  end loop;

  return new_order_id;
exception
  when unique_violation then
    select id into existing_order_id
    from public.orders
    where stripe_session_id = p_stripe_session_id;

    if existing_order_id is not null then
      return existing_order_id;
    end if;

    raise;
end;
$$;
