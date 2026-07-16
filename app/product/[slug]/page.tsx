import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { ProductDetail } from '@/components/product/ProductDetail';
import { ProductReviews } from '@/components/product/ProductReviews';
import { AIChatWidget } from '@/components/product/AIChatWidget';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data: product } = await supabase
    .from('products')
    .select('title, short_description, thumbnail_url')
    .eq('slug', params.slug)
    .eq('status', 'APPROVED')
    .single();

  if (!product) return {};

  return {
    title: `${product.title} | CodeBazaar`,
    description: product.short_description,
    openGraph: {
      images: product.thumbnail_url ? [product.thumbnail_url] : undefined,
    },
  };
}

async function getProduct(slug: string) {
  const { data: product } = await supabase
    .from('products')
    .select('*, seller:profiles(name, email)')
    .eq('slug', slug)
    .eq('status', 'APPROVED')
    .single();

  if (!product) return null;
  return product;
}

async function getReviews(productId: string) {
  const { data } = await supabase
    .from('reviews')
    .select('*, buyer:profiles(name)')
    .eq('product_id', productId)
    .eq('is_flagged', false)
    .order('created_at', { ascending: false });
  return data || [];
}

export default async function ProductPage({ params }: Props) {
  const product = await getProduct(params.slug);
  if (!product) return notFound();

  const reviews = await getReviews(product.id);

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="container mx-auto px-4 py-8">
        <ProductDetail product={product} />
        <ProductReviews productId={product.id} reviews={reviews} />
      </div>
      <AIChatWidget productSlug={params.slug} productTitle={product.title} />
    </div>
  );
}
