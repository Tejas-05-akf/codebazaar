'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, Package, ShoppingCart, TrendingUp, Star, Download } from 'lucide-react';

function formatPrice(paise: number) {
  return '₹' + (paise / 100).toLocaleString('en-IN');
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSellers: 0,
    totalProducts: 0,
    approvedProducts: 0,
    totalRevenue: 0,
    platformRevenue: 0,
    totalOrders: 0,
    paidOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<{ label: string; revenue: number }[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    const [usersRes, productsRes, ordersRes] = await Promise.all([
      supabase.from('profiles').select('role'),
      supabase.from('products').select('id, status, download_count, average_rating, review_count, title, price'),
      supabase.from('orders').select('id, amount, platform_fee, payment_status, created_at, product:products(title)').order('created_at', { ascending: false }).limit(10),
    ]);

    const users = usersRes.data || [];
    const products = productsRes.data || [];
    const orders = ordersRes.data || [];

    const paidOrders = orders.filter((o) => o.payment_status === 'PAID');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.amount, 0);
    const platformRevenue = paidOrders.reduce((sum, o) => sum + o.platform_fee, 0);

    setStats({
      totalUsers: users.length,
      totalSellers: users.filter((u) => u.role === 'SELLER').length,
      totalProducts: products.length,
      approvedProducts: products.filter((p) => p.status === 'APPROVED').length,
      totalRevenue,
      platformRevenue,
      totalOrders: orders.length,
      paidOrders: paidOrders.length,
    });

    setRecentOrders(orders.slice(0, 10));

    const top = products
      .filter((p) => p.status === 'APPROVED')
      .sort((a, b) => (b.download_count || 0) - (a.download_count || 0))
      .slice(0, 5);
    setTopProducts(top);

    // Monthly revenue for last 6 months
    const now = new Date();
    const monthly: { label: string; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const label = monthStart.toLocaleDateString('en-IN', { month: 'short' });
      const revenue = paidOrders
        .filter((o) => {
          const d = new Date(o.created_at);
          return d >= monthStart && d <= monthEnd;
        })
        .reduce((sum, o) => sum + o.amount, 0);
      monthly.push({ label, revenue });
    }
    setMonthlyRevenue(monthly);

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue), 1);

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

        <h1 className="text-2xl font-bold mb-6">Platform Analytics</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</p>
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
                  <p className="text-2xl font-bold text-[#FF6B35]">{formatPrice(stats.platformRevenue)}</p>
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
                  <p className="text-2xl font-bold">{stats.totalOrders}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyRevenue.every((m) => m.revenue === 0) ? (
                <p className="text-muted-foreground text-center py-8">No revenue data yet</p>
              ) : (
                <div className="flex items-end justify-between h-48 gap-2">
                  {monthlyRevenue.map((m) => (
                    <div key={m.label} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-muted rounded-t-md flex items-end" style={{ height: '100%' }}>
                        <div
                          className="w-full bg-[#FF6B35] rounded-t-md transition-all"
                          style={{ height: `${(m.revenue / maxRevenue) * 100}%`, minHeight: m.revenue > 0 ? '4px' : '0' }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{m.label}</span>
                      <span className="text-[10px] text-muted-foreground">{formatPrice(m.revenue)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Products by Downloads</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topProducts.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No products yet</p>
              ) : (
                topProducts.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="text-sm font-bold text-muted-foreground w-6">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.title}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Download className="h-3 w-3" /> {p.download_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {p.average_rating?.toFixed(1)}
                        </span>
                        <span>{formatPrice(p.price)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentOrders.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No orders yet</p>
            ) : (
              <div className="divide-y">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium">{order.product?.title || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatPrice(order.amount)}</p>
                      <p className="text-xs text-muted-foreground">{order.payment_status}</p>
                    </div>
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
