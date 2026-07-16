'use client';

const options = [
  { value: 'newest', label: 'Newest' },
  { value: 'downloads', label: 'Most Downloaded' },
  { value: 'rating', label: 'Best Rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

export function SortDropdown({ currentSort }: { currentSort: string }) {
  return (
    <div className="text-sm">
      <span className="text-muted-foreground">Sort: </span>
      <select
        className="bg-transparent border-none font-medium cursor-pointer hover:text-[#FF6B35]"
        value={currentSort}
        onChange={(e) => {
          const url = new URL(window.location.href);
          url.searchParams.set('sort', e.target.value);
          window.location.href = url.toString();
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
