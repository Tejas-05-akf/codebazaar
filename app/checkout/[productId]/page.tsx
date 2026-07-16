'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Shield, ShoppingCart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

function formatPrice(paise: number) {
  return '₹' + (paise / 100).toLocaleString('en-IN');
}

declare global {
  interface Window {
    Razorpay?: any;
  }
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
      .then(({ data, error }) => {
        if (error || !data) {
          toast.error('Product not found');
        }
        setProduct(data);
        setLoading(false);
      });
  }, [productId]);

  useEffect(() => {
    if (!user) {
      toast.error('Please login to purchase');
    }
  }, [user]);

  const handlePurchase = async () => {
    if (!user || !product) return;
    setProcessing(true);

    try {
      // Step 1: Create Razorpay order via edge function
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;

      const createRes = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/razorpay-create-order`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ product_id: product.id, buyer_id: user.id }),
        }
      );

      if (!createRes.ok) {
        const err = await createRes.json();
        toast.error(err.error || 'Failed to create order');
        setProcessing(false);
        return;
      }

      const orderData = await createRes.json();
      const { order_id, razorpay_order_id, amount, key_id, dev_mode } = orderData;

      // Dev mode: skip Razorpay checkout, verify directly
      if (dev_mode) {
        const verifyRes = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/razorpay-verify`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              order_id,
              razorpay_payment_id: `pay_mock_${Date.now()}`,
              dev_mode: true,
            }),
          }
        );
        const verifyData = await verifyRes.json();
        if (verifyData.success) {
          setOrder({ ...orderData, license_key: verifyData.license_key });
          setCompleted(true);
          toast.success('Purchase successful!');
        } else {
          toast.error(verifyData.error || 'Payment verification failed');
        }
        setProcessing(false);
        return;
      }

      // Step 2: Open Razorpay checkout
      if (!window.Razorpay) {
        toast.error('Payment gateway not loaded. Please refresh and try again.');
        setProcessing(false);
        return;
      }

      const rzp = new window.Razorpay({
        key_id,
        amount,
        currency: 'INR',
        name: 'CodeBazaar',
        description: product.title,
        order_id: razorpay_order_id,
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: { color: '#FF6B35' },
        handler: async (response: any) => {
          // Step 3: Verify payment
          const verifyRes = await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/razorpay-verify`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            }
          );
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            setOrder({ ...orderData, license_key: verifyData.license_key });
            setCompleted(true);
            toast.success('Payment successful!');
            window.location.href = `/payment-success?order_id=${order_id}`;
          } else {
            toast.error(verifyData.error || 'Payment verification failed');
            window.location.href = `/payment-failed?order_id=${order_id}`;
          }
          setProcessing(false);
        },
        modal: {
          ondismiss: () => {
            toast.error('Payment cancelled');
            setProcessing(false);
          },
        },
      });

      rzp.on('payment.failed', (response: any) => {
        toast.error(response.error.description || 'Payment failed');
        window.location.href = `/payment-failed?order_id=${order_id}`;
        setProcessing(false);
      });

      rzp.open();
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Product not found</p>
          <Button className="bg-[#FF6B35] hover:bg-[#FF6B35]/90" onClick={() => window.location.href = '/browse'}>
            Browse Products
          </Button>
        </div>
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
                  View Orders & Download
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
                {product.thumbnail_url && (
                  <img src={product.thumbnail_url} alt={product.title} className="h-16 w-16 rounded object-cover" />
                )}
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
                <p className="text-xs text-muted-foreground">Your payment is processed securely via Razorpay. We do not store your card details.</p>
              </div>
              <Button
                className="w-full bg-[#FF6B35] hover:bg-[#FF6B35]/90 gap-2"
                size="lg"
                onClick={handlePurchase}
                disabled={processing || !user}
              >
                {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
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
