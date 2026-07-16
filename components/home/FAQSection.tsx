'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqData = [
  {
    question: 'Can I customize the templates?',
    answer: 'Yes, every product includes full source code with complete customization access. You can modify colors, fonts, layouts, and functionality to match your brand.',
  },
  {
    question: 'Do I receive complete source code?',
    answer: 'Absolutely. All products come with complete source code including frontend, backend, database schemas, and deployment guides. You get everything you need to build upon.',
  },
  {
    question: 'Are future updates included?',
    answer: 'Yes, when you purchase a product, you receive lifetime access to all future updates from the seller. Updates can be re-downloaded from your Orders page.',
  },
  {
    question: 'Can I use templates commercially?',
    answer: 'Most templates include a Commercial license by default. Each product page clearly lists the license type (Personal, Commercial, Extended, or Whitelabel) before purchase.',
  },
  {
    question: 'How can I become a seller?',
    answer: 'Sign up and select "Sell Products" during registration, then complete the KYC onboarding form. Our team reviews your application within 1-2 business days.',
  },
];

function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-[#1F1F1F] rounded-xl bg-[#111111] px-5 overflow-hidden">
      <button
        className="w-full text-left font-medium text-sm text-white flex items-center justify-between py-4 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 rounded-lg"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className={isOpen ? 'text-[#FF6B35]' : 'text-white'}>{question}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[#FF6B35] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className="text-sm text-zinc-500 pb-4 leading-relaxed overflow-hidden transition-all duration-200"
        style={{
          maxHeight: isOpen ? '200px' : '0px',
          opacity: isOpen ? 1 : 0,
          paddingBottom: isOpen ? '16px' : '0px',
        }}
      >
        {answer}
      </div>
    </div>
  );
}

export function FAQSection() {
  return (
    <section className="bg-[#0A0A0A] py-20 border-b border-[#1F1F1F]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-sans text-3xl font-bold text-white mb-2">Frequently Asked Questions</h2>
          <p className="font-sans text-zinc-500 text-sm">Everything you need to know about buying and selling on CodeBazaar</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true, margin: '-50px' }}
          className="space-y-3"
        >
          {faqData.map((item, index) => (
            <FAQItem key={index} question={item.question} answer={item.answer} index={index} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
