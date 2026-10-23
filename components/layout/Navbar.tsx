'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import type { AdminViewMode } from '@/lib/auth-context';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Menu, X, Sun, Moon, ShoppingCart, Store, LayoutDashboard, Package, LogOut, User, MessageSquare, Shield, ChevronDown } from 'lucide-react';

export function Navbar() {
  const { user, logout, viewMode, setViewMode } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => setMounted(true), []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/browse?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link href="/" className="flex items-center gap-2 mr-6">
          <Store className="h-6 w-6 text-[#FF6B35]" />
          <div className="flex flex-col">
            <span className="text-lg font-bold leading-tight tracking-tight">CodeBazaar</span>
            <span className="text-[10px] leading-none text-muted-foreground">by developers, for developers</span>
          </div>
        </Link>

        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search templates, components, tools..."
              className="w-full rounded-md border border-input bg-background px-9 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        <nav className="hidden md:flex items-center gap-1 ml-auto">
          <Link href="/browse">
            <Button variant="ghost" size="sm">Browse</Button>
          </Link>
          <Link href="/seller">
            <Button variant="ghost" size="sm">Sell</Button>
          </Link>
          <Link href="/support">
            <Button variant="ghost" size="sm">Support</Button>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {mounted ? (theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />) : <Sun className="h-4 w-4 opacity-0" />}
          </Button>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback>{user.name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:inline">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm font-medium">{user.name}</div>
                <div className="px-2 pb-1 text-xs text-muted-foreground">{user.email}</div>
                <DropdownMenuSeparator />
                {/* SUPER_ADMIN role switcher */}
                {user.role === 'SUPER_ADMIN' && (
                  <>
                    <DropdownMenuLabel className="text-[11px] text-muted-foreground">Switch View</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setViewMode('admin')} className="cursor-pointer">
                      <Shield className="mr-2 h-4 w-4 text-[#FF6B35]" />
                      <span className={viewMode === 'admin' ? 'font-semibold text-[#FF6B35]' : ''}>🛡 Platform Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setViewMode('buyer')} className="cursor-pointer">
                      <ShoppingCart className="mr-2 h-4 w-4 text-green-500" />
                      <span className={viewMode === 'buyer' ? 'font-semibold text-[#FF6B35]' : ''}>🛒 Buyer View</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setViewMode('seller')} className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4 text-blue-500" />
                      <span className={viewMode === 'seller' ? 'font-semibold text-[#FF6B35]' : ''}>💼 Seller View</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {user.role === 'SELLER' && (
                  <DropdownMenuItem asChild>
                    <Link href="/seller" className="cursor-pointer"><LayoutDashboard className="mr-2 h-4 w-4" />Dashboard</Link>
                  </DropdownMenuItem>
                )}
                {user.role === 'ADMIN' && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="cursor-pointer"><LayoutDashboard className="mr-2 h-4 w-4" />Admin Panel</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/orders" className="cursor-pointer"><Package className="mr-2 h-4 w-4" />My Orders</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/support" className="cursor-pointer"><MessageSquare className="mr-2 h-4 w-4" />Support</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer"><User className="mr-2 h-4 w-4" />Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()} className="cursor-pointer text-red-500">
                  <LogOut className="mr-2 h-4 w-4" />Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-[#FF6B35] hover:bg-[#FF6B35]/90">Start Selling</Button>
              </Link>
            </>
          )}
        </nav>

        <Button variant="ghost" size="icon" className="md:hidden ml-auto" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t px-4 py-4 space-y-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Search..."
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" size="sm"><Search className="h-4 w-4" /></Button>
          </form>
          <Link href="/browse" className="block text-sm py-2" onClick={() => setMobileOpen(false)}>Browse</Link>
          <Link href="/seller" className="block text-sm py-2" onClick={() => setMobileOpen(false)}>Sell</Link>
          <Link href="/support" className="block text-sm py-2" onClick={() => setMobileOpen(false)}>Support</Link>
          {user ? (
            <>
              <Link href="/orders" className="block text-sm py-2" onClick={() => setMobileOpen(false)}>My Orders</Link>
              <Link href="/profile" className="block text-sm py-2" onClick={() => setMobileOpen(false)}>Profile</Link>
              <Button variant="outline" size="sm" className="w-full" onClick={() => { logout(); setMobileOpen(false); }}>Logout</Button>
            </>
          ) : (
            <>
              <Link href="/login" className="block text-sm py-2" onClick={() => setMobileOpen(false)}>Login</Link>
              <Link href="/signup" className="block text-sm py-2" onClick={() => setMobileOpen(false)}>Start Selling</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
