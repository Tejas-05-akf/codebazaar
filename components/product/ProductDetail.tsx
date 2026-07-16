'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Download, ExternalLink, ShoppingCart, Check, Shield } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

function formatPrice(paise: number) {
  return '₹' + (paise / 100).toLocaleString('en-IN');
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function ProductDetail({ product }: { product: any }) {
  const { user } = useAuth();
  const [activeImage, setActiveImage] = useState(product.thumbnail_url || product.screenshots[0]);
  const [buying, setBuying] = useState(false);

  const allImages = [product.thumbnail_url, ...product.screenshots].filter(Boolean);

  const handleBuy = async () => {
    if (!user) {
      toast.error('Please login to purchase');
      return;
    }
    setBuying(true);
    // Simulate checkout redirect
    toast.success('Redirecting to checkout...');
    setTimeout(() => {
      window.location.href = `/checkout/${product.id}`;
    }, 500);
    setBuying(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
      {/* Left - Images */}
      <div className="space-y-4">
        <div className="aspect-video rounded-xl overflow-hidden border bg-muted">
          <img src={activeImage} alt={product.title} className="h-full w-full object-cover" />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveImage(img)}
              className={`aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                activeImage === img ? 'border-[#FF6B35]' : 'border-transparent hover:border-muted-foreground'
              }`}
            >
              <img src={img} alt={`Screenshot ${i + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Right - Info */}
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{product.category}</Badge>
            <Badge variant="outline">{product.license_type}</Badge>
          </div>
          <h1 className="text-3xl font-bold">{product.title}</h1>
          <p className="text-muted-foreground">{product.short_description}</p>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            {product.average_rating?.toFixed(1)} ({product.review_count} reviews)
          </span>
          <span className="flex items-center gap-1">
            <Download className="h-4 w-4 text-muted-foreground" />
            {product.download_count} downloads
          </span>
          <span className="text-muted-foreground">by {product.seller?.name}</span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-[#FF6B35]">{formatPrice(product.price)}</span>
          <span className="text-sm text-muted-foreground">GST inclusive</span>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            size="lg"
            className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white gap-2"
            onClick={handleBuy}
            disabled={buying}
          >
            <ShoppingCart className="h-4 w-4" />
            {buying ? 'Processing...' : 'Buy Now'}
          </Button>
          {product.demo_url && (
            <a href={product.demo_url} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="gap-2">
                <ExternalLink className="h-4 w-4" /> Live Demo
              </Button>
            </a>
          )}
        </div>

        <div className="space-y-2 rounded-lg border p-4 bg-muted/30">
          <h4 className="font-semibold text-sm">What's included</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500" /> Full source code</li>
            <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500" /> Documentation</li>
            <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500" /> 6 months support</li>
            <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500" /> Free updates</li>
          </ul>
        </div>

        <div className="flex flex-wrap gap-1">
          {product.tech_stack.map((tech: string) => (
            <Badge key={tech} variant="secondary" className="text-xs">{tech}</Badge>
          ))}
        </div>
      </div>

      {/* Tabs - Full Width */}
      <div className="lg:col-span-2">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({product.review_count})</TabsTrigger>
            <TabsTrigger value="license">License</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-4">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div className="whitespace-pre-wrap">{product.description}</div>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="mt-4">
            <p className="text-muted-foreground">See reviews section below</p>
          </TabsContent>
          <TabsContent value="license" className="mt-4">
            <div className="space-y-4 rounded-lg border p-6">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#FF6B35]" />
                {product.license_type} License
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                {product.license_type === 'PERSONAL' && (
                  <>
                    <p>For personal use only. Cannot be used in commercial projects or resold.</p>
                    <p>Allowed: Learning, personal portfolio, non-commercial hobby projects.</p>
                    <p>Not allowed: Client work, SaaS products, commercial redistribution.</p>
                  </>
                )}
                {product.license_type === 'COMMERCIAL' && (
                  <>
                    <p>For commercial use in client projects and your own products.</p>
                    <p>Allowed: Client projects, commercial SaaS, internal company tools.</p>
                    <p>Not allowed: Reselling the code as a standalone product, creating competing marketplace listings.</p>
                  </>
                )}
                {product.license_type === 'EXTENDED' && (
                  <>
                    <p>For unlimited commercial use including redistribution within your products.</p>
                    <p>Allowed: All commercial uses, embedding in products sold to end users, white-label solutions.</p>
                    <p>Not allowed: Reselling the code as a standalone template on competing marketplaces.</p>
                  </>
                )}
                {product.license_type === 'WHITELABEL' && (
                  <>
                    <p>Full rights to rebrand and resell as your own product.</p>
                    <p>Allowed: All uses including resale, rebranding, and creating derivative products.</p>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
