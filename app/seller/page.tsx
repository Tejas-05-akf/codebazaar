'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  Package,
  DollarSign,
  ShoppingCart,
  Star,
  ArrowUpRight,
  Plus,
  LayoutDashboard,
  Wallet,
  List,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

function formatPrice(paise: number) {
  return '₹' + (paise / 100).toLocaleString('en-IN');
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function SellerDashboard() {
  const { user } = useAuth();
  const [sellerProfile, setSellerProfile] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || (user.role !== 'SELLER' && user.role !== 'SUPER_ADMIN')) return;
    loadData();
  }, [user]);

  async function loadData() {
    if (!user) return;
    const [profileRes, productsRes, ordersRes] = await Promise.all([
      supabase.from('seller_profiles').select('*').eq('user_id', user.id).single(),
      supabase.from('products').select('*').eq('seller_id', user.id).order('created_at', { ascending: false }),
      supabase.from('orders').select('*, product:products(title, thumbnail_url)').order('created_at', { ascending: false }).limit(10),
    ]);
    setSellerProfile(profileRes.data);
    setProducts(productsRes.data || []);
    setOrders(ordersRes.data || []);
    setLoading(false);
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please login to access your seller dashboard</p>
          <Button className="bg-[#FF6B35] hover:bg-[#FF6B35]/90" onClick={() => window.location.href = '/login'}>Login</Button>
        </div>
      </div>
    );
  }

  if (user.role !== 'SELLER' && user.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold mb-2">Seller access required</h2>
          <p className="text-muted-foreground mb-4">You need a seller account to access this dashboard. Upgrade your account to start selling.</p>
          <Button className="bg-[#FF6B35] hover:bg-[#FF6B35]/90" onClick={() => window.location.href = '/seller/onboarding'}>Become a Seller</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading dashboard...</div>
      </div>
    );
  }

  const totalRevenue = sellerProfile?.total_earnings || 0;
  const pendingPayout = sellerProfile?.pending_payout || 0;
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const approvedProducts = products.filter((p) => p.status === 'APPROVED').length;
  const pendingProducts = products.filter((p) => p.status === 'PENDING_REVIEW').length;

  const stats = [
    { label: 'Total Revenue', value: formatPrice(totalRevenue), icon: DollarSign, color: 'text-[#FF6B35]' },
    { label: 'Pending Payout', value: formatPrice(pendingPayout), icon: Wallet, color: 'text-amber-500' },
    { label: 'Total Products', value: totalProducts.toString(), icon: Package, color: 'text-blue-500' },
    { label: 'Total Orders', value: totalOrders.toString(), icon: ShoppingCart, color: 'text-green-500' },
  ];

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">Seller Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {sellerProfile?.display_name || user.name}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/seller/listings/new">
              <Button className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 gap-2">
                <Plus className="h-4 w-4" /> New Product
              </Button>
            </Link>
            <Link href="/seller/payouts">
              <Button variant="outline" className="gap-2">
                <Wallet className="h-4 w-4" /> Payouts
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Orders</CardTitle>
              <Link href="/seller/orders" className="text-sm text-[#FF6B35] hover:underline">View all</Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {orders.length === 0 ? (
                <p className="text-muted-foreground text-center py-6">No orders yet</p>
              ) : (
                orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center gap-3 rounded-lg border p-3">
                    <img src={order.product?.thumbnail_url} alt={order.product?.title} className="h-10 w-10 rounded object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{order.product?.title}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatPrice(order.amount)}</p>
                      <Badge variant="outline" className="text-[10px]">{order.payment_status}</Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Your Products</CardTitle>
              <Link href="/seller/listings" className="text-sm text-[#FF6B35] hover:underline">View all</Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {products.length === 0 ? (
                <p className="text-muted-foreground text-center py-6">No products yet. Create your first listing!</p>
              ) : (
                products.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center gap-3 rounded-lg border p-3">
                    <img src={product.thumbnail_url} alt={product.title} className="h-10 w-10 rounded object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {product.average_rating?.toFixed(1)}
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" /> {product.download_count}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatPrice(product.price)}</p>
                      <Badge variant={product.status === 'APPROVED' ? 'default' : product.status === 'PENDING_REVIEW' ? 'secondary' : 'destructive'} className="text-[10px]">
                        {product.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
