import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

async function verifySignature(body: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const expected = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  const expectedHex = Array.from(new Uint8Array(expected))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return expectedHex === signature;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { order_id, razorpay_payment_id, razorpay_order_id, razorpay_signature, dev_mode } = await req.json();

    if (!order_id || !razorpay_payment_id) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    // Verify signature (skip in dev mode)
    if (!dev_mode && razorpay_signature && razorpay_order_id && keySecret) {
      const body = `${razorpay_order_id}|${razorpay_payment_id}`;
      const isValid = await verifySignature(body, razorpay_signature, keySecret);
      if (!isValid) {
        // Mark order as failed
        await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${order_id}`, {
          method: "PATCH",
          headers: {
            "apikey": serviceKey,
            "Authorization": `Bearer ${serviceKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ payment_status: "FAILED" }),
        });
        return new Response(JSON.stringify({ error: "Invalid payment signature" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Update order to PAID
    const licenseKey = `lic_${crypto.randomUUID()}`;
    const patchRes = await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${order_id}`, {
      method: "PATCH",
      headers: {
        "apikey": serviceKey,
        "Authorization": `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation",
      },
      body: JSON.stringify({
        payment_status: "PAID",
        payment_id: razorpay_payment_id,
        license_key: licenseKey,
      }),
    });
    const orders = await patchRes.json();

    if (!orders || orders.length === 0) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const order = orders[0];

    // Send purchase confirmation email (fire and forget)
    try {
      await fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "PURCHASE_CONFIRMATION",
          to_email: order.buyer_id,
          order_id: order.id,
          product_id: order.product_id,
          license_key: licenseKey,
        }),
      });
    } catch {
      // Email failure should not block payment verification
    }

    return new Response(JSON.stringify({
      success: true,
      order_id: order.id,
      license_key: licenseKey,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error", details: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
