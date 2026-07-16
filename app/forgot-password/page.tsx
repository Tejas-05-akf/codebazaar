'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) { toast.error('Please enter your email'); return; }
    setLoading(true);
    const { error } = await resetPassword(email.trim());
    setLoading(false);
    if (error) {
      toast.error(error);
    } else {
      setSent(true);
      toast.success('Password reset link sent to your email');
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <Link href="/login">
          <Button variant="ghost" size="sm" className="mb-4 gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Login
          </Button>
        </Link>
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-[#FF6B35]/10 flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-[#FF6B35]" />
            </div>
            <CardTitle className="text-2xl">Forgot Password</CardTitle>
            <p className="text-muted-foreground text-sm">
              Enter your email and we&apos;ll send you a reset link
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {sent ? (
              <div className="space-y-4 text-center">
                <div className="rounded-lg bg-green-50 dark:bg-green-950/30 p-4 text-sm text-green-700 dark:text-green-400">
                  Reset link sent! Check your email ({email}) for instructions to reset your password.
                </div>
                <Button className="w-full bg-[#FF6B35] hover:bg-[#FF6B35]/90" onClick={() => window.location.href = '/login'}>
                  Return to Login
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  />
                </div>
                <Button className="w-full bg-[#FF6B35] hover:bg-[#FF6B35]/90" onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
