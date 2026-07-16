'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Wallet, ArrowUpRight, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

function formatPrice(paise: number) {
  return '₹' + (paise / 100).toLocaleString('en-IN');
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function SellerPayoutsPage() {
  const { user } = useAuth();
  const [sellerProfile, setSellerProfile] = useState<any>(null);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestAmount, setRequestAmount] = useState('');
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (!user || (user.role !== 'SELLER' && user.role !== 'SUPER_ADMIN')) return;
    loadData();
  }, [user]);

  async function loadData() {
    const [profileRes, payoutsRes] = await Promise.all([
      supabase.from('seller_profiles').select('*').eq('user_id', user?.id).single(),
      supabase.from('payout_requests').select('*').eq('seller_id', user?.id).order('requested_at', { ascending: false }),
    ]);
    setSellerProfile(profileRes.data);
    setPayouts(payoutsRes.data || []);
    setLoading(false);
  }

  const handleRequest = async () => {
    if (!user || !sellerProfile) return;
    const amount = parseInt(requestAmount) * 100;
    if (isNaN(amount) || amount < 50000) {
      toast.error('Minimum payout amount is ₹500');
      return;
    }
    if (amount > sellerProfile.pending_payout) {
      toast.error('Amount exceeds available payout balance');
      return;
    }
    setRequesting(true);
    const { error } = await supabase.from('payout_requests').insert({
      seller_id: user.id,
      amount,
      status: 'PENDING',
    });
    if (error) {
      toast.error('Failed to request payout');
    } else {
      toast.success('Payout request submitted!');
      setRequestAmount('');
      loadData();
    }
    setRequesting(false);
  };

  if (!user || (user.role !== 'SELLER' && user.role !== 'SUPER_ADMIN')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Seller access required</p>
          <Button className="bg-[#FF6B35] hover:bg-[#FF6B35]/90" onClick={() => window.location.href = '/seller/onboarding'}>Become a Seller</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Payouts</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Available for Payout</p>
                  <p className="text-3xl font-bold text-[#FF6B35]">{formatPrice(sellerProfile?.pending_payout || 0)}</p>
                </div>
                <Wallet className="h-10 w-10 text-[#FF6B35]" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Earned</p>
                  <p className="text-3xl font-bold">{formatPrice(sellerProfile?.total_earnings || 0)}</p>
                </div>
                <ArrowUpRight className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Request Payout</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Input
                type="number"
                placeholder="Amount in ₹"
                value={requestAmount}
                onChange={(e) => setRequestAmount(e.target.value)}
                className="max-w-xs"
              />
              <Button className="bg-[#FF6B35] hover:bg-[#FF6B35]/90" onClick={handleRequest} disabled={requesting}>
                {requesting ? 'Requesting...' : 'Request Payout'}
              </Button>
            </div>
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3 text-sm text-amber-700 dark:text-amber-400 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              <p>Minimum payout amount is ₹500. Payouts are processed within 3-5 business days. 1% TDS is deducted on all payouts.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payout History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {payouts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No payout requests yet</p>
            ) : (
              <div className="divide-y">
                {payouts.map((payout) => (
                  <div key={payout.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-semibold">{formatPrice(payout.amount)}</p>
                      <p className="text-xs text-muted-foreground">Requested {formatDate(payout.requested_at)}</p>
                    </div>
                    <Badge
                      variant={payout.status === 'PAID' ? 'default' : payout.status === 'PENDING' ? 'secondary' : 'destructive'}
                      className={payout.status === 'PAID' ? 'bg-green-500' : payout.status === 'PENDING' ? '' : ''}
                    >
                      {payout.status}
                    </Badge>
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
