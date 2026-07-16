'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Eye, Package, Clock } from 'lucide-react';
import { toast } from 'sonner';

function formatPrice(paise: number) {
  return '₹' + (paise / 100).toLocaleString('en-IN');
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('orders')
      .select('*, product:products(*)')
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders(data || []);
        setLoading(false);
      });
  }, [user]);

  const handleDownload = async (order: any) => {
    if (order.download_count >= order.max_downloads) {
      toast.error('Download limit reached. Contact support.');
      return;
    }
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

      // Call the create_download_token RPC
      const { data, error } = await supabase.rpc('create_download_token', {
        p_order_id: order.id,
        p_buyer_id: order.buyer_id,
        p_product_id: order.product_id,
      });

      if (error || !data) {
        toast.error('Failed to generate download link');
        return;
      }

      // Trigger download via edge function
      window.open(`${supabaseUrl}/functions/v1/secure-download?token=${data}&order_id=${order.id}`, '_blank');
      toast.success('Download started!');
      // Reload orders to update download count
      if (user) {
        supabase
          .from('orders')
          .select('*, product:products(*)')
          .eq('buyer_id', user.id)
          .order('created_at', { ascending: false })
          .then(({ data }) => setOrders(data || []));
      }
    } catch {
      toast.error('Download failed. Please try again.');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please login to view your orders</p>
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
        <div className="text-center">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">My Orders</h1>
        {orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-4">Start browsing and discover amazing developer products</p>
            <Button className="bg-[#FF6B35] hover:bg-[#FF6B35]/90" onClick={() => window.location.href = '/browse'}>
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="h-32 md:h-auto md:w-48 bg-muted flex-shrink-0">
                      <img
                        src={order.product?.thumbnail_url || 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg'}
                        alt={order.product?.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{order.product?.title}</h3>
                          <p className="text-sm text-muted-foreground">Purchased on {formatDate(order.created_at)}</p>
                        </div>
                        <Badge variant={order.payment_status === 'PAID' ? 'default' : 'secondary'} className={order.payment_status === 'PAID' ? 'bg-green-500' : ''}>
                          {order.payment_status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-bold">{formatPrice(order.amount)}</span>
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Download className="h-3 w-3" /> {order.download_count} / {order.max_downloads} downloads
                        </span>
                      </div>
                      {order.payment_status === 'PAID' && (
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            onClick={() => handleDownload(order)}
                            disabled={order.download_count >= order.max_downloads}
                          >
                            <Download className="h-3 w-3" /> Re-download
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            onClick={() => {
                              const el = document.createElement('textarea');
                              el.value = order.license_key;
                              document.body.appendChild(el);
                              el.select();
                              document.execCommand('copy');
                              document.body.removeChild(el);
                              toast.success('License key copied!');
                            }}
                          >
                            <Eye className="h-3 w-3" /> Copy License Key
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
