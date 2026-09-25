'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Repeat, ShieldCheck, Banknote, Zap, ArrowRight, CheckCircle2, MessageCircle } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { getWhatsAppSellTradeUrl } from '@/lib/whatsapp';

export default function SellTradePage() {
  const router = useRouter();

  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('CONSOLE');
  const [platform, setPlatform] = useState('PS5');
  const [condition, setCondition] = useState('LIKE_NEW');
  const [accessories, setAccessories] = useState('Original box, power cable, controller');
  const [payoutChoice, setPayoutChoice] = useState<'CASH' | 'TRADE_CREDIT'>('TRADE_CREDIT');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [userNotes, setUserNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Dynamic estimate valuation calculator logic
  const calculateValuation = () => {
    let baseCash = 2000;
    if (category === 'CONSOLE') {
      if (platform === 'PS5') baseCash = 28000;
      else if (platform === 'XBOX') baseCash = 24000;
      else if (platform === 'SWITCH') baseCash = 16000;
      else baseCash = 12000;
    } else if (category === 'GAME') {
      baseCash = 1800;
    } else if (category === 'CONTROLLER') {
      baseCash = 2500;
    } else {
      baseCash = 3000;
    }

    if (condition === 'LIKE_NEW') baseCash *= 1.0;
    else if (condition === 'GOOD') baseCash *= 0.85;
    else baseCash *= 0.7;

    const estimatedCash = Math.round(baseCash);
    const estimatedCredit = Math.round(baseCash * 1.15); // +15% trade credit bonus

    return { estimatedCash, estimatedCredit };
  };

  const { estimatedCash, estimatedCredit } = calculateValuation();
  const whatsappSellTradeUrl = getWhatsAppSellTradeUrl(itemName);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !fullName || !phone || !pickupAddress) {
      alert('Please fill out all required pickup and item details.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/sell-trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName,
          category,
          platform,
          condition,
          accessories,
          estimatedCash,
          estimatedCredit,
          payoutChoice,
          fullName,
          email,
          phone,
          pickupAddress,
          userNotes,
        }),
      });

      if (res.ok) {
        setSubmittedSuccess(true);
      } else {
        alert('Failed to submit sell/trade request. Please try again.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-2xl">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-white">Sell / Trade Request Submitted!</h1>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            Your estimate quote for <strong className="text-white">{itemName}</strong> has been saved. Our courier coordinator will contact you at <strong className="text-cyan-400">{phone}</strong> within 24 hours to schedule free doorstep pickup.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#111726] border border-slate-800 max-w-md mx-auto text-left space-y-3 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Chosen Payout Option:</span>
            <span className="font-bold text-emerald-400">
              {payoutChoice === 'TRADE_CREDIT' ? 'Malibu2u Trade Credit (+15% Bonus)' : 'Instant Bank Cash'}
            </span>
          </div>
          <div className="flex justify-between border-t border-slate-800 pt-2">
            <span className="text-slate-400">Estimated Quote Value:</span>
            <span className="font-extrabold font-mono text-white text-sm">
              {formatPrice(payoutChoice === 'TRADE_CREDIT' ? estimatedCredit : estimatedCash)}
            </span>
          </div>
        </div>

        <button
          onClick={() => router.push('/account')}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs"
        >
          Track Request Status in My Account
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Title */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-cyan-950 border border-emerald-500/30 space-y-2">
        <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
          <Repeat className="w-4 h-4 text-emerald-400" /> INSTANT GAMING TRADE-IN ENGINE
        </span>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Sell or Trade Your Video Games & Consoles
        </h1>
        <p className="text-xs text-slate-300">
          Get an instant estimated valuation quote and schedule free insured doorstep pickup across India.
        </p>
      </div>

      {/* Form Grid */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Item Details */}
        <div className="lg:col-span-7 space-y-6 bg-[#111726] p-6 rounded-3xl border border-slate-800">
          <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
            Step 1: Item Specifications
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Item Title / Model Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. PlayStation 5 Disc Edition / God of War Ragnarok / DualSense Controller"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="CONSOLE">Gaming Console</option>
                  <option value="GAME">Video Game Disc</option>
                  <option value="CONTROLLER">Controller / Gamepad</option>
                  <option value="ACCESSORY">Gaming Accessory</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Platform</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="PS5">PlayStation 5</option>
                  <option value="PS4">PlayStation 4</option>
                  <option value="XBOX">Xbox Series X|S</option>
                  <option value="SWITCH">Nintendo Switch</option>
                  <option value="PC">PC Hardware</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Item Cosmetic & Functional Condition</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setCondition('LIKE_NEW')}
                  className={`p-3 rounded-xl border text-center font-bold text-xs transition-colors ${
                    condition === 'LIKE_NEW'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  Like New (Mint)
                </button>
                <button
                  type="button"
                  onClick={() => setCondition('GOOD')}
                  className={`p-3 rounded-xl border text-center font-bold text-xs transition-colors ${
                    condition === 'GOOD'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  Good (Minor Wear)
                </button>
                <button
                  type="button"
                  onClick={() => setCondition('FAIR')}
                  className={`p-3 rounded-xl border text-center font-bold text-xs transition-colors ${
                    condition === 'FAIR'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  Fair (Superficial Marks)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Accessories Included</label>
              <input
                type="text"
                placeholder="Original Box, HDMI Cable, Power Adapter..."
                value={accessories}
                onChange={(e) => setAccessories(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 pt-4">
            Step 2: Pickup & Contact Info
          </h3>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Email Address</label>
              <input
                type="email"
                placeholder="alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Full Pickup Address & Pin Code *</label>
              <textarea
                required
                rows={3}
                placeholder="Street name, apartment, city, state, postal pin code..."
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Right Live Valuation Box */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 p-6 rounded-3xl border border-emerald-500/40 space-y-4 shadow-xl sticky top-24">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center justify-between">
              <span>Estimated Valuation</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                LIVE CALCULATOR
              </span>
            </h3>

            {/* Valuation Choices */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => setPayoutChoice('TRADE_CREDIT')}
                className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  payoutChoice === 'TRADE_CREDIT'
                    ? 'bg-emerald-950/80 border-emerald-400 ring-2 ring-emerald-500/30'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div>
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" /> Malibu2u Trade Credit (+15% Bonus)
                  </span>
                  <p className="text-2xl font-black text-white font-mono mt-1">
                    {formatPrice(estimatedCredit)}
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-1 rounded bg-emerald-500 text-slate-950 font-black">
                  BEST VALUE
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPayoutChoice('CASH')}
                className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  payoutChoice === 'CASH'
                    ? 'bg-cyan-950/80 border-cyan-400 ring-2 ring-cyan-500/30'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div>
                  <span className="text-xs text-slate-400 font-medium">Direct Bank Cash Payout</span>
                  <p className="text-xl font-bold text-white font-mono mt-1">
                    {formatPrice(estimatedCash)}
                  </p>
                </div>
                <Banknote className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="text-[11px] text-slate-400 space-y-1.5 pt-2 border-t border-slate-800">
              <p className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Free doorstep pick-up included
              </p>
              <p className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" /> Inspection & payout in 24 hours
              </p>
              {whatsappSellTradeUrl && (
                <p className="flex items-center gap-1.5 text-emerald-400">
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <a
                    href={whatsappSellTradeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline font-semibold"
                  >
                    Questions? Chat on WhatsApp
                  </a>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 hover:brightness-110 text-white font-extrabold text-sm shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
            >
              {submitting ? 'Submitting Request...' : 'Confirm & Request Free Pickup'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
