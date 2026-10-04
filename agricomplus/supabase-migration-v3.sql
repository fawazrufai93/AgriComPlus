-- AgriCom+ v3: readable order items + real QR trace lookup
-- Run in Supabase SQL Editor AFTER supabase-migration-v2.sql. Safe to re-run.

-- 1. One row per item ordered (easy to read in Table Editor)
create table if not exists public.order_items (
  id bigserial primary key,
  order_id text not null references public.orders(id) on delete cascade,
  product_id text,
  product_name text,
  unit text,
  quantity integer not null,
  unit_price numeric not null,
  line_total numeric not null,
  created_at timestamptz default now()
);
create index if not exists order_items_order_id_idx on public.order_items (order_id);

alter table public.order_items enable row level security;
drop policy if exists "Owners can read their order items" on public.order_items;
create policy "Owners can read their order items" on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
drop policy if exists "Admins can read all order items" on public.order_items;
create policy "Admins can read all order items" on public.order_items for select
  using (public.is_admin());

-- 2. Keep order_items in sync with orders.items automatically
create or replace function public.sync_order_items()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  delete from public.order_items where order_id = new.id;
  insert into public.order_items (order_id, product_id, product_name, unit, quantity, unit_price, line_total)
  select new.id,
         i->'product'->>'id',
         i->'product'->>'name',
         i->'product'->>'unit',
         (i->>'quantity')::int,
         (i->'product'->>'price')::numeric,
         (i->>'quantity')::int * (i->'product'->>'price')::numeric
  from jsonb_array_elements(new.items) i;
  return new;
end;
$$;
drop trigger if exists orders_sync_items on public.orders;
create trigger orders_sync_items after insert or update of items on public.orders
  for each row execute procedure public.sync_order_items();

-- 3. Backfill existing orders
insert into public.order_items (order_id, product_id, product_name, unit, quantity, unit_price, line_total)
select o.id, i->'product'->>'id', i->'product'->>'name', i->'product'->>'unit',
       (i->>'quantity')::int, (i->'product'->>'price')::numeric,
       (i->>'quantity')::int * (i->'product'->>'price')::numeric
from public.orders o, jsonb_array_elements(o.items) i
where not exists (select 1 from public.order_items x where x.order_id = o.id);

-- 4. One readable row per order: who, what, how much, paid or not
create or replace view public.order_overview with (security_invoker = true) as
select o.created_at, o.id as order_id, o.customer_name, o.customer_phone, o.customer_email,
       (select string_agg(x.quantity || ' x ' || x.product_name, ', ') from public.order_items x where x.order_id = o.id) as items,
       o.subtotal, o.delivery_fee, o.total,
       o.payment_method->>'details' as payment_method, o.payment_status, o.status,
       o.delivery_address->>'area' as area, o.delivery_address->>'landmark' as landmark, o.trace_code
from public.orders o order by o.created_at desc;

-- 5. Public QR lookup also returns the farm names (no personal data)
create or replace function public.get_order_trace(p_trace_code text)
returns table (id text, trace_code text, status text, placed_at text, estimated_delivery text,
               farm_ids text[], trace_events jsonb, item_names text[])
language sql security definer set search_path = public stable as $$
  select o.id, o.trace_code, o.status, o.placed_at, o.estimated_delivery, o.farm_ids, o.trace_events,
         array(select i->'product'->>'name' from jsonb_array_elements(o.items) i)
  from public.orders o where upper(o.trace_code) = upper(trim(p_trace_code)) limit 1;
$$;
grant execute on function public.get_order_trace(text) to anon, authenticated;
