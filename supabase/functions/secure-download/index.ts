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
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const orderId = url.searchParams.get("order_id");

    if (!token || !orderId) {
      return new Response(JSON.stringify({ error: "Missing token or order_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Fetch the download record
    const downloadRes = await fetch(
      `${supabaseUrl}/rest/v1/downloads?download_token=eq.${token}&order_id=eq.${orderId}&select=*&limit=1`,
      {
        headers: {
          "apikey": serviceKey,
          "Authorization": `Bearer ${serviceKey}`,
        },
      }
    );
    const downloads = await downloadRes.json();

    if (!downloads || downloads.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid download token" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const download = downloads[0];

    // Check expiry
    if (new Date(download.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: "Download link expired" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch product to get download URL
    const productRes = await fetch(
      `${supabaseUrl}/rest/v1/products?id=eq.${download.product_id}&select=download_url,title`,
      {
        headers: {
          "apikey": serviceKey,
          "Authorization": `Bearer ${serviceKey}`,
        },
      }
    );
    const products = await productRes.json();

    if (!products || products.length === 0) {
      return new Response(JSON.stringify({ error: "Product not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const product = products[0];

    if (!product.download_url) {
      return new Response(JSON.stringify({ error: "Download URL not configured for this product" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Redirect to the download URL
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        "Location": product.download_url,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error", details: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
