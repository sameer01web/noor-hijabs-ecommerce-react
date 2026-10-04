
-- NOOR HIJABS E-COMMERCE
-- Supabase PostgreSQL schema + RLS
-- Run this migration in Supabase SQL Editor.
-- Payment secrets are NOT stored in this SQL.

create extension if not exists "pgcrypto";

-- ---------- ENUMS ----------
do $$ begin
  create type public.user_role as enum ('customer','admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.order_status as enum ('pending','confirmed','processing','shipped','delivered','cancelled','refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_status as enum ('pending','paid','failed','refunded');
exception when duplicate_object then null; end $$;

-- ---------- PROFILES ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- HELPERS ----------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- Automatically create a profile after Auth signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name',''),
    new.phone
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- ---------- CATEGORIES ----------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- PRODUCTS ----------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  sku text unique,
  description text,
  price numeric(12,2) not null check (price >= 0),
  compare_at_price numeric(12,2) check (compare_at_price is null or compare_at_price >= price),
  stock integer not null default 0 check (stock >= 0),
  low_stock_threshold integer not null default 5 check (low_stock_threshold >= 0),
  color text,
  fabric text,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- ADDRESSES ----------
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  phone text not null,
  address_line1 text not null,
  address_line2 text,
  landmark text,
  city text not null,
  state text not null,
  pincode text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- CART ----------
create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(cart_id, product_id)
);

-- ---------- WISHLIST ----------
create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);

-- ---------- COUPONS ----------
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null check (discount_type in ('percent','fixed')),
  discount_value numeric(12,2) not null check (discount_value >= 0),
  min_order_amount numeric(12,2) not null default 0,
  max_discount numeric(12,2),
  usage_limit integer,
  used_count integer not null default 0,
  starts_at timestamptz,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- ORDERS ----------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  order_number text not null unique,
  status public.order_status not null default 'pending',
  payment_status public.payment_status not null default 'pending',
  payment_method text,
  razorpay_order_id text unique,
  razorpay_payment_id text unique,
  subtotal numeric(12,2) not null check (subtotal >= 0),
  shipping_fee numeric(12,2) not null default 0 check (shipping_fee >= 0),
  discount numeric(12,2) not null default 0 check (discount >= 0),
  total numeric(12,2) not null check (total >= 0),
  coupon_code text,
  shipping_name text not null,
  shipping_phone text not null,
  shipping_address_line1 text not null,
  shipping_address_line2 text,
  shipping_landmark text,
  shipping_city text not null,
  shipping_state text not null,
  shipping_pincode text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  sku text,
  unit_price numeric(12,2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  line_total numeric(12,2) not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

-- ---------- REVIEWS ----------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  review_text text,
  is_approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, product_id)
);

-- ---------- PAYMENT WEBHOOK IDEMPOTENCY ----------
create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_id text not null unique,
  event_type text,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

-- ---------- INDEXES ----------
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_active on public.products(is_active);
create index if not exists idx_product_images_product on public.product_images(product_id);
create index if not exists idx_addresses_user on public.addresses(user_id);
create index if not exists idx_cart_items_cart on public.cart_items(cart_id);
create index if not exists idx_wishlists_user on public.wishlists(user_id);
create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_reviews_product on public.reviews(product_id);

-- ---------- RLS ----------
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.addresses enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlists enable row level security;
alter table public.coupons enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;
alter table public.payment_events enable row level security;

-- Remove broad API privileges. service_role is intentionally not revoked.
revoke all on public.profiles, public.categories, public.products, public.product_images,
  public.addresses, public.carts, public.cart_items, public.wishlists, public.coupons,
  public.orders, public.order_items, public.reviews, public.payment_events
from anon, authenticated;

grant select on public.categories, public.products, public.product_images, public.reviews to anon, authenticated;
grant select, insert, update, delete on public.profiles, public.addresses, public.carts,
  public.cart_items, public.wishlists, public.reviews to authenticated;
grant select on public.orders, public.order_items to authenticated;

-- PROFILES
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select to authenticated
using ((select auth.uid()) = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update to authenticated
using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles for all to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));

-- PUBLIC CATALOG
drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories for select to anon, authenticated
using (is_active = true or (select public.is_admin()));

drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products for select to anon, authenticated
using (is_active = true or (select public.is_admin()));

drop policy if exists product_images_public_read on public.product_images;
create policy product_images_public_read on public.product_images for select to anon, authenticated
using (
  exists (
    select 1 from public.products p
    where p.id = product_id and (p.is_active = true or (select public.is_admin()))
  )
);

-- ADMIN catalog management
drop policy if exists categories_admin_all on public.categories;
create policy categories_admin_all on public.categories for all to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists products_admin_all on public.products;
create policy products_admin_all on public.products for all to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists product_images_admin_all on public.product_images;
create policy product_images_admin_all on public.product_images for all to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));

-- ADDRESSES
drop policy if exists addresses_own_all on public.addresses;
create policy addresses_own_all on public.addresses for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists addresses_admin_all on public.addresses;
create policy addresses_admin_all on public.addresses for all to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));

-- CARTS
drop policy if exists carts_own_all on public.carts;
create policy carts_own_all on public.carts for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- CART ITEMS: ownership is through carts
drop policy if exists cart_items_own_all on public.cart_items;
create policy cart_items_own_all on public.cart_items for all to authenticated
using (exists(select 1 from public.carts c where c.id=cart_id and c.user_id=(select auth.uid())))
with check (exists(select 1 from public.carts c where c.id=cart_id and c.user_id=(select auth.uid())));

-- WISHLISTS
drop policy if exists wishlists_own_all on public.wishlists;
create policy wishlists_own_all on public.wishlists for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- COUPONS: public can read only active coupons; final validation MUST happen server-side.
drop policy if exists coupons_public_read on public.coupons;
create policy coupons_public_read on public.coupons for select to anon, authenticated
using (is_active = true and (starts_at is null or starts_at <= now()) and (expires_at is null or expires_at >= now()));

drop policy if exists coupons_admin_all on public.coupons;
create policy coupons_admin_all on public.coupons for all to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));

-- ORDERS
drop policy if exists orders_own_read on public.orders;
create policy orders_own_read on public.orders for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists orders_admin_all on public.orders;
create policy orders_admin_all on public.orders for all to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));

-- No client insert/update/delete policy for orders:
-- order creation and payment state changes are performed by trusted Edge Functions.

-- ORDER ITEMS
drop policy if exists order_items_own_read on public.order_items;
create policy order_items_own_read on public.order_items for select to authenticated
using (exists(select 1 from public.orders o where o.id=order_id and o.user_id=(select auth.uid())));

drop policy if exists order_items_admin_all on public.order_items;
create policy order_items_admin_all on public.order_items for all to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));

-- REVIEWS
drop policy if exists reviews_public_approved_read on public.reviews;
create policy reviews_public_approved_read on public.reviews for select to anon, authenticated
using (is_approved = true or (select auth.uid()) = user_id or (select public.is_admin()));

drop policy if exists reviews_own_insert on public.reviews;
create policy reviews_own_insert on public.reviews for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists reviews_own_update on public.reviews;
create policy reviews_own_update on public.reviews for update to authenticated
using ((select auth.uid()) = user_id and is_approved = false)
with check ((select auth.uid()) = user_id);

drop policy if exists reviews_own_delete on public.reviews;
create policy reviews_own_delete on public.reviews for delete to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists reviews_admin_all on public.reviews;
create policy reviews_admin_all on public.reviews for all to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));

-- PAYMENT EVENTS: no browser access.
-- service role / Edge Functions bypass RLS.

-- ---------- ADMIN RPC: safe stock update ----------
create or replace function public.decrement_product_stock(p_product_id uuid, p_quantity integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_count integer;
begin
  if p_quantity <= 0 then raise exception 'Invalid quantity'; end if;

  update public.products
  set stock = stock - p_quantity, updated_at = now()
  where id = p_product_id
    and stock >= p_quantity
    and is_active = true;

  get diagnostics updated_count = row_count;
  return updated_count = 1;
end;
$$;

revoke all on function public.decrement_product_stock(uuid, integer) from public, anon, authenticated;
grant execute on function public.decrement_product_stock(uuid, integer) to service_role;

-- ---------- ORDER NUMBER ----------
create or replace function public.generate_order_number()
returns text
language plpgsql
as $$
begin
  return 'NH-' || to_char(now(),'YYYYMMDD') || '-' ||
         upper(substr(replace(gen_random_uuid()::text,'-',''),1,8));
end;
$$;

-- Seed categories (100% Hijab-Only Store)
insert into public.categories(name,slug,sort_order)
values
 ('Printed Hijabs','printed-hijabs',1),
 ('Plain Hijabs','plain-hijabs',2),
 ('Chiffon Hijabs','chiffon-hijabs',3),
 ('Georgette Hijabs','georgette-hijabs',4),
 ('Cotton Hijabs','cotton-hijabs',5),
 ('Silk Hijabs','silk-hijabs',6),
 ('Embroidered Hijabs','embroidered-hijabs',7),
 ('Premium Hijabs','premium-hijabs',8),
 ('New Arrivals','new-arrivals',9),
 ('Best Sellers','best-sellers',10)
on conflict (slug) do nothing;

-- IMPORTANT:
-- After creating your first account, promote ONLY that account to admin:
-- update public.profiles set role='admin' where id='YOUR_AUTH_USER_UUID';
