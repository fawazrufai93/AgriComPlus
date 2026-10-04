-- AgriCom+ v2 migration: secure orders, payments, admin role, stock
-- Run AFTER supabase-schema.sql, then run supabase-seed.sql.
-- Safe to re-run.

-- ─────────────────────────────────────────────
-- 1. Admin role on profiles
-- ─────────────────────────────────────────────
alter table public.profiles add column if not exists role text not null default 'customer';

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Stop users from promoting themselves: role can only be changed by an admin or via the SQL editor.
create or replace function public.protect_profile_role()
returns trigger language plpgsql security definer as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null and not public.is_admin() then
    new.role := old.role;
  end if;
  return new;
end;
$$;
drop trigger if exists protect_profile_role on public.profiles;
create trigger protect_profile_role before update on public.profiles
  for each row execute procedure public.protect_profile_role();

-- Admins can read all profiles (to see customer names/phones on orders)
drop policy if exists "Admins can read all profiles" on public.profiles;
create policy "Admins can read all profiles" on public.profiles for select using (public.is_admin());

-- ─────────────────────────────────────────────
-- 2. Orders: payment fields + locked-down access
-- ─────────────────────────────────────────────
alter table public.orders add column if not exists payment_status text not null default 'pending';
  -- pending | paid | failed | pay_on_delivery
alter table public.orders add column if not exists payment_reference text;
alter table public.orders add column if not exists paid_at timestamptz;
alter table public.orders add column if not exists customer_name text;
alter table public.orders add column if not exists customer_phone text;
alter table public.orders add column if not exists customer_email text;
alter table public.orders add column if not exists stock_deducted boolean not null default false;
alter table public.orders add column if not exists updated_at timestamptz default now();

create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_trace_code_idx on public.orders (trace_code);

-- Remove the old wide-open policies (anyone could read every customer's address & phone,
-- and anyone could insert orders with any price).
drop policy if exists "Anyone can read orders" on public.orders;
drop policy if exists "Anyone can create an order" on public.orders;
drop policy if exists "Owners can update their orders" on public.orders;

drop policy if exists "Owners can read their orders" on public.orders;
create policy "Owners can read their orders" on public.orders for select using (auth.uid() = user_id);

drop policy if exists "Admins can read all orders" on public.orders;
create policy "Admins can read all orders" on public.orders for select using (public.is_admin());

drop policy if exists "Admins can update orders" on public.orders;
create policy "Admins can update orders" on public.orders for update
  using (public.is_admin()) with check (public.is_admin());

-- NOTE: there is intentionally NO insert policy. Orders are created by the
-- /api/create-order serverless function (service role), which recomputes prices
-- from the products table so a customer can't tamper with totals.

-- Keep updated_at fresh
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
drop trigger if exists orders_touch on public.orders;
create trigger orders_touch before update on public.orders
  for each row execute procedure public.touch_updated_at();

-- Public QR verification: anyone with a trace code can see provenance only (no PII).
create or replace function public.get_order_trace(p_trace_code text)
returns table (
  id text, trace_code text, status text, placed_at text, estimated_delivery text,
  farm_ids text[], trace_events jsonb, item_names text[]
)
language sql security definer set search_path = public stable as $$
  select o.id, o.trace_code, o.status, o.placed_at, o.estimated_delivery, o.farm_ids, o.trace_events,
         array(select i->'product'->>'name' from jsonb_array_elements(o.items) i)
  from public.orders o where o.trace_code = p_trace_code limit 1;
$$;
grant execute on function public.get_order_trace(text) to anon, authenticated;

-- ─────────────────────────────────────────────
-- 3. Stock deduction (called once per order by the server after payment / COD)
-- ─────────────────────────────────────────────
create or replace function public.deduct_order_stock(p_order_id text)
returns void language plpgsql security definer set search_path = public as $$
declare
  o record; it jsonb;
begin
  select * into o from public.orders where id = p_order_id for update;
  if not found or o.stock_deducted then return; end if;
  for it in select * from jsonb_array_elements(o.items) loop
    update public.products
       set stock_count = greatest(stock_count - (it->>'quantity')::int, 0),
           in_stock = (stock_count - (it->>'quantity')::int) > 0
     where id = it->'product'->>'id';
  end loop;
  update public.orders set stock_deducted = true where id = p_order_id;
end;
$$;
revoke all on function public.deduct_order_stock(text) from public, anon, authenticated;

-- ─────────────────────────────────────────────
-- 4. Admin write access on catalog
-- ─────────────────────────────────────────────
drop policy if exists "Admins can write products" on public.products;
create policy "Admins can write products" on public.products for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can write farms" on public.farms;
create policy "Admins can write farms" on public.farms for all
  using (public.is_admin()) with check (public.is_admin());

-- ─────────────────────────────────────────────
-- 5. Realtime: customers see status changes live, admins see new orders live
-- ─────────────────────────────────────────────
do $$ begin
  alter publication supabase_realtime add table public.orders;
exception when duplicate_object then null; end $$;

-- ─────────────────────────────────────────────
-- 6. Make yourself admin (replace the email, then run once)
-- ─────────────────────────────────────────────
-- update public.profiles set role = 'admin' where email = 'you@example.com';
