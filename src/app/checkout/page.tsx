'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { formatPrice } from '@/lib/utils';
import { ShieldCheck, CreditCard, ArrowRight, Truck, Lock, Sparkles, Zap, Ticket, CheckCircle2, AlertCircle } from 'lucide-react';

declare global {
  interface Window {
    Cashfree?: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, clearCart } = useCart();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Coupon state
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number; message: string } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Fetch logged in user profile if present
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.user) {
          setFullName(data.user.name || '');
          setEmail(data.user.email || '');
          if (data.user.phone) setPhone(data.user.phone);
        }
      })
      .catch(() => {});
  }, []);

  // Split-Payment Option: SPLIT_50_50 or FULL_ONLINE
  const [paymentOption, setPaymentOption] = useState<'SPLIT_50_50' | 'FULL_ONLINE'>('SPLIT_50_50');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cashfreeLoaded, setCashfreeLoaded] = useState(false);

  // Load Cashfree Web JS SDK v3
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.onload = () => setCashfreeLoaded(true);
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Server validated coupon application handler
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;

    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCodeInput.trim(),
          cartSubtotal: subtotal,
        }),
      });

      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedCoupon({
          code: data.code,
          discountAmount: data.discountAmount,
          message: data.message,
        });
        setCouponCodeInput('');
      } else {
        setCouponError(data.message || 'Invalid coupon code');
        setAppliedCoupon(null);
      }
    } catch (err) {
      setCouponError('Failed to validate coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const promoDiscount = appliedCoupon?.discountAmount || 0;
  const shippingFee = subtotal >= 2000 ? 0 : 99;
  const finalTotal = Math.max(0, subtotal - promoDiscount + shippingFee);

  // Fixed 50% split calculation (Ensures advance + remaining = finalTotal)
  const advanceAmount = paymentOption === 'SPLIT_50_50' ? Math.ceil(finalTotal * 0.5) : finalTotal;
  const remainingCodAmount = paymentOption === 'SPLIT_50_50' ? finalTotal - advanceAmount : 0;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (!fullName || !phone || !addressLine1 || !city || !postalCode) {
      alert('Please fill out all required shipping address fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create Cashfree Payment Order on Server
      const res = await fetch('/api/cashfree/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          paymentMethod: paymentOption,
          promoDiscount,
          shippingAddress: {
            fullName,
            email,
            phone,
            addressLine1,
            city,
            state,
            postalCode,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'Failed to initiate Cashfree payment session');
        setIsSubmitting(false);
        return;
      }

      // 2. Open Cashfree Web Checkout or Dev Verification Fallback
      if (data.isDevPlaceholder) {
        // Local sandbox development mode - auto-verify sandbox order
        const verifyRes = await fetch('/api/cashfree/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: data.orderId }),
        });

        const verifyData = await verifyRes.json();
        if (verifyRes.ok && verifyData.success) {
          clearCart();
          router.push(`/checkout/verify?order_id=${data.orderId}`);
        } else {
          alert(verifyData.error || 'Sandbox payment verification failed');
          setIsSubmitting(false);
        }
      } else if (window.Cashfree && data.cashfreeSessionId) {
        const cashfree = window.Cashfree({
          mode: process.env.NEXT_PUBLIC_CASHFREE_MODE || 'sandbox',
        });
        cashfree.checkout({
          paymentSessionId: data.cashfreeSessionId,
          redirectTarget: '_self',
        });
      } else {
        // Fallback redirect URL
        clearCart();
        router.push(`/checkout/verify?order_id=${data.orderId}`);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('An unexpected error occurred during checkout.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-[#111827] to-cyan-950 border border-slate-800 space-y-2">
        <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
          <Lock className="w-4 h-4 text-cyan-400" /> CASHFREE PG SPLIT-PAYMENT GATEWAY
        </span>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Secure Order Checkout
        </h1>
        <p className="text-xs text-slate-300">
          Pay 50% advance now via Cashfree / UPI / Card, and the remaining 50% when delivered.
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Shipping Address & Split Payment Selection */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Shipping Address Form */}
          <div className="bg-[#111726] p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <Truck className="w-4 h-4 text-cyan-400" /> 1. Delivery Address
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Mobile Phone *</label>
                <input
                  type="tel"
                  required
                  placeholder="Enter mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block text-slate-300 font-bold mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="text-xs">
              <label className="block text-slate-300 font-bold mb-1">Street Address *</label>
              <input
                type="text"
                required
                placeholder="House / Apartment no., Street, Area"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">City *</label>
                <input
                  type="text"
                  required
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">State *</label>
                <input
                  type="text"
                  required
                  placeholder="State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">PIN Code *</label>
                <input
                  type="text"
                  required
                  placeholder="PIN code"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Payment Option Selector */}
          <div className="bg-[#111726] p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-cyan-400" /> 2. Payment Options
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                CASHFREE PROTECTED
              </span>
            </h3>

            <div className="space-y-3">
              
              {/* Option 1: 50% Advance + 50% COD */}
              <button
                type="button"
                onClick={() => setPaymentOption('SPLIT_50_50')}
                className={`w-full p-4 rounded-2xl border text-left transition-all ${
                  paymentOption === 'SPLIT_50_50'
                    ? 'bg-cyan-950/70 border-cyan-400 ring-2 ring-cyan-500/30'
                    : 'bg-slate-900 border-slate-800 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-cyan-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Option 1: Pay 50% Advance + 50% COD
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500 text-slate-950 font-black">
                    RECOMMENDED
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-semibold mt-2">
                  Pay 50% advance ({formatPrice(Math.ceil(finalTotal * 0.5))}) now through UPI/Cashfree, and the remaining 50% ({formatPrice(finalTotal - Math.ceil(finalTotal * 0.5))}) when your order is delivered.
                </p>

                <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-800/80 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-cyan-500/30">
                    <span className="text-[10px] text-cyan-400 font-bold block">ADVANCE PAYABLE NOW</span>
                    <span className="text-base font-black text-white">{formatPrice(Math.ceil(finalTotal * 0.5))}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-amber-500/30">
                    <span className="text-[10px] text-amber-400 font-bold block">DUE ON DELIVERY (COD)</span>
                    <span className="text-base font-black text-white">{formatPrice(finalTotal - Math.ceil(finalTotal * 0.5))}</span>
                  </div>
                </div>
              </button>

              {/* Option 2: Full Online Payment */}
              <button
                type="button"
                onClick={() => setPaymentOption('FULL_ONLINE')}
                className={`w-full p-4 rounded-2xl border text-left transition-all ${
                  paymentOption === 'FULL_ONLINE'
                    ? 'bg-violet-950/70 border-violet-400 ring-2 ring-violet-500/30'
                    : 'bg-slate-900 border-slate-800 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-violet-300 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-violet-400" /> Option 2: Full Online Payment
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 font-bold">
                    100% ONLINE
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-semibold mt-2">
                  Pay the complete order total of {formatPrice(finalTotal)} online through Cashfree. Zero balance due on delivery.
                </p>

                <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-violet-500/30 flex justify-between items-center">
                    <span className="text-[10px] text-violet-400 font-bold">FULL AMOUNT PAYABLE NOW:</span>
                    <span className="text-base font-black text-white">{formatPrice(finalTotal)}</span>
                  </div>
                </div>
              </button>

            </div>
          </div>

        </div>

        {/* Right Column: Order Summary & Checkout Action */}
        <div className="lg:col-span-5 space-y-6 bg-[#111726] p-6 rounded-3xl border border-slate-800">
          <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">Order Summary</h3>

          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-bold text-white truncate max-w-[190px]">{item.product.name}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">Qty: {item.quantity} • {item.product.platform}</p>
                </div>
                <span className="font-mono font-bold text-white">
                  {formatPrice((item.product.discountPrice ?? item.product.price) * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Promo Coupon Application Box */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
              <Ticket className="w-4 h-4 text-cyan-400" /> Apply Coupon Code
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Code (e.g. GAMER10)"
                value={couponCodeInput}
                onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={couponLoading}
                className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 font-bold text-xs border border-cyan-500/30 hover:bg-cyan-500/30 disabled:opacity-50"
              >
                {couponLoading ? 'Checking...' : 'Apply'}
              </button>
            </div>

            {appliedCoupon && (
              <div className="flex items-center justify-between text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 p-2 rounded-xl">
                <span>{appliedCoupon.message}</span>
                <button
                  type="button"
                  onClick={() => setAppliedCoupon(null)}
                  className="text-[10px] underline hover:text-emerald-200"
                >
                  Remove
                </button>
              </div>
            )}

            {couponError && (
              <div className="flex items-center gap-1.5 text-xs text-red-300 bg-red-500/10 border border-red-500/30 p-2 rounded-xl">
                <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span>{couponError}</span>
              </div>
            )}
          </div>

          {/* Pricing Breakdown */}
          <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Product Subtotal</span>
              <span className="font-mono font-bold text-white">{formatPrice(subtotal)}</span>
            </div>
            {promoDiscount > 0 && (
              <div className="flex justify-between text-emerald-400 font-medium">
                <span>Coupon Discount ({appliedCoupon?.code})</span>
                <span className="font-mono">-{formatPrice(promoDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-400">
              <span>Express Insured Shipping</span>
              <span className="font-mono text-emerald-400 font-bold">
                {shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}
              </span>
            </div>

            <div className="flex justify-between items-baseline pt-2 border-t border-slate-800">
              <span className="text-sm font-bold text-white">Total Order Value</span>
              <span className="text-2xl font-black font-mono text-cyan-400">{formatPrice(finalTotal)}</span>
            </div>
          </div>

          {/* Split Payment Highlights */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-cyan-400 font-bold font-mono">
              <span>Advance Payment (Pay Now):</span>
              <span>{formatPrice(advanceAmount)}</span>
            </div>
            <div className="flex justify-between text-amber-400 font-bold font-mono">
              <span>Remaining Balance (COD):</span>
              <span>{formatPrice(remainingCodAmount)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || cart.length === 0}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 hover:brightness-110 text-white font-extrabold text-sm shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting
              ? 'Opening Cashfree Gateway...'
              : paymentOption === 'SPLIT_50_50'
              ? `Pay 50% Advance (${formatPrice(advanceAmount)}) Now`
              : `Pay Full Order (${formatPrice(finalTotal)}) Now`}{' '}
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[11px] text-center text-slate-400 font-medium flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Cashfree Payments 256-Bit Encrypted
          </p>
        </div>

      </form>
    </div>
  );
}
