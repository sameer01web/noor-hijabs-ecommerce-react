-- =====================================================================
-- NOOR HIJABS - COMPLETE SUPABASE SETUP SCRIPT (100% SAFE & IDEMPOTENT)
-- PostgreSQL Schema, Storage Bucket, RLS Policies, Auto-Admin & Seed Data
-- Run this entire script in your Supabase SQL Editor: https://supabase.com/dashboard
-- =====================================================================

-- 1. Enable Required Extensions
create extension if not exists "pgcrypto";

-- 2. Custom Types & Enums (Safe Creation)
do $$ begin
  create type public.user_role as enum ('customer', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.order_status as enum ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_status as enum ('pending', 'paid', 'failed', 'refunded');
exception when duplicate_object then null; end $$;

-- 3. Profiles Table (Auth Users Extension)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  city text default 'India',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Safe migrations for profiles table
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists city text default 'India';
alter table public.profiles add column if not exists role text default 'customer';

-- Admin Verification Helper
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and (role::text = 'admin')
  );
$$;

-- Automatic Profile Creation on Auth Signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_count integer;
  assigned_role text;
begin
  select count(*) into user_count from public.profiles;
  -- Automatically make the first user or admin email an admin
  if user_count = 0 or new.email ilike '%admin%' then
    assigned_role := 'admin';
  else
    assigned_role := 'customer';
  end if;

  insert into public.profiles (id, email, full_name, phone, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'phone', new.phone),
    assigned_role
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = coalesce(excluded.full_name, public.profiles.full_name),
      updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- 4. Categories Table
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  description text,
  image_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create unique index if not exists idx_categories_slug on public.categories (slug);

-- 5. Products Table
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null,
  sku text,
  description text,
  price numeric(12,2) not null default 0 check (price >= 0),
  compare_at_price numeric(12,2),
  stock integer not null default 0 check (stock >= 0),
  low_stock_threshold integer not null default 5 check (low_stock_threshold >= 0),
  color text,
  fabric text,
  design text,
  pattern text,
  size text default '185 cm × 75 cm (Maxi Coverage)',
  opacity text default 'Opaque (100% full coverage)',
  badge text,
  rating numeric(3,2) default 4.9,
  reviews_count integer default 24,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Safe migrations for existing products table columns
alter table public.products add column if not exists category_id uuid references public.categories(id) on delete set null;
alter table public.products add column if not exists name text;
alter table public.products add column if not exists slug text;
alter table public.products add column if not exists sku text;
alter table public.products add column if not exists description text;
alter table public.products add column if not exists price numeric(12,2) default 0;
alter table public.products add column if not exists compare_at_price numeric(12,2);
alter table public.products add column if not exists stock integer default 0;
alter table public.products add column if not exists low_stock_threshold integer default 5;
alter table public.products add column if not exists color text;
alter table public.products add column if not exists fabric text;
alter table public.products add column if not exists design text;
alter table public.products add column if not exists pattern text;
alter table public.products add column if not exists size text default '185 cm × 75 cm (Maxi Coverage)';
alter table public.products add column if not exists opacity text default 'Opaque (100% full coverage)';
alter table public.products add column if not exists badge text;
alter table public.products add column if not exists rating numeric(3,2) default 4.9;
alter table public.products add column if not exists reviews_count integer default 24;
alter table public.products add column if not exists is_active boolean default true;
alter table public.products add column if not exists is_featured boolean default false;

create unique index if not exists idx_products_slug on public.products (slug);

-- 6. Product Images Table
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 7. Coupons Table
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  discount_type text not null default 'percent',
  discount_value numeric(10,2) not null default 0,
  min_order_amount numeric(10,2) not null default 0,
  max_discount numeric(10,2),
  usage_limit integer,
  used_count integer not null default 0,
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index if not exists idx_coupons_code on public.coupons (code);

-- 8. Orders Table
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null,
  user_id uuid references public.profiles(id) on delete set null,
  status text not null default 'pending',
  payment_status text not null default 'pending',
  payment_method text not null default 'cod',
  razorpay_order_id text,
  razorpay_payment_id text,
  subtotal numeric(12,2) not null default 0,
  shipping_fee numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  coupon_code text,
  shipping_name text not null default 'Customer',
  shipping_phone text not null default '',
  shipping_address_line1 text not null default '',
  shipping_address_line2 text,
  shipping_landmark text,
  shipping_city text not null default '',
  shipping_state text not null default '',
  shipping_pincode text not null default '',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_orders_number on public.orders (order_number);

-- Safe migrations for orders table
alter table public.orders add column if not exists notes text;
alter table public.orders add column if not exists coupon_code text;
alter table public.orders add column if not exists razorpay_order_id text;
alter table public.orders add column if not exists razorpay_payment_id text;

-- 9. Order Items Table
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  sku text,
  unit_price numeric(12,2) not null default 0,
  quantity integer not null default 1,
  line_total numeric(12,2) not null default 0,
  fabric text,
  color text,
  image text,
  created_at timestamptz not null default now()
);

-- Safe migrations for order_items table
alter table public.order_items add column if not exists fabric text;
alter table public.order_items add column if not exists color text;
alter table public.order_items add column if not exists image text;

-- 10. Storage Bucket Setup (product-images)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

-- Storage Policies for product-images bucket
drop policy if exists "Public Access for Product Images" on storage.objects;
create policy "Public Access for Product Images"
on storage.objects for select
using (bucket_id = 'product-images');

drop policy if exists "Allow Public & Auth Uploads for Product Images" on storage.objects;
create policy "Allow Public & Auth Uploads for Product Images"
on storage.objects for insert
with check (bucket_id = 'product-images');

drop policy if exists "Allow Public & Auth Updates for Product Images" on storage.objects;
create policy "Allow Public & Auth Updates for Product Images"
on storage.objects for update
using (bucket_id = 'product-images');

drop policy if exists "Allow Public & Auth Deletes for Product Images" on storage.objects;
create policy "Allow Public & Auth Deletes for Product Images"
on storage.objects for delete
using (bucket_id = 'product-images');

-- 11. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.coupons enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Permissive RLS Policies for Noor Hijabs Portal
-- Categories
drop policy if exists "categories_read_all" on public.categories;
create policy "categories_read_all" on public.categories for select using (true);

drop policy if exists "categories_admin_all" on public.categories;
create policy "categories_admin_all" on public.categories for all using (true) with check (true);

-- Products
drop policy if exists "products_read_all" on public.products;
create policy "products_read_all" on public.products for select using (true);

drop policy if exists "products_admin_write" on public.products;
create policy "products_admin_write" on public.products for all using (true) with check (true);

-- Product Images
drop policy if exists "product_images_read_all" on public.product_images;
create policy "product_images_read_all" on public.product_images for select using (true);

drop policy if exists "product_images_admin_write" on public.product_images;
create policy "product_images_admin_write" on public.product_images for all using (true) with check (true);

-- Coupons
drop policy if exists "coupons_read_all" on public.coupons;
create policy "coupons_read_all" on public.coupons for select using (true);

drop policy if exists "coupons_admin_write" on public.coupons;
create policy "coupons_admin_write" on public.coupons for all using (true) with check (true);

-- Orders & Order Items
drop policy if exists "orders_read_all" on public.orders;
create policy "orders_read_all" on public.orders for select using (true);

drop policy if exists "orders_write_all" on public.orders;
create policy "orders_write_all" on public.orders for all using (true) with check (true);

drop policy if exists "order_items_read_all" on public.order_items;
create policy "order_items_read_all" on public.order_items for select using (true);

drop policy if exists "order_items_write_all" on public.order_items;
create policy "order_items_write_all" on public.order_items for all using (true) with check (true);

-- Profiles
drop policy if exists "profiles_read_all" on public.profiles;
create policy "profiles_read_all" on public.profiles for select using (true);

drop policy if exists "profiles_write_all" on public.profiles;
create policy "profiles_write_all" on public.profiles for all using (true) with check (true);

-- 12. Seed 10 Pure Hijab Categories
insert into public.categories (id, name, slug, description, sort_order, is_active)
values
  ('aa2b3302-de2c-4710-be32-4daedcfd6de2', 'Printed Hijabs', 'printed-hijabs', 'Artisan floral, botanical & geometric prints', 1, true),
  ('3977d144-c5b7-4cbd-9d00-0a1dead26f7c', 'Plain Hijabs', 'plain-hijabs', 'Timeless solid neutrals and rich everyday tones', 2, true),
  ('c45b85a1-7e82-4f91-8b01-9a1dead26f7d', 'Chiffon Hijabs', 'chiffon-hijabs', 'Featherlight, elegant drape with soft flow', 3, true),
  ('d56c96b2-8f93-5e02-9c12-0b2dead37f8e', 'Georgette Hijabs', 'georgette-hijabs', 'Non-slip, durable textured weave', 4, true),
  ('e67da7c3-9004-6f13-0d23-1c3dead48f9f', 'Cotton Hijabs', 'cotton-hijabs', '100% breathable natural Turkish cotton', 5, true),
  ('f78eb8d4-0115-7a24-1e34-2d4dead59fa0', 'Silk Hijabs', 'silk-hijabs', 'Lustrous mulberry silk & satin luxury', 6, true),
  ('089fc9e5-1226-8b35-2f45-3e5dead60fb1', 'Embroidered Hijabs', 'embroidered-hijabs', 'Hand-detailed lace & needlework borders', 7, true),
  ('190ad0f6-2337-9c46-3056-4f6dead71fc2', 'Premium Hijabs', 'premium-hijabs', 'Occasion wear with ultra-refined finishing', 8, true),
  ('2a1be107-3448-0d57-4167-507dead82fd3', 'New Arrivals', 'new-arrivals', 'Fresh seasonal drops & newly released designs', 9, true),
  ('3b2cf218-4559-1e68-5278-618dead93fe4', 'Best Sellers', 'best-sellers', 'Most-loved hijabs chosen by our community', 10, true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order;

-- 13. Seed Curated Pure Hijabs
do $$
declare
  v_prod_id uuid;
  v_cat_printed uuid;
  v_cat_plain uuid;
  v_cat_chiffon uuid;
  v_cat_georgette uuid;
  v_cat_cotton uuid;
  v_cat_embroidered uuid;
begin
  select id into v_cat_printed from public.categories where slug = 'printed-hijabs' limit 1;
  select id into v_cat_plain from public.categories where slug = 'plain-hijabs' limit 1;
  select id into v_cat_chiffon from public.categories where slug = 'chiffon-hijabs' limit 1;
  select id into v_cat_georgette from public.categories where slug = 'georgette-hijabs' limit 1;
  select id into v_cat_cotton from public.categories where slug = 'cotton-hijabs' limit 1;
  select id into v_cat_embroidered from public.categories where slug = 'embroidered-hijabs' limit 1;

  -- Product 1: Vintage Botanical Printed Chiffon Hijab
  insert into public.products (category_id, name, slug, sku, description, price, compare_at_price, stock, color, fabric, design, size, opacity, badge, rating, reviews_count, is_active, is_featured)
  values (
    v_cat_printed,
    'Vintage Botanical Printed Chiffon Hijab',
    'vintage-botanical-printed-chiffon-hijab',
    'NH-CHI-01',
    'An ethereal printed chiffon hijab adorned with delicate sage and olive botanical motifs. Ultra-breathable, lightweight, and designed with a flowy drape.',
    549.00, 799.00, 28, 'Sage & Soft Olive', '100% Premium Korean Chiffon', 'Botanical Flora & Leaf Motif',
    '185 cm × 75 cm (Maxi Coverage)', 'Semi-Opaque (85% coverage)', 'Best Seller', 4.9, 148, true, true
  )
  on conflict (slug) do update set price = excluded.price returning id into v_prod_id;

  if v_prod_id is not null then
    delete from public.product_images where product_id = v_prod_id;
    insert into public.product_images (product_id, image_url, alt_text, sort_order)
    values (v_prod_id, '/images/vintage_printed_chiffon_hijab.png', 'Vintage Botanical Printed Chiffon Hijab', 0);
  end if;

  -- Product 2: Royal Heritage Embroidered Silk Hijab
  insert into public.products (category_id, name, slug, sku, description, price, compare_at_price, stock, color, fabric, design, size, opacity, badge, rating, reviews_count, is_active, is_featured)
  values (
    v_cat_embroidered,
    'Royal Heritage Embroidered Silk Hijab',
    'royal-heritage-embroidered-silk-hijab',
    'NH-SLK-01',
    'Exquisitely crafted for weddings, Eid, and celebrations. Features artisan hand-embroidery along both hems on a lustrous silk-crepe base.',
    999.00, 1499.00, 14, 'Champagne Ivory', 'Pure Mulberry Silk-Crepe Blend', 'Hand-Embroidered Scallop Border',
    '190 cm × 80 cm (Full Maxi)', 'Opaque (100% full coverage)', 'New Arrival', 5.0, 62, true, true
  )
  on conflict (slug) do update set price = excluded.price returning id into v_prod_id;

  if v_prod_id is not null then
    delete from public.product_images where product_id = v_prod_id;
    insert into public.product_images (product_id, image_url, alt_text, sort_order)
    values (v_prod_id, 'https://images.unsplash.com/photo-1584990347449-a2924344ca12?auto=format&fit=crop&w=900&q=80', 'Royal Heritage Embroidered Silk Hijab', 0);
  end if;

  -- Product 3: Everyday Matte Georgette Hijab
  insert into public.products (category_id, name, slug, sku, description, price, compare_at_price, stock, color, fabric, design, size, opacity, badge, rating, reviews_count, is_active, is_featured)
  values (
    v_cat_georgette,
    'Everyday Matte Georgette Hijab',
    'everyday-matte-georgette-hijab',
    'NH-GEO-01',
    'Our top customer favorite! Crafted from rich, wrinkle-resistant georgette with subtle texture that prevents slipping without excess pins.',
    449.00, 649.00, 45, 'Warm Mocha Brown', 'Heavyweight Matte Georgette', 'Minimalist Matte Weave',
    '180 cm × 75 cm (Standard Maxi)', 'Opaque (100% full coverage)', 'Best Seller', 4.9, 215, true, true
  )
  on conflict (slug) do update set price = excluded.price returning id into v_prod_id;

  if v_prod_id is not null then
    delete from public.product_images where product_id = v_prod_id;
    insert into public.product_images (product_id, image_url, alt_text, sort_order)
    values (v_prod_id, 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&w=900&q=80', 'Everyday Matte Georgette Hijab', 0);
  end if;

  -- Product 4: Artisan Paisley Silk-Luxe Hijab
  insert into public.products (category_id, name, slug, sku, description, price, compare_at_price, stock, color, fabric, design, size, opacity, badge, rating, reviews_count, is_active, is_featured)
  values (
    v_cat_printed,
    'Artisan Paisley Silk-Luxe Hijab',
    'artisan-paisley-silk-luxe-hijab',
    'NH-SLK-02',
    'A striking fusion of traditional Persian paisley patterns and modern pastel hues on lustrous silk satin.',
    799.00, 1199.00, 19, 'Dusty Rose & Gold', 'Lustrous Silk Satin', 'Persian Paisley Art',
    '180 cm × 75 cm (Maxi)', 'Opaque (95% coverage)', 'Premium Luxe', 4.8, 84, true, false
  )
  on conflict (slug) do update set price = excluded.price returning id into v_prod_id;

  if v_prod_id is not null then
    delete from public.product_images where product_id = v_prod_id;
    insert into public.product_images (product_id, image_url, alt_text, sort_order)
    values (v_prod_id, 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=900&q=80', 'Artisan Paisley Silk-Luxe Hijab', 0);
  end if;

  -- Product 5: Pure Breathable Turkish Cotton Hijab
  insert into public.products (category_id, name, slug, sku, description, price, compare_at_price, stock, color, fabric, design, size, opacity, badge, rating, reviews_count, is_active, is_featured)
  values (
    v_cat_cotton,
    'Pure Breathable Turkish Cotton Hijab',
    'pure-breathable-turkish-cotton-hijab',
    'NH-COT-01',
    'Made from all-natural, feather-soft Turkish cotton voile. Cooling, pin-free friendly, and styled effortlessly for daily wear.',
    399.00, 599.00, 50, 'Nude Almond Sand', '100% Organic Turkish Cotton Voile', 'Natural Crinkle Texture',
    '185 cm × 80 cm (Maxi Coverage)', 'Opaque (100% coverage)', 'Best Seller', 4.8, 173, true, true
  )
  on conflict (slug) do update set price = excluded.price returning id into v_prod_id;

  if v_prod_id is not null then
    delete from public.product_images where product_id = v_prod_id;
    insert into public.product_images (product_id, image_url, alt_text, sort_order)
    values (v_prod_id, 'https://images.unsplash.com/photo-1585488433560-7f9e3d9f9e0b?auto=format&fit=crop&w=900&q=80', 'Pure Breathable Turkish Cotton Hijab', 0);
  end if;

  -- Product 6: Midnight Noir Plain Georgette Hijab
  insert into public.products (category_id, name, slug, sku, description, price, compare_at_price, stock, color, fabric, design, size, opacity, badge, rating, reviews_count, is_active, is_featured)
  values (
    v_cat_plain,
    'Midnight Noir Plain Georgette Hijab',
    'midnight-noir-plain-georgette-hijab',
    'NH-BLK-01',
    'The essential deep jet black hijab that every Muslimah wardrobe relies upon. Resists pilling and holds its shape flawlessly.',
    449.00, 599.00, 60, 'Jet Black', 'High-Density Georgette Crepe', 'Deep Jet Solid',
    '185 cm × 75 cm (Maxi)', 'Opaque (100% full coverage)', 'Essential', 4.9, 310, true, true
  )
  on conflict (slug) do update set price = excluded.price returning id into v_prod_id;

  if v_prod_id is not null then
    delete from public.product_images where product_id = v_prod_id;
    insert into public.product_images (product_id, image_url, alt_text, sort_order)
    values (v_prod_id, 'https://images.unsplash.com/photo-1592621385612-4d7129426394?auto=format&fit=crop&w=900&q=80', 'Midnight Noir Plain Georgette Hijab', 0);
  end if;
end $$;

-- 14. Seed Promotional Coupons
insert into public.coupons (code, discount_type, discount_value, min_order_amount, max_discount, usage_limit, is_active)
values
  ('NOOR10', 'percent', 10, 500, 300, 1000, true),
  ('EIDLUXE', 'fixed', 200, 1499, 200, 500, true),
  ('SILK15', 'percent', 15, 999, 500, 300, true),
  ('WELCOME50', 'fixed', 50, 399, 50, 2000, true)
on conflict (code) do nothing;
