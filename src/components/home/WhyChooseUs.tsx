import React from 'react';
import { ShieldCheck, Cpu, RefreshCw, Truck, Headphones, ThumbsUp } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export function WhyChooseUs() {
  const points = [
    {
      icon: ShieldCheck,
      title: '100% Genuine Products',
      description: 'Every product listed on Malibu2u is sourced from authorized distributors or verified gamers.',
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30 group-hover:border-cyan-400 group-hover:bg-cyan-500/20',
      hoverGlow: 'hover:border-cyan-500/40 hover:shadow-cyan-500/10',
    },
    {
      icon: Cpu,
      title: '42-Point Quality Check',
      description: 'Pre-owned consoles and accessories undergo strict hardware stress tests, thermal checks, and optical disc test.',
      color: 'text-violet-400 bg-violet-500/10 border-violet-500/30 group-hover:border-violet-400 group-hover:bg-violet-500/20',
      hoverGlow: 'hover:border-violet-500/40 hover:shadow-violet-500/10',
    },
    {
      icon: RefreshCw,
      title: '7-Day Replacement Guarantee',
      description: 'Receive full replacement or resolution if your order experiences any defect within 7 days of delivery.',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 group-hover:border-emerald-400 group-hover:bg-emerald-500/20',
      hoverGlow: 'hover:border-emerald-500/40 hover:shadow-emerald-500/10',
    },
    {
      icon: Truck,
      title: 'Insured Express Shipping',
      description: 'Orders are packed in tamper-proof heavy duty gaming boxes with live SMS and WhatsApp tracking.',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30 group-hover:border-amber-400 group-hover:bg-amber-500/20',
      hoverGlow: 'hover:border-amber-500/40 hover:shadow-amber-500/10',
    },
    {
      icon: ThumbsUp,
      title: 'Transparent Pre-Owned Grading',
      description: 'Know exact cosmetic & functional condition (Mint / Good) before purchasing. No hidden scratches.',
      color: 'text-pink-400 bg-pink-500/10 border-pink-500/30 group-hover:border-pink-400 group-hover:bg-pink-500/20',
      hoverGlow: 'hover:border-pink-500/40 hover:shadow-pink-500/10',
    },
    {
      icon: Headphones,
      title: 'Dedicated Gamer Support',
      description: 'Real gamers staffing support to assist you with tech specs, compatibility, order tracking, and trade quotes.',
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/30 group-hover:border-blue-400 group-hover:bg-blue-500/20',
      hoverGlow: 'hover:border-blue-500/40 hover:shadow-blue-500/10',
    },
  ];

  return (
    <section className="space-y-8">
      <ScrollReveal className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
          WHY GAMERS TRUST MALIBU2U
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase">
          Built for Gamers, Backed by Quality
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          We combine the reliability of a premier retailer with the value of a gaming exchange.
        </p>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {points.map((pt, idx) => {
          const Icon = pt.icon;
          return (
            <ScrollReveal key={pt.title} delayMs={idx * 80}>
              <div
                className={`group p-6 rounded-2xl bg-[#111726] border border-slate-800/80 transition-all duration-300 hover:-translate-y-1.5 shadow-lg hover:shadow-2xl ${pt.hoverGlow} space-y-3.5 h-full`}
              >
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-md ${pt.color}`}>
                  <Icon className="w-6 h-6 transition-transform duration-300" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">{pt.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{pt.description}</p>
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}
