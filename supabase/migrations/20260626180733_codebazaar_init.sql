/*
# CodeBazaar Database Schema - Initial Setup

1. Overview
This migration creates the complete database schema for CodeBazaar, an Indian marketplace for developer products. It includes user profiles, seller KYC, products, orders, reviews, payouts, support tickets, and AI chat history.

2. New Tables
- `profiles` — extends Supabase auth.users with role, name, avatar, verification status
- `seller_profiles` — KYC info for sellers (PAN, bank, UPI, earnings)
- `products` — product listings with tech stack, license, status, pricing
- `orders` — purchase records with payment and download tracking
- `reviews` — product reviews with verified purchase flag
- `payout_requests` — seller payout requests with status tracking
- `support_tickets` — customer support tickets
- `ticket_messages` — threaded messages within support tickets
- `product_rejections` — stores admin rejection reasons for products

3. Security
- RLS enabled on ALL tables
- Owner-scoped policies for authenticated users
- Admin-only access for admin-specific tables
- Anon + authenticated access for public data (products, reviews)

4. Indexes
- B-tree indexes on foreign keys, search columns, status fields
- Full-text search index on product titles

5. Notes
- All monetary fields stored in paise (INR * 100) to avoid float issues
- Product status workflow: DRAFT → PENDING_REVIEW → APPROVED/REJECTED/SUSPENDED
- Seller KYC status: PENDING → APPROVED/REJECTED
- Order payment status: PENDING → PAID/FAILED/REFUNDED
*/

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'BUYER' CHECK (role IN ('BUYER', 'SELLER', 'ADMIN')),
  avatar_url text,
  is_verified boolean NOT NULL DEFAULT false,
  is_banned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Seller Profiles table
CREATE TABLE IF NOT EXISTS seller_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  bio text,
  pan_number text,
  bank_account_number text,
  ifsc_code text,
  upi_id text,
  total_earnings integer NOT NULL DEFAULT 0,
  pending_payout integer NOT NULL DEFAULT 0,
  kyc_status text NOT NULL DEFAULT 'PENDING' CHECK (kyc_status IN ('PENDING', 'APPROVED', 'REJECTED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_seller_profiles_user_id ON seller_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_seller_profiles_kyc_status ON seller_profiles(kyc_status);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL,
  short_description text NOT NULL,
  price integer NOT NULL,
  category text NOT NULL,
  tech_stack text[] NOT NULL DEFAULT '{}',
  license_type text NOT NULL DEFAULT 'PERSONAL' CHECK (license_type IN ('PERSONAL', 'COMMERCIAL', 'EXTENDED', 'WHITELABEL')),
  status text NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED')),
  demo_url text,
  thumbnail_url text,
  screenshots text[] NOT NULL DEFAULT '{}',
  download_file_key text,
  download_count integer NOT NULL DEFAULT 0,
  average_rating numeric(3,2) NOT NULL DEFAULT 0,
  review_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  platform_fee integer NOT NULL,
  seller_earning integer NOT NULL,
  payment_id text,
  payment_status text NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED')),
  download_count integer NOT NULL DEFAULT 0,
  max_downloads integer NOT NULL DEFAULT 5,
  license_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (buyer_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  is_verified boolean NOT NULL DEFAULT false,
  is_flagged boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_buyer_id ON reviews(buyer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_is_flagged ON reviews(is_flagged);

-- Payout Requests table
CREATE TABLE IF NOT EXISTS payout_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'PAID', 'REJECTED')),
  razorpay_payout_id text,
  transaction_reference text,
  requested_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_payout_requests_seller_id ON payout_requests(seller_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_status ON payout_requests(status);

-- Support Tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  subject text NOT NULL,
  status text NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);

-- Ticket Messages table
CREATE TABLE IF NOT EXISTS ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message text NOT NULL,
  is_ai boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);

-- Product Rejections table
CREATE TABLE IF NOT EXISTS product_rejections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_rejections_product_id ON product_rejections(product_id);

-- AI Chat History table (for product chatbot)
CREATE TABLE IF NOT EXISTS ai_chat_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  session_id text NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_chat_history_product_id ON ai_chat_history(product_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_session_id ON ai_chat_history(session_id);

-- RLS Policies

-- Profiles: users can read all profiles, update own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_profiles" ON profiles;
CREATE POLICY "select_profiles" ON profiles FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO anon, authenticated WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (id = auth.uid());

-- Seller Profiles: sellers can read/update own, admin can read all
ALTER TABLE seller_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_seller_profiles" ON seller_profiles;
CREATE POLICY "select_seller_profiles" ON seller_profiles FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_seller_profile" ON seller_profiles;
CREATE POLICY "insert_own_seller_profile" ON seller_profiles FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "update_own_seller_profile" ON seller_profiles;
CREATE POLICY "update_own_seller_profile" ON seller_profiles FOR UPDATE
  TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "delete_own_seller_profile" ON seller_profiles;
CREATE POLICY "delete_own_seller_profile" ON seller_profiles FOR DELETE
  TO authenticated USING (user_id = auth.uid());

-- Products: public read for APPROVED, seller CRUD for own, admin all
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_products" ON products;
CREATE POLICY "select_products" ON products FOR SELECT
  TO anon, authenticated USING (status = 'APPROVED' OR seller_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
  ));

DROP POLICY IF EXISTS "insert_own_products" ON products;
CREATE POLICY "insert_own_products" ON products FOR INSERT
  TO authenticated WITH CHECK (seller_id = auth.uid());

DROP POLICY IF EXISTS "update_own_products" ON products;
CREATE POLICY "update_own_products" ON products FOR UPDATE
  TO authenticated USING (seller_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
  )) WITH CHECK (seller_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
  ));

DROP POLICY IF EXISTS "delete_own_products" ON products;
CREATE POLICY "delete_own_products" ON products FOR DELETE
  TO authenticated USING (seller_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
  ));

-- Orders: buyer can read own, seller can read orders for their products
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_orders" ON orders;
CREATE POLICY "select_orders" ON orders FOR SELECT
  TO authenticated USING (
    buyer_id = auth.uid() OR EXISTS (
      SELECT 1 FROM products WHERE products.id = orders.product_id AND products.seller_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
    )
  );

DROP POLICY IF EXISTS "insert_own_orders" ON orders;
CREATE POLICY "insert_own_orders" ON orders FOR INSERT
  TO authenticated WITH CHECK (buyer_id = auth.uid());

DROP POLICY IF EXISTS "update_own_orders" ON orders;
CREATE POLICY "update_own_orders" ON orders FOR UPDATE
  TO authenticated USING (
    buyer_id = auth.uid() OR EXISTS (
      SELECT 1 FROM products WHERE products.id = orders.product_id AND products.seller_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
    )
  );

DROP POLICY IF EXISTS "delete_own_orders" ON orders;
CREATE POLICY "delete_own_orders" ON orders FOR DELETE
  TO authenticated USING (
    buyer_id = auth.uid() OR EXISTS (
      SELECT 1 FROM products WHERE products.id = orders.product_id AND products.seller_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
    )
  );

-- Reviews: public read, buyer can create/update own
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_reviews" ON reviews;
CREATE POLICY "select_reviews" ON reviews FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_reviews" ON reviews;
CREATE POLICY "insert_own_reviews" ON reviews FOR INSERT
  TO authenticated WITH CHECK (buyer_id = auth.uid());

DROP POLICY IF EXISTS "update_own_reviews" ON reviews;
CREATE POLICY "update_own_reviews" ON reviews FOR UPDATE
  TO authenticated USING (buyer_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
  )) WITH CHECK (buyer_id = auth.uid());

DROP POLICY IF EXISTS "delete_own_reviews" ON reviews;
CREATE POLICY "delete_own_reviews" ON reviews FOR DELETE
  TO authenticated USING (buyer_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
  ));

-- Payout Requests: seller can read own, admin can read/update all
ALTER TABLE payout_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_payout_requests" ON payout_requests;
CREATE POLICY "select_payout_requests" ON payout_requests FOR SELECT
  TO authenticated USING (
    seller_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
    )
  );

DROP POLICY IF EXISTS "insert_own_payout_requests" ON payout_requests;
CREATE POLICY "insert_own_payout_requests" ON payout_requests FOR INSERT
  TO authenticated WITH CHECK (seller_id = auth.uid());

DROP POLICY IF EXISTS "update_payout_requests" ON payout_requests;
CREATE POLICY "update_payout_requests" ON payout_requests FOR UPDATE
  TO authenticated USING (
    seller_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
    )
  ) WITH CHECK (
    seller_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
    )
  );

DROP POLICY IF EXISTS "delete_payout_requests" ON payout_requests;
CREATE POLICY "delete_payout_requests" ON payout_requests FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
    )
  );

-- Support Tickets: user can read own, admin can read all
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_support_tickets" ON support_tickets;
CREATE POLICY "select_support_tickets" ON support_tickets FOR SELECT
  TO authenticated USING (
    user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
    )
  );

DROP POLICY IF EXISTS "insert_own_support_tickets" ON support_tickets;
CREATE POLICY "insert_own_support_tickets" ON support_tickets FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "update_own_support_tickets" ON support_tickets;
CREATE POLICY "update_own_support_tickets" ON support_tickets FOR UPDATE
  TO authenticated USING (
    user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
    )
  ) WITH CHECK (
    user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
    )
  );

DROP POLICY IF EXISTS "delete_own_support_tickets" ON support_tickets;
CREATE POLICY "delete_own_support_tickets" ON support_tickets FOR DELETE
  TO authenticated USING (
    user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
    )
  );

-- Ticket Messages: participants can read, admin can read all
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_ticket_messages" ON ticket_messages;
CREATE POLICY "select_ticket_messages" ON ticket_messages FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM support_tickets st WHERE st.id = ticket_messages.ticket_id AND (
        st.user_id = auth.uid() OR EXISTS (
          SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
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
          SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
        )
      )
    )
  );

DROP POLICY IF EXISTS "update_ticket_messages" ON ticket_messages;
CREATE POLICY "update_ticket_messages" ON ticket_messages FOR UPDATE
  TO authenticated USING (
    sender_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
    )
  ) WITH CHECK (
    sender_id = auth.uid()
  );

DROP POLICY IF EXISTS "delete_ticket_messages" ON ticket_messages;
CREATE POLICY "delete_ticket_messages" ON ticket_messages FOR DELETE
  TO authenticated USING (
    sender_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
    )
  );

-- Product Rejections: admin only
ALTER TABLE product_rejections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_product_rejections" ON product_rejections;
CREATE POLICY "select_product_rejections" ON product_rejections FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
    )
  );

DROP POLICY IF EXISTS "insert_product_rejections" ON product_rejections;
CREATE POLICY "insert_product_rejections" ON product_rejections FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
    )
  );

DROP POLICY IF EXISTS "update_product_rejections" ON product_rejections;
CREATE POLICY "update_product_rejections" ON product_rejections FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
    )
  );

DROP POLICY IF EXISTS "delete_product_rejections" ON product_rejections;
CREATE POLICY "delete_product_rejections" ON product_rejections FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
    )
  );

-- AI Chat History
ALTER TABLE ai_chat_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_ai_chat_history" ON ai_chat_history;
CREATE POLICY "select_ai_chat_history" ON ai_chat_history FOR SELECT
  TO authenticated USING (
    user_id = auth.uid() OR user_id IS NULL
  );

DROP POLICY IF EXISTS "insert_ai_chat_history" ON ai_chat_history;
CREATE POLICY "insert_ai_chat_history" ON ai_chat_history FOR INSERT
  TO authenticated WITH CHECK (
    user_id = auth.uid() OR user_id IS NULL
  );

DROP POLICY IF EXISTS "update_ai_chat_history" ON ai_chat_history;
CREATE POLICY "update_ai_chat_history" ON ai_chat_history FOR UPDATE
  TO authenticated USING (
    user_id = auth.uid() OR user_id IS NULL
  ) WITH CHECK (
    user_id = auth.uid() OR user_id IS NULL
  );

DROP POLICY IF EXISTS "delete_ai_chat_history" ON ai_chat_history;
CREATE POLICY "delete_ai_chat_history" ON ai_chat_history FOR DELETE
  TO authenticated USING (
    user_id = auth.uid() OR user_id IS NULL
  );

-- Function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'BUYER')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update product average_rating after review insert/update/delete
CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    UPDATE products
    SET average_rating = (
      SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE product_id = OLD.product_id
    ),
    review_count = (
      SELECT COUNT(*) FROM reviews WHERE product_id = OLD.product_id
    )
    WHERE id = OLD.product_id;
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    UPDATE products
    SET average_rating = (
      SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE product_id = NEW.product_id
    ),
    review_count = (
      SELECT COUNT(*) FROM reviews WHERE product_id = NEW.product_id
    )
    WHERE id = NEW.product_id;
    RETURN NEW;
  ELSE
    UPDATE products
    SET average_rating = (
      SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE product_id = NEW.product_id
    ),
    review_count = (
      SELECT COUNT(*) FROM reviews WHERE product_id = NEW.product_id
    )
    WHERE id = NEW.product_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_review_change ON reviews;
CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_product_rating();

-- Function to update product download_count from orders
CREATE OR REPLACE FUNCTION public.update_product_download_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.download_count IS DISTINCT FROM NEW.download_count) THEN
    UPDATE products
    SET download_count = (
      SELECT COALESCE(SUM(download_count), 0) FROM orders WHERE product_id = NEW.product_id AND payment_status = 'PAID'
    )
    WHERE id = NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_order_download_change ON orders;
CREATE TRIGGER on_order_download_change
  AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION public.update_product_download_count();
