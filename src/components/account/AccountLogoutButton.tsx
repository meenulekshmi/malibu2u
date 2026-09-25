'use client';

import React from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export function AccountLogoutButton() {
  const { logout } = useAuth();

  return (
    <button
      onClick={() => logout()}
      className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 font-bold text-xs flex items-center gap-2 transition-all"
    >
      <LogOut className="w-4 h-4" />
      <span>Log Out</span>
    </button>
  );
}
