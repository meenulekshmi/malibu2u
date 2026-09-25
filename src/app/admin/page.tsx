import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { AdminDashboardClient } from './AdminDashboardClient';
import { ShieldCheck, Package, ShoppingBag, Repeat, Users, Lock } from 'lucide-react';

import { AccountLogoutButton } from '@/components/account/AccountLogoutButton';

export const revalidate = 0;

export default async function AdminPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 bg-[#111726] p-8 rounded-3xl border border-slate-800">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-white">Admin Portal Restricted</h1>
        <p className="text-xs text-slate-400">
          You must be logged in with administrator privileges to access this control panel.
        </p>
        <Link
          href="/login"
          className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs"
        >
          Sign In to Admin Account
        </Link>
      </div>
    );
  }

  const products = await prisma.product.findMany({
    include: { images: true, category: true },
    orderBy: { createdAt: 'desc' },
  });

  const orders = await prisma.order.findMany({
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const sellRequests = await prisma.sellTradeRequest.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-violet-950 via-slate-900 to-cyan-950 border border-violet-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> MALIBU2U ADMIN CONTROL CENTER
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">Management Dashboard</h1>
          <p className="text-xs text-slate-300">
            Welcome back, Administrator <strong className="text-cyan-400">{currentUser.name}</strong>
          </p>
        </div>
        <AccountLogoutButton />
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-[#111726] border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Total Catalog Products</span>
          <p className="text-2xl font-black text-white font-mono">{products.length}</p>
        </div>

        <div className="p-6 rounded-2xl bg-[#111726] border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Customer Orders</span>
          <p className="text-2xl font-black text-cyan-400 font-mono">{orders.length}</p>
        </div>

        <div className="p-6 rounded-2xl bg-[#111726] border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Pending Sell/Trade Quotes</span>
          <p className="text-2xl font-black text-emerald-400 font-mono">{sellRequests.length}</p>
        </div>

        <div className="p-6 rounded-2xl bg-[#111726] border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Gross Sales Revenue</span>
          <p className="text-2xl font-black text-violet-400 font-mono">₹{totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Interactive Tabs & Management Client */}
      <AdminDashboardClient
        initialProducts={products}
        initialOrders={orders}
        initialSellRequests={sellRequests}
      />
    </div>
  );
}
