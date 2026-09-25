'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShoppingBag,
  Heart,
  User as UserIcon,
  Menu,
  X,
  Repeat,
  Sparkles,
  Gamepad2,
  Tv,
  Headphones,
  Laptop,
  Flame,
  ShieldCheck,
  LogOut,
  SlidersHorizontal,
  ChevronDown,
  LayoutDashboard,
  Package,
} from 'lucide-react';
import { Malibu2uLogo } from '@/components/ui/Malibu2uLogo';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { useAuth } from '@/lib/auth-context';

export function Header() {
  const router = useRouter();
  const { setIsCartOpen, totalItems } = useCart();
  const { totalWishlistItems } = useWishlist();
  const { user, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogoutAction = async () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    await logout();
  };

  const navCategories = [
    { name: 'PlayStation', href: '/shop?platform=PS5', icon: Gamepad2, color: 'text-blue-400' },
    { name: 'Xbox', href: '/shop?platform=XBOX_SERIES', icon: Gamepad2, color: 'text-emerald-400' },
    { name: 'Nintendo', href: '/shop?platform=NINTENDO_SWITCH', icon: Gamepad2, color: 'text-red-400' },
    { name: 'PC Gaming', href: '/pc-hardware', icon: Laptop, color: 'text-purple-400' },
    { name: 'Consoles', href: '/consoles', icon: Tv, color: 'text-cyan-400' },
    { name: 'Games', href: '/games', icon: Gamepad2, color: 'text-amber-400' },
    { name: 'Accessories', href: '/accessories', icon: Headphones, color: 'text-pink-400' },
    { name: 'Pre-Owned Bargains', href: '/pre-owned', icon: ShieldCheck, color: 'text-emerald-400', badge: 'SAVE UP TO 60%' },
    { name: 'Hot Deals', href: '/deals', icon: Flame, color: 'text-orange-400' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#090D16]/95 backdrop-blur-md border-b border-slate-800/80 shadow-lg shadow-black/40">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-violet-950 border-b border-cyan-500/20 px-4 py-1.5 text-[11px] font-medium text-slate-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <Sparkles className="w-3 h-3 mr-1" /> MALIBU2U GUARANTEE
            </span>
            <span className="hidden sm:inline text-slate-300">
              42-Point Quality Check on Pre-owned • 7-Day Replacement • Instant Trade Cash
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/sell-trade" className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1">
              <Repeat className="w-3 h-3" /> Sell/Trade Gaming Gear
            </Link>
            <span className="text-slate-600">|</span>
            <Link href="/contact" className="hover:text-white transition-colors">
              Support
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-3.5">
        <div className="flex items-center justify-between gap-4">
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <Malibu2uLogo size="md" className="-ml-2 sm:-ml-5 md:-ml-8" />

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-xl relative">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search PS5 games, pre-owned consoles, Xbox controllers, RTX GPUs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-24 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all shadow-inner"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-500/20 transition-all"
              >
                Search
              </button>
            </div>
          </form>

          {/* User & Actions */}
          <div className="flex items-center gap-3">
            {/* Sell & Trade Quick CTA */}
            <Link
              href="/sell-trade"
              className="hidden xl:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-violet-500/10 border border-emerald-500/40 text-emerald-400 hover:text-emerald-300 font-bold text-xs shadow-sm hover:border-emerald-400 transition-all"
            >
              <Repeat className="w-4 h-4 text-emerald-400 animate-spin-slow" />
              <span>Sell / Trade</span>
              <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-300 font-mono">
                INSTANT CASH
              </span>
            </Link>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {totalWishlistItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-pink-500 text-white text-[11px] font-bold flex items-center justify-center font-mono shadow-md">
                  {totalWishlistItems}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-cyan-400/60 text-white font-medium text-xs transition-all shadow-sm group"
            >
              <ShoppingBag className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline font-bold">Cart</span>
              {totalItems > 0 && (
                <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 font-extrabold text-[11px] flex items-center justify-center font-mono">
                  {totalItems}
                </span>
              )}
            </button>

            {/* User Account / Auth Dropdown */}
            {user ? (
              <div className="relative group" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/50 transition-all focus:outline-none"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center text-white font-extrabold text-xs shadow-inner">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="hidden sm:inline text-xs font-bold text-white max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                </button>

                {/* Dropdown Menu */}
                <div
                  className={`absolute right-0 mt-2 w-56 py-2 bg-[#0E1626] border border-slate-700/80 rounded-2xl shadow-2xl transition-all z-50 ${
                    userDropdownOpen
                      ? 'opacity-100 visible translate-y-0'
                      : 'opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-1'
                  }`}
                >
                  <div className="px-4 py-2.5 border-b border-slate-800 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black text-white truncate">{user.name}</p>
                      {user.role === 'ADMIN' && (
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/40">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                  </div>

                  <div className="py-1">
                    {user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-violet-300 hover:bg-violet-950/40 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-violet-400" />
                        <span>Admin Control Center</span>
                      </Link>
                    )}
                    <Link
                      href="/account"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-slate-200 hover:bg-slate-800 transition-colors font-medium"
                    >
                      <UserIcon className="w-4 h-4 text-cyan-400" />
                      <span>Account Overview</span>
                    </Link>
                    <Link
                      href="/orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-slate-200 hover:bg-slate-800 transition-colors font-medium"
                    >
                      <Package className="w-4 h-4 text-cyan-400" />
                      <span>Order Vault & Tracking</span>
                    </Link>
                    <Link
                      href="/sell-trade"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-slate-200 hover:bg-slate-800 transition-colors font-medium"
                    >
                      <Repeat className="w-4 h-4 text-emerald-400" />
                      <span>My Sell & Trade Quotes</span>
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-slate-800">
                    <button
                      onClick={handleLogoutAction}
                      className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 font-bold flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-red-400" />
                      <span>Log Out Account</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-cyan-400 text-white font-bold text-xs transition-all shadow-sm"
              >
                <UserIcon className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-3 md:hidden">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search games, consoles, controllers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </form>
      </div>

      {/* Category Navigation Bar */}
      <nav className="hidden lg:block bg-slate-900/50 border-t border-slate-800/60 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 space-x-1">
            {navCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.name}
                  href={cat.href}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors whitespace-nowrap group"
                >
                  <Icon className={`w-3.5 h-3.5 ${cat.color} group-hover:scale-110 transition-transform`} />
                  <span>{cat.name}</span>
                  {cat.badge && (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {cat.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <Link
            href="/shop"
            className="flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors px-3 py-1.5 whitespace-nowrap"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" /> All Products
          </Link>
        </div>
      </nav>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-b border-slate-800 px-4 py-4 space-y-4 shadow-2xl">
          
          {/* Mobile User Profile Header */}
          {user ? (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 to-[#111827] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">{user.name}</p>
                    <p className="text-[10px] text-slate-400 leading-tight">{user.email}</p>
                  </div>
                </div>
                {user.role === 'ADMIN' && (
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/40">
                    ADMIN
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                {user.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-300 font-bold text-xs flex items-center justify-center gap-1.5 col-span-2"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" /> Admin Control Panel
                  </Link>
                )}
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <UserIcon className="w-3.5 h-3.5 text-cyan-400" /> Account
                </Link>
                <Link
                  href="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Package className="w-3.5 h-3.5 text-cyan-400" /> Orders
                </Link>
              </div>

              <button
                onClick={handleLogoutAction}
                className="w-full py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-red-500/20 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" /> Log Out
              </button>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-white">Gamer Account</p>
                <p className="text-[10px] text-slate-400">Sign in for fast checkout & order tracking</p>
              </div>
              <div className="flex gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-extrabold text-xs shadow-md"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-white font-bold text-xs border border-slate-700"
                >
                  Register
                </Link>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            {navCategories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 hover:text-cyan-400"
              >
                <cat.icon className={`w-4 h-4 ${cat.color}`} />
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
            <Link
              href="/sell-trade"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs"
            >
              <Repeat className="w-4 h-4" /> Sell or Trade Your Gaming Gear
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
