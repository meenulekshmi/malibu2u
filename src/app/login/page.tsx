'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Malibu2uLogo } from '@/components/ui/Malibu2uLogo';
import { Lock, Mail, ArrowRight, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect');
  const { user, refreshUser, logout } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      if (redirectTarget) {
        router.push(redirectTarget);
      } else if (user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/account');
      }
    }
  }, [user, router, redirectTarget]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {}

      if (res.ok) {
        await refreshUser();
        if (redirectTarget) {
          router.push(redirectTarget);
        } else if (data.user?.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/account');
        }
        router.refresh();
      } else {
        setError(data.error || 'Login failed. Please check credentials.');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <Malibu2uLogo size="lg" className="justify-center" />
        <div className="p-8 rounded-3xl bg-[#111726] border border-slate-800 space-y-4 shadow-2xl">
          <p className="text-sm font-bold text-white">You are signed in as</p>
          <p className="text-cyan-400 font-mono text-sm font-bold">{user.name}</p>
          <p className="text-slate-400 text-xs">{user.email}</p>
          <div className="pt-4 flex flex-col gap-2">
            <Link
              href={redirectTarget || (user.role === 'ADMIN' ? '/admin' : '/account')}
              className="w-full py-3 rounded-xl bg-cyan-500 text-slate-950 font-extrabold text-xs hover:bg-cyan-400 transition-all"
            >
              {redirectTarget ? 'Continue Your Purchase' : user.role === 'ADMIN' ? 'Go to Admin Control Center' : 'My Account Overview'}
            </Link>
            <button
              onClick={() => logout()}
              className="w-full py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-xs hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Log Out Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-8 space-y-6">
      <div className="text-center space-y-3">
        <Malibu2uLogo size="lg" className="justify-center" />
        <h1 className="text-2xl font-black text-white tracking-tight pt-2">Gamer Sign In</h1>
        <p className="text-xs text-slate-400">Access your Malibu2u orders, wishlist, and trade credit vault.</p>
      </div>

      <div className="p-8 rounded-3xl bg-[#111726] border border-slate-800 space-y-6 shadow-2xl">
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800 text-xs">
          <span className="text-slate-400">Don&apos;t have an account yet? </span>
          <Link
            href={redirectTarget ? `/register?redirect=${encodeURIComponent(redirectTarget)}` : '/register'}
            className="text-cyan-400 font-bold hover:underline"
          >
            Register New Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto py-16 text-center text-slate-400">Loading sign in...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
