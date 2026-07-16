import { supabase } from '@/lib/supabase';
import { Package, Users, ShoppingBag, Star } from 'lucide-react';

async function getStats() {
  const { count: productCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'APPROVED');
  const { count: sellerCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'SELLER');
  const { count: orderCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('payment_status', 'PAID');
  const { count: reviewCount } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true });

  return {
    products: productCount || 0,
    sellers: sellerCount || 0,
    orders: orderCount || 0,
    reviews: reviewCount || 0,
  };
}

export async function StatsBanner() {
  const stats = await getStats();

  const items = [
    { icon: Package, label: 'Products', value: stats.products },
    { icon: Users, label: 'Sellers', value: stats.sellers },
    { icon: ShoppingBag, label: 'Orders', value: stats.orders },
    { icon: Star, label: 'Reviews', value: stats.reviews },
  ];

  return (
    <div className="border-y bg-muted/30 py-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="rounded-full bg-[#FF6B35]/10 p-2.5">
                <item.icon className="h-5 w-5 text-[#FF6B35]" />
              </div>
              <div>
                <p className="text-2xl font-bold leading-tight">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
