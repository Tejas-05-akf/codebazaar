'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, Download, ExternalLink, MessageCircle, ArrowRight } from 'lucide-react';

export type ProductBadge = 'Bestseller' | 'Hot' | 'New' | undefined;

export interface ProductCardData {
  id: string;
  title: string;
  shortDescription: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  downloads: number;
  thumbnailColor: string;
  thumbnailUrl: string | null;
  demoUrl: string | null;
  contactWhatsapp: string | null;
  seller: { name: string; initials: string; verified: boolean };
  isFeatured: boolean;
  badge: ProductBadge;
}

function formatINR(rupees: number): string {
  return '₹' + rupees.toLocaleString('en-IN');
}

function badgeClasses(badge: ProductBadge): string {
  if (!badge) return '';
  if (badge === 'Bestseller') return 'bg-[#FF6B35] text-black';
  if (badge === 'Hot') return 'bg-red-500 text-white';
  if (badge === 'New') return 'bg-cyan-500 text-black';
  return '';
}

function buildWhatsappUrl(phone: string | null, productTitle: string): string | null {
  if (!phone) return null;
  const message = `Hi, I am interested in ${productTitle} from CodeBazaar for my business`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const [hovered, setHovered] = useState(false);
  const whatsappUrl = buildWhatsappUrl(product.contactWhatsapp, product.title);

  return (
    <motion.div
      className="bg-[#111111] border border-[#1F1F1F] rounded-xl overflow-hidden cursor-pointer group"
      style={{ borderLeft: '2px solid transparent' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{
        borderColor: '#2A2A2A',
        y: -2,
        borderLeftColor: 'rgba(255,107,53,0.4)',
      }}
      transition={{ duration: 0.2 }}
    >
      <Link href={`/product/${product.id}`}>
        {/* Thumbnail */}
        <div className="h-44 relative overflow-hidden">
          {product.thumbnailUrl ? (
            <img
              src={product.thumbnailUrl}
              alt={product.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${product.thumbnailColor}`} />
          )}
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                'linear-gradient(#1F1F1F 1px, transparent 1px), linear-gradient(90deg, #1F1F1F 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
          {/* Initials */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-sans font-bold text-5xl text-white/10">
              {product.seller.initials}
            </span>
          </div>
          {/* Badge */}
          {product.badge && (
            <div className={`absolute top-3 left-3 font-sans text-[11px] font-bold rounded-md px-2.5 py-1 ${badgeClasses(product.badge)}`}>
              {product.badge}
            </div>
          )}
          {/* Category badge */}
          <div className="absolute top-3 right-3 bg-[#0A0A0A]/80 backdrop-blur-sm border border-[#1F1F1F] text-zinc-300 font-sans text-[11px] rounded-md px-2.5 py-1">
            {product.category}
          </div>
          {/* Quick preview hover */}
          <div
            className={`absolute bottom-3 left-3 transition-all duration-200 ${hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
          >
            <span className="text-white/80 font-sans text-xs bg-[#0A0A0A]/70 px-3 py-1.5 rounded-lg inline-flex items-center gap-1">
              Quick preview <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Card body */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-sans font-semibold text-base text-white mt-0 leading-snug line-clamp-2 group-hover:text-[#FF6B35]/90 transition-colors">
            {product.title}
          </h3>

          {/* Description */}
          <p className="font-sans text-zinc-500 text-xs mt-1.5 leading-relaxed line-clamp-2">
            {product.shortDescription}
          </p>

          {/* Rating row */}
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span className="text-yellow-400 font-sans text-xs font-bold">{product.rating}</span>
            </span>
            <span className="text-zinc-600 font-sans text-xs">({product.reviews} reviews)</span>
            <span className="flex-1" />
            <span className="flex items-center gap-1 text-zinc-600">
              <Download className="w-3 h-3" />
              <span className="font-sans text-xs">{product.downloads}</span>
            </span>
          </div>
        </div>
      </Link>

      {/* Divider */}
      <div className="border-t border-[#1F1F1F] mx-4" />

      {/* Footer */}
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Seller */}
        <Link href={`/product/${product.id}`} className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#1F1F1F] flex items-center justify-center">
            <span className="font-sans text-[10px] text-zinc-400">{product.seller.initials}</span>
          </div>
          <span className="font-sans text-zinc-500 text-xs">{product.seller.name}</span>
        </Link>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="font-sans font-bold text-base text-white">{formatINR(product.price)}</span>
          <span className="font-sans text-[10px] text-zinc-600">source code</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-4 pb-4 flex items-center gap-2">
        {product.demoUrl && (
          <a
            href={product.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-[#1F1F1F] text-zinc-300 font-sans text-xs font-medium px-3 py-2 rounded-lg hover:bg-[#2A2A2A] hover:text-white transition-all flex items-center justify-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Live Demo
          </a>
        )}
        <Link
          href={`/product/${product.id}`}
          className="flex-1 bg-[#1F1F1F] text-zinc-300 font-sans text-xs font-medium px-3 py-2 rounded-lg hover:bg-[#2A2A2A] hover:text-white transition-all flex items-center justify-center gap-1.5"
        >
          Get Quote
        </Link>
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366]/10 text-[#25D366] font-sans text-xs font-medium px-3 py-2 rounded-lg hover:bg-[#25D366]/20 transition-all flex items-center justify-center gap-1.5"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            WhatsApp
          </a>
        )}
      </div>
    </motion.div>
  );
}
