'use client';

import React from 'react';
import Link from 'next/link';
import { Malibu2uLogo } from '@/components/ui/Malibu2uLogo';
import { ShieldCheck, Truck, Headphones, RotateCcw, Lock, Send } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#060911] border-t border-slate-800/80 text-slate-400 text-xs">
      {/* Value Proposition Highlights */}
      <div className="border-b border-slate-800/60 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">100% Genuine Guaranteed</h4>
              <p className="text-slate-400 text-[11px]">42-point quality check on pre-owned gear</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Insured Express Shipping</h4>
              <p className="text-slate-400 text-[11px]">Free delivery on orders over ₹2,000</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="p-3 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">7-Day Replacement</h4>
              <p className="text-slate-400 text-[11px]">Hassle-free replacement policy</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="p-3 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Gamer Support Line</h4>
              <p className="text-slate-400 text-[11px]">Dedicated assistance 7 days a week</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        
        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-4">
          <Malibu2uLogo size="md" />
          <p className="text-slate-400 leading-relaxed text-xs max-w-sm">
            Malibu2u is India’s premier gaming destination to buy, sell, and trade new and certified pre-owned video games, consoles, controllers, accessories, and high-performance PC hardware.
          </p>
          <div className="pt-2">
            <p className="text-xs font-bold text-white mb-2">Subscribe for Exclusive Drop Alerts & Secret Deals</p>
            <form onSubmit={(e) => e.preventDefault()} className="flex gap-2 max-w-sm">
              <input
                type="email"
                placeholder="Enter your gamer email..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs hover:brightness-110 flex items-center gap-1 shadow-md shadow-cyan-500/20"
              >
                Join <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4 className="font-bold text-white text-sm mb-3 text-cyan-400 uppercase tracking-wider text-[11px]">
            Shop Categories
          </h4>
          <ul className="space-y-2">
            <li>
              <Link href="/consoles" className="hover:text-cyan-400 transition-colors">
                Gaming Consoles (PS5, Xbox, Switch)
              </Link>
            </li>
            <li>
              <Link href="/games" className="hover:text-cyan-400 transition-colors">
                Video Games
              </Link>
            </li>
            <li>
              <Link href="/pre-owned" className="hover:text-cyan-400 transition-colors font-semibold text-emerald-400">
                Pre-Owned Games & Consoles
              </Link>
            </li>
            <li>
              <Link href="/accessories" className="hover:text-cyan-400 transition-colors">
                Controllers & Accessories
              </Link>
            </li>
            <li>
              <Link href="/pc-hardware" className="hover:text-cyan-400 transition-colors">
                PC Gaming Hardware & GPUs
              </Link>
            </li>
            <li>
              <Link href="/deals" className="hover:text-cyan-400 transition-colors text-amber-400">
                Hot Deals & Clearance
              </Link>
            </li>
          </ul>
        </div>

        {/* Sell & Customer Service */}
        <div>
          <h4 className="font-bold text-white text-sm mb-3 text-cyan-400 uppercase tracking-wider text-[11px]">
            Sell & Support
          </h4>
          <ul className="space-y-2">
            <li>
              <Link href="/sell-trade" className="hover:text-emerald-400 transition-colors font-semibold text-emerald-400">
                Sell or Trade Your Gear
              </Link>
            </li>
            <li>
              <Link href="/orders" className="hover:text-cyan-400 transition-colors">
                Track Your Order
              </Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-cyan-400 transition-colors">
                Frequently Asked Questions
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-cyan-400 transition-colors">
                Contact Customer Care
              </Link>
            </li>
            <li>
              <Link href="/account" className="hover:text-cyan-400 transition-colors">
                My Account
              </Link>
            </li>
          </ul>
        </div>

        {/* Policies */}
        <div>
          <h4 className="font-bold text-white text-sm mb-3 text-cyan-400 uppercase tracking-wider text-[11px]">
            Legal & Trust
          </h4>
          <ul className="space-y-2">
            <li>
              <Link href="/faq#shipping" className="hover:text-cyan-400 transition-colors">
                Shipping & Delivery Policy
              </Link>
            </li>
            <li>
              <Link href="/faq#returns" className="hover:text-cyan-400 transition-colors">
                Returns & Refunds Policy
              </Link>
            </li>
            <li>
              <Link href="/faq#privacy" className="hover:text-cyan-400 transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/faq#terms" className="hover:text-cyan-400 transition-colors">
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link href="/admin" className="hover:text-violet-400 transition-colors text-violet-400 font-semibold">
                Admin Portal
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Copyright & Payment Methods */}
      <div className="border-t border-slate-900 bg-black/60 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-[11px]">
            © {new Date().getFullYear()} Malibu2u Gaming Marketplace. All rights reserved. All product names, logos, and brands are property of their respective owners.
          </p>

          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
            <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded">UPI</span>
            <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded">VISA</span>
            <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded">Mastercard</span>
            <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded">NetBanking</span>
            <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded">Cash on Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
