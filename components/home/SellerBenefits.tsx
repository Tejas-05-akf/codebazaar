'use client';

import { motion } from 'framer-motion';
import { Shield, Zap, Wallet, Lock } from 'lucide-react';

const benefits = [
  {
    icon: <Shield className="w-5 h-5" />,
    title: 'Verified Buyers',
    description: 'Every purchase is verified. We handle payment collection and disputes.',
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: 'Instant Delivery',
    description: 'Your solution is delivered automatically upon payment. Zero manual work.',
  },
  {
    icon: <Wallet className="w-5 h-5" />,
    title: 'UPI Payouts',
    description: 'Get paid directly to your UPI or bank account. Weekly payouts.',
  },
  {
    icon: <Lock className="w-5 h-5" />,
    title: 'Protected IP',
    description: 'Your code is protected. Buyers get a license, not full source access.',
  },
];

export function SellerBenefits() {
  return (
    <section className="bg-[#0A0A0A] py-20 border-b border-[#1F1F1F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-sans text-3xl font-bold text-white mb-2">Why sell on CodeBazaar?</h2>
          <p className="font-sans text-zinc-500 text-sm">Built for Indian developers, by Indian developers</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {benefits.map((b, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              viewport={{ once: true, margin: '-50px' }}
              className="bg-[#111111] border border-[#1F1F1F] rounded-xl p-5 hover:border-[#2A2A2A] transition-all duration-300 h-full flex flex-col"
            >
              <div className="w-10 h-10 rounded-lg bg-[#1F1F1F] flex items-center justify-center text-[#FF6B35] mb-3">
                {b.icon}
              </div>
              <h3 className="font-sans text-sm font-semibold text-white mb-1">{b.title}</h3>
              <p className="font-sans text-xs text-zinc-500 leading-relaxed flex-1">{b.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
