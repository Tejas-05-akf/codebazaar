'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Store, Grid3X3 } from 'lucide-react';
import { ProductCard, type ProductCardData } from './ProductCard';
import { ProductSkeleton } from './ProductSkeleton';
import { supabase } from '@/lib/supabase';

type FilterTag = 'All' | 'Featured' | 'New' | 'Bestseller' | 'Popular';

const filterTags: FilterTag[] = ['All', 'Featured', 'New', 'Bestseller', 'Popular'];

type SortOption = 'Popular' | 'Newest' | 'Price: Low to High' | 'Price: High to Low';

function EmptyMarketplaceState() {
  return (
    <div className="text-center py-12">
      <motion.div
        className="relative w-40 h-40 mx-auto mb-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 rounded-full border-2 border-[#1F1F1F]" />
        <div className="absolute inset-4 rounded-full bg-[#111111] border border-[#1F1F1F] flex items-center justify-center">
          <Grid3X3 className="w-16 h-16 text-zinc-600" strokeWidth={1} />
        </div>
        <motion.div
          className="absolute -top-2 left-1/2 w-3 h-3 rounded-full bg-[#FF6B35]"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-2 left-1/2 w-2 h-2 rounded-full bg-[#FF6B35]/60"
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        />
        <motion.div
          className="absolute top-1/2 -right-2 w-2 h-2 rounded-full bg-[#FF6B35]/40"
          animate={{ x: [0, 4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="absolute top-1/2 -left-2 w-1.5 h-1.5 rounded-full bg-[#FF6B35]/30"
          animate={{ x: [0, -4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.75 }}
        />
      </motion.div>

      <motion.h3
        className="font-sans text-2xl font-bold text-white mb-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        No Products Published Yet
      </motion.h3>

      <motion.p
        className="font-sans text-zinc-500 text-sm max-w-md mx-auto leading-relaxed mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Be among the first developers to sell websites, mobile apps, SaaS products, dashboards, AI tools, and templates on CodeBazaar.
      </motion.p>

      <motion.div
        className="flex items-center justify-center gap-4 flex-wrap"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Link href="/seller">
          <button className="bg-[#FF6B35] text-black font-sans text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#FF6B35]/90 transition-colors duration-200 flex items-center gap-2">
            <Store className="w-4 h-4" />
            Become the First Seller
          </button>
        </Link>
        <Link href="/browse">
          <button className="border border-[#1F1F1F] text-zinc-300 font-sans text-sm px-5 py-2.5 rounded-lg hover:bg-[#1F1F1F] hover:text-zinc-200 transition-all duration-200 flex items-center gap-2">
            <Grid3X3 className="w-4 h-4" />
            Browse Categories
          </button>
        </Link>
      </motion.div>
    </div>
  );
}

function mapSupabaseProduct(p: {
  id: string;
  title: string;
  short_description: string;
  category: string;
  price: number;
  average_rating: number;
  review_count: number;
  download_count: number;
  thumbnail_url: string | null;
  is_featured: boolean;
  created_at: string;
  seller?: { name: string } | null;
}): ProductCardData {
  const sellerName = p.seller?.name || 'Unknown';
  const initials = sellerName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const daysSinceCreated =
    (Date.now() - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24);

  let badge: ProductCardData['badge'] = undefined;
  if (daysSinceCreated < 7) badge = 'New';
  else if (p.download_count > 100) badge = 'Bestseller';
  else if (p.is_featured) badge = 'Hot';

  return {
    id: p.id,
    title: p.title,
    shortDescription: p.short_description,
    category: p.category,
    price: p.price / 100,
    rating: p.average_rating || 0,
    reviews: p.review_count || 0,
    downloads: p.download_count || 0,
    thumbnailColor: 'from-zinc-800/40 to-zinc-900/60',
    thumbnailUrl: p.thumbnail_url,
    seller: { name: sellerName, initials, verified: true },
    isFeatured: p.is_featured,
    badge,
  };
}

export function FeaturedProducts() {
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterTag>('All');
  const [sortBy, setSortBy] = useState<SortOption>('Popular');
  const [sortOpen, setSortOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*, seller:profiles(name)')
      .eq('status', 'APPROVED')
      .order('is_featured', { ascending: false })
      .order('download_count', { ascending: false })
      .limit(12);

    if (!error && data) {
      setProducts(data.map(mapSupabaseProduct));
    }
    setIsLoading(false);
  }

  const filtered = (() => {
    let list = [...products];
    if (activeFilter === 'Featured') list = list.filter((p) => p.isFeatured);
    if (activeFilter === 'New') list = list.filter((p) => p.badge === 'New');
    if (activeFilter === 'Bestseller') list = list.filter((p) => p.badge === 'Bestseller');
    if (activeFilter === 'Popular') list = list.sort((a, b) => b.downloads - a.downloads);
    if (activeFilter === 'All') list = list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    if (sortBy === 'Popular') list = list.sort((a, b) => b.downloads - a.downloads);
    if (sortBy === 'Newest') list = list.sort((a, b) => b.downloads - a.downloads);
    if (sortBy === 'Price: Low to High') list = list.sort((a, b) => a.price - b.price);
    if (sortBy === 'Price: High to Low') list = list.sort((a, b) => b.price - a.price);
    return list;
  })();

  const hasProducts = products.length > 0;

  return (
    <section className="bg-[#0A0A0A] py-20 border-t border-[#1F1F1F] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <h2
            className="font-sans text-3xl font-bold text-white"
            style={{ textShadow: '0 0 40px rgba(255,107,53,0.1)' }}
          >
            Featured Products
          </h2>
          {hasProducts && (
            <div className="relative">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="font-sans text-zinc-400 text-xs border border-[#1F1F1F] rounded-lg px-3 py-2 flex items-center gap-2 hover:text-zinc-300 hover:border-[#2A2A2A] transition-all"
              >
                {sortBy}
              </button>
              {sortOpen && (
                <div className="absolute right-0 mt-1 bg-[#111111] border border-[#1F1F1F] rounded-lg shadow-xl overflow-hidden z-20 min-w-[180px]">
                  {(['Popular', 'Newest', 'Price: Low to High', 'Price: High to Low'] as SortOption[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => { setSortBy(s); setSortOpen(false); }}
                      className={`w-full text-left font-sans text-xs px-4 py-2.5 hover:bg-[#1F1F1F] transition-colors ${
                        s === sortBy ? 'text-[#FF6B35]' : 'text-zinc-400'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <p className="font-sans text-sm text-zinc-500 mb-6 max-w-2xl leading-relaxed">
          CodeBazaar is preparing for its first generation of digital sellers.
        </p>

        {hasProducts && (
          <>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-sans text-[11px] text-zinc-500 mr-2">Active filters:</span>
              {filterTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveFilter(tag)}
                  className={`font-sans text-xs font-medium rounded-lg px-3.5 py-2 transition-all border ${
                    activeFilter === tag
                      ? 'bg-[#FF6B35] text-black border-[#FF6B35]'
                      : 'bg-[#111111] text-zinc-400 border-[#1F1F1F] hover:border-[#2A2A2A] hover:text-zinc-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <p className="font-sans text-[11px] text-zinc-500 mb-8">
              Showing {filtered.length} of {products.length} products
            </p>
          </>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {[1, 2, 3, 4].map((i) => (
                <ProductSkeleton key={i} />
              ))}
            </motion.div>
          ) : !hasProducts ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <EmptyMarketplaceState />
              <div className="mt-12">
                <p className="font-sans text-xs text-zinc-600 text-center mb-6">
                  Products will appear here once published
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 opacity-60">
                  {[1, 2, 3, 4].map((i) => (
                    <ProductSkeleton key={i} />
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="products"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filtered.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  viewport={{ once: true, margin: '-50px' }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {hasProducts && (
          <div className="flex justify-center mt-12">
            <Link href="/browse">
              <button className="font-sans text-sm text-zinc-400 border border-[#1F1F1F] rounded-lg px-6 py-2.5 hover:bg-[#1F1F1F] hover:text-zinc-200 transition-all flex items-center gap-2">
                Browse all products <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
