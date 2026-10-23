/*
# Replace dummy developer products with business-oriented solutions

1. Schema Changes
- Add `contact_whatsapp` column to `products` table (text, nullable) — stores a seller's WhatsApp number per listing for direct buyer-seller chat.

2. Data Changes
- DELETE 6 dummy developer starter-kit products (React Dashboard, Next.js E-commerce, React Native Social App, Django SaaS Boilerplate, Python Data Pipeline, FastAPI Microservices Starter).
- INSERT 4 business-oriented solutions as APPROVED listings backed by an existing seller profile:
  * GymPro Suite — Gym member management, trainer scheduling, QR check-in (₹2,499)
  * DineFlow Online — Restaurant table reservation, QR menu, order manager (₹1,999)
  * GlamBook Portal — Salon & spa booking, staff scheduling, SMS reminders (₹1,499)
  * MedPulse Clinic — Doctor appointments, digital prescriptions, patient records (₹2,999)
- All 4 products use status='APPROVED', is_featured=true, and include demo_url + contact_whatsapp.

3. Security
- No RLS policy changes (column addition is covered by existing policies).
- No new grants needed (existing product grants cover the new column).

4. Notes
- Prices stored in paise (₹2,499 = 249900).
- contact_whatsapp is nullable so existing/seller-uploaded products are not affected.
- Migration is idempotent: product inserts use ON CONFLICT (slug) DO NOTHING.
*/

-- Add contact_whatsapp column to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS contact_whatsapp text;

-- Delete dummy developer products
DELETE FROM products WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111112',
  '11111111-1111-1111-1111-111111111113',
  '22222222-2222-2222-2222-222222222221',
  '22222222-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222223'
);

-- Insert 4 business-oriented solutions (idempotent by slug)
INSERT INTO products (
  seller_id, title, slug, description, short_description,
  price, category, tech_stack, license_type, status,
  demo_url, thumbnail_url, screenshots, download_count,
  average_rating, review_count, is_featured, tags,
  version, contact_whatsapp, created_at, updated_at
) VALUES
  (
    '7673f223-55c0-4a01-9484-930cc795ad12',
    'GymPro Suite',
    'gympro-suite',
    'Complete gym management system with member portal, trainer scheduling, QR-based check-in, UPI payment collection, and attendance tracking. Includes admin dashboard for owners, member self-service portal, and mobile-responsive design. Full source code in React + Node.js with PostgreSQL database.',
    'Gym member management, trainer scheduling, and QR check-in portal.',
    249900,
    'gym',
    ARRAY['React', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
    'COMMERCIAL',
    'APPROVED',
    'https://demo.codebazaar.in/gympro',
    NULL,
    ARRAY[]::text[],
    0,
    0.00,
    0,
    true,
    ARRAY['gym', 'member-management', 'qr-checkin', 'trainer-scheduling'],
    '1.0.0',
    '919876543210',
    now(),
    now()
  ),
  (
    '7673f223-55c0-4a01-9484-930cc795ad12',
    'DineFlow Online',
    'dineflow-online',
    'Restaurant management system with table reservation, digital QR menu, online order manager, and kitchen display integration. Includes customer-facing ordering page, admin order dashboard, and SMS notification for reservations. Full source code in Next.js + Supabase.',
    'Restaurant table reservation system, digital QR menu, and order manager.',
    199900,
    'restaurant',
    ARRAY['Next.js', 'Supabase', 'Tailwind CSS', 'TypeScript'],
    'COMMERCIAL',
    'APPROVED',
    'https://demo.codebazaar.in/dineflow',
    NULL,
    ARRAY[]::text[],
    0,
    0.00,
    0,
    true,
    ARRAY['restaurant', 'table-reservation', 'qr-menu', 'order-manager'],
    '1.0.0',
    '919876543210',
    now(),
    now()
  ),
  (
    '7673f223-55c0-4a01-9484-930cc795ad12',
    'GlamBook Portal',
    'glambook-portal',
    'Salon and spa booking system with appointment scheduling, staff management, service catalog, SMS reminders, and payment collection. Includes customer booking page, staff calendar view, and admin dashboard. Full source code in React + Node.js.',
    'Salon & spa booking system with staff scheduling and SMS reminders.',
    149900,
    'salon',
    ARRAY['React', 'Node.js', 'MongoDB', 'Tailwind CSS'],
    'COMMERCIAL',
    'APPROVED',
    'https://demo.codebazaar.in/glambook',
    NULL,
    ARRAY[]::text[],
    0,
    0.00,
    0,
    true,
    ARRAY['salon', 'booking-system', 'staff-scheduling', 'sms-reminders'],
    '1.0.0',
    '919876543210',
    now(),
    now()
  ),
  (
    '7673f223-55c0-4a01-9484-930cc795ad12',
    'MedPulse Clinic',
    'medpulse-clinic',
    'Clinic management application with doctor appointment booking, digital prescription generation, patient records management, and billing. Includes patient portal, doctor dashboard, and reception interface. Full source code in Next.js + PostgreSQL with HIPAA-aware data handling.',
    'Doctor appointment booking, digital prescriptions, and patient records app.',
    299900,
    'clinic',
    ARRAY['Next.js', 'PostgreSQL', 'Prisma', 'Tailwind CSS'],
    'COMMERCIAL',
    'APPROVED',
    'https://demo.codebazaar.in/medpulse',
    NULL,
    ARRAY[]::text[],
    0,
    0.00,
    0,
    true,
    ARRAY['clinic', 'appointments', 'prescriptions', 'patient-records'],
    '1.0.0',
    '919876543210',
    now(),
    now()
  )
ON CONFLICT (slug) DO NOTHING;
