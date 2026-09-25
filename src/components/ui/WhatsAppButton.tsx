'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { getWhatsAppUrl } from '@/lib/whatsapp';

export function WhatsAppButton() {
  const [targetNumber, setTargetNumber] = useState<string | null>(
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || null
  );

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data?.whatsappNumber) {
          setTargetNumber(data.whatsappNumber);
        }
      })
      .catch(() => {});
  }, []);

  const whatsappUrl = getWhatsAppUrl(
    targetNumber,
    'Hi Malibu2u, I need help with a product or order.'
  );

  // Hidden in production or missing config
  if (!whatsappUrl) {
    return null;
  }

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Malibu2u on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all group border border-emerald-300/40"
    >
      <div className="relative">
        <MessageCircle className="w-5 h-5 fill-slate-950 group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
        </span>
      </div>
      <span className="hidden sm:inline tracking-wide font-sans">Chat with Us</span>
    </a>
  );
}

