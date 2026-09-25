'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Plus, Check } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { formatPrice, calculateDiscount } from '@/lib/utils';

export interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number | null;
  condition: string;
  platform: string;
  brand: string;
  rating?: number;
  reviewCount?: number;
  image: string;
  isPreOrder?: boolean;
  stock?: number;
  categoryName?: string;
  tagBadge?: string;
}

export function ProductCard({
  id,
  name,
  slug,
  price,
  discountPrice,
  condition,
  platform,
  brand,
  image,
  isPreOrder = false,
  stock = 5,
  categoryName = 'GAMES',
  tagBadge,
}: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [added, setAdded] = useState(false);
  const [isWishlistAnimating, setIsWishlistAnimating] = useState(false);

  const isSaved = isInWishlist(id);
  const discountPercent = calculateDiscount(price, discountPrice);
  const activePrice = discountPrice ?? price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Visual micro-interaction trigger
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);

    addToCart({
      id,
      name,
      slug,
      price,
      discountPrice,
      image,
      condition,
      platform,
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsWishlistAnimating(true);
    setTimeout(() => setIsWishlistAnimating(false), 450);

    toggleWishlist({
      id,
      name,
      slug,
      price,
      discountPrice,
      image,
      condition,
      platform,
    });
  };

  // Determine top tag pill badge if not specified
  const displayTag = tagBadge || (discountPercent > 0 ? `${discountPercent}% OFF` : isPreOrder ? 'PRE-ORDER' : 'TOP PICK');
  const isPreOwned = condition.includes('PREOWNED') || condition === 'MINT_PREOWNED' || condition === 'GOOD_PREOWNED';

  return (
    <div className="group relative flex flex-col rounded-3xl bg-[#0C0E1A] border border-slate-800/80 hover:border-cyan-400/50 transition-all duration-300 hover:-translate-y-1.5 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/10 overflow-hidden h-full">
      
      {/* Top Image Box with Ambient Gradient Backdrop */}
      <div className="relative aspect-square w-full bg-gradient-to-br from-[#120D26] via-[#0D0E1A] to-[#0A0D18] overflow-hidden flex items-center justify-center p-4">
        {/* Ambient Center Glow */}
        <div className="absolute w-40 h-40 bg-purple-600/15 rounded-full filter blur-2xl pointer-events-none group-hover:bg-cyan-500/20 group-hover:scale-125 transition-all duration-500" />

        <Link href={`/product/${slug}`} className="relative w-full h-full block">
          <Image
            src={image}
            alt={name}
            fill
            className="object-contain p-2 group-hover:scale-108 transition-transform duration-500 ease-out"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        </Link>

        {/* Top-Left Badges */}
        <div className="absolute top-3.5 left-3.5 flex flex-wrap items-center gap-1.5 z-10 pointer-events-none">
          <span className="px-2.5 py-0.5 rounded-full bg-blue-600/90 backdrop-blur-md text-white font-mono text-[9px] font-extrabold uppercase tracking-wider border border-blue-400/30 shadow-md">
            {displayTag}
          </span>

          {isPreOwned ? (
            <span className="px-2.5 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-slate-300 font-mono text-[9px] font-extrabold uppercase tracking-wider border border-slate-700">
              PRE-OWNED
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 backdrop-blur-md text-emerald-300 font-mono text-[9px] font-extrabold uppercase tracking-wider border border-emerald-500/30">
              BRAND NEW
            </span>
          )}
        </div>

        {/* Top-Right Wishlist Button with Heart Pop Animation */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-3.5 right-3.5 w-8 h-8 rounded-full backdrop-blur-md border transition-all duration-300 z-10 flex items-center justify-center active:scale-90 ${
            isWishlistAnimating ? 'animate-heart-pop' : ''
          } ${
            isSaved
              ? 'bg-pink-500/20 text-pink-400 border-pink-500/50 shadow-lg shadow-pink-500/25 scale-105'
              : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:text-white hover:border-pink-500/40 hover:bg-pink-500/10'
          }`}
          title={isSaved ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-4 h-4 transition-transform ${isSaved ? 'fill-pink-500 text-pink-500' : ''}`} />
        </button>
      </div>

      {/* Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-[#0C0E1A]">
        <div>
          {/* Platform / Category Meta + Stock Pill */}
          <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
            <span className="font-extrabold text-slate-400 uppercase tracking-wider">
              {platform} / {categoryName.toUpperCase()}
            </span>
            <div className="flex items-center gap-1 text-emerald-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{stock} left</span>
            </div>
          </div>

          <Link href={`/product/${slug}`} className="group-hover:text-cyan-400 transition-colors duration-200">
            <h3 className="text-sm font-extrabold text-white leading-snug line-clamp-2 min-h-[2.5rem]">
              {name}
            </h3>
          </Link>
        </div>

        {/* Pricing & Add Button Micro-Interaction */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <div>
            <div className="text-base font-black text-white font-mono">
              {formatPrice(activePrice)}
            </div>
            {discountPrice && discountPrice < price && (
              <div className="flex items-center gap-1 text-[11px] font-mono">
                <span className="text-slate-500 line-through">{formatPrice(price)}</span>
                <span className="text-emerald-400 font-extrabold">-{discountPercent}%</span>
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className={`inline-flex items-center gap-1 px-4 py-1.5 rounded-full font-extrabold text-xs transition-all duration-300 active:scale-95 shadow-md ${
              added
                ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30 animate-check-pop'
                : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-cyan-500/20 hover:brightness-110 hover:scale-105'
            }`}
          >
            {added ? (
              <>
                <span>Added</span>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </>
            ) : (
              <>
                <span>Add</span>
                <Plus className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
