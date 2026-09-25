'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { formatPrice, getConditionBadge } from '@/lib/utils';
import { OrderConfirmationModal } from '@/components/ui/OrderConfirmationModal';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Tag, MessageCircle } from 'lucide-react';

export default function DetailedCartPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, subtotal, totalItems, totalDiscount, clearCart } = useCart();
  const { user } = useAuth();

  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoMsg, setPromoMsg] = useState('');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'MALIBU2026') {
      const discount = Math.round(subtotal * 0.1);
      setAppliedDiscount(discount);
      setPromoMsg('Promo Code MALIBU2026 applied (-10%)');
    } else {
      setPromoMsg('Invalid promo code. Try MALIBU2026');
    }
  };

  const handleCheckoutClick = () => {
    if (cart.length === 0) return;
    if (!user) {
      router.push('/login?redirect=/cart');
      return;
    }
    setIsOrderModalOpen(true);
  };

  const finalTotal = Math.max(0, subtotal - appliedDiscount);

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-white">Your Shopping Vault is Empty</h1>
          <p className="text-xs text-slate-400">
            Explore our new releases, certified pre-owned games, and gaming hardware to get started!
          </p>
        </div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/20"
        >
          Browse Store Catalog <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Shopping Cart Overview</h1>
          <p className="text-xs text-slate-400 mt-1">Review items in your vault before proceeding to order checkout.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-[#111726] rounded-3xl border border-slate-800 divide-y divide-slate-800 overflow-hidden">
              {cart.map((item) => {
                const badge = getConditionBadge(item.product.condition);
                const activePrice = item.product.discountPrice ?? item.product.price;
                return (
                  <div key={item.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="relative w-24 h-24 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex-shrink-0">
                      <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${badge.className}`}>
                        {badge.label}
                      </span>
                      <h3 className="text-sm font-bold text-white leading-snug line-clamp-2">{item.product.name}</h3>
                      <p className="text-[11px] text-slate-400 font-mono">Platform: {item.product.platform}</p>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl p-1">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="p-1 text-slate-400 hover:text-white rounded"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center font-bold font-mono text-xs text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="p-1 text-slate-400 hover:text-white rounded"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right min-w-[90px]">
                      <p className="text-base font-extrabold text-white font-mono">
                        {formatPrice(activePrice * item.quantity)}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-xs text-slate-500 hover:text-red-400 mt-1"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center text-xs">
              <button onClick={clearCart} className="text-slate-500 hover:text-red-400">
                Clear Cart Vault
              </button>
              <Link href="/shop" className="text-cyan-400 hover:underline">
                &larr; Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary & Coupon */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#111726] p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">Order Summary</h3>

              {/* Promo Code Input */}
              <form onSubmit={handleApplyPromo} className="space-y-2">
                <label className="text-xs text-slate-300 font-bold block">Apply Promo Coupon</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="MALIBU2026"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono uppercase"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                  >
                    Apply
                  </button>
                </div>
                {promoMsg && <p className="text-[11px] font-mono text-cyan-400">{promoMsg}</p>}
              </form>

              <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">Cart Subtotal</span>
                  <span className="font-mono font-bold text-white">{formatPrice(subtotal)}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>Product Savings</span>
                    <span className="font-mono">-{formatPrice(totalDiscount)}</span>
                  </div>
                )}
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-cyan-400 font-medium">
                    <span>Promo Discount (MALIBU2026)</span>
                    <span className="font-mono">-{formatPrice(appliedDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Express Delivery</span>
                  <span className="font-mono text-emerald-400 font-bold">FREE</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                <span className="text-sm font-bold text-white">Grand Total</span>
                <span className="text-2xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">
                  {formatPrice(finalTotal)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCheckoutClick}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:brightness-110 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5"
              >
                <MessageCircle className="w-4 h-4 fill-slate-950 text-emerald-500" />
                <span>Continue Order via WhatsApp</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Order Confirmation Modal for Cart Page */}
      <OrderConfirmationModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onSuccess={() => clearCart()}
        cartItems={cart.map((item) => ({
          id: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.discountPrice ?? item.product.price,
          image: item.product.image,
        }))}
        user={user}
      />
    </>
  );
}
