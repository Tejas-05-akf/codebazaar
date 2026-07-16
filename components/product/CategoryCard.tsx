import Link from 'next/link';
import { type LucideIcon } from 'lucide-react';

interface CategoryCardProps {
  name: string;
  icon: LucideIcon;
  count: number;
  slug: string;
}

export function CategoryCard({ name, icon: Icon, count, slug }: CategoryCardProps) {
  return (
    <Link
      href={`/browse?category=${encodeURIComponent(slug)}`}
      className="group flex flex-col items-center gap-3 rounded-xl border bg-card p-4 transition-all hover:border-[#FF6B35]/50 hover:shadow-md"
    >
      <div className="rounded-full bg-[#FF6B35]/10 p-3 transition-colors group-hover:bg-[#FF6B35]/20">
        <Icon className="h-6 w-6 text-[#FF6B35]" />
      </div>
      <div className="text-center">
        <h3 className="text-sm font-semibold">{name}</h3>
        <p className="text-xs text-muted-foreground">{count} products</p>
      </div>
    </Link>
  );
}
