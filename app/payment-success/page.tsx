'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Download, Package } from 'lucide-react';
import Link from 'next/link';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    supabase
      .from('orders')
      .select('*, product:products(title, slug)')
      .eq('id', orderId)
      .single()
      .then(({ data }) => {
        setOrder(data);
        setLoading(false);
      });
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto rounded-full bg-green-100 dark:bg-green-950/30 p-4 w-fit mb-2">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Payment Successful</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Your purchase of <strong>{order?.product?.title}</strong> is complete.
            </p>
            {order?.license_key && (
              <div className="rounded-lg bg-muted p-4 text-left space-y-1">
                <p className="text-xs text-muted-foreground">Your License Key</p>
                <code className="block text-sm font-mono select-all">{order.license_key}</code>
              </div>
            )}
            <div className="space-y-2">
              <Link href="/orders">
                <Button className="w-full bg-[#FF6B35] hover:bg-[#FF6B35]/90 gap-2">
                  <Download className="h-4 w-4" /> Download Your Product
                </Button>
              </Link>
              <Link href="/browse">
                <Button variant="outline" className="w-full gap-2">
                  <Package className="h-4 w-4" /> Continue Browsing
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
