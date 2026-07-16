'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function SellerOnboardingPage() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    displayName: '',
    bio: '',
    panNumber: '',
    bankAccountNumber: '',
    ifscCode: '',
    upiId: '',
  });

  const handleSubmit = async () => {
    if (!user) { toast.error('Please login'); return; }
    if (!form.displayName || !form.panNumber) {
      toast.error('Please fill required fields');
      return;
    }
    setLoading(true);

    const { error: profileError } = await supabase
      .from('seller_profiles')
      .insert({
        user_id: user.id,
        display_name: form.displayName,
        bio: form.bio,
        pan_number: form.panNumber,
        bank_account_number: form.bankAccountNumber,
        ifsc_code: form.ifscCode,
        upi_id: form.upiId,
        kyc_status: 'PENDING',
      });

    if (profileError) {
      toast.error('Failed to create seller profile: ' + profileError.message);
      setLoading(false);
      return;
    }

    const { error: roleError } = await supabase
      .from('profiles')
      .update({ role: 'SELLER' })
      .eq('id', user.id);

    if (roleError) {
      toast.error('Failed to update role: ' + roleError.message);
    } else {
      await refreshUser();
      toast.success('Seller profile created! Your KYC is pending review.');
      window.location.href = '/seller';
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please login to become a seller</p>
          <Button className="bg-[#FF6B35] hover:bg-[#FF6B35]/90" onClick={() => window.location.href = '/login'}>Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Become a Seller</CardTitle>
            <p className="text-muted-foreground">Complete your KYC to start selling on CodeBazaar</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Display Name *</Label>
              <Input placeholder="Your brand or personal name" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea placeholder="Tell buyers about your expertise..." value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>PAN Number *</Label>
              <Input placeholder="ABCDE1234F" value={form.panNumber} onChange={(e) => setForm({ ...form, panNumber: e.target.value.toUpperCase() })} />
            </div>
            <div className="space-y-2">
              <Label>Bank Account Number</Label>
              <Input placeholder="123456789012" value={form.bankAccountNumber} onChange={(e) => setForm({ ...form, bankAccountNumber: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>IFSC Code</Label>
              <Input placeholder="HDFC0001234" value={form.ifscCode} onChange={(e) => setForm({ ...form, ifscCode: e.target.value.toUpperCase() })} />
            </div>
            <div className="space-y-2">
              <Label>UPI ID</Label>
              <Input placeholder="yourname@upi" value={form.upiId} onChange={(e) => setForm({ ...form, upiId: e.target.value })} />
            </div>
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-4 text-sm text-amber-700 dark:text-amber-400">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <div>
                  <p className="font-medium">KYC & Payout Information</p>
                  <p className="mt-1">Your KYC will be reviewed within 1-2 business days. Payouts are processed weekly. TDS of 1% is deducted on all payouts as per Indian tax law.</p>
                </div>
              </div>
            </div>
            <Button className="w-full bg-[#FF6B35] hover:bg-[#FF6B35]/90" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit KYC'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
