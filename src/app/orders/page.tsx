import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { formatPrice } from '@/lib/utils';
import { Package, Truck, CheckCircle2 } from 'lucide-react';

export const revalidate = 0;

export default async function OrdersPage() {
  const user = await getCurrentUser();

  let orders: any[] = [];
  if (user) {
    orders = await prisma.order.findMany({
      where: { userId: user.userId },
      include: {
        items: {
          include: { product: { include: { images: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  return (
    <div className="space-y-8">
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
            <Package className="w-4 h-4 text-cyan-400" /> ORDER VAULT & STATUS TRACKER
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">Order History</h1>
          <p className="text-xs text-slate-400">Track 50% split payments, remaining COD balances, and delivery progress.</p>
        </div>
      </div>

      {!user ? (
        <div className="p-12 text-center bg-[#111726] rounded-3xl border border-slate-800 space-y-4">
          <p className="text-sm font-bold text-white">Please sign in to view your order history.</p>
          <Link
            href="/login"
            className="inline-block px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
          >
            Sign In to Account
          </Link>
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center bg-[#111726] rounded-3xl border border-slate-800 space-y-3">
          <Package className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-bold text-white">You haven&apos;t placed any orders yet.</p>
          <Link
            href="/shop"
            className="inline-block px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs"
          >
            Browse Malibu2u Store
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const advance = order.advanceAmount || Math.ceil(order.totalAmount * 0.5);
            const remaining = order.remainingCodAmount || (order.totalAmount - advance);
            return (
              <div
                key={order.id}
                className="p-6 rounded-3xl bg-[#111726] border border-slate-800 space-y-4 shadow-lg"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-mono">Order Tracking ID:</span>
                    <span className="font-extrabold font-mono text-cyan-400 ml-2">{order.trackingNumber}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-mono">
                      Placed: {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase font-mono">
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Split Payment Summary Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-2xl bg-slate-900 border border-emerald-500/30 flex justify-between items-center">
                    <div>
                      <span className="text-emerald-400 font-bold block text-[10px]">50% ADVANCE PAID (CASHFREE)</span>
                      <span className="text-sm font-black text-white">{formatPrice(advance)}</span>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-900 border border-amber-500/30 flex justify-between items-center">
                    <div>
                      <span className="text-amber-400 font-bold block text-[10px]">REMAINING COD BALANCE (DUE ON DELIVERY)</span>
                      <span className="text-sm font-black text-white">{formatPrice(remaining)}</span>
                    </div>
                    <Truck className="w-5 h-5 text-amber-400" />
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-3 pt-2">
                  {order.items.map((item: any) => {
                    const image =
                      item.product?.images?.[0]?.url ||
                      'https://images.unsplash.com/photo-1606813907291-d86efa9b94db';
                    return (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="relative w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex-shrink-0">
                          <Image src={image} alt={item.product?.name || 'Product'} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{item.product?.name}</h4>
                          <p className="text-[10px] text-slate-400 font-mono">
                            Qty: {item.quantity} • Platform: {item.product?.platform}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-white font-mono">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-400">Payment Option: <strong className="text-white">{order.paymentMethod}</strong></span>
                  <span className="text-base font-black text-cyan-400">Total Order Value: {formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
