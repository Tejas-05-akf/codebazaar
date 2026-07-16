'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, Trash2, Star, Search } from 'lucide-react';
import { toast } from 'sonner';

function formatPrice(paise: number) {
  return '₹' + (paise / 100).toLocaleString('en-IN');
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-500',
  PENDING_REVIEW: 'bg-yellow-500',
  APPROVED: 'bg-green-500',
  REJECTED: 'bg-red-500',
  SUSPENDED: 'bg-gray-700',
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const { data } = await supabase
      .from('products')
      .select('*, seller:profiles(name)')
      .order('created_at', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  }

  async function handleApprove(id: string) {
    const { error } = await supabase
      .from('products')
      .update({ status: 'APPROVED' })
      .eq('id', id);
    if (error) {
      toast.error('Failed to approve product');
    } else {
      toast.success('Product approved');
      loadProducts();
    }
  }

  async function handleReject(id: string) {
    if (!rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    const { error: updateError } = await supabase
      .from('products')
      .update({ status: 'REJECTED' })
      .eq('id', id);
    if (updateError) {
      toast.error('Failed to reject product');
      return;
    }
    const { error: rejectError } = await supabase
      .from('product_rejections')
      .insert({ product_id: id, reason: rejectReason.trim() });
    if (rejectError) {
      toast.error('Failed to save rejection reason');
    } else {
      toast.success('Product rejected');
      setRejecting(null);
      setRejectReason('');
      loadProducts();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete product');
    } else {
      toast.success('Product deleted');
      loadProducts();
    }
  }

  async function handleFeature(id: string, currentFeatured: boolean) {
    const { error } = await supabase
      .from('products')
      .update({ is_featured: !currentFeatured })
      .eq('id', id);
    if (error) {
      toast.error('Failed to update featured status');
    } else {
      toast.success(!currentFeatured ? 'Product featured' : 'Product unfeatured');
      loadProducts();
    }
  }

  async function handleSuspend(id: string) {
    const { error } = await supabase
      .from('products')
      .update({ status: 'SUSPENDED' })
      .eq('id', id);
    if (error) {
      toast.error('Failed to suspend product');
    } else {
      toast.success('Product suspended');
      loadProducts();
    }
  }

  const filtered = products.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || p.status === filter;
    return matchesSearch && matchesFilter;
  });

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

        <h1 className="text-2xl font-bold mb-6">Product Management</h1>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filter === f ? 'bg-[#FF6B35] text-white' : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {f === 'all' ? 'All' : f.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">No products found</p>
            ) : (
              <div className="divide-y">
                {filtered.map((product) => (
                  <div key={product.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <img
                        src={product.thumbnail_url || 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg'}
                        alt={product.title}
                        className="h-14 w-14 rounded object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold truncate">{product.title}</h3>
                          <Badge className={`${statusColors[product.status] || 'bg-gray-500'} text-white text-[10px]`}>
                            {product.status}
                          </Badge>
                          {product.is_featured && (
                            <Badge className="bg-[#FF6B35] text-white text-[10px]">Featured</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span>{formatPrice(product.price)}</span>
                          <span>by {product.seller?.name}</span>
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {product.average_rating?.toFixed(1)}
                          </span>
                          <span>{product.download_count} downloads</span>
                          <span>{formatDate(product.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {product.status === 'PENDING_REVIEW' && (
                          <>
                            <Button size="sm" variant="ghost" onClick={() => handleApprove(product.id)}>
                              <Check className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setRejecting(product.id)}>
                              <X className="h-4 w-4 text-red-500" />
                            </Button>
                          </>
                        )}
                        {product.status === 'APPROVED' && (
                          <Button size="sm" variant="ghost" onClick={() => handleSuspend(product.id)}>
                            <X className="h-4 w-4 text-amber-500" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleFeature(product.id, product.is_featured)}
                        >
                          <Star className={`h-4 w-4 ${product.is_featured ? 'fill-[#FF6B35] text-[#FF6B35]' : 'text-muted-foreground'}`} />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(product.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    {rejecting === product.id && (
                      <div className="mt-3 pl-18 space-y-2">
                        <Textarea
                          placeholder="Reason for rejection..."
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          className="min-h-[60px]"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" variant="destructive" onClick={() => handleReject(product.id)}>
                            Confirm Reject
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => { setRejecting(null); setRejectReason(''); }}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
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
