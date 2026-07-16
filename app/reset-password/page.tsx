'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!password) { toast.error('Please enter a new password'); return; }
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    const { error } = await updatePassword(password);
    setLoading(false);
    if (error) {
      toast.error(error);
    } else {
      setDone(true);
      toast.success('Password updated successfully!');
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-[#FF6B35]/10 flex items-center justify-center mb-4">
              {done ? <Check className="h-6 w-6 text-green-600" /> : <Lock className="h-6 w-6 text-[#FF6B35]" />}
            </div>
            <CardTitle className="text-2xl">{done ? 'Password Updated' : 'Reset Password'}</CardTitle>
            <p className="text-muted-foreground text-sm">
              {done ? 'You can now login with your new password' : 'Enter your new password below'}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {done ? (
              <Button className="w-full bg-[#FF6B35] hover:bg-[#FF6B35]/90" onClick={() => window.location.href = '/login'}>
                Go to Login
              </Button>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Confirm Password</Label>
                  <Input
                    type="password"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  />
                </div>
                <Button className="w-full bg-[#FF6B35] hover:bg-[#FF6B35]/90" onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Updating...' : 'Update Password'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
