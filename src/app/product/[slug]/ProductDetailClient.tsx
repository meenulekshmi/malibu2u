'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { useAuth } from '@/lib/auth-context';
import { formatPrice } from '@/lib/utils';
import { getWhatsAppProductUrl } from '@/lib/whatsapp';
import { OrderConfirmationModal } from '@/components/ui/OrderConfirmationModal';
import { ShoppingBag, Heart, ShieldCheck, Truck, Plus, Minus, Zap, CheckCircle2, MessageCircle } from 'lucide-react';

interface ClientProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    discountPrice?: number | null;
    condition: string;
    platform: string;
    brand: string;
    stock: number;
    rating: number;
    reviewCount: number;
    sku?: string;
    images: string[];
  };
  conditionBadge: { label: string; className: string };
  platformBadge: { label: string; color: string };
  discountPercent: number;
  specsObj: Record<string, string>;
}

export function ProductDetailClient({
  product,
  conditionBadge,
  platformBadge,
  discountPercent,
  specsObj,
}: ClientProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();

  const [selectedImage, setSelectedImage] = useState(
    product.images[0] || 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db'
  );
  const [quantity, setQuantity] = useState(1);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const isSaved = isInWishlist(product.id);
  const activePrice = product.discountPrice ?? product.price;
  const whatsappProductUrl = getWhatsAppProductUrl(product.name, product.sku);

  const handleAddToCart = () => {
    addToCart(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        discountPrice: product.discountPrice,
        image: selectedImage,
        condition: product.condition,
        platform: product.platform,
      },
      quantity
    );
  };

  const handleBuyNow = () => {
    if (!user) {
      const currentPath = window.location.pathname;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }
    setIsOrderModalOpen(true);
  };

  return (
    <>
      {/* Left Column: Gallery */}
      <div className="lg:col-span-6 space-y-4">
        {/* Main Display Box */}
        <div className="relative aspect-square w-full rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl">
          <Image
            src={selectedImage}
            alt={product.name}
            fill
            className="object-cover transition-all duration-300"
            priority
          />

          {discountPercent > 0 && (
            <span className="absolute top-4 left-4 px-3 py-1 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 text-white font-black text-xs font-mono shadow-lg">
              SAVE {discountPercent}%
            </span>
          )}

          <button
            onClick={() =>
              toggleWishlist({
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                discountPrice: product.discountPrice,
                image: selectedImage,
                condition: product.condition,
                platform: product.platform,
                rating: product.rating,
              })
            }
            className={`absolute top-4 right-4 p-3 rounded-2xl backdrop-blur-md border transition-all ${
              isSaved
                ? 'bg-pink-500/20 text-pink-400 border-pink-500/40'
                : 'bg-slate-950/60 text-slate-300 border-white/10 hover:text-white'
            }`}
          >
            <Heart className={`w-5 h-5 ${isSaved ? 'fill-pink-500' : ''}`} />
          </button>
        </div>

        {/* Thumbnail Selector */}
        {product.images.length > 1 && (
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {product.images.map((imgUrl, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(imgUrl)}
                className={`relative w-20 h-20 rounded-xl bg-slate-900 border overflow-hidden flex-shrink-0 transition-all ${
                  selectedImage === imgUrl ? 'border-cyan-400 ring-2 ring-cyan-400/40' : 'border-slate-800 opacity-60 hover:opacity-100'
                }`}
              >
                <Image src={imgUrl} alt={`Thumbnail ${idx}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right Column: Pricing & Purchase Details */}
      <div className="lg:col-span-6 space-y-6">
        
        {/* Title & Badges */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${conditionBadge.className}`}>
              {conditionBadge.label}
            </span>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-mono border ${platformBadge.color}`}>
              {product.platform}
            </span>
            <span className="text-xs font-semibold text-slate-400">Brand: {product.brand}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
            {product.name}
          </h1>
        </div>

        {/* Price Box */}
        <div className="p-6 rounded-2xl bg-[#111726] border border-slate-800 space-y-3">
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black text-white font-mono">
              {formatPrice(activePrice)}
            </span>
            {product.discountPrice && product.discountPrice < product.price && (
              <span className="text-sm text-slate-500 line-through font-mono">
                {formatPrice(product.price)}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="text-xs font-bold text-emerald-400 font-mono">
                Saved {formatPrice(product.price - activePrice)}
              </span>
            )}
          </div>

          <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> In Stock ({product.stock} units left) • Ships Same Day
          </p>
        </div>

        {/* Quantity & Buy Actions */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="text-xs font-bold text-slate-300 uppercase font-mono">Quantity:</label>
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1.5">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-bold font-mono text-sm text-white">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-slate-900 border border-cyan-500/50 hover:bg-slate-800 text-cyan-400 font-extrabold text-sm shadow-md transition-all"
            >
              <ShoppingBag className="w-4 h-4" /> Add to Cart
            </button>

            <button
              onClick={handleBuyNow}
              className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 text-white font-extrabold text-sm shadow-lg shadow-cyan-500/25 hover:brightness-110 transition-all transform hover:-translate-y-0.5"
            >
              <Zap className="w-4 h-4" /> Buy Now
            </button>
          </div>
        </div>

        {/* Value Features */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3 text-xs text-slate-300">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-cyan-400 flex-shrink-0" />
            <span>
              <strong>Malibu2u Verified:</strong> 42-Point Quality Check Passed with 7-Day Replacement Warranty.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Truck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>
              <strong>Express Delivery:</strong> Dispatched in heavy duty tamper-proof packaging.
            </span>
          </div>
          {whatsappProductUrl && (
            <div className="flex items-center gap-3 pt-2 border-t border-slate-800/60">
              <MessageCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>
                <strong>Have Questions?</strong>{' '}
                <a
                  href={whatsappProductUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2 transition-colors"
                >
                  Chat about this item on WhatsApp &rarr;
                </a>
              </span>
            </div>
          )}
        </div>

      </div>

      {/* Order Confirmation Modal */}
      <OrderConfirmationModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        singleProduct={{
          id: product.id,
          name: product.name,
          sku: product.sku,
          category: specsObj?.Category || product.platform,
          quantity,
          price: activePrice,
          image: selectedImage,
        }}
        user={user}
      />
    </>
  );
}
