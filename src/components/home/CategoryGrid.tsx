import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Gamepad2, Tv, Headphones, Laptop, ArrowRight } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export async function CategoryGrid() {
  let categories: any[] = [];
  try {
    categories = await prisma.category.findMany({
      where: { parentId: null },
      orderBy: { name: 'asc' },
    });
  } catch (e) {
    console.error('Error fetching homepage categories:', e);
  }

  // Core categories with default high quality imagery if DB category has no custom image
  const defaultCategoryImages: Record<string, string> = {
    games: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    consoles: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80',
    accessories: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
    controllers: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=800&q=80',
    'pc-hardware': 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80',
  };

  const displayCategories = categories.length > 0 ? categories : [
    {
      id: '1',
      name: 'Games',
      slug: 'games',
      image: defaultCategoryImages.games,
      description: 'PS5, PS4, Xbox Series X & Nintendo Switch Blockbusters',
    },
    {
      id: '2',
      name: 'Consoles',
      slug: 'consoles',
      image: defaultCategoryImages.consoles,
      description: 'Next-Gen & Pre-Owned Certified Gaming Consoles',
    },
    {
      id: '3',
      name: 'Accessories',
      slug: 'accessories',
      image: defaultCategoryImages.accessories,
      description: 'Wireless Gamepads, Headsets, Charging Docks & Gear',
    },
    {
      id: '4',
      name: 'PC Components',
      slug: 'pc-hardware',
      image: defaultCategoryImages['pc-hardware'],
      description: 'Graphics Cards, CPUs, High-Freq RAM & Peripherals',
    },
  ];

  return (
    <section className="space-y-6">
      <ScrollReveal className="flex items-end justify-between border-b border-slate-800/80 pb-4">
        <div>
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> SHOP BY CATEGORIES
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1 uppercase">
            Explore Gaming Categories
          </h2>
        </div>
        <Link
          href="/shop"
          className="group text-xs font-bold text-slate-400 hover:text-cyan-400 transition-colors hidden sm:flex items-center gap-1"
        >
          <span>View All Categories</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </ScrollReveal>

      {/* Category Picture Banners Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayCategories.map((cat, idx) => {
          const href = cat.slug.startsWith('shop') || cat.slug === 'games' || cat.slug === 'consoles' || cat.slug === 'accessories' || cat.slug === 'pc-hardware'
            ? `/${cat.slug}`
            : `/shop?category=${cat.slug}`;

          const categoryImage = cat.image || defaultCategoryImages[cat.slug] || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80';

          return (
            <ScrollReveal key={cat.id || cat.slug} delayMs={idx * 100}>
              <Link
                href={href}
                className="group relative h-64 sm:h-72 rounded-3xl overflow-hidden border border-slate-800/90 hover:border-cyan-400/70 shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-500/15 flex flex-col justify-between p-6 block"
              >
                {/* Picture Background */}
                <div className="absolute inset-0 bg-slate-950 z-0">
                  <Image
                    src={categoryImage}
                    alt={cat.name}
                    fill
                    className="object-cover opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all duration-700 filter brightness-90"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                  {/* Dark Gradient Overlay for Contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090D16] via-[#090D16]/65 to-transparent transition-opacity duration-300 group-hover:opacity-90" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#090D16]/85 via-transparent to-transparent opacity-80" />
                </div>

                {/* Top Icon Badge */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-white/10 text-cyan-400 flex items-center justify-center group-hover:border-cyan-400 group-hover:bg-cyan-500/20 group-hover:scale-110 transition-all duration-300 shadow-md">
                    {cat.slug.includes('game') ? (
                      <Gamepad2 className="w-6 h-6" />
                    ) : cat.slug.includes('console') ? (
                      <Tv className="w-6 h-6" />
                    ) : cat.slug.includes('pc') ? (
                      <Laptop className="w-6 h-6" />
                    ) : (
                      <Headphones className="w-6 h-6" />
                    )}
                  </div>

                  <span className="px-3 py-1 rounded-full text-[10px] font-mono font-extrabold bg-slate-950/80 backdrop-blur-md text-cyan-300 border border-cyan-500/30 group-hover:border-cyan-400/60 transition-colors">
                    {cat.name.toUpperCase()}
                  </span>
                </div>

                {/* Bottom Content */}
                <div className="relative z-10 space-y-2 pt-4">
                  <h3 className="text-xl font-extrabold text-white group-hover:text-cyan-300 transition-colors duration-300 group-hover:translate-x-0.5">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {cat.description || 'Explore gaming products and pre-owned deals.'}
                  </p>

                  <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-cyan-400 group-hover:text-cyan-300">
                    <span>Explore Vault</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform duration-300" />
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}
