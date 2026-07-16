import { Suspense } from 'react';
import { ProductCard } from '@/components/product/ProductCard';
import { BrowseFilters } from '@/components/product/BrowseFilters';
import { BrowsePagination } from '@/components/product/BrowsePagination';
import { SortDropdown } from '@/components/product/SortDropdown';
import { supabase } from '@/lib/supabase';
import { Product } from '@/lib/supabase';

interface SearchParams {
  search?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  techStack?: string;
  license?: string;
  sort?: string;
  page?: string;
}

const PAGE_SIZE = 12;

async function getBrowseProducts(searchParams: SearchParams) {
  let query = supabase
    .from('products')
    .select('*, seller:profiles(name)', { count: 'exact' })
    .eq('status', 'APPROVED');

  if (searchParams.search) {
    query = query.ilike('title', `%${searchParams.search}%`);
  }
  if (searchParams.category) {
    query = query.eq('category', searchParams.category);
  }
  if (searchParams.minPrice) {
    query = query.gte('price', parseInt(searchParams.minPrice) * 100);
  }
  if (searchParams.maxPrice) {
    query = query.lte('price', parseInt(searchParams.maxPrice) * 100);
  }
  if (searchParams.techStack) {
    const techs = searchParams.techStack.split(',');
    techs.forEach((tech) => {
      query = query.contains('tech_stack', [tech]);
    });
  }
  if (searchParams.license) {
    query = query.eq('license_type', searchParams.license);
  }

  const sort = searchParams.sort || 'newest';
  if (sort === 'newest') {
    query = query.order('created_at', { ascending: false });
  } else if (sort === 'downloads') {
    query = query.order('download_count', { ascending: false });
  } else if (sort === 'rating') {
    query = query.order('average_rating', { ascending: false });
  } else if (sort === 'price_asc') {
    query = query.order('price', { ascending: true });
  } else if (sort === 'price_desc') {
    query = query.order('price', { ascending: false });
  }

  const page = parseInt(searchParams.page || '1');
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  query = query.range(from, to);

  const { data, count } = await query;
  return { products: (data as Product[]) || [], total: count || 0, page };
}

async function getCategories() {
  const { data } = await supabase.from('products').select('category').eq('status', 'APPROVED');
  const cats = new Set<string>();
  data?.forEach((p) => cats.add(p.category));
  return Array.from(cats).sort();
}

async function getTechStacks() {
  const { data } = await supabase.from('products').select('tech_stack').eq('status', 'APPROVED');
  const techs = new Set<string>();
  data?.forEach((p) => {
    p.tech_stack.forEach((t: string) => techs.add(t));
  });
  return Array.from(techs).sort();
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [{ products, total, page }, categories, techStacks] = await Promise.all([
    getBrowseProducts(searchParams),
    getCategories(),
    getTechStacks(),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Browse Products</h1>
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 shrink-0">
            <BrowseFilters
              categories={categories}
              techStacks={techStacks}
              currentParams={searchParams}
            />
          </aside>
          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {total} products found
              </p>
              <Suspense fallback={null}>
                <SortDropdown currentSort={searchParams.sort || 'newest'} />
              </Suspense>
            </div>
            {products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground">No products found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
            <BrowsePagination currentPage={page} totalPages={totalPages} params={searchParams} />
          </div>
        </div>
      </div>
    </div>
  );
}
