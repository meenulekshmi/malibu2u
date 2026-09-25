'use client';

import React from 'react';
import Link from 'next/link';
import { useWishlist } from '@/lib/wishlist-context';
import { ProductCard } from '@/components/product/ProductCard';
import { Heart, ArrowRight } from 'lucide-react';

export default function WishlistPage() {
  const { wishlist } = useWishlist();

  if (wishlist.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-pink-400 mx-auto">
          <Heart className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-white">Your Wishlist is Empty</h1>
          <p className="text-xs text-slate-400">
            Click the heart icon on any game or console card to save it for later!
          </p>
        </div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-lg"
        >
          Explore Games Store <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Heart className="w-7 h-7 text-pink-400 fill-pink-500" /> Saved Wishlist Vault ({wishlist.length})
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Saved games, consoles, and gaming gear reserved for quick purchase.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            slug={product.slug}
            price={product.price}
            discountPrice={product.discountPrice}
            condition={product.condition}
            platform={product.platform}
            brand="Wishlist Item"
            rating={product.rating || 4.8}
            reviewCount={15}
            image={product.image}
          />
        ))}
      </div>
    </div>
  );
}
