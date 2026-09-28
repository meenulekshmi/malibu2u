'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Repeat, Zap, ChevronLeft, ChevronRight, Sparkles, ShieldCheck, Flame } from 'lucide-react';

const DEFAULT_BANNERS = [
  {
    id: 'default-1',
    title: 'YOUR GAME. YOUR RULES.',
    subtitle: 'Premium games, consoles and gear — new drops and pre-owned legends, 100% verified and ready to ship.',
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=1920&q=85',
    buttonText: 'Shop the Drop',
    buttonUrl: '/shop',
  },
  {
    id: 'default-2',
    title: 'TAKE CONTROL.',
    subtitle: 'Upgrade your setup with official next-gen wireless controllers and precision pro gear built for every playstyle.',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1920&q=85',
    buttonText: 'Explore Accessories',
    buttonUrl: '/accessories',
  },
  {
    id: 'default-3',
    title: 'COMPLETE YOUR RIG.',
    subtitle: 'High-performance graphics cards, ultra-fast SSD storage, mechanical keyboards, and precision gaming monitors.',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=85',
    buttonText: 'Shop PC Hardware',
    buttonUrl: '/pc-hardware',
  },
];

export function HeroBanner() {
  const [banners, setBanners] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    fetch('/api/admin/banners')
      .then(async (res) => {
        if (!res.ok) return null;
        const text = await res.text();
        return text ? JSON.parse(text) : null;
      })
      .then((data) => {
        if (data && Array.isArray(data.banners) && data.banners.length > 0) {
          const active = data.banners.filter((b: any) => b.active);
          if (active.length > 0) setBanners(active);
        }
      })
      .catch((e) => console.error('Error fetching hero banners:', e));
  }, []);

  const slideList = banners.length > 0 ? banners : DEFAULT_BANNERS;

  // Auto-rotation timer (pauses on hover)
  useEffect(() => {
    if (slideList.length <= 1 || isHovered) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideList.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slideList.length, isHovered]);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden rounded-[2.2rem] sm:rounded-[2.75rem] group border border-slate-800/80 shadow-2xl bg-[#090D16] min-h-[460px] sm:min-h-[500px] lg:h-[520px] transition-all duration-700 ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      {/* Dynamic Ambient Background Aura */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/15 rounded-full filter blur-[120px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-purple-600/20 rounded-full filter blur-[120px] pointer-events-none animate-pulse-glow" />

      {/* Slide Stack with Full-Bleed Images & Smooth Fade Transitions */}
      {slideList.map((banner, index) => {
        const isActive = index === currentSlide;
        return (
          <div
            key={banner.id || index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* 1. Full-Bleed Image with Smooth Ken-Burns Zoom Effect */}
            <div className="absolute inset-0 overflow-hidden">
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                priority={index === 0}
                className={`object-cover object-center transition-transform duration-[8000ms] ease-out will-change-transform ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
                unoptimized={banner.image?.startsWith('data:') || banner.image?.includes('google')}
              />
            </div>

            {/* 2. Sleek Multi-Stop Gradient Overlays for High-Contrast Clean Typography */}
            {/* Left-to-right deep dark vignette */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#070913] via-[#070913]/90 md:via-[#070913]/85 lg:via-[#070913]/75 to-transparent w-full md:w-[75%] lg:w-[65%]" />
            {/* Bottom-to-top subtle shadow */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#070913] via-[#070913]/40 to-transparent" />
            {/* Subtle cyber grid overlay */}
            <div className="absolute inset-0 bg-cyber-grid opacity-25 pointer-events-none" />

            {/* 3. Text & Action Container */}
            <div className="relative z-10 h-full max-w-7xl mx-auto px-6 sm:px-12 md:px-16 flex flex-col justify-between py-10 sm:py-12">
              
              {/* Top Tag Pill */}
              <div
                className={`transition-all duration-700 delay-100 ${
                  isActive ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'
                }`}
              >
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 backdrop-blur-md border border-cyan-500/40 text-[11px] font-mono font-extrabold tracking-widest text-cyan-300 uppercase shadow-lg shadow-cyan-950/50">
                  <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> MALIBU2U FEATURED VAULT
                </span>
              </div>

              {/* Center Content: Title, Subtitle, CTA Buttons */}
              <div className="max-w-2xl space-y-5 my-auto">
                {/* Title */}
                <h1
                  className={`text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase leading-[1.08] drop-shadow-md transition-all duration-700 delay-200 ${
                    isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                >
                  {banner.title}
                </h1>

                {/* Subtitle */}
                {banner.subtitle && (
                  <p
                    className={`text-sm sm:text-base text-slate-200 leading-relaxed max-w-xl font-medium drop-shadow transition-all duration-700 delay-300 ${
                      isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}
                  >
                    {banner.subtitle}
                  </p>
                )}

                {/* CTA Action Buttons */}
                <div
                  className={`pt-2 flex flex-wrap items-center gap-3.5 transition-all duration-700 delay-400 ${
                    isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                >
                  <Link
                    href={banner.buttonUrl || '/shop'}
                    className="group/btn inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-black text-xs sm:text-sm tracking-wide uppercase shadow-xl shadow-cyan-500/30 hover:brightness-110 hover:-translate-y-0.5 hover:shadow-cyan-500/50 active:scale-95 transition-all duration-200"
                  >
                    <span>{banner.buttonText || 'Shop Now'}</span>
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1.5 transition-transform duration-300" />
                  </Link>

                  <Link
                    href="/sell-trade"
                    className="group/trade inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700/90 text-slate-200 font-bold text-xs sm:text-sm hover:border-cyan-400 hover:text-cyan-300 hover:bg-slate-900 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 shadow-lg"
                  >
                    <Repeat className="w-4 h-4 text-cyan-400 group-hover/trade:rotate-180 transition-transform duration-500" />
                    <span>Sell / Trade Gear</span>
                  </Link>
                </div>
              </div>

              {/* Bottom Quick Feature Highlights */}
              <div
                className={`pt-4 border-t border-white/10 flex flex-wrap items-center gap-6 sm:gap-10 text-xs font-mono font-bold text-slate-300 transition-all duration-700 delay-500 ${
                  isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span>42-Point Tested Discs & Hardware</span>
                </div>
                <div className="flex items-center gap-2 hidden sm:flex">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>7-Day Replacement Warranty</span>
                </div>
                <div className="flex items-center gap-2 hidden md:flex">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span>Instant Trade Cashout</span>
                </div>
              </div>

            </div>
          </div>
        );
      })}

      {/* Floating Prev Navigation Arrow Button */}
      {slideList.length > 1 && (
        <button
          onClick={() => setCurrentSlide((prev) => (prev === 0 ? slideList.length - 1 : prev - 1))}
          className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/15 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-cyan-500 hover:text-slate-950 hover:border-cyan-400 transition-all duration-200 shadow-2xl active:scale-90"
          aria-label="Previous Banner"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Floating Next Navigation Arrow Button */}
      {slideList.length > 1 && (
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % slideList.length)}
          className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/15 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-cyan-500 hover:text-slate-950 hover:border-cyan-400 transition-all duration-200 shadow-2xl active:scale-90"
          aria-label="Next Banner"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Bottom Cinematic Pill Progress Indicator */}
      {slideList.length > 1 && (
        <div className="absolute bottom-5 sm:bottom-6 right-6 sm:right-12 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/10 shadow-xl">
          {slideList.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-500 ${
                idx === currentSlide
                  ? 'w-8 bg-gradient-to-r from-cyan-400 to-blue-500 shadow-md shadow-cyan-400/50'
                  : 'w-2 bg-slate-600 hover:bg-slate-400'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
