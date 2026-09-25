import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { Package } from 'lucide-react';
import { CustomerOrderVaultClient } from '@/components/orders/CustomerOrderVaultClient';

export const revalidate = 0;

export default async function OrdersPage() {
  const user = await getCurrentUser();

  let orders: any[] = [];
  if (user) {
    orders = await prisma.order.findMany({
      where: { userId: user.userId },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, platform: true, images: { select: { url: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  const setting = await prisma.systemSetting.findUnique({
    where: { key: 'whatsapp_number' },
  });
  const supportWhatsAppNumber = setting?.value || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918078565355';

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-[#111827] to-cyan-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xl">
        <div>
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
            <Package className="w-4 h-4 text-cyan-400" /> ORDER VAULT & STATUS TRACKER
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">Order Vault</h1>
          <p className="text-xs text-slate-400">
            Real-time status tracking, address confirmation snapshots, and instant WhatsApp payment verification.
          </p>
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
        <CustomerOrderVaultClient initialOrders={orders} supportWhatsAppNumber={supportWhatsAppNumber} />
      )}
    </div>
  );
}
