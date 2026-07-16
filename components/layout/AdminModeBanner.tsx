'use client';

import { useAuth } from '@/lib/auth-context';
import { Shield } from 'lucide-react';

export function AdminModeBanner() {
  const { user, viewMode } = useAuth();

  // Only show for SUPER_ADMIN in buyer or seller view mode
  if (!user || user.role !== 'SUPER_ADMIN') return null;
  if (viewMode === 'admin' || viewMode === null) return null;

  const message =
    viewMode === 'buyer'
      ? 'Admin Mode – Viewing Buyer Experience'
      : 'Admin Mode – Viewing Seller Experience';

  return (
    <div className="bg-[#FF6B35]/15 border-b border-[#FF6B35]/20 text-center py-1.5 px-4">
      <div className="flex items-center justify-center gap-2 text-[#FF6B35] text-xs font-semibold">
        <Shield className="h-3 w-3" />
        <span>{message}</span>
      </div>
    </div>
  );
}
