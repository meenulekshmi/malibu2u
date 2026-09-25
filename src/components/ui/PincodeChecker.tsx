'use client';

import React, { useState } from 'react';
import { MapPin, CheckCircle2, AlertCircle } from 'lucide-react';

export function PincodeChecker() {
  const [pincode, setPincode] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = pincode.trim();
    if (!/^\d{6}$/.exec(clean)) {
      setStatus({
        type: 'error',
        message: 'Please enter a valid 6-digit PIN code.',
      });
      return;
    }

    setLoading(true);
    // Simulate pincode verification without false hardcoded dates
    setTimeout(() => {
      setLoading(false);
      setStatus({
        type: 'success',
        message: `Delivery available for PIN ${clean}. Standard express dispatch in 24 hours.`,
      });
    }, 400);
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
        <MapPin className="w-4 h-4 text-cyan-400" />
        <span>Check Delivery & Pincode Availability</span>
      </div>

      <form onSubmit={handleCheckPincode} className="flex gap-2">
        <input
          type="text"
          maxLength={6}
          placeholder="Enter 6-digit PIN code"
          value={pincode}
          onChange={(e) => setPincode(e.target.value)}
          className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold text-xs border border-slate-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Checking...' : 'Check'}
        </button>
      </form>

      {status && (
        <div
          className={`flex items-start gap-2 p-2.5 rounded-xl text-xs ${
            status.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border border-red-500/30 text-red-300'
          }`}
        >
          {status.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          )}
          <span>{status.message}</span>
        </div>
      )}
    </div>
  );
}
