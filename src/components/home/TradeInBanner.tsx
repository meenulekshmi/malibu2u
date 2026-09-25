import React from 'react';
import Link from 'next/link';
import { Repeat, Truck, Banknote, ShieldCheck, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export function TradeInBanner() {
  return (
    <ScrollReveal>
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950/80 via-slate-900 to-cyan-950/80 border border-emerald-500/30 p-8 sm:p-12 shadow-2xl shadow-emerald-950/30 group">
        
        {/* Glowing Background Auras */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/15 rounded-full filter blur-[90px] pointer-events-none group-hover:bg-emerald-500/25 transition-all duration-700" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full filter blur-[90px] pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold font-mono shadow-md shadow-emerald-500/10">
              <Repeat className="w-3.5 h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '8s' }} /> SELL OR TRADE YOUR GAMING GEAR
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight uppercase">
              Turn Your Used Games & Consoles into{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-300 to-teal-200">
                Instant Cash or Trade Credit
              </span>
            </h2>

            <p className="text-sm text-slate-300 max-w-lg leading-relaxed">
              Have old PS4 discs, unused DualSense controllers, or thinking of upgrading to a PS5 Slim? Get an instant online valuation, free insured doorstep pickup, and instant bank payout or +15% extra Malibu2u Store Credit!
            </p>

            {/* Interactive Step Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-300 flex items-start gap-3 shadow-md">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 font-extrabold font-mono text-sm shrink-0">
                  01
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Select Item Details</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Choose console/game model & condition</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 hover:-translate-y-1 transition-all duration-300 flex items-start gap-3 shadow-md">
                <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 font-extrabold font-mono text-sm shrink-0">
                  02
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Free Doorstep Pickup</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Courier collects from your location</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-violet-500/40 hover:-translate-y-1 transition-all duration-300 flex items-start gap-3 shadow-md">
                <div className="p-2 rounded-lg bg-violet-500/20 text-violet-400 font-extrabold font-mono text-sm shrink-0">
                  03
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Instant Payout</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Bank transfer or store credit</p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-2 flex items-center gap-4">
              <Link
                href="/sell-trade"
                className="group/btn inline-flex items-center gap-2.5 px-6.5 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
              >
                <span>Get Instant Sell/Trade Quote</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1.5 transition-transform duration-300" />
              </Link>
            </div>
          </div>

          {/* Right Offer Highlight Card */}
          <div className="lg:col-span-5 rounded-2xl bg-slate-900/90 border border-emerald-500/40 p-6 space-y-4 shadow-2xl hover:border-emerald-400/60 transition-colors">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-300 tracking-wider font-mono">ESTIMATED PAYOUT COMPARISON</span>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/40 animate-pulse-glow">
                +15% BONUS
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between transition-colors hover:border-slate-700">
                <div>
                  <span className="text-xs text-slate-400 font-medium">Instant Bank Cash</span>
                  <p className="text-lg font-extrabold text-white font-mono">₹14,500</p>
                </div>
                <Banknote className="w-6 h-6 text-slate-400" />
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/60 flex items-center justify-between shadow-inner hover:border-emerald-400 transition-colors">
                <div>
                  <span className="text-xs text-emerald-300 font-bold flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> Malibu2u Store Trade Credit
                  </span>
                  <p className="text-xl font-black text-emerald-400 font-mono">₹16,675</p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-black text-xs font-mono shadow-md">
                  BEST VALUE
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Free 48-hour pickup across all major pin codes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero cancellation fees if valuation is revised</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Trade credit never expires</span>
              </div>
            </div>
          </div>

        </div>
      </section>
    </ScrollReveal>
  );
}
