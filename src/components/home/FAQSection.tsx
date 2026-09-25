'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export function FAQSection() {
  const faqs = [
    {
      q: 'How does the Sell & Trade service work on Malibu2u?',
      a: 'Simply select your game, console, or controller model, choose its condition, and get an instant payout valuation quote. Submit your request, and our courier will collect the item from your doorstep. Once our technical team verifies the item condition via our 42-point quality test, payment is transferred directly to your bank account or added as +15% bonus Malibu2u Trade Credit!',
    },
    {
      q: 'What is the quality condition of Pre-Owned games and consoles?',
      a: 'All pre-owned items are graded into two transparent categories: Mint (Grade A - like new with original box/accessories) and Good (Grade B - fully functional with minor superficial wear). All pre-owned games are guaranteed 100% scratch-free and backed by our Malibu2u Replacement Warranty.',
    },
    {
      q: 'How fast is delivery and are shipments insured?',
      a: 'Orders placed before 2 PM are dispatched the same day via priority air courier (BlueDart / Delhivery Express). Delivery takes 1 to 3 business days depending on location. All shipments are fully transit-insured in heavy-duty tamper-proof packaging.',
    },
    {
      q: 'Can I pay using Cash on Delivery (COD) or UPI?',
      a: 'Yes! We support Cash on Delivery, Instant UPI payments, Credit/Debit cards, Net Banking, and Malibu2u Trade Credit.',
    },
    {
      q: 'What is the 7-Day Replacement Policy?',
      a: 'If any product purchased from Malibu2u develops a technical fault within 7 days of receipt, we will arrange a reverse pickup and issue a free replacement or instant store credit.',
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="space-y-8">
      <ScrollReveal className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> FREQUENTLY ASKED QUESTIONS
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase">
          Everything You Need to Know
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Got questions about pre-owned warranties, trade payouts, or shipping times?
        </p>
      </ScrollReveal>

      <div className="max-w-3xl mx-auto space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <ScrollReveal key={faq.q} delayMs={idx * 70}>
              <div
                className={`rounded-2xl bg-[#111726] border transition-all duration-300 overflow-hidden shadow-md ${
                  isOpen
                    ? 'border-cyan-500/50 shadow-cyan-500/10 bg-[#141C2E]'
                    : 'border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-white hover:text-cyan-400 transition-colors"
                >
                  <span className={isOpen ? 'text-cyan-300 font-extrabold' : ''}>{faq.q}</span>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-900 text-slate-400'}`}>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 text-cyan-400' : ''
                      }`}
                    />
                  </div>
                </button>

                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                      {faq.a}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}
