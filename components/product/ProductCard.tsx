import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Star, Download } from 'lucide-react';
import { Product } from '@/lib/supabase';

function formatPrice(paise: number) {
  return '₹' + (paise / 100).toLocaleString('en-IN');
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="rounded-xl border bg-card overflow-hidden transition-all hover:shadow-lg hover:border-[#FF6B35]/30">
        <div className="aspect-video overflow-hidden bg-muted">
          <img
            src={product.thumbnail_url || 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg'}
            alt={product.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold line-clamp-2 text-sm leading-snug">{product.title}</h3>
          </div>
          <div className="flex flex-wrap gap-1">
            {product.tech_stack.slice(0, 3).map((tech) => (
              <Badge key={tech} variant="secondary" className="text-[10px] px-1.5 py-0.5">{tech}</Badge>
            ))}
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {product.average_rating?.toFixed(1) || '0.0'}
              </span>
              <span className="flex items-center gap-1">
                <Download className="h-3 w-3" />
                {product.download_count}
              </span>
            </div>
            <span className="font-bold text-[#FF6B35]">{formatPrice(product.price)}</span>
          </div>
          <p className="text-xs text-muted-foreground">by {product.seller?.name || 'Unknown'}</p>
        </div>
      </div>
    </Link>
  );
}
