'use client';

import Link from 'next/link';
import { Store, Github, Twitter, Linkedin, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-[#FF6B35]" />
              <span className="font-bold text-lg">CodeBazaar</span>
            </div>
            <p className="text-sm text-muted-foreground">
              India's marketplace for developer products. Buy and sell production-ready code, templates, and tools.
            </p>
            <div className="flex gap-3">
              <a href="#" aria-label="GitHub" className="text-muted-foreground hover:text-foreground transition-colors duration-200"><Github className="h-4 w-4" /></a>
              <a href="#" aria-label="Twitter" className="text-muted-foreground hover:text-foreground transition-colors duration-200"><Twitter className="h-4 w-4" /></a>
              <a href="#" aria-label="LinkedIn" className="text-muted-foreground hover:text-foreground transition-colors duration-200"><Linkedin className="h-4 w-4" /></a>
              <a href="#" aria-label="Email" className="text-muted-foreground hover:text-foreground transition-colors duration-200"><Mail className="h-4 w-4" /></a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">For Buyers</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/browse" className="hover:text-foreground transition-colors duration-200">Browse Products</Link></li>
              <li><Link href="/orders" className="hover:text-foreground transition-colors duration-200">My Orders</Link></li>
              <li><Link href="/faq" className="hover:text-foreground transition-colors duration-200">FAQ</Link></li>
              <li><Link href="/support" className="hover:text-foreground transition-colors duration-200">Support</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">For Sellers</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/seller" className="hover:text-foreground transition-colors duration-200">Seller Dashboard</Link></li>
              <li><Link href="/seller/onboarding" className="hover:text-foreground transition-colors duration-200">Become a Seller</Link></li>
              <li><Link href="/faq" className="hover:text-foreground transition-colors duration-200">Seller Guidelines</Link></li>
              <li><Link href="/faq" className="hover:text-foreground transition-colors duration-200">Payouts</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/terms" className="hover:text-foreground transition-colors duration-200">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground transition-colors duration-200">Privacy Policy</Link></li>
              <li><Link href="/faq" className="hover:text-foreground transition-colors duration-200">Refund Policy</Link></li>
              <li><Link href="/faq" className="hover:text-foreground transition-colors duration-200">GST Information</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>2026 CodeBazaar. Made in India.</p>
          <Link href="/admin" className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200">
            Go to Admin Panel
          </Link>
          <p>All prices are GST inclusive.</p>
        </div>
      </div>
    </footer>
  );
}
