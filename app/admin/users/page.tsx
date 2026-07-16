'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Ban, CheckCircle, User, Store, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    const { data } = await supabase
      .from('profiles')
      .select('*, seller:seller_profiles(kyc_status)')
      .order('created_at', { ascending: false });
    setUsers(data || []);
    setLoading(false);
  }

  async function handleBan(id: string, currentBanned: boolean) {
    const { error } = await supabase
      .from('profiles')
      .update({ is_banned: !currentBanned })
      .eq('id', id);
    if (error) {
      toast.error('Failed to update user');
    } else {
      toast.success(!currentBanned ? 'User banned' : 'User unbanned');
      loadUsers();
    }
  }

  async function handleVerify(id: string, currentVerified: boolean) {
    const { error } = await supabase
      .from('profiles')
      .update({ is_verified: !currentVerified })
      .eq('id', id);
    if (error) {
      toast.error('Failed to update verification');
    } else {
      toast.success(!currentVerified ? 'User verified' : 'Verification removed');
      loadUsers();
    }
  }

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || u.role === filter;
    return matchesSearch && matchesFilter;
  });

  const counts = {
    total: users.length,
    buyers: users.filter((u) => u.role === 'BUYER').length,
    sellers: users.filter((u) => u.role === 'SELLER').length,
    admins: users.filter((u) => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-2 mb-6">
          <Link href="/admin"><Button variant="outline" size="sm">Overview</Button></Link>
          <Link href="/admin/products"><Button variant="outline" size="sm">Products</Button></Link>
          <Link href="/admin/users"><Button variant="outline" size="sm">Users</Button></Link>
          <Link href="/admin/orders"><Button variant="outline" size="sm">Orders</Button></Link>
          <Link href="/admin/analytics"><Button variant="outline" size="sm">Analytics</Button></Link>
        </div>

        <h1 className="text-2xl font-bold mb-6">User Management</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{counts.total}</p>
                </div>
                <User className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Buyers</p>
                  <p className="text-2xl font-bold">{counts.buyers}</p>
                </div>
                <ShoppingBag className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sellers</p>
                  <p className="text-2xl font-bold">{counts.sellers}</p>
                </div>
                <Store className="h-8 w-8 text-[#FF6B35]" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Admins</p>
                  <p className="text-2xl font-bold">{counts.admins}</p>
                </div>
                <User className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'BUYER', 'SELLER', 'ADMIN'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filter === f ? 'bg-[#FF6B35] text-white' : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {f === 'all' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase() + 's'}
              </button>
            ))}
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">No users found</p>
            ) : (
              <div className="divide-y">
                {filtered.map((u) => (
                  <div key={u.id} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold">{u.name?.[0]?.toUpperCase() || 'U'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold truncate">{u.name}</h3>
                        <Badge variant="outline" className="text-[10px]">{u.role}</Badge>
                        {u.is_verified && (
                          <Badge className="bg-green-500 text-white text-[10px]">Verified</Badge>
                        )}
                        {u.is_banned && (
                          <Badge variant="destructive" className="text-[10px]">Banned</Badge>
                        )}
                        {u.seller?.kyc_status && (
                          <Badge variant="outline" className="text-[10px]">KYC: {u.seller.kyc_status}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{u.email} • Joined {formatDate(u.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleVerify(u.id, u.is_verified)}
                        title={u.is_verified ? 'Remove verification' : 'Verify user'}
                      >
                        <CheckCircle className={`h-4 w-4 ${u.is_verified ? 'text-green-500' : 'text-muted-foreground'}`} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleBan(u.id, u.is_banned)}
                        title={u.is_banned ? 'Unban user' : 'Ban user'}
                      >
                        <Ban className={`h-4 w-4 ${u.is_banned ? 'text-red-500' : 'text-muted-foreground'}`} />
                      </Button>
                    </div>
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
