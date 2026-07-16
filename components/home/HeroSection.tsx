'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Search } from 'lucide-react';

export function HeroSection() {
  const [search, setSearch] = useState('');

  return (
    <section aria-label="Hero" className="bg-[#0A0A0A] relative overflow-hidden border-b border-[#1F1F1F]">
      {/* Background dots */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(#FFFFFF 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      {/* Orange glow */}
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[300px] bg-[#FF6B35]/5 rounded-full blur-[120px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
        <div className="max-w-3xl mx-auto text-center">
          {/* Beta badge */}
          <motion.div
            className="inline-block border border-[#1F1F1F] text-[#FF6B35] font-sans text-[11px] font-medium rounded-lg px-3 py-1 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Beta: Connects to real Supabase
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="font-sans text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-bold text-white leading-tight px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Code solutions built for{' '}
            <span className="text-[#FF6B35]">Indian businesses</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            className="font-sans text-base sm:text-lg text-zinc-400 mt-4 leading-relaxed px-4 sm:px-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Ready-made websites, CRMs, booking apps and more. Buy once, customize forever.
            <br />
            <span className="text-[#FF6B35] font-semibold">Priced for Indian businesses.</span>
          </motion.p>

          {/* Search bar */}
          <motion.div
            className="mt-8 max-w-xl mx-auto relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex border border-[#1F1F1F] rounded-xl bg-[#111111] overflow-hidden focus-within:border-[#FF6B35]/50 transition-colors duration-200">
              <div className="flex items-center pl-4">
                <Search className="w-4 h-4 text-zinc-500" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for gym websites, restaurant CRMs, salon apps..."
                className="flex-1 bg-transparent font-sans text-sm text-white placeholder-zinc-500 py-4 px-3 outline-none"
              />
              <button className="bg-[#FF6B35] text-black font-sans text-sm font-semibold px-6 m-1 rounded-lg hover:bg-[#FF6B35]/90 transition-colors">
                Search
              </button>
            </div>
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            className="mt-6 flex items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link href="/browse">
              <button className="bg-[#FF6B35] text-black font-sans text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#FF6B35]/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 focus:ring-offset-2 focus:ring-offset-[#0A0A0A] flex items-center gap-2">
                Browse marketplace <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/seller">
              <button className="border border-[#1F1F1F] text-white font-sans text-sm px-5 py-2.5 rounded-lg hover:bg-[#1F1F1F] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 focus:ring-offset-2 focus:ring-offset-[#0A0A0A]">
                Sell your solution
              </button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
