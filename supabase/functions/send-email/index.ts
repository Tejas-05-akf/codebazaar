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
    const { type, to_email, order_id, product_id, license_key, user_name, reset_link, reason } = await req.json();

    if (!type) {
      return new Response(JSON.stringify({ error: "Missing email type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");

    if (!resendKey) {
      // Dev mode: log email instead of sending
      console.log(`[EMAIL] Type: ${type}, To: ${to_email}`);
      return new Response(JSON.stringify({ success: true, dev_mode: true, message: "Email logged (no Resend key)" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // For order-related emails, fetch the buyer's email
    let email = to_email;
    let userName = user_name || "there";
    let productTitle = "";
    let price = 0;

    if (order_id) {
      const orderRes = await fetch(
        `${supabaseUrl}/rest/v1/orders?id=eq.${order_id}&select=*,buyer:profiles(email,name),product:products(title,price)`,
        {
          headers: {
            "apikey": serviceKey,
            "Authorization": `Bearer ${serviceKey}`,
          },
        }
      );
      const orders = await orderRes.json();
      if (orders && orders.length > 0) {
        email = email || orders[0].buyer?.email;
        userName = orders[0].buyer?.name || userName;
        productTitle = orders[0].product?.title || "";
        price = orders[0].amount || 0;
      }
    }

    if (product_id && !productTitle) {
      const productRes = await fetch(
        `${supabaseUrl}/rest/v1/products?id=eq.${product_id}&select=title,price`,
        {
          headers: {
            "apikey": serviceKey,
            "Authorization": `Bearer ${serviceKey}`,
          },
        }
      );
      const products = await productRes.json();
      if (products && products.length > 0) {
        productTitle = products[0].title;
        price = products[0].price;
      }
    }

    // Build email content based on type
    let subject = "";
    let html = "";

    switch (type) {
      case "WELCOME":
        subject = "Welcome to CodeBazaar!";
        html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #FF6B35;">Welcome to CodeBazaar, ${userName}!</h1>
            <p>You're now part of India's premier marketplace for digital products.</p>
            <p>Start exploring templates, dashboards, AI tools, and more — or become a seller and start earning.</p>
            <a href="${Deno.env.get("SITE_URL") || "https://codebazaar.in"}" style="background: #FF6B35; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 16px;">Get Started</a>
          </div>
        `;
        break;

      case "PURCHASE_CONFIRMATION":
        subject = `Purchase Confirmation - ${productTitle}`;
        html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #FF6B35;">Purchase Successful!</h1>
            <p>Hi ${userName}, your purchase is complete.</p>
            <div style="background: #f4f4f4; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p><strong>Product:</strong> ${productTitle}</p>
              <p><strong>Amount:</strong> ₹${(price / 100).toLocaleString("en-IN")}</p>
              ${license_key ? `<p><strong>License Key:</strong> <code>${license_key}</code></p>` : ""}
            </div>
            <p>You can download your product from your orders page.</p>
            <a href="${Deno.env.get("SITE_URL") || "https://codebazaar.in"}/orders" style="background: #FF6B35; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 16px;">Download Your Product</a>
          </div>
        `;
        break;

      case "SELLER_APPROVAL":
        subject = "Your seller account has been approved!";
        html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #FF6B35;">Seller Account Approved!</h1>
            <p>Hi ${userName}, your KYC has been reviewed and approved. You can now start listing products on CodeBazaar.</p>
            <a href="${Deno.env.get("SITE_URL") || "https://codebazaar.in"}/seller/listings/new" style="background: #FF6B35; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 16px;">Create Your First Listing</a>
          </div>
        `;
        break;

      case "PRODUCT_APPROVED":
        subject = `Your product "${productTitle}" has been approved!`;
        html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #FF6B35;">Product Approved!</h1>
            <p>Hi ${userName}, your product "${productTitle}" has been approved and is now live on CodeBazaar.</p>
            <a href="${Deno.env.get("SITE_URL") || "https://codebazaar.in"}/seller/listings" style="background: #FF6B35; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 16px;">View Your Listings</a>
          </div>
        `;
        break;

      case "PRODUCT_REJECTED":
        subject = `Your product "${productTitle}" needs attention`;
        html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #FF6B35;">Product Review Update</h1>
            <p>Hi ${userName}, your product "${productTitle}" was not approved.</p>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
            <p>Please update your product and resubmit for review.</p>
            <a href="${Deno.env.get("SITE_URL") || "https://codebazaar.in"}/seller/listings" style="background: #FF6B35; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 16px;">View Your Listings</a>
          </div>
        `;
        break;

      case "PASSWORD_RESET":
        subject = "Reset your CodeBazaar password";
        html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #FF6B35;">Password Reset</h1>
            <p>Hi ${userName}, we received a request to reset your password.</p>
            ${reset_link ? `<a href="${reset_link}" style="background: #FF6B35; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 16px;">Reset Password</a>` : ""}
            <p>If you didn't request this, you can safely ignore this email.</p>
          </div>
        `;
        break;

      case "REFUND_UPDATE":
        subject = `Refund processed for ${productTitle}`;
        html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #FF6B35;">Refund Processed</h1>
            <p>Hi ${userName}, your refund for "${productTitle}" has been processed.</p>
            <p>The refund will appear in your account within 5-7 business days.</p>
          </div>
        `;
        break;

      default:
        return new Response(JSON.stringify({ error: "Unknown email type" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    // Send via Resend
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "CodeBazaar <noreply@codebazaar.in>",
        to: email,
        subject,
        html,
      }),
    });

    if (!resendRes.ok) {
      const err = await resendRes.text();
      return new Response(JSON.stringify({ error: "Failed to send email", details: err }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error", details: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
