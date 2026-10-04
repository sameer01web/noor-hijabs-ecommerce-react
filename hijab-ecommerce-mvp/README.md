# Noor Hijabs — React E-commerce Starter

A responsive, production-oriented UI starter for a hijab/modest-fashion e-commerce store.

## Run locally

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal.

## Supabase + production integration

This starter intentionally uses local demo catalog/cart/wishlist data so the UI runs immediately.

Use Antigravity to connect:
- Supabase Auth: email/password, forgot password, account profile
- Supabase tables: products, product_images, categories, profiles, addresses, carts, cart_items, wishlists, orders, order_items, coupons, reviews
- Supabase Storage: product images and user avatars
- Row Level Security on every user-owned table
- Admin roles/policies for catalog, inventory, orders, coupons and customers
- Payment gateway: Razorpay or Cashfree for India (create orders server-side / Edge Function and verify webhook signatures)
- Shipping provider integration if required
- Transactional email/order notifications
- WhatsApp order notification if required

## Suggested Supabase core schema

products:
id uuid, name text, slug text unique, description text, price numeric, compare_at_price numeric, sku text unique, stock integer, category_id uuid, is_active boolean, created_at timestamptz

product_images:
id uuid, product_id uuid, image_url text, sort_order integer

categories:
id uuid, name text, slug text unique, is_active boolean

profiles:
id uuid references auth.users, full_name text, phone text, role text default 'customer', created_at timestamptz

addresses:
id uuid, user_id uuid, name text, phone text, address_line1 text, address_line2 text, city text, state text, pincode text, is_default boolean

orders:
id uuid, user_id uuid, status text, payment_status text, payment_method text, subtotal numeric, shipping_fee numeric, discount numeric, total numeric, shipping_address jsonb, payment_reference text, created_at timestamptz

order_items:
id uuid, order_id uuid, product_id uuid, product_name text, unit_price numeric, quantity integer, line_total numeric

wishlists:
id uuid, user_id uuid, product_id uuid, created_at timestamptz, unique(user_id, product_id)

reviews:
id uuid, user_id uuid, product_id uuid, rating integer, review_text text, is_approved boolean, created_at timestamptz

## Important security

Never put a Supabase service-role key in Vite/client code. Use the anon/publishable key on the client and RLS. Payment secrets and webhook verification belong in a secure server/Edge Function.

## Brand

The current placeholder brand is "Noor Hijabs". Replace the name, logo, imagery, colors and copy with your final brand identity.
