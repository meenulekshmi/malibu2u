'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Repeat, Zap, Gamepad2, ChevronLeft, ChevronRight, ShieldCheck, Sparkles } from 'lucide-react';

const DEFAULT_BANNERS = [
  {
    id: 'default-1',
    title: 'YOUR GAME. YOUR RULES.',
    subtitle: 'Premium games, consoles and gear — new drops and pre-owned legends, tested and ready for your next session.',
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=1200&q=80',
    buttonText: 'Shop the drop',
    buttonUrl: '/shop',
  },
  {
    id: 'default-2',
    title: 'TAKE CONTROL.',
    subtitle: 'Upgrade your setup with official next-gen gaming controllers and custom gear built for every playstyle.',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80',
    buttonText: 'Explore Accessories',
    buttonUrl: '/accessories',
  },
  {
    id: 'default-3',
    title: 'COMPLETE YOUR SETUP.',
    subtitle: 'High-performance headsets, mechanical keyboards, RTX GPUs, and gaming essentials all in one place.',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    buttonText: 'Shop Hardware',
    buttonUrl: '/pc-hardware',
  },
];

export function HeroBanner() {
  const [banners, setBanners] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

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

  useEffect(() => {
    if (slideList.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideList.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [slideList.length]);

  return (
    <div className={`relative overflow-hidden rounded-[2.5rem] group border border-purple-500/30 shadow-2xl bg-[#090D16]/95 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      
      {/* Subtle Background Glow Ambient Effects */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/15 rounded-full filter blur-[100px] pointer-events-none animate-pulse-glow" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/20 rounded-full filter blur-[110px] pointer-events-none animate-pulse-glow" />
      
      {/* Cyber Mesh Background Pattern */}
      <div className="absolute inset-0 bg-cyber-grid opacity-60 pointer-events-none" />

      {/* Horizontal Sliding Carousel Track */}
      <div
        className="flex transition-transform duration-700 ease-in-out w-full relative z-10"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slideList.map((banner, index) => {
          const isActive = index === currentSlide;
          return (
            <div key={banner.id || index} className="w-full shrink-0 min-w-full">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-[440px] lg:h-[460px] p-2 sm:p-3">
                
                {/* Left Main Hero Card */}
                <div className="lg:col-span-7 xl:col-span-7 relative overflow-hidden rounded-[2rem] bg-[#0B0C16]/85 backdrop-blur-2xl p-8 sm:p-10 flex flex-col justify-between min-h-[420px] lg:h-[440px] border border-white/5">
                  
                  {/* Subtle Card Internal Glow */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full filter blur-3xl pointer-events-none" />

                  {/* Top Section with Staggered Entrance */}
                  <div className="relative z-10 space-y-4 my-auto">
                    
                    {/* Top Pill Tag */}
                    <div className={`transition-all duration-500 delay-100 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
                      <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[11px] font-mono font-extrabold tracking-widest text-cyan-400 uppercase shadow-md shadow-cyan-500/10">
                        <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> THE NEXT LEVEL IS HERE
                      </span>
                    </div>

                    {/* Main Headline */}
                    <div className={`min-h-[5.5rem] flex items-center transition-all duration-600 delay-200 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                      <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight uppercase line-clamp-2">
                        {banner.title}
                      </h1>
                    </div>

                    {/* Subtitle Description */}
                    <p className={`text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed font-sans line-clamp-2 min-h-[2.5rem] transition-all duration-600 delay-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                      {banner.subtitle}
                    </p>

                    {/* Action Buttons */}
                    <div className={`pt-1 flex flex-wrap items-center gap-3 transition-all duration-700 delay-400 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                      <Link
                        href={banner.buttonUrl || '/shop'}
                        className="group/btn inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/30 hover:brightness-110 hover:-translate-y-0.5 hover:shadow-cyan-500/40 active:scale-95 transition-all"
                      >
                        <span>{banner.buttonText || 'Shop Now'}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1.5 transition-transform duration-300" />
                      </Link>

                      <Link
                        href="/sell-trade"
                        className="group/trade inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-slate-900/90 border border-slate-700/90 text-white font-bold text-xs hover:border-cyan-400 hover:text-cyan-300 hover:-translate-y-0.5 active:scale-95 transition-all shadow-md"
                      >
                        <Repeat className="w-3.5 h-3.5 text-slate-400 group-hover/trade:rotate-180 transition-transform duration-500" />
                        <span>Trade your gear</span>
                      </Link>
                    </div>
                  </div>

                  {/* Bottom Metrics Bar */}
                  <div className="relative z-10 pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-4 mt-auto shrink-0">
                    <div className="group/metric">
                      <p className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight group-hover/metric:text-cyan-400 transition-colors">4K+</p>
                      <p className="text-[9px] sm:text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        GAMES IN ORBIT
                      </p>
                    </div>

                    <div className="group/metric">
                      <p className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight group-hover/metric:text-emerald-400 transition-colors">100%</p>
                      <p className="text-[9px] sm:text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        TESTED GEAR
                      </p>
                    </div>

                    <div className="group/metric">
                      <p className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight group-hover/metric:text-purple-400 transition-colors">24h</p>
                      <p className="text-[9px] sm:text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        FAST DISPATCH
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Featured Setup Banner Card */}
                <div className="lg:col-span-5 xl:col-span-5 relative overflow-hidden rounded-[2rem] bg-gradient-to-tr from-[#160B28] via-[#1D1236] to-[#251648] border border-purple-500/30 shadow-2xl p-6 sm:p-8 flex flex-col justify-between min-h-[420px] lg:h-[440px]">
                  
                  {/* Background Artwork Reveal */}
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={banner.image}
                      alt={banner.title}
                      fill
                      className={`object-cover opacity-90 transition-transform duration-1000 filter brightness-95 ${isActive ? 'scale-100' : 'scale-105'}`}
                      priority={index === 0}
                      unoptimized={banner.image?.startsWith('data:') || banner.image?.includes('google')}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F0A1E] via-transparent to-[#0F0A1E]/40 opacity-85" />
                  </div>

                  {/* Top Circle Badge */}
                  <div className="relative z-10 flex justify-end">
                    <div className="w-10 h-10 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/10 text-cyan-400 flex items-center justify-center shadow-lg hover:scale-110 hover:border-cyan-400 transition-all">
                      <Gamepad2 className="w-5 h-5 animate-pulse" />
                    </div>
                  </div>

                  {/* Bottom Headline Overlay */}
                  <div className={`relative z-10 space-y-1 mt-auto transition-all duration-700 delay-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <span className="text-[10px] font-mono font-extrabold tracking-widest text-cyan-400 uppercase block">
                      FEATURED SETUP
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none uppercase">
                      LEVEL UP
                    </h2>
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none uppercase">
                      YOUR STATION<span className="text-cyan-400">.</span>
                    </h2>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Prev Arrow Button */}
      {slideList.length > 1 && (
        <button
          onClick={() => setCurrentSlide((prev) => (prev === 0 ? slideList.length - 1 : prev - 1))}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-slate-950/80 border border-slate-700/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-cyan-500 hover:text-slate-950 hover:border-cyan-400 transition-all shadow-xl active:scale-90"
          aria-label="Previous Banner"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Floating Next Arrow Button */}
      {slideList.length > 1 && (
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % slideList.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-slate-950/80 border border-slate-700/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-cyan-500 hover:text-slate-950 hover:border-cyan-400 transition-all shadow-xl active:scale-90"
          aria-label="Next Banner"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Bottom Indicator Pill Bar */}
      {slideList.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-800 shadow-lg">
          {slideList.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentSlide ? 'w-7 bg-cyan-400 shadow-md shadow-cyan-400/50' : 'w-2 bg-slate-700 hover:bg-slate-500'
              }`}
              aria-label={`Go to banner slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

    </div>
  );
}
