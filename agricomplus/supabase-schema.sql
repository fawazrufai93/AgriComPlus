-- AgriCom+ Supabase schema & Row Level Security policies
-- Run this once in your Supabase project's SQL editor (Project > SQL Editor > New query).
-- Replaces firebase-applet-config.json (config) and firestore.rules (security rules).

-- ─────────────────────────────────────────────
-- 1. Profiles table (replaces Firestore "users" collection)
--    Supabase Auth already stores email/password in auth.users;
--    this table stores the app-specific profile fields.
-- ─────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  username text,
  email text,
  phone text,
  avatar text,
  addresses jsonb default '[]'::jsonb,
  saved_item_ids text[] default '{}',
  joined_date text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ─────────────────────────────────────────────
-- 2. Orders table (replaces Firestore "orders" collection)
-- ─────────────────────────────────────────────
create table if not exists public.orders (
  id text primary key,
  user_id uuid references auth.users(id) on delete set null,
  trace_code text not null,
  placed_at text,
  items jsonb not null,
  subtotal numeric not null,
  delivery_fee numeric not null,
  total numeric not null,
  delivery_address jsonb not null,
  payment_method jsonb not null,
  status text not null,
  estimated_delivery text,
  farm_ids text[] default '{}',
  trace_events jsonb not null default '[]'::jsonb,
  created_at timestamptz default now()
);

alter table public.orders enable row level security;

-- Public read so QR scanners / recipients can verify provenance, mirroring
-- the original "allow read: if true" rule for /orders/{orderId}.
create policy "Anyone can read orders"
  on public.orders for select
  using (true);

-- Anyone can create an order (covers guest / quick checkout flows).
create policy "Anyone can create an order"
  on public.orders for insert
  with check (true);

-- Only the order's owner can update it.
create policy "Owners can update their orders"
  on public.orders for update
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- 3. Products table (replaces Firestore "products" collection)
--    Publicly readable catalog; writes restricted to admins.
-- ─────────────────────────────────────────────
create table if not exists public.products (
  id text primary key,
  name text not null,
  local_name text,
  category text not null,
  price numeric not null,
  original_price numeric,
  discount_percent numeric,
  unit text,
  weight text,
  images text[] default '{}',
  farm_id text,
  description text,
  health_tags text[] default '{}',
  in_stock boolean default true,
  stock_count integer default 0,
  harvest_date text,
  shelf_life text,
  nutrition_highlights text[] default '{}'
);

alter table public.products enable row level security;

create policy "Anyone can read products"
  on public.products for select
  using (true);

-- ─────────────────────────────────────────────
-- 4. Farms table (replaces Firestore "farms" collection)
-- ─────────────────────────────────────────────
create table if not exists public.farms (
  id text primary key,
  name text not null,
  cluster text,
  location text,
  region text,
  bio text,
  practices text[] default '{}',
  certifications jsonb default '[]'::jsonb,
  photo text,
  farmer_name text,
  farmer_photo text,
  rating numeric,
  reviews_count integer,
  established_year integer,
  phone text,
  lat numeric,
  lng numeric
);

alter table public.farms enable row level security;

create policy "Anyone can read farms"
  on public.farms for select
  using (true);

-- ─────────────────────────────────────────────
-- 5. Admin write access (replaces isAdmin() in firestore.rules)
--    Swap the email below for your own, then uncomment and run these
--    if you need an admin who can write products/farms from the dashboard
--    or via the Supabase client.
-- ─────────────────────────────────────────────
-- create policy "Admin can write products"
--   on public.products for all
--   using (auth.jwt() ->> 'email' = 'you@example.com')
--   with check (auth.jwt() ->> 'email' = 'you@example.com');
--
-- create policy "Admin can write farms"
--   on public.farms for all
--   using (auth.jwt() ->> 'email' = 'you@example.com')
--   with check (auth.jwt() ->> 'email' = 'you@example.com');

-- ─────────────────────────────────────────────
-- 6. Auto-create a profile row whenever a new auth user signs up
--    (keeps profiles in sync the way the old onAuthStateChanged code did)
-- ─────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, username, joined_date)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    to_char(now(), 'Mon YYYY')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
