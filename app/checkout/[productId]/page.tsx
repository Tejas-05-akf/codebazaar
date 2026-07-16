'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Shield, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

function formatPrice(paise: number) {
  return '₹' + (paise / 100).toLocaleString('en-IN');
}

export default function CheckoutPage() {
  const { productId } = useParams<{ productId: string }>();
  const { user } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (!productId) return;
    supabase
      .from('products')
      .select('*, seller:profiles(name)')
      .eq('id', productId)
      .single()
      .then(({ data }) => {
        setProduct(data);
        setLoading(false);
      });
  }, [productId]);

  useEffect(() => {
    if (!user) {
      toast.error('Please login to purchase');
      return;
    }
  }, [user]);

  const handlePurchase = async () => {
    if (!user || !product) return;
    setProcessing(true);
    
    const amount = product.price;
    const platformFee = Math.round(amount * 0.3);
    const sellerEarning = amount - platformFee;

    const { data: orderData, error } = await supabase
      .from('orders')
      .insert({
        buyer_id: user.id,
        product_id: product.id,
        amount,
        platform_fee: platformFee,
        seller_earning: sellerEarning,
        payment_status: 'PAID',
        license_key: `lic_${crypto.randomUUID()}`,
      })
      .select()
      .single();

    if (error) {
      toast.error('Purchase failed: ' + error.message);
      setProcessing(false);
      return;
    }

    setOrder(orderData);
    setCompleted(true);
    toast.success('Purchase successful!');
    setProcessing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Product not found</div>
      </div>
    );
  }

  if (completed && order) {
    return (
      <div className="min-h-screen bg-muted/20 py-12">
        <div className="container mx-auto px-4 max-w-lg">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto rounded-full bg-green-100 p-3 w-fit mb-2">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Purchase Complete!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">You now have access to <strong>{product.title}</strong></p>
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">License Key</span>
                </div>
                <code className="block text-sm font-mono bg-background p-2 rounded border select-all">{order.license_key}</code>
              </div>
              <div className="flex gap-3">
                <Button className="flex-1 bg-[#FF6B35] hover:bg-[#FF6B35]/90" onClick={() => window.location.href = '/orders'}>
                  View Orders
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => window.location.href = `/product/${product.slug}`}>
                  Back to Product
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <img src={product.thumbnail_url} alt={product.title} className="h-16 w-16 rounded object-cover" />
                <div>
                  <h3 className="font-semibold">{product.title}</h3>
                  <p className="text-sm text-muted-foreground">by {product.seller?.name}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(product.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform Fee (30%)</span>
                  <span>{formatPrice(Math.round(product.price * 0.3))}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-[#FF6B35]">{formatPrice(product.price)}</span>
                </div>
                <p className="text-xs text-muted-foreground">GST inclusive</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Shield className="h-4 w-4 text-[#FF6B35]" />
                  Secure Checkout
                </div>
                <p className="text-xs text-muted-foreground">Your payment is processed securely. We do not store your card details.</p>
              </div>
              <Button
                className="w-full bg-[#FF6B35] hover:bg-[#FF6B35]/90 gap-2"
                size="lg"
                onClick={handlePurchase}
                disabled={processing}
              >
                <ShoppingCart className="h-4 w-4" />
                {processing ? 'Processing...' : `Pay ${formatPrice(product.price)}`}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                By purchasing, you agree to our license terms
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
