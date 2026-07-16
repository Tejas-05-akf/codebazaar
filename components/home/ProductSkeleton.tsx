'use client';

export function ProductSkeleton() {
  return (
    <div className="bg-[#111111] border border-[#1F1F1F] rounded-xl overflow-hidden animate-pulse">
      {/* Thumbnail skeleton */}
      <div className="h-44 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1F1F1F] to-[#151515]" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(#2A2A2A 1px, transparent 1px), linear-gradient(90deg, #2A2A2A 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        {/* Shimmer effect */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>

      {/* Card body skeleton */}
      <div className="p-4">
        {/* Solution type skeleton */}
        <div className="bg-[#1F1F1F] w-20 h-5 rounded-md" />

        {/* Title skeleton */}
        <div className="mt-3 space-y-2">
          <div className="bg-[#1F1F1F] w-3/4 h-4 rounded" />
          <div className="bg-[#1F1F1F] w-1/2 h-4 rounded" />
        </div>

        {/* Description skeleton */}
        <div className="mt-3 space-y-2">
          <div className="bg-[#1F1F1F] w-full h-3 rounded" />
          <div className="bg-[#1F1F1F] w-2/3 h-3 rounded" />
        </div>

        {/* Rating row skeleton */}
        <div className="flex items-center gap-3 mt-4">
          <div className="bg-[#1F1F1F] w-16 h-4 rounded" />
          <div className="bg-[#1F1F1F] w-20 h-4 rounded" />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#1F1F1F] mx-4" />

      {/* Footer skeleton */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#1F1F1F]" />
          <div className="bg-[#1F1F1F] w-24 h-4 rounded" />
        </div>
        <div className="bg-[#1F1F1F] w-20 h-5 rounded" />
      </div>
    </div>
  );
}
