'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, ExternalLink, Trash2, Star, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

function formatPrice(paise: number) {
  return '₹' + (paise / 100).toLocaleString('en-IN');
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-500',
  PENDING_REVIEW: 'bg-yellow-500',
  APPROVED: 'bg-green-500',
  REJECTED: 'bg-red-500',
  SUSPENDED: 'bg-gray-700',
};

export default function SellerListingsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) return;
    loadProducts();
  }, [user]);

  async function loadProducts() {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', user?.id)
      .order('created_at', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete');
    } else {
      setProducts(products.filter((p) => p.id !== id));
      toast.success('Product deleted');
    }
  }

  const filtered = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please login to access your listings</p>
          <Button className="bg-[#FF6B35] hover:bg-[#FF6B35]/90" onClick={() => window.location.href = '/login'}>Login</Button>
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">My Listings</h1>
            <p className="text-muted-foreground">Manage your products and track performance</p>
          </div>
          <Link href="/seller/listings/new">
            <Button className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 gap-2">
              <Plus className="h-4 w-4" /> New Product
            </Button>
          </Link>
        </div>

        <div className="mb-6 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground mb-4">No products found</p>
                <Link href="/seller/listings/new">
                  <Button className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 gap-2">
                    <Plus className="h-4 w-4" /> Create First Product
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y">
                {filtered.map((product) => (
                  <div key={product.id} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                    <img src={product.thumbnail_url} alt={product.title} className="h-14 w-14 rounded object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">{product.title}</h3>
                        <Badge className={`${statusColors[product.status] || 'bg-gray-500'} text-white text-[10px]`}>
                          {product.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span>{formatPrice(product.price)}</span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {product.average_rating?.toFixed(1)}
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" /> {product.download_count}
                        </span>
                        <span>{product.review_count} reviews</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/product/${product.slug}`}>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
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
