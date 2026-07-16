import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type Profile = {
  id: string;
  email: string;
  name: string;
  role: 'BUYER' | 'SELLER' | 'ADMIN' | 'SUPER_ADMIN';
  avatar_url: string | null;
  is_verified: boolean;
  is_banned: boolean;
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  type: 'PURCHASE' | 'SALE' | 'PAYOUT' | 'REVIEW' | 'PRODUCT_APPROVED' | 'PRODUCT_REJECTED' | 'SYSTEM';
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
};

export type Download = {
  id: string;
  order_id: string;
  buyer_id: string;
  product_id: string;
  download_token: string;
  expires_at: string;
  ip_address: string | null;
  created_at: string;
};

export type SellerProfile = {
  id: string;
  user_id: string;
  display_name: string;
  bio: string | null;
  pan_number: string | null;
  bank_account_number: string | null;
  ifsc_code: string | null;
  upi_id: string | null;
  total_earnings: number;
  pending_payout: number;
  kyc_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
};

export type Product = {
  id: string;
  seller_id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  category: string;
  tech_stack: string[];
  license_type: 'PERSONAL' | 'COMMERCIAL' | 'EXTENDED' | 'WHITELABEL';
  status: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  demo_url: string | null;
  thumbnail_url: string | null;
  screenshots: string[];
  download_file_key: string | null;
  download_count: number;
  average_rating: number;
  review_count: number;
  is_featured: boolean;
  tags: string[];
  github_url: string | null;
  download_url: string | null;
  documentation_url: string | null;
  version: string;
  created_at: string;
  updated_at: string;
  seller?: { name: string };
};

export type Order = {
  id: string;
  buyer_id: string;
  product_id: string;
  amount: number;
  platform_fee: number;
  seller_earning: number;
  payment_id: string | null;
  payment_status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  download_count: number;
  max_downloads: number;
  license_key: string | null;
  created_at: string;
  product?: Product;
};

export type Review = {
  id: string;
  order_id: string;
  buyer_id: string;
  product_id: string;
  rating: number;
  comment: string | null;
  is_verified: boolean;
  is_flagged: boolean;
  created_at: string;
  buyer?: { name: string };
};

export type SupportTicket = {
  id: string;
  user_id: string;
  product_id: string | null;
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  created_at: string;
  product?: { title: string };
};

export type TicketMessage = {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  is_ai: boolean;
  created_at: string;
  sender?: { name: string };
};

export type PayoutRequest = {
  id: string;
  seller_id: string;
  amount: number;
  status: 'PENDING' | 'PROCESSING' | 'PAID' | 'REJECTED';
  razorpay_payout_id: string | null;
  transaction_reference: string | null;
  requested_at: string;
  processed_at: string | null;
};
