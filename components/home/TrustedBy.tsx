'use client';

import { motion } from 'framer-motion';
import { stats } from '@/data/mockData';

export function TrustedBy() {
  return (
    <section className="bg-[#0A0A0A] border-b border-[#1F1F1F] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="font-sans text-3xl font-bold text-[#FF6B35] mb-1">{stat.value}</div>
              <div className="font-sans text-xs text-zinc-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
