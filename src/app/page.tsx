import React from 'react';
import Link from 'next/link';
import { HeroBanner } from '@/components/home/HeroBanner';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { TradeInBanner } from '@/components/home/TradeInBanner';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';
import { FAQSection } from '@/components/home/FAQSection';
import { ReviewsCarousel } from '@/components/home/ReviewsCarousel';
import { ProductCard } from '@/components/product/ProductCard';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { prisma } from '@/lib/prisma';
import { ShieldCheck, Sparkles, Trophy, ArrowRight, PackageCheck, Heart, Zap } from 'lucide-react';

export const revalidate = 0; // Fresh dynamic data

export default async function HomePage() {
  // Fetch real database products
  let featuredProducts: any[] = [];
  let preOwnedProducts: any[] = [];
  let bestSellers: any[] = [];

  try {
    const allProducts = await prisma.product.findMany({
      include: {
        images: true,
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    featuredProducts = allProducts.filter((p) => p.isFeatured || p.isNewArrival);
    preOwnedProducts = allProducts.filter(
      (p) => p.condition === 'MINT_PREOWNED' || p.condition === 'GOOD_PREOWNED' || p.isPreOwned
    );
    bestSellers = allProducts.filter((p) => p.isBestSeller);
    
    // If no featured products filtered specifically, use all products for featured
    if (featuredProducts.length === 0 && allProducts.length > 0) {
      featuredProducts = allProducts;
    }
  } catch (e) {
    console.error('Database connection error in homepage:', e);
  }

  return (
    <div className="space-y-16 sm:space-y-20">
      {/* Hero Banner */}
      <HeroBanner />

      {/* Product Categories Grid */}
      <CategoryGrid />

      {/* Main Showcase Section: NEW IN THE ARENA */}
      <section className="space-y-6">
        <ScrollReveal className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-800/80 pb-4 gap-4">
          <div>
            <span className="text-xs font-mono font-extrabold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> FRESH FROM THE VAULT
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase mt-1">
              NEW IN THE ARENA
            </h2>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="text-slate-400 font-mono font-medium hidden sm:inline">
              {featuredProducts.length} items ready to ship
            </span>
            <Link
              href="/wishlist"
              className="px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 hover:border-pink-500/40 hover:text-pink-400 text-slate-300 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-md active:scale-95"
            >
              <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500/20" />
              <span>Wishlist</span>
            </Link>
          </div>
        </ScrollReveal>

        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 8).map((product, idx) => {
              const primaryImage =
                product.images.find((img: any) => img.isPrimary)?.url ||
                product.images[0]?.url ||
                'https://images.unsplash.com/photo-1606813907291-d86efa9b94db';
              const tagBadge = idx === 0 ? 'TOP PICK' : idx === 1 ? 'READY TO PLAY' : idx === 2 ? 'HOT DROP' : undefined;
              return (
                <ScrollReveal key={product.id} delayMs={idx * 75}>
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    slug={product.slug}
                    price={product.price}
                    discountPrice={product.discountPrice}
                    condition={product.condition}
                    platform={product.platform}
                    brand={product.brand}
                    rating={product.rating}
                    reviewCount={product.reviewCount}
                    image={primaryImage}
                    isPreOrder={product.isPreOrder}
                    stock={product.stock}
                    categoryName={product.category?.name || 'GAMES'}
                    tagBadge={tagBadge}
                  />
                </ScrollReveal>
              );
            })}
          </div>
        ) : (
          <ScrollReveal>
            <div className="p-12 text-center bg-[#0C0E1A] rounded-3xl border border-slate-800/80 space-y-3 shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
                <PackageCheck className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-extrabold text-white">No products available yet.</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Products added through the Admin Dashboard will automatically appear here in the storefront.
              </p>
            </div>
          </ScrollReveal>
        )}
      </section>

      {/* Pre-Owned Bargains Showcase */}
      <ScrollReveal>
        <section className="p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-950 via-[#0B0F1C] to-purple-950/40 border border-purple-500/30 space-y-6 shadow-2xl shadow-purple-950/20 relative overflow-hidden">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-800/80 pb-4 gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> 42-POINT CERTIFIED PRE-OWNED
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase mt-1">
                PRE-OWNED LEGENDS
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                100% genuine tested discs and hardware with Malibu2u replacement warranty.
              </p>
            </div>
            <Link
              href="/pre-owned"
              className="group px-4.5 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs hover:bg-emerald-500/30 transition-all whitespace-nowrap self-start sm:self-auto flex items-center gap-1 shadow-md active:scale-95"
            >
              <span>Browse All Pre-Owned</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {preOwnedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {preOwnedProducts.slice(0, 4).map((product, idx) => {
                const primaryImage =
                  product.images.find((img: any) => img.isPrimary)?.url ||
                  product.images[0]?.url ||
                  'https://images.unsplash.com/photo-1606813907291-d86efa9b94db';
                return (
                  <ScrollReveal key={product.id} delayMs={idx * 100}>
                    <ProductCard
                      id={product.id}
                      name={product.name}
                      slug={product.slug}
                      price={product.price}
                      discountPrice={product.discountPrice}
                      condition={product.condition}
                      platform={product.platform}
                      brand={product.brand}
                      rating={product.rating}
                      reviewCount={product.reviewCount}
                      image={primaryImage}
                      stock={product.stock}
                      categoryName={product.category?.name || 'GAMES'}
                      tagBadge="BEST VALUE"
                    />
                  </ScrollReveal>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
              <h4 className="text-sm font-bold text-white">No pre-owned items yet.</h4>
              <p className="text-xs text-slate-400">
                Pre-owned games and consoles added in the Admin Dashboard will appear here.
              </p>
            </div>
          )}
        </section>
      </ScrollReveal>

      {/* Trade-In / Sell Your Console Banner */}
      <TradeInBanner />

      {/* Gamer Favorites / Best Sellers */}
      <section className="space-y-6">
        <ScrollReveal className="flex items-end justify-between border-b border-slate-800/80 pb-4">
          <div>
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> GAMER FAVORITES
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase mt-1">
              TOP BEST SELLERS
            </h2>
          </div>
          <Link
            href="/shop"
            className="group text-xs font-bold text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1"
          >
            <span>View All Best Sellers</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </ScrollReveal>

        {bestSellers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {bestSellers.slice(0, 4).map((product, idx) => {
              const primaryImage =
                product.images.find((img: any) => img.isPrimary)?.url ||
                product.images[0]?.url ||
                'https://images.unsplash.com/photo-1606813907291-d86efa9b94db';
              return (
                <ScrollReveal key={product.id} delayMs={idx * 100}>
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    slug={product.slug}
                    price={product.price}
                    discountPrice={product.discountPrice}
                    condition={product.condition}
                    platform={product.platform}
                    brand={product.brand}
                    rating={product.rating}
                    reviewCount={product.reviewCount}
                    image={primaryImage}
                    stock={product.stock}
                    categoryName={product.category?.name || 'GAMES'}
                    tagBadge="FAN FAVOURITE"
                  />
                </ScrollReveal>
              );
            })}
          </div>
        ) : (
          <ScrollReveal>
            <div className="p-8 text-center bg-[#0C0E1A] rounded-2xl border border-slate-800/80 space-y-2">
              <h4 className="text-sm font-bold text-white">No best sellers yet.</h4>
              <p className="text-xs text-slate-400">
                Products flagged as Best Seller in Admin will populate this section.
              </p>
            </div>
          </ScrollReveal>
        )}
      </section>

      {/* Why Choose Malibu2u */}
      <WhyChooseUs />

      {/* Community Reviews */}
      <ReviewsCarousel />

      {/* Frequently Asked Questions */}
      <FAQSection />
    </div>
  );
}
