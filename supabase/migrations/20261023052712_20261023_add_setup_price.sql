/*
# Add setup_price column for turnkey deployment pricing

1. Schema Changes
- Add `setup_price` column to `products` table (integer, nullable) — stores the turnkey setup price in paise alongside the source code price.

2. Data Changes
- Update the 4 business products with their turnkey setup prices:
  * GymPro Suite: ₹8,999 (899900 paise)
  * DineFlow Online: ₹6,999 (699900 paise)
  * GlamBook Portal: ₹5,499 (549900 paise)
  * MedPulse Clinic: ₹9,999 (999900 paise)

3. Security
- No RLS policy changes (column addition is covered by existing policies).

4. Notes
- `setup_price` is nullable so seller-uploaded products without setup pricing are not affected.
- The `price` column continues to represent the source code license price.
*/

ALTER TABLE products ADD COLUMN IF NOT EXISTS setup_price integer;

UPDATE products SET setup_price = 899900 WHERE slug = 'gympro-suite';
UPDATE products SET setup_price = 699900 WHERE slug = 'dineflow-online';
UPDATE products SET setup_price = 549900 WHERE slug = 'glambook-portal';
UPDATE products SET setup_price = 999900 WHERE slug = 'medpulse-clinic';
