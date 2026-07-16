'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

export function BrowsePagination({
  currentPage,
  totalPages,
  params,
}: {
  currentPage: number;
  totalPages: number;
  params: SearchParams;
}) {
  if (totalPages <= 1) return null;

  const goToPage = (page: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set('page', page.toString());
    window.location.href = url.toString();
  };

  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    if (totalPages <= 5) return i + 1;
    if (currentPage <= 3) return i + 1;
    if (currentPage >= totalPages - 2) return totalPages - 4 + i;
    return currentPage - 2 + i;
  });

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <Button
        variant="outline"
        size="sm"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {pages.map((p) => (
        <Button
          key={p}
          variant={p === currentPage ? 'default' : 'outline'}
          size="sm"
          className={p === currentPage ? 'bg-[#FF6B35] hover:bg-[#FF6B35]/90' : ''}
          onClick={() => goToPage(p)}
        >
          {p}
        </Button>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
