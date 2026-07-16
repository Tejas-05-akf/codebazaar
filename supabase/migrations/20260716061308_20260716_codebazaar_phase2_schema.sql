-- Add SUPER_ADMIN to profiles role constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('BUYER', 'SELLER', 'ADMIN', 'SUPER_ADMIN'));

-- Add is_featured column to products for admin-curated featured products
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured) WHERE is_featured = true;

-- Add tags column to products (separate from tech_stack for search/filtering)
ALTER TABLE products ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';

-- Add missing product fields for full seller workflow
ALTER TABLE products ADD COLUMN IF NOT EXISTS github_url text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS download_url text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS documentation_url text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS version text NOT NULL DEFAULT '1.0.0';

-- Categories table for structured category management
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  icon text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);

-- Seed default categories
INSERT INTO categories (name, slug, sort_order) VALUES
  ('Websites', 'websites', 1),
  ('Mobile Apps', 'mobile-apps', 2),
  ('SaaS', 'saas', 3),
  ('Dashboards', 'dashboards', 4),
  ('AI Tools', 'ai-tools', 5),
  ('Templates', 'templates', 6),
  ('CRM', 'crm', 7),
  ('ERP', 'erp', 8),
  ('UI Kits', 'ui-kits', 9),
  ('Figma Designs', 'figma-designs', 10),
  ('Automation', 'automation', 11)
ON CONFLICT (name) DO NOTHING;

-- Downloads table for secure download tracking
CREATE TABLE IF NOT EXISTS downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  download_token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_downloads_order_id ON downloads(order_id);
CREATE INDEX IF NOT EXISTS idx_downloads_buyer_id ON downloads(buyer_id);
CREATE INDEX IF NOT EXISTS idx_downloads_product_id ON downloads(product_id);
CREATE INDEX IF NOT EXISTS idx_downloads_token ON downloads(download_token);
CREATE INDEX IF NOT EXISTS idx_downloads_expires_at ON downloads(expires_at);

-- Notifications table for user notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('PURCHASE', 'SALE', 'PAYOUT', 'REVIEW', 'PRODUCT_APPROVED', 'PRODUCT_REJECTED', 'SYSTEM')),
  title text NOT NULL,
  message text NOT NULL,
  data jsonb,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Enable RLS on new tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Categories: public read, admin write
DROP POLICY IF EXISTS "select_categories" ON categories;
CREATE POLICY "select_categories" ON categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_categories" ON categories;
CREATE POLICY "insert_categories" ON categories FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN'))
  );

DROP POLICY IF EXISTS "update_categories" ON categories;
CREATE POLICY "update_categories" ON categories FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN'))
  );

DROP POLICY IF EXISTS "delete_categories" ON categories;
CREATE POLICY "delete_categories" ON categories FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN'))
  );

-- Downloads: buyer can read own, admin can read all
DROP POLICY IF EXISTS "select_downloads" ON downloads;
CREATE POLICY "select_downloads" ON downloads FOR SELECT
  TO authenticated USING (
    buyer_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

DROP POLICY IF EXISTS "insert_downloads" ON downloads;
CREATE POLICY "insert_downloads" ON downloads FOR INSERT
  TO authenticated WITH CHECK (
    buyer_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

DROP POLICY IF EXISTS "update_downloads" ON downloads;
CREATE POLICY "update_downloads" ON downloads FOR UPDATE
  TO authenticated USING (
    buyer_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

DROP POLICY IF EXISTS "delete_downloads" ON downloads;
CREATE POLICY "delete_downloads" ON downloads FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN'))
  );

-- Notifications: user can read/update own, admin can insert
DROP POLICY IF EXISTS "select_notifications" ON notifications;
CREATE POLICY "select_notifications" ON notifications FOR SELECT
  TO authenticated USING (
    user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

DROP POLICY IF EXISTS "insert_notifications" ON notifications;
CREATE POLICY "insert_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (
    user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

DROP POLICY IF EXISTS "update_notifications" ON notifications;
CREATE POLICY "update_notifications" ON notifications FOR UPDATE
  TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "delete_notifications" ON notifications;
CREATE POLICY "delete_notifications" ON notifications FOR DELETE
  TO authenticated USING (
    user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- Update RLS policies to include SUPER_ADMIN alongside ADMIN for admin access
-- Products: update select policy to include SUPER_ADMIN
DROP POLICY IF EXISTS "select_products" ON products;
CREATE POLICY "select_products" ON products FOR SELECT
  TO anon, authenticated USING (
    status = 'APPROVED' OR seller_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

DROP POLICY IF EXISTS "update_own_products" ON products;
CREATE POLICY "update_own_products" ON products FOR UPDATE
  TO authenticated USING (
    seller_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  ) WITH CHECK (
    seller_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

DROP POLICY IF EXISTS "delete_own_products" ON products;
CREATE POLICY "delete_own_products" ON products FOR DELETE
  TO authenticated USING (
    seller_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- Orders: update select to include SUPER_ADMIN
DROP POLICY IF EXISTS "select_orders" ON orders;
CREATE POLICY "select_orders" ON orders FOR SELECT
  TO authenticated USING (
    buyer_id = auth.uid() OR EXISTS (
      SELECT 1 FROM products WHERE products.id = orders.product_id AND products.seller_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

DROP POLICY IF EXISTS "update_own_orders" ON orders;
CREATE POLICY "update_own_orders" ON orders FOR UPDATE
  TO authenticated USING (
    buyer_id = auth.uid() OR EXISTS (
      SELECT 1 FROM products WHERE products.id = orders.product_id AND products.seller_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

DROP POLICY IF EXISTS "delete_own_orders" ON orders;
CREATE POLICY "delete_own_orders" ON orders FOR DELETE
  TO authenticated USING (
    buyer_id = auth.uid() OR EXISTS (
      SELECT 1 FROM products WHERE products.id = orders.product_id AND products.seller_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- Payout Requests: update to include SUPER_ADMIN
DROP POLICY IF EXISTS "select_payout_requests" ON payout_requests;
CREATE POLICY "select_payout_requests" ON payout_requests FOR SELECT
  TO authenticated USING (
    seller_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

DROP POLICY IF EXISTS "update_payout_requests" ON payout_requests;
CREATE POLICY "update_payout_requests" ON payout_requests FOR UPDATE
  TO authenticated USING (
    seller_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  ) WITH CHECK (
    seller_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

DROP POLICY IF EXISTS "delete_payout_requests" ON payout_requests;
CREATE POLICY "delete_payout_requests" ON payout_requests FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN'))
  );

-- Support Tickets: update to include SUPER_ADMIN
DROP POLICY IF EXISTS "select_support_tickets" ON support_tickets;
CREATE POLICY "select_support_tickets" ON support_tickets FOR SELECT
  TO authenticated USING (
    user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

DROP POLICY IF EXISTS "update_own_support_tickets" ON support_tickets;
CREATE POLICY "update_own_support_tickets" ON support_tickets FOR UPDATE
  TO authenticated USING (
    user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  ) WITH CHECK (
    user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

DROP POLICY IF EXISTS "delete_own_support_tickets" ON support_tickets;
CREATE POLICY "delete_own_support_tickets" ON support_tickets FOR DELETE
  TO authenticated USING (
    user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- Ticket Messages: update to include SUPER_ADMIN
DROP POLICY IF EXISTS "select_ticket_messages" ON ticket_messages;
CREATE POLICY "select_ticket_messages" ON ticket_messages FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM support_tickets st WHERE st.id = ticket_messages.ticket_id AND (
        st.user_id = auth.uid() OR EXISTS (
          SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
        )
      )
    )
  );

DROP POLICY IF EXISTS "insert_ticket_messages" ON ticket_messages;
CREATE POLICY "insert_ticket_messages" ON ticket_messages FOR INSERT
  TO authenticated WITH CHECK (
    sender_id = auth.uid() AND EXISTS (
      SELECT 1 FROM support_tickets st WHERE st.id = ticket_messages.ticket_id AND (
        st.user_id = auth.uid() OR EXISTS (
          SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
        )
      )
    )
  );

DROP POLICY IF EXISTS "update_ticket_messages" ON ticket_messages;
CREATE POLICY "update_ticket_messages" ON ticket_messages FOR UPDATE
  TO authenticated USING (
    sender_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  ) WITH CHECK (sender_id = auth.uid());

DROP POLICY IF EXISTS "delete_ticket_messages" ON ticket_messages;
CREATE POLICY "delete_ticket_messages" ON ticket_messages FOR DELETE
  TO authenticated USING (
    sender_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- Product Rejections: update to include SUPER_ADMIN
DROP POLICY IF EXISTS "select_product_rejections" ON product_rejections;
CREATE POLICY "select_product_rejections" ON product_rejections FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN'))
  );

DROP POLICY IF EXISTS "insert_product_rejections" ON product_rejections;
CREATE POLICY "insert_product_rejections" ON product_rejections FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN'))
  );

DROP POLICY IF EXISTS "update_product_rejections" ON product_rejections;
CREATE POLICY "update_product_rejections" ON product_rejections FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN'))
  );

DROP POLICY IF EXISTS "delete_product_rejections" ON product_rejections;
CREATE POLICY "delete_product_rejections" ON product_rejections FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN'))
  );

-- Seller Profiles: update admin policies to include SUPER_ADMIN
DROP POLICY IF EXISTS "select_seller_profiles" ON seller_profiles;
CREATE POLICY "select_seller_profiles" ON seller_profiles FOR SELECT
  TO anon, authenticated USING (true);

-- Function to generate a secure download token and create download record
CREATE OR REPLACE FUNCTION public.create_download_token(p_order_id uuid, p_buyer_id uuid, p_product_id uuid)
RETURNS text AS $$
DECLARE
  v_token text;
  v_download_id uuid;
BEGIN
  -- Verify the order belongs to the buyer and is paid
  IF NOT EXISTS (
    SELECT 1 FROM orders
    WHERE id = p_order_id AND buyer_id = p_buyer_id AND product_id = p_product_id AND payment_status = 'PAID'
  ) THEN
    RETURN NULL;
  END IF;

  -- Check download limit
  IF EXISTS (
    SELECT 1 FROM orders WHERE id = p_order_id AND download_count >= max_downloads
  ) THEN
    RETURN NULL;
  END IF;

  v_token := encode(gen_random_bytes(32), 'hex');

  INSERT INTO downloads (order_id, buyer_id, product_id, download_token, expires_at)
  VALUES (p_order_id, p_buyer_id, p_product_id, v_token, now() + interval '24 hours')
  RETURNING id INTO v_download_id;

  -- Increment order download count
  UPDATE orders SET download_count = download_count + 1 WHERE id = p_order_id;

  RETURN v_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify a download token and return the product download URL
CREATE OR REPLACE FUNCTION public.verify_download_token(p_token text, p_user_id uuid)
RETURNS TABLE (
  product_id uuid,
  download_url text,
  expires_at timestamptz,
  is_valid boolean
) AS $$
DECLARE
  v_download downloads%ROWTYPE;
  v_product products%ROWTYPE;
BEGIN
  SELECT * INTO v_download FROM downloads WHERE download_token = p_token AND buyer_id = p_user_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::uuid, NULL::text, NULL::timestamptz, false;
    RETURN;
  END IF;

  IF v_download.expires_at < now() THEN
    RETURN QUERY SELECT NULL::uuid, NULL::text, NULL::timestamptz, false;
    RETURN;
  END IF;

  SELECT * INTO v_product FROM products WHERE id = v_download.product_id;

  RETURN QUERY SELECT v_product.id, v_product.download_url, v_download.expires_at, true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update seller earnings when an order is paid
CREATE OR REPLACE FUNCTION public.update_seller_earnings_on_paid()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.payment_status <> 'PAID' AND NEW.payment_status = 'PAID') THEN
    UPDATE seller_profiles
    SET total_earnings = total_earnings + NEW.seller_earning,
        pending_payout = pending_payout + NEW.seller_earning
    WHERE user_id = (
      SELECT seller_id FROM products WHERE id = NEW.product_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_order_paid ON orders;
CREATE TRIGGER on_order_paid
  AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION public.update_seller_earnings_on_paid();

-- Function to create notification on purchase
CREATE OR REPLACE FUNCTION public.create_purchase_notifications()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.payment_status = 'PAID') THEN
    -- Notify buyer
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      NEW.buyer_id, 'PURCHASE', 'Purchase Complete',
      'Your purchase is complete. You can now download your product.',
      jsonb_build_object('order_id', NEW.id, 'product_id', NEW.product_id)
    );

    -- Notify seller
    INSERT INTO notifications (user_id, type, title, message, data)
    SELECT
      p.seller_id, 'SALE', 'New Sale!',
      'You have a new sale on your product.',
      jsonb_build_object('order_id', NEW.id, 'product_id', NEW.product_id, 'amount', NEW.seller_earning)
    FROM products p WHERE p.id = NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_order_created_notify ON orders;
CREATE TRIGGER on_order_created_notify
  AFTER INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION public.create_purchase_notifications();
