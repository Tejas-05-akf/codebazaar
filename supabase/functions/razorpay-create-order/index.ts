import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { product_id, buyer_id } = await req.json();

    if (!product_id || !buyer_id) {
      return new Response(JSON.stringify({ error: "Missing product_id or buyer_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Fetch product
    const productRes = await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${product_id}&select=id,title,price,seller_id,status`, {
      headers: {
        "apikey": serviceKey,
        "Authorization": `Bearer ${serviceKey}`,
      },
    });
    const products = await productRes.json();
    if (!products || products.length === 0) {
      return new Response(JSON.stringify({ error: "Product not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const product = products[0];
    if (product.status !== "APPROVED") {
      return new Response(JSON.stringify({ error: "Product not available" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if already purchased
    const orderRes = await fetch(
      `${supabaseUrl}/rest/v1/orders?buyer_id=eq.${buyer_id}&product_id=eq.${product_id}&payment_status=eq.PAID&select=id`,
      {
        headers: {
          "apikey": serviceKey,
          "Authorization": `Bearer ${serviceKey}`,
        },
      }
    );
    const existingOrders = await orderRes.json();
    if (existingOrders && existingOrders.length > 0) {
      return new Response(JSON.stringify({ error: "You already own this product" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const amount = product.price;
    const platformFee = Math.round(amount * 0.3);
    const sellerEarning = amount - platformFee;

    // Create Razorpay order
    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!keyId || !keySecret) {
      // Dev mode: return mock order without Razorpay
      const mockOrderId = `order_mock_${Date.now()}`;
      // Create order in DB with PENDING status
      const insertRes = await fetch(`${supabaseUrl}/rest/v1/orders`, {
        method: "POST",
        headers: {
          "apikey": serviceKey,
          "Authorization": `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
          "Prefer": "return=representation",
        },
        body: JSON.stringify({
          buyer_id,
          product_id,
          amount,
          platform_fee: platformFee,
          seller_earning: sellerEarning,
          payment_status: "PENDING",
          payment_id: mockOrderId,
        }),
      });
      const orders = await insertRes.json();
      return new Response(JSON.stringify({
        order_id: orders[0].id,
        razorpay_order_id: mockOrderId,
        amount,
        currency: "INR",
        key_id: "rzp_test_mock",
        dev_mode: true,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Razorpay order via API
    const auth = btoa(`${keyId}:${keySecret}`);
    const razorpayRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency: "INR",
        receipt: `cb_${Date.now()}`,
        notes: {
          product_id,
          buyer_id,
        },
      }),
    });

    if (!razorpayRes.ok) {
      const err = await razorpayRes.text();
      return new Response(JSON.stringify({ error: "Razorpay order creation failed", details: err }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const razorpayOrder = await razorpayRes.json();

    // Create order in DB with PENDING status
    const insertRes = await fetch(`${supabaseUrl}/rest/v1/orders`, {
      method: "POST",
      headers: {
        "apikey": serviceKey,
        "Authorization": `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation",
      },
      body: JSON.stringify({
        buyer_id,
        product_id,
        amount,
        platform_fee: platformFee,
        seller_earning: sellerEarning,
        payment_status: "PENDING",
        payment_id: razorpayOrder.id,
      }),
    });
    const orders = await insertRes.json();

    return new Response(JSON.stringify({
      order_id: orders[0].id,
      razorpay_order_id: razorpayOrder.id,
      amount,
      currency: "INR",
      key_id: keyId,
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
