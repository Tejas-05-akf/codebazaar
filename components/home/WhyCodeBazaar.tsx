'use client';

import { motion } from 'framer-motion';
import { Download, Infinity as InfinityIcon, Code2, Globe } from 'lucide-react';

const features = [
  {
    icon: <Download className="w-5 h-5" />,
    title: 'Instant Download',
    description: 'Receive your source code immediately after purchase.',
  },
  {
    icon: <InfinityIcon className="w-5 h-5" />,
    title: 'Lifetime License',
    description: 'Own it forever with no recurring licensing fees.',
  },
  {
    icon: <Code2 className="w-5 h-5" />,
    title: 'Source Code Included',
    description: 'Fully customizable and developer-friendly.',
  },
  {
    icon: <Globe className="w-5 h-5" />,
    title: 'Built for Indian Businesses',
    description: 'Designed with Indian pricing, workflows and businesses in mind.',
  },
];

export function WhyCodeBazaar() {
  return (
    <section className="bg-[#0A0A0A] py-20 border-b border-[#1F1F1F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-sans text-3xl font-bold text-white mb-2">Why Choose CodeBazaar</h2>
          <p className="font-sans text-zinc-500 text-sm">Everything you need to launch your business faster.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              viewport={{ once: true, margin: '-50px' }}
              className="bg-[#111111] border border-[#1F1F1F] rounded-xl p-5 hover:border-[#2A2A2A] transition-all h-full flex flex-col"
            >
              <div className="w-10 h-10 rounded-lg bg-[#1F1F1F] flex items-center justify-center text-[#FF6B35] mb-3">
                {f.icon}
              </div>
              <h3 className="font-sans text-sm font-semibold text-white mb-1">{f.title}</h3>
              <p className="font-sans text-xs text-zinc-500 leading-relaxed flex-1">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
