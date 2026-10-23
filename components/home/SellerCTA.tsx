'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Upload } from 'lucide-react';
import Link from 'next/link';

export function SellerCTA() {
  return (
    <section aria-label="Seller CTA" className="bg-[#0A0A0A] py-20 border-b border-[#1F1F1F] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#FF6B35]/5 rounded-full blur-[150px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left: text */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="font-sans text-3xl font-bold text-white mb-4">Have a solution that worked for your business?</h2>
              <p className="font-sans text-zinc-400 text-sm leading-relaxed mb-6">
                Sell your website, CRM, or app to other Indian business owners. Turn code into revenue.
              </p>
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-[#FF6B35]/10 text-[#FF6B35] font-sans text-sm font-bold px-3 py-1 rounded-lg">
                  Keep 80% of revenue
                </div>
                <div className="bg-[#1F1F1F] text-zinc-400 font-sans text-sm px-3 py-1 rounded-lg">
                  UPI payments
                </div>
              </div>
              <div className="flex gap-3">
                <Link href="/seller">
                  <button className="bg-[#FF6B35] text-black font-sans text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#FF6B35]/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 focus:ring-offset-2 focus:ring-offset-[#0A0A0A] flex items-center gap-2">
                    <Upload className="w-4 h-4" /> Upload your solution
                  </button>
                </Link>
                <Link href="/seller/onboarding">
                  <button className="border border-[#1F1F1F] text-white font-sans text-sm px-5 py-2.5 rounded-lg hover:bg-[#1F1F1F] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 focus:ring-offset-2 focus:ring-offset-[#0A0A0A]">
                    Learn more
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Right: visual */}
          <motion.div
            className="hidden md:block"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="bg-[#111111] border border-[#1F1F1F] rounded-xl p-6 relative">
              {/* Code snippet decoration */}
              <div className="font-mono text-xs text-zinc-600 leading-relaxed">
                <div className="text-zinc-500">{'// Your business solution, ready to sell'}</div>
                <div className="text-zinc-400">{'import { GymPro } from "./gym-pro-suite";'}</div>
                <div className="text-zinc-400">{'export default function MemberPortal() {'}</div>
                <div className="text-zinc-400 pl-4">{'return <CheckInPortal />;'}</div>
                <div className="text-zinc-400">{'}'}</div>
                <div className="mt-4 text-zinc-500">{'// Revenue: 80% to you'}</div>
                <div className="text-zinc-400">{'// Direct WhatsApp leads, no agency cut'}</div>
              </div>
              <div className="absolute -top-3 -right-3 bg-[#FF6B35] text-black font-sans text-xs font-bold px-3 py-1 rounded-lg">
                ₹2,499 / sale
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
