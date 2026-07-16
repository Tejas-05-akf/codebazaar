'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');

  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto rounded-full bg-red-100 dark:bg-red-950/30 p-4 w-fit mb-2">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Payment Failed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Your payment could not be processed. No charges have been made.
            </p>
            {orderId && (
              <p className="text-xs text-muted-foreground">Order reference: {orderId}</p>
            )}
            <div className="space-y-2">
              <Link href="/browse">
                <Button className="w-full bg-[#FF6B35] hover:bg-[#FF6B35]/90 gap-2">
                  <RefreshCw className="h-4 w-4" /> Try Again
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full gap-2">
                  <Home className="h-4 w-4" /> Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>}>
      <PaymentFailedContent />
    </Suspense>
  );
}
