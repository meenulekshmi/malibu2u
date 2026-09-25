import React from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { User, Package, Repeat, ShieldCheck, MapPin, Plus, ArrowRight } from 'lucide-react';
import { AccountLogoutButton } from '@/components/account/AccountLogoutButton';
import { CustomerAddressManager } from '@/components/account/CustomerAddressManager';

export const revalidate = 0;

export default async function AccountPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <h1 className="text-2xl font-extrabold text-white">Sign In Required</h1>
        <p className="text-xs text-slate-400">Log in to view your profile, orders, saved addresses, and trade quotes.</p>
        <Link
          href="/login"
          className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-lg"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const orderCount = await prisma.order.count({ where: { userId: currentUser.userId } });
  const sellRequestCount = await prisma.sellTradeRequest.count({ where: { userId: currentUser.userId } });
  const addresses = await prisma.address.findMany({
    where: { userId: currentUser.userId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-[#111827] to-cyan-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-cyan-500/20">
            {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
                GAMER PROFILE
              </span>
              {currentUser.role === 'ADMIN' && (
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/40">
                  ADMINISTRATOR
                </span>
              )}
            </div>
            <h1 className="text-2xl font-extrabold text-white">{currentUser.name}</h1>
            <p className="text-xs text-slate-400">{currentUser.email}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {currentUser.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="px-4 py-2.5 rounded-xl bg-violet-600/20 border border-violet-500/40 text-violet-300 font-bold text-xs hover:bg-violet-600/30 transition-colors"
            >
              Admin Control Center &rarr;
            </Link>
          )}
          <AccountLogoutButton />
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Link
          href="/orders"
          className="p-6 rounded-3xl bg-[#111726] border border-slate-800 hover:border-cyan-500/50 transition-all space-y-3 group shadow-lg"
        >
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
            My Order Vault ({orderCount})
          </h3>
          <p className="text-xs text-slate-400">View active shipments, live status timeline, and payment verification.</p>
        </Link>

        <Link
          href="/sell-trade"
          className="p-6 rounded-3xl bg-[#111726] border border-slate-800 hover:border-emerald-500/50 transition-all space-y-3 group shadow-lg"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <Repeat className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
            Sell & Trade Requests ({sellRequestCount})
          </h3>
          <p className="text-xs text-slate-400">Track pending sell/trade pickup requests and valuation quotes.</p>
        </Link>
      </div>

      {/* My Addresses Section */}
      <div className="p-8 rounded-3xl bg-[#111726] border border-slate-800 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">My Delivery Addresses</h2>
              <p className="text-xs text-slate-400">Manage saved addresses for express WhatsApp and website checkout.</p>
            </div>
          </div>
        </div>

        <CustomerAddressManager initialAddresses={addresses} />
      </div>
    </div>
  );
}
