'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  AlertCircle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Clock,
  Star,
  ArrowRight,
} from 'lucide-react';

function formatPrice(paise: number) {
  return '₹' + (paise / 100).toLocaleString('en-IN');
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalGMV: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalSellers: 0,
    totalBuyers: 0,
    pendingReviews: 0,
    pendingKYC: 0,
    pendingPayouts: 0,
  });
  const [pendingProducts, setPendingProducts] = useState<any[]>([]);
  const [pendingSellers, setPendingSellers] = useState<any[]>([]);
  const [pendingPayouts, setPendingPayouts] = useState<any[]>([]);

  useEffect(() => {
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) return;
    loadData();
  }, [user]);

  async function loadData() {
    const [productsRes, ordersRes, sellersRes, buyersRes, kycRes, payoutsRes, pendingProductsRes] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'APPROVED'),
      supabase.from('orders').select('amount').eq('payment_status', 'PAID'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'SELLER'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'BUYER'),
      supabase.from('seller_profiles').select('*').eq('kyc_status', 'PENDING'),
      supabase.from('payout_requests').select('*').eq('status', 'PENDING'),
      supabase.from('products').select('*, seller:profiles(name)').eq('status', 'PENDING_REVIEW').order('created_at', { ascending: false }).limit(10),
    ]);

    const totalGMV = ordersRes.data?.reduce((sum, o) => sum + (o.amount || 0), 0) || 0;

    setStats({
      totalGMV,
      totalOrders: ordersRes.data?.length || 0,
      totalProducts: productsRes.count || 0,
      totalSellers: sellersRes.count || 0,
      totalBuyers: buyersRes.count || 0,
      pendingReviews: pendingProductsRes.data?.length || 0,
      pendingKYC: kycRes.data?.length || 0,
      pendingPayouts: payoutsRes.data?.length || 0,
    });
    setPendingProducts(pendingProductsRes.data || []);
    setPendingSellers(kycRes.data || []);
    setPendingPayouts(payoutsRes.data || []);
    setLoading(false);
  }

  const handleProductAction = async (productId: string, action: 'approve' | 'reject') => {
    const { error } = await supabase
      .from('products')
      .update({ status: action === 'approve' ? 'APPROVED' : 'REJECTED' })
      .eq('id', productId);
    if (error) {
      toast.error('Failed to update');
    } else {
      toast.success(`Product ${action === 'approve' ? 'approved' : 'rejected'}`);
      loadData();
    }
  };

  const handleKYCAction = async (sellerId: string, action: 'APPROVED' | 'REJECTED') => {
    const { error } = await supabase
      .from('seller_profiles')
      .update({ kyc_status: action })
      .eq('id', sellerId);
    if (error) {
      toast.error('Failed to update KYC');
    } else {
      toast.success(`KYC ${action.toLowerCase()}`);
      loadData();
    }
  };

  const handlePayoutAction = async (payoutId: string) => {
    const { error } = await supabase
      .from('payout_requests')
      .update({ status: 'PAID', processed_at: new Date().toISOString() })
      .eq('id', payoutId);
    if (error) {
      toast.error('Failed to process payout');
    } else {
      toast.success('Payout marked as paid');
      loadData();
    }
  };

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold mb-2">Admin access required</h2>
          <p className="text-muted-foreground mb-6">You do not have permission to access this page.</p>
          <Button className="bg-[#FF6B35] hover:bg-[#FF6B35]/90" onClick={() => window.location.href = '/login'}>
            Login
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading admin dashboard...</div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total GMV', value: formatPrice(stats.totalGMV), icon: DollarSign, color: 'text-[#FF6B35]' },
    { label: 'Total Orders', value: stats.totalOrders.toString(), icon: ShoppingCart, color: 'text-blue-500' },
    { label: 'Total Products', value: stats.totalProducts.toString(), icon: Package, color: 'text-green-500' },
    { label: 'Total Sellers', value: stats.totalSellers.toString(), icon: Users, color: 'text-purple-500' },
  ];

  const pendingCards = [
    { label: 'Pending Reviews', value: stats.pendingReviews, icon: Clock, href: '#products' },
    { label: 'Pending KYC', value: stats.pendingKYC, icon: AlertCircle, href: '#sellers' },
    { label: 'Pending Payouts', value: stats.pendingPayouts, icon: DollarSign, href: '#payouts' },
  ];

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

        <div className="flex flex-wrap gap-2 mb-6">
          <Link href="/admin"><Button variant="outline" size="sm">Overview</Button></Link>
          <Link href="/admin/products"><Button variant="outline" size="sm">Products</Button></Link>
          <Link href="/admin/users"><Button variant="outline" size="sm">Users</Button></Link>
          <Link href="/admin/orders"><Button variant="outline" size="sm">Orders</Button></Link>
          <Link href="/admin/analytics"><Button variant="outline" size="sm">Analytics</Button></Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((stat) => (
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {pendingCards.map((card) => (
            <Card key={card.label} className="border-l-4 border-l-[#FF6B35]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                    <p className="text-3xl font-bold">{card.value}</p>
                  </div>
                  <card.icon className="h-8 w-8 text-[#FF6B35]" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="products">
          <TabsList>
            <TabsTrigger value="products">Product Queue ({stats.pendingReviews})</TabsTrigger>
            <TabsTrigger value="sellers">KYC Queue ({stats.pendingKYC})</TabsTrigger>
            <TabsTrigger value="payouts">Payouts ({stats.pendingPayouts})</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pending Product Reviews</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {pendingProducts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No pending products</p>
                ) : (
                  <div className="divide-y">
                    {pendingProducts.map((product) => (
                      <div key={product.id} className="flex items-center gap-4 p-4">
                        <img src={product.thumbnail_url} alt={product.title} className="h-14 w-14 rounded object-cover" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold">{product.title}</h3>
                          <p className="text-xs text-muted-foreground">by {product.seller?.name} • {product.category} • {formatPrice(product.price)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" className="bg-green-500 hover:bg-green-600 gap-1" onClick={() => handleProductAction(product.id, 'approve')}>
                            <CheckCircle className="h-3 w-3" /> Approve
                          </Button>
                          <Button size="sm" variant="destructive" className="gap-1" onClick={() => handleProductAction(product.id, 'reject')}>
                            <XCircle className="h-3 w-3" /> Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sellers" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pending KYC Reviews</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {pendingSellers.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No pending KYC requests</p>
                ) : (
                  <div className="divide-y">
                    {pendingSellers.map((seller) => (
                      <div key={seller.id} className="flex items-center gap-4 p-4">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
                          {seller.display_name?.[0] || 'S'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold">{seller.display_name}</h3>
                          <p className="text-xs text-muted-foreground">PAN: {seller.pan_number} • UPI: {seller.upi_id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" className="bg-green-500 hover:bg-green-600 gap-1" onClick={() => handleKYCAction(seller.id, 'APPROVED')}>
                            <CheckCircle className="h-3 w-3" /> Approve
                          </Button>
                          <Button size="sm" variant="destructive" className="gap-1" onClick={() => handleKYCAction(seller.id, 'REJECTED')}>
                            <XCircle className="h-3 w-3" /> Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payouts" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pending Payouts</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {pendingPayouts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No pending payouts</p>
                ) : (
                  <div className="divide-y">
                    {pendingPayouts.map((payout) => (
                      <div key={payout.id} className="flex items-center gap-4 p-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold">{formatPrice(payout.amount)}</h3>
                          <p className="text-xs text-muted-foreground">Requested {formatDate(payout.requested_at)}</p>
                        </div>
                        <Button size="sm" className="bg-green-500 hover:bg-green-600 gap-1" onClick={() => handlePayoutAction(payout.id)}>
                          <CheckCircle className="h-3 w-3" /> Mark Paid
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
