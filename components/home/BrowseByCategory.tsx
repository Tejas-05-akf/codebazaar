'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Dumbbell, UtensilsCrossed, Scissors, Stethoscope, GraduationCap, Building2 } from 'lucide-react';
import { businessCategories } from '@/data/mockData';

const iconMap: Record<string, React.ReactNode> = {
  Dumbbell: <Dumbbell className="w-6 h-6" />,
  UtensilsCrossed: <UtensilsCrossed className="w-6 h-6" />,
  Scissors: <Scissors className="w-6 h-6" />,
  Stethoscope: <Stethoscope className="w-6 h-6" />,
  GraduationCap: <GraduationCap className="w-6 h-6" />,
  Building2: <Building2 className="w-6 h-6" />,
};

export function BrowseByCategory() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section className="bg-[#0A0A0A] py-20 border-b border-[#1F1F1F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-sans text-3xl font-bold text-white mb-2">Browse by Category</h2>
          <p className="font-sans text-zinc-500 text-sm">Find the right solution for your business type</p>
        </div>

        {/* Category grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {businessCategories.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              viewport={{ once: true, margin: '-50px' }}
              onMouseEnter={() => setHovered(cat.id)}
              onMouseLeave={() => setHovered(null)}
              className={`bg-[#111111] border border-[#1F1F1F] rounded-xl p-5 cursor-pointer hover:border-[#2A2A2A] transition-all duration-300 h-full flex flex-col ${
                hovered === cat.id ? 'bg-gradient-to-br ' + cat.color : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cat.iconBg} ${cat.iconColor}`}>
                  {iconMap[cat.icon]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-sans text-sm font-semibold text-white">{cat.label}</h3>
                    <span className="font-sans text-[11px] text-zinc-500">{cat.count} solutions</span>
                  </div>
                  <p className="font-sans text-xs text-zinc-500 mt-1 leading-relaxed">{cat.description}</p>
                  {/* Solution types tags */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {cat.solutionTypes.map((st) => (
                      <span key={st} className="bg-[#1F1F1F] text-zinc-400 font-sans text-[10px] px-2 py-0.5 rounded">
                        {st}
                      </span>
                    ))}
                  </div>
                  {hovered === cat.id && (
                    <div className="flex items-center gap-1 mt-3 text-[#FF6B35] font-sans text-xs font-semibold">
                      Explore <ArrowRight className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
