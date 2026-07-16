'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

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

export function BrowseFilters({
  categories,
  techStacks,
  currentParams,
}: {
  categories: string[];
  techStacks: string[];
  currentParams: SearchParams;
}) {
  const selectedTechs = currentParams.techStack ? currentParams.techStack.split(',') : [];

  const updateUrl = (updates: Partial<SearchParams>) => {
    const url = new URL(window.location.href);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === '') {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, value);
      }
    });
    url.searchParams.delete('page');
    window.location.href = url.toString();
  };

  const toggleTech = (tech: string) => {
    const newTechs = selectedTechs.includes(tech)
      ? selectedTechs.filter((t) => t !== tech)
      : [...selectedTechs, tech];
    updateUrl({ techStack: newTechs.length > 0 ? newTechs.join(',') : undefined });
  };

  const hasActiveFilters = Object.entries(currentParams).some(
    ([k, v]) => v && k !== 'sort' && k !== 'page'
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => {
            const url = new URL(window.location.href);
            ['search', 'category', 'minPrice', 'maxPrice', 'techStack', 'license'].forEach((k) => url.searchParams.delete(k));
            window.location.href = url.toString();
          }}>
            <X className="h-3 w-3 mr-1" /> Clear
          </Button>
        )}
      </div>

      {currentParams.search && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Search:</span>
          <Badge variant="secondary">{currentParams.search}</Badge>
        </div>
      )}

      <div className="space-y-3">
        <h4 className="text-sm font-medium">Category</h4>
        <div className="space-y-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => updateUrl({ category: currentParams.category === cat ? undefined : cat })}
              className={`block w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
                currentParams.category === cat
                  ? 'bg-[#FF6B35]/10 text-[#FF6B35] font-medium'
                  : 'hover:bg-muted text-muted-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium">Price Range (₹)</h4>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            className="text-sm"
            value={currentParams.minPrice || ''}
            onChange={(e) => updateUrl({ minPrice: e.target.value || undefined })}
          />
          <Input
            type="number"
            placeholder="Max"
            className="text-sm"
            value={currentParams.maxPrice || ''}
            onChange={(e) => updateUrl({ maxPrice: e.target.value || undefined })}
          />
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium">Tech Stack</h4>
        <div className="flex flex-wrap gap-1.5">
          {techStacks.map((tech) => (
            <button
              key={tech}
              onClick={() => toggleTech(tech)}
              className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                selectedTechs.includes(tech)
                  ? 'bg-[#FF6B35] text-white'
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground'
              }`}
            >
              {tech}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium">License Type</h4>
        <div className="space-y-1">
          {['PERSONAL', 'COMMERCIAL', 'EXTENDED', 'WHITELABEL'].map((license) => (
            <button
              key={license}
              onClick={() => updateUrl({ license: currentParams.license === license ? undefined : license })}
              className={`block w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
                currentParams.license === license
                  ? 'bg-[#FF6B35]/10 text-[#FF6B35] font-medium'
                  : 'hover:bg-muted text-muted-foreground'
              }`}
            >
              {license}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
