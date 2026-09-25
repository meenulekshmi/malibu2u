'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Headphones, Send, MessageCircle } from 'lucide-react';
import { formatDisplayPhoneNumber, getWhatsAppContactUrl } from '@/lib/whatsapp';

export default function ContactPage() {
  const [rawNumber, setRawNumber] = useState<string | null>(
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || null
  );

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data?.whatsappNumber) {
          setRawNumber(data.whatsappNumber);
        }
      })
      .catch(() => {});
  }, []);

  const displayPhone = formatDisplayPhoneNumber(rawNumber);
  const whatsappContactUrl = getWhatsAppContactUrl(rawNumber);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
        <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
          <Headphones className="w-4 h-4" /> GAMER SUPPORT LINE
        </span>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Contact Malibu2u</h1>
        <p className="text-xs text-slate-400">
          Our dedicated gaming support team is available 7 days a week to answer your tech, order, and trade inquiries.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 rounded-3xl bg-[#111726] border border-slate-800 space-y-6">
          <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">Direct Channels</h3>
          
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-slate-400 block font-mono text-[10px]">PHONE & WHATSAPP SUPPORT</span>
                {whatsappContactUrl && displayPhone ? (
                  <a
                    href={whatsappContactUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-white text-sm hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5 group"
                  >
                    <span>{displayPhone}</span>
                    <MessageCircle className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                  </a>
                ) : (
                  <span className="font-bold text-slate-400 text-sm">Available via Direct Message</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="text-slate-400 block font-mono text-[10px]">SUPPORT EMAIL</span>
                <span className="font-bold text-white text-sm">support@malibu2u.com</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-slate-400 block font-mono text-[10px]">HEADQUARTERS & TESTING CENTER</span>
                <span className="font-bold text-white text-xs">Malibu2u Gaming Hub, Bandra Kurla Complex, Mumbai 400051</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 rounded-3xl bg-[#111726] border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">Send Support Message</h3>
          <form className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Your Name</label>
              <input type="text" placeholder="Enter your name" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white" />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">Email Address</label>
              <input type="email" placeholder="yourname@example.com" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white" />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">Message / Inquiry</label>
              <textarea rows={4} placeholder="How can our support team assist you?" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white" />
            </div>
            <button type="submit" className="w-full py-3 rounded-xl bg-cyan-500 text-slate-950 font-black flex items-center justify-center gap-2">
              Send Message <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

