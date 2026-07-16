'use client';

import { motion } from 'framer-motion';
import { testimonials } from '@/data/mockData';

export function Testimonials() {
  return (
    <section className="bg-[#0A0A0A] py-20 border-b border-[#1F1F1F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-sans text-3xl font-bold text-white mb-2">What Our Users Say</h2>
          <p className="font-sans text-zinc-500 text-sm">Trusted by developers and business owners across India</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              viewport={{ once: true, margin: '-50px' }}
              className="bg-[#111111] border border-[#1F1F1F] rounded-xl p-5 hover:border-[#2A2A2A] transition-all h-full flex flex-col"
            >
              <p className="font-sans text-sm text-zinc-300 leading-relaxed mb-5 flex-1">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#1F1F1F] flex items-center justify-center">
                  <span className="font-sans text-xs text-zinc-400">{t.initials}</span>
                </div>
                <div>
                  <div className="font-sans text-sm font-medium text-white">{t.author}</div>
                  <div className="font-sans text-xs text-zinc-500">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
