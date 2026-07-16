'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Store, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

export default function SignupPage() {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'BUYER' | 'SELLER'>('BUYER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await signup(email, password, name, role);
    if (error) {
      setError(error);
      toast.error('Sign up failed');
    } else {
      toast.success('Account created! Check your email for verification.');
      window.location.href = '/';
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
          <CardDescription>Join CodeBazaar as a buyer or seller</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
            <div className="space-y-2">
              <Label>I want to</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('BUYER')}
                  className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors ${role === 'BUYER' ? 'border-[#FF6B35] bg-[#FF6B35]/5' : 'border-border hover:bg-muted'}`}
                >
                  <ShoppingBag className={`h-6 w-6 ${role === 'BUYER' ? 'text-[#FF6B35]' : 'text-muted-foreground'}`} />
                  <span className={`text-sm font-medium ${role === 'BUYER' ? 'text-[#FF6B35]' : ''}`}>Buy Products</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('SELLER')}
                  className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors ${role === 'SELLER' ? 'border-[#FF6B35] bg-[#FF6B35]/5' : 'border-border hover:bg-muted'}`}
                >
                  <Store className={`h-6 w-6 ${role === 'SELLER' ? 'text-[#FF6B35]' : 'text-muted-foreground'}`} />
                  <span className={`text-sm font-medium ${role === 'SELLER' ? 'text-[#FF6B35]' : ''}`}>Sell Products</span>
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full bg-[#FF6B35] hover:bg-[#FF6B35]/90" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-[#FF6B35] hover:underline">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
