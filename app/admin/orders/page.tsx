'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, RefreshCw, DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

function formatPrice(paise: number) {
  return '₹' + (paise / 100).toLocaleString('en-IN');
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    const { data } = await supabase
      .from('orders')
      .select('*, product:products(title), buyer:profiles(name), seller:profiles!products_seller_id_fkey(name)')
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  }

  async function handleRefund(id: string) {
    if (!confirm('Process refund for this order?')) return;
    const { error } = await supabase
      .from('orders')
      .update({ payment_status: 'REFUNDED' })
      .eq('id', id);
    if (error) {
      toast.error('Failed to process refund');
    } else {
      toast.success('Refund processed');
      loadOrders();
    }
  }

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.product?.title?.toLowerCase().includes(search.toLowerCase()) ||
      o.buyer?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || o.payment_status === filter;
    return matchesSearch && matchesFilter;
  });

  const totalRevenue = orders
    .filter((o) => o.payment_status === 'PAID')
    .reduce((sum, o) => sum + o.amount, 0);
  const platformRevenue = orders
    .filter((o) => o.payment_status === 'PAID')
    .reduce((sum, o) => sum + o.platform_fee, 0);
  const totalOrders = orders.length;
  const refundedOrders = orders.filter((o) => o.payment_status === 'REFUNDED').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-2 mb-6">
          <Link href="/admin"><Button variant="outline" size="sm">Overview</Button></Link>
          <Link href="/admin/products"><Button variant="outline" size="sm">Products</Button></Link>
          <Link href="/admin/users"><Button variant="outline" size="sm">Users</Button></Link>
          <Link href="/admin/orders"><Button variant="outline" size="sm">Orders</Button></Link>
          <Link href="/admin/analytics"><Button variant="outline" size="sm">Analytics</Button></Link>
        </div>

        <h1 className="text-2xl font-bold mb-6">Order Management</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatPrice(totalRevenue)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Platform Revenue</p>
                  <p className="text-2xl font-bold text-[#FF6B35]">{formatPrice(platformRevenue)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-[#FF6B35]" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{totalOrders}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Refunded</p>
                  <p className="text-2xl font-bold">{refundedOrders}</p>
                </div>
                <RefreshCw className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by product or buyer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'PAID', 'PENDING', 'FAILED', 'REFUNDED'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filter === f ? 'bg-[#FF6B35] text-white' : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {f === 'all' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">No orders found</p>
            ) : (
              <div className="divide-y">
                {filtered.map((order) => (
                  <div key={order.id} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold truncate">{order.product?.title || 'Unknown product'}</h3>
                        <Badge
                          variant={order.payment_status === 'PAID' ? 'default' : order.payment_status === 'REFUNDED' ? 'destructive' : 'secondary'}
                          className={order.payment_status === 'PAID' ? 'bg-green-500' : ''}
                        >
                          {order.payment_status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span>Buyer: {order.buyer?.name}</span>
                        <span>{formatDate(order.created_at)}</span>
                        <span>{order.download_count}/{order.max_downloads} downloads</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold">{formatPrice(order.amount)}</p>
                      <p className="text-xs text-muted-foreground">Fee: {formatPrice(order.platform_fee)}</p>
                    </div>
                    {order.payment_status === 'PAID' && (
                      <Button size="sm" variant="outline" onClick={() => handleRefund(order.id)} className="flex-shrink-0">
                        <RefreshCw className="h-3 w-3 mr-1" /> Refund
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
