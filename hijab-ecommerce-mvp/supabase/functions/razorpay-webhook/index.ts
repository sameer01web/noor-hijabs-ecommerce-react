import { createClient } from "npm:@supabase/supabase-js@2"

const cors = { "Content-Type": "application/json" }

async function hmacSha256(secret: string, body: string) {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  )
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body))
  return Array.from(new Uint8Array(sig)).map(b=>b.toString(16).padStart(2,"0")).join("")
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", {status:405,headers:cors})

  const secret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET")
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  if (!secret || !serviceKey || !supabaseUrl) return new Response("Not configured",{status:500,headers:cors})

  const raw = await req.text()
  const signature = req.headers.get("x-razorpay-signature") || ""
  const expected = await hmacSha256(secret, raw)

  if (signature.length !== expected.length ||
      !crypto.timingSafeEqual(new TextEncoder().encode(signature), new TextEncoder().encode(expected))) {
    return new Response("Invalid signature",{status:401,headers:cors})
  }

  const payload = JSON.parse(raw)
  const eventId = req.headers.get("x-razorpay-event-id") || payload?.event || crypto.randomUUID()
  const admin = createClient(supabaseUrl, serviceKey)

  // Idempotency: Razorpay can retry webhook delivery.
  const { error: existingError } = await admin.from("payment_events").insert({
    provider: "razorpay",
    event_id: eventId,
    event_type: payload.event || null,
    payload
  })
  if (existingError) {
    // Unique violation means the event was already processed.
    return new Response(JSON.stringify({ok:true,duplicate:true}),{headers:cors})
  }

  const payment = payload?.payload?.payment?.entity
  const rpOrderId = payment?.order_id
  if (!rpOrderId) return new Response(JSON.stringify({ok:true}),{headers:cors})

  const { data: order } = await admin.from("orders")
    .select("id,status,payment_status")
    .eq("razorpay_order_id", rpOrderId)
    .single()

  if (!order) return new Response("Order not found",{status:404,headers:cors})

  if (payload.event === "payment.captured" || payload.event === "order.paid") {
    const { data: items } = await admin.from("order_items")
      .select("product_id,quantity").eq("order_id", order.id)

    // Stock is decremented atomically by the DB function.
    for (const item of items || []) {
      if (!item.product_id) continue
      const { data: ok, error } = await admin.rpc("decrement_product_stock", {
        p_product_id: item.product_id,
        p_quantity: item.quantity
      })
      if (error || ok !== true) {
        await admin.from("orders").update({
          status: "pending",
          payment_status: "paid",
          notes: "Payment received but stock reconciliation required."
        }).eq("id",order.id)
        return new Response(JSON.stringify({ok:false,stock_reconciliation_required:true}),{status:500,headers:cors})
      }
    }

    await admin.from("orders").update({
      status:"confirmed",
      payment_status:"paid",
      razorpay_payment_id: payment?.id || null,
      updated_at:new Date().toISOString()
    }).eq("id",order.id)
  }

  if (payload.event === "payment.failed") {
    await admin.from("orders").update({
      payment_status:"failed",
      updated_at:new Date().toISOString()
    }).eq("id",order.id)
  }

  return new Response(JSON.stringify({ok:true}),{headers:cors})
})