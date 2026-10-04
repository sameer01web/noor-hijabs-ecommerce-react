# Noor Hijabs — Supabase production backend

## 1) Database

Run `supabase/migrations/001_noor_hijabs.sql` in Supabase SQL Editor.

Then create your first customer account in the app. Find its UUID in Authentication > Users and run:

```sql
update public.profiles
set role = 'admin'
where id = 'YOUR-AUTH-USER-UUID';
```

Do NOT make normal customers admins.

## 2) Storage

Create a Supabase Storage bucket named `product-images`.

Recommended:
- bucket can be public if product images are public
- do NOT put private customer documents here
- store only image URLs in `product_images`

For production, add Storage policies allowing admins to upload/update/delete product images and public users to read published images.

## 3) Edge Functions

There are two functions:

- `create-razorpay-order`: authenticated customer creates a pending order from their cart. Prices/stock are read from Supabase, not trusted from the browser.
- `razorpay-webhook`: verifies Razorpay webhook signature, handles payment success/failure, and decrements stock.

Install Supabase CLI, then from the project root:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF

supabase functions deploy create-razorpay-order
supabase functions deploy razorpay-webhook
```

## 4) Secrets

Never put these secrets in the React `.env`:

```text
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
SUPABASE_SERVICE_ROLE_KEY
```

Set them as Edge Function secrets:

```bash
supabase secrets set RAZORPAY_KEY_ID=rzp_test_xxx
supabase secrets set RAZORPAY_KEY_SECRET=xxx
supabase secrets set RAZORPAY_WEBHOOK_SECRET=your_random_webhook_secret
```

Supabase automatically provides its server-side variables to Edge Functions. Keep service-role/secret keys server-side only.

## 5) Razorpay dashboard

Create a Razorpay account and test keys first.

Configure a webhook pointing to:

`https://YOUR_PROJECT_REF.supabase.co/functions/v1/razorpay-webhook`

Use the exact same webhook secret that you set as `RAZORPAY_WEBHOOK_SECRET`.

Subscribe to:
- `payment.captured`
- `payment.failed`
- `order.paid`

Start with test mode. Move to live keys only after end-to-end testing.

## 6) React integration

Your React checkout should:
1. Require Supabase login.
2. Save/select a delivery address.
3. Call `create-razorpay-order` with `{ address_id, coupon_code }`.
4. Open Razorpay Checkout using the returned `razorpay_order_id`, `razorpay_key_id`, `amount`, `currency`.
5. After checkout, show a processing/success state.
6. Do NOT mark the order paid from the browser.
7. Wait for the verified webhook to update `orders.payment_status` to `paid` and `status` to `confirmed`.

The webhook is the trusted source of payment state.

## 7) Important production note

The sample webhook handles payment success and stock deduction, but you should add a dedicated transactional SQL function before high-volume production so order status + stock + coupon usage are atomic in one database transaction. Also add an order-expiry/reconciliation job for abandoned Razorpay orders.

For a small MVP, test thoroughly with Razorpay test payments first.

## 8) RLS

The migration intentionally:
- lets the public read active catalog data
- lets customers access only their own profile/address/cart/wishlist/orders
- prevents browsers from directly inserting/updating orders
- gives admin-only catalog/order management
- keeps payment events inaccessible to browser roles

Supabase RLS must remain enabled. Do not disable it to "fix" frontend errors.
