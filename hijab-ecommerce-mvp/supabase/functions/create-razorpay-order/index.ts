import { createClient } from "npm:@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: corsHeaders })

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405)

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!
  const publishableKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!
  const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID")
  const razorpaySecret = Deno.env.get("RAZORPAY_KEY_SECRET")

  if (!razorpayKeyId || !razorpaySecret) return json({ error: "Payment gateway is not configured" }, 500)

  const authHeader = req.headers.get("Authorization")
  if (!authHeader?.startsWith("Bearer ")) return json({ error: "Authentication required" }, 401)

  // User-scoped client: reads the user's cart using RLS.
  const userClient = createClient(supabaseUrl, publishableKey, {
    global: { headers: { Authorization: authHeader } }
  })

  const { data: { user }, error: userError } = await userClient.auth.getUser()
  if (userError || !user) return json({ error: "Invalid session" }, 401)

  const body = await req.json()
  const { address_id, coupon_code = null } = body

  if (!address_id) return json({ error: "address_id is required" }, 400)

  const { data: address, error: addressError } = await userClient
    .from("addresses").select("*").eq("id", address_id).single()
  if (addressError || !address) return json({ error: "Delivery address not found" }, 400)

  const { data: cart } = await userClient.from("carts").select("id").eq("user_id", user.id).single()
  if (!cart) return json({ error: "Cart is empty" }, 400)

  const { data: items, error: itemError } = await userClient
    .from("cart_items")
    .select("product_id, quantity, products(id,name,sku,price,stock,is_active)")
    .eq("cart_id", cart.id)

  if (itemError || !items?.length) return json({ error: "Cart is empty" }, 400)

  let subtotal = 0
  const orderItems = []

  for (const item of items) {
    const p = item.products as any
    if (!p || !p.is_active) return json({ error: `Product unavailable: ${item.product_id}` }, 400)
    if (p.stock < item.quantity) return json({ error: `Insufficient stock for ${p.name}` }, 409)
    const line = Number(p.price) * Number(item.quantity)
    subtotal += line
    orderItems.push({
      product_id: p.id,
      product_name: p.name,
      sku: p.sku,
      unit_price: Number(p.price),
      quantity: Number(item.quantity),
      line_total: line
    })
  }

  let discount = 0
  let appliedCoupon = null
  if (coupon_code) {
    const { data: coupon } = await userClient.from("coupons").select("*")
      .eq("code", String(coupon_code).trim().toUpperCase()).eq("is_active", true).maybeSingle()

    const now = Date.now()
    if (coupon &&
        Number(coupon.min_order_amount) <= subtotal &&
        (!coupon.starts_at || new Date(coupon.starts_at).getTime() <= now) &&
        (!coupon.expires_at || new Date(coupon.expires_at).getTime() >= now) &&
        (coupon.usage_limit === null || coupon.used_count < coupon.usage_limit)) {
      discount = coupon.discount_type === "percent"
        ? subtotal * Number(coupon.discount_value) / 100
        : Number(coupon.discount_value)
      if (coupon.max_discount !== null) discount = Math.min(discount, Number(coupon.max_discount))
      discount = Math.min(discount, subtotal)
      appliedCoupon = coupon.code
    }
  }

  const shipping = subtotal - discount >= 999 ? 0 : 79
  const total = Math.max(0, subtotal - discount + shipping)

  // Trusted client for creating the pending order and payment record.
  const secretKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  const admin = createClient(supabaseUrl, secretKey)

  const orderNumber = `NH-${new Date().toISOString().slice(0,10).replaceAll("-","")}-${crypto.randomUUID().replaceAll("-","").slice(0,8).toUpperCase()}`

  const { data: order, error: orderError } = await admin.from("orders").insert({
    user_id: user.id,
    order_number: orderNumber,
    status: "pending",
    payment_status: "pending",
    payment_method: "razorpay",
    subtotal,
    shipping_fee: shipping,
    discount,
    total,
    coupon_code: appliedCoupon,
    shipping_name: address.name,
    shipping_phone: address.phone,
    shipping_address_line1: address.address_line1,
    shipping_address_line2: address.address_line2,
    shipping_landmark: address.landmark,
    shipping_city: address.city,
    shipping_state: address.state,
    shipping_pincode: address.pincode
  }).select().single()

  if (orderError || !order) return json({ error: "Could not create order" }, 500)

  const { error: orderItemsError } = await admin.from("order_items").insert(
    orderItems.map(i => ({ ...i, order_id: order.id }))
  )
  if (orderItemsError) {
    await admin.from("orders").delete().eq("id", order.id)
    return json({ error: "Could not create order items" }, 500)
  }

  const auth = btoa(`${razorpayKeyId}:${razorpaySecret}`)
  const rp = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Basic ${auth}` },
    body: JSON.stringify({
      amount: Math.round(total * 100),
      currency: "INR",
      receipt: orderNumber,
      notes: { supabase_order_id: order.id, user_id: user.id }
    })
  })

  const rpData = await rp.json()
  if (!rp.ok) {
    await admin.from("orders").update({ status: "cancelled" }).eq("id", order.id)
    return json({ error: "Payment order creation failed", details: rpData }, 502)
  }

  await admin.from("orders").update({ razorpay_order_id: rpData.id }).eq("id", order.id)

  return json({
    order_id: order.id,
    order_number: orderNumber,
    razorpay_order_id: rpData.id,
    razorpay_key_id: razorpayKeyId,
    amount: Math.round(total * 100),
    currency: "INR"
  })
})