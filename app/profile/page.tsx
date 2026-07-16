'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { User, Mail, Calendar, Shield } from 'lucide-react';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  const handleUpdate = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ name })
      .eq('id', user.id);
    if (error) {
      toast.error('Failed to update profile');
    } else {
      await refreshUser();
      toast.success('Profile updated!');
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please login to view your profile</p>
          <Button className="bg-[#FF6B35] hover:bg-[#FF6B35]/90" onClick={() => window.location.href = '/login'}>Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 py-12">
      <div className="container mx-auto px-4 max-w-lg">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto h-20 w-20 rounded-full bg-[#FF6B35]/10 flex items-center justify-center mb-4">
              <User className="h-10 w-10 text-[#FF6B35]" />
            </div>
            <CardTitle className="text-2xl">Your Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user.email} disabled />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input value={user.role} disabled />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Joined {new Date(user.created_at).toLocaleDateString('en-IN')}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              {user.is_verified ? 'Verified account' : 'Unverified'}
            </div>
            <Button className="w-full bg-[#FF6B35] hover:bg-[#FF6B35]/90" onClick={handleUpdate} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
