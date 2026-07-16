import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    { url: 'https://codebazaar.in', lastModified: new Date(), priority: 1 },
    { url: 'https://codebazaar.in/browse', lastModified: new Date(), priority: 0.9 },
    { url: 'https://codebazaar.in/login', lastModified: new Date(), priority: 0.5 },
    { url: 'https://codebazaar.in/signup', lastModified: new Date(), priority: 0.5 },
    { url: 'https://codebazaar.in/seller', lastModified: new Date(), priority: 0.7 },
    { url: 'https://codebazaar.in/faq', lastModified: new Date(), priority: 0.4 },
    { url: 'https://codebazaar.in/support', lastModified: new Date(), priority: 0.4 },
  ];

  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at')
    .eq('status', 'APPROVED');

  const productPages = (products || []).map((p) => ({
    url: `https://codebazaar.in/product/${p.slug}`,
    lastModified: new Date(p.updated_at),
    priority: 0.8,
  }));

  return [...staticPages, ...productPages];
}
