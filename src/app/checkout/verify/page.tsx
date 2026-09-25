'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { formatPrice } from '@/lib/utils';
import { CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight, Truck, RefreshCw } from 'lucide-react';

function VerifyPaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();

  const orderId = searchParams.get('order_id');
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) {
      setError('No Order ID found in verification request.');
      setLoading(false);
      return;
    }

    fetch('/api/cashfree/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.order) {
          setOrder(data.order);
          clearCart();
        } else {
          setError(data.error || 'Payment verification failed or advance was cancelled.');
        }
      })
      .catch((err) => {
        console.error(err);
        setError('Server error verifying Cashfree payment.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [orderId, clearCart]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
        <h2 className="text-xl font-bold text-white">Verifying Payment with Cashfree...</h2>
        <p className="text-xs text-slate-400">Please wait while we confirm your advance transaction securely.</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-6 bg-[#111726] p-8 rounded-3xl border border-red-500/30">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Advance Payment Failed</h2>
          <p className="text-xs text-red-300 font-medium">{error}</p>
          <p className="text-[11px] text-slate-400">
            No money was deducted or your transaction was cancelled. Your order has not been placed.
          </p>
        </div>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            href="/checkout"
            className="px-6 py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
          >
            Retry Checkout Safely
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6">
      <div className="w-20 h-20 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center mx-auto shadow-2xl">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
          ORDER VERIFIED & CONFIRMED
        </span>
        <h1 className="text-3xl font-extrabold text-white">Thank You for Your Order!</h1>
        <p className="text-xs text-slate-300">
          Tracking ID: <strong className="text-cyan-400 font-mono">{order.trackingNumber}</strong>
        </p>
      </div>

      {/* Split Payment Breakdown Box */}
      <div className="p-6 rounded-3xl bg-[#111726] border border-cyan-500/40 text-left space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-bold text-white uppercase font-mono">Split Payment Status</span>
          <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            50% ADVANCE PAID
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Total Order Value:</span>
            <span className="font-extrabold font-mono text-white text-base">
              {formatPrice(order.totalAmount)}
            </span>
          </div>

          <div className="flex justify-between p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Advance Paid (Cashfree Online):
            </span>
            <span className="font-extrabold font-mono text-sm">{formatPrice(order.advanceAmount)}</span>
          </div>

          <div className="flex justify-between p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 font-medium">
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-amber-400" /> Remaining Balance on Delivery (COD):
            </span>
            <span className="font-extrabold font-mono text-sm">{formatPrice(order.remainingCodAmount)}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Delivery Carrier: Express Air Courier</span>
          <span>Cashfree Ref: {order.cashfreePaymentId || order.cashfreeOrderId}</span>
        </div>
      </div>

      <div className="flex justify-center gap-4 pt-2">
        <Link
          href="/orders"
          className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-2"
        >
          Track Order Status in Account <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

export default function VerifyPaymentPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-slate-400 text-xs">Loading verification...</div>}>
      <VerifyPaymentContent />
    </Suspense>
  );
}
