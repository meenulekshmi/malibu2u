'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Tag, MessageCircle } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { formatPrice, getConditionBadge } from '@/lib/utils';
import { OrderConfirmationModal } from '@/components/ui/OrderConfirmationModal';

export function CartDrawer() {
  const router = useRouter();
  const { isCartOpen, setIsCartOpen, cart, removeFromCart, updateQuantity, subtotal, totalItems, totalDiscount, clearCart } =
    useCart();
  const { user } = useAuth();
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  if (!isCartOpen) return null;

  const freeShippingThreshold = 2000;
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = freeShippingThreshold - subtotal;

  const handleCheckoutClick = () => {
    if (cart.length === 0) return;
    if (!user) {
      setIsCartOpen(false);
      router.push('/login?redirect=/cart');
      return;
    }
    setIsOrderModalOpen(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
          onClick={() => setIsCartOpen(false)}
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-md bg-[#0F172A] border-l border-slate-800 text-slate-100 flex flex-col shadow-2xl shadow-cyan-950/50">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    Shopping Cart
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {totalItems} {totalItems === 1 ? 'item' : 'items'}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">Authentic Gaming Gear & Verified Pre-owned</p>
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Bar */}
            <div className="px-6 py-3 bg-slate-900/40 border-b border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5 font-medium">
                <span>
                  {remainingForFreeShipping <= 0 ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> FREE Express Shipping Unlocked!
                    </span>
                  ) : (
                    <>
                      Add <strong className="text-cyan-400">{formatPrice(remainingForFreeShipping)}</strong> more for FREE Shipping
                    </>
                  )}
                </span>
                <span className="text-slate-400 font-mono text-[11px]">{Math.round(progressPercent)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-400 to-violet-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 divide-y divide-slate-800/60">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
                  <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 shadow-inner">
                    <ShoppingBag className="w-10 h-10 text-slate-500" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Your cart is currently empty</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">
                      Browse our high-grade games, consoles, controllers & accessories to fill your vault!
                    </p>
                  </div>
                  <Link
                    href="/shop"
                    onClick={() => setIsCartOpen(false)}
                    className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-semibold text-xs shadow-lg shadow-cyan-500/25 hover:brightness-110 transition-all"
                  >
                    Explore Store <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                cart.map((item) => {
                  const badge = getConditionBadge(item.product.condition);
                  const activePrice = item.product.discountPrice ?? item.product.price;
                  return (
                    <div key={item.id} className="pt-4 first:pt-0 flex gap-4 items-start group">
                      <div className="relative w-20 h-20 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex-shrink-0">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-white line-clamp-2 leading-tight">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-slate-500 hover:text-red-400 transition-colors p-1"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${badge.className}`}>
                            {badge.label}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 uppercase">
                            {item.product.platform}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1">
                            <button
                              onClick={() => updateQuantity(item.product.id, -1)}
                              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold font-mono px-2 text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, 1)}
                              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="text-right">
                            <span className="text-sm font-extrabold text-white font-mono">
                              {formatPrice(activePrice * item.quantity)}
                            </span>
                            {item.product.discountPrice && item.product.discountPrice < item.product.price && (
                              <div className="text-[10px] text-slate-500 line-through font-mono">
                                {formatPrice(item.product.price * item.quantity)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer & Summary */}
            {cart.length > 0 && (
              <div className="p-6 bg-slate-900/90 border-t border-slate-800 space-y-4">
                {totalDiscount > 0 && (
                  <div className="flex items-center justify-between text-xs text-emerald-400 font-medium px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <span className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" /> Total Discount Savings
                    </span>
                    <span className="font-bold font-mono">-{formatPrice(totalDiscount)}</span>
                  </div>
                )}

                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Subtotal</span>
                    <span className="font-mono font-bold text-white text-sm">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Estimated Delivery</span>
                    <span className="font-mono text-emerald-400 font-semibold">
                      {remainingForFreeShipping <= 0 ? 'FREE' : '₹99 (Express)'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-white">Grand Total</span>
                  <span className="text-xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">
                    {formatPrice(subtotal + (remainingForFreeShipping <= 0 ? 0 : 99))}
                  </span>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={handleCheckoutClick}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:brightness-110 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5"
                  >
                    <MessageCircle className="w-4 h-4 fill-slate-950 text-emerald-500" />
                    <span>Order via WhatsApp</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center justify-between text-center pt-2">
                    <Link
                      href="/cart"
                      onClick={() => setIsCartOpen(false)}
                      className="text-xs text-slate-400 hover:text-cyan-400 transition-colors w-full underline decoration-slate-700 underline-offset-4"
                    >
                      View detailed cart & enter promo code
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Confirmation Modal for Cart */}
      <OrderConfirmationModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onSuccess={() => {
          clearCart();
          setIsCartOpen(false);
        }}
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
