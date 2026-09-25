import React from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/product/ProductCard';
import { prisma } from '@/lib/prisma';
import { SlidersHorizontal, PackageSearch } from 'lucide-react';

export const revalidate = 0;

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    platform?: string;
    condition?: string;
    sort?: string;
    search?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const { category, platform, condition, sort = 'newest', search } = params;

  const where: any = {};
  if (category) where.category = { slug: category };
  if (platform) where.platform = platform;
  if (condition) where.condition = condition;
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
      { brand: { contains: search } },
    ];
  }

  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'price_asc') orderBy = { price: 'asc' };
  if (sort === 'price_desc') orderBy = { price: 'desc' };
  if (sort === 'rating') orderBy = { rating: 'desc' };

  let products: any[] = [];
  try {
    products = await prisma.product.findMany({
      where,
      include: { images: true, category: true },
      orderBy,
    });
  } catch (e) {
    console.error('Error fetching shop products:', e);
  }

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-[#111827] to-cyan-950/60 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
            MALIBU2U CATALOG
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
            {platform
              ? `${platform} Gaming Store`
              : category
              ? `${category.toUpperCase()} Collection`
              : condition === 'MINT_PREOWNED'
              ? 'Pre-Owned Certified Vault'
              : 'All Gaming Products'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Showing {products.length} products with 100% genuine guarantee & express shipping.
          </p>
        </div>

        {/* Quick Filters Pill Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/shop"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
              !platform && !condition
                ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            All Items
          </Link>
          <Link
            href="/shop?platform=PS5"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
              platform === 'PS5'
                ? 'bg-blue-600 text-white border-blue-400'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            PS5
          </Link>
          <Link
            href="/shop?platform=XBOX_SERIES"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
              platform === 'XBOX_SERIES'
                ? 'bg-emerald-600 text-white border-emerald-400'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            Xbox
          </Link>
          <Link
            href="/shop?platform=NINTENDO_SWITCH"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
              platform === 'NINTENDO_SWITCH'
                ? 'bg-red-600 text-white border-red-400'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            Switch
          </Link>
          <Link
            href="/shop?condition=MINT_PREOWNED"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
              condition === 'MINT_PREOWNED'
                ? 'bg-cyan-400 text-slate-950 border-cyan-300'
                : 'bg-slate-900 text-emerald-400 border-emerald-500/30 hover:border-emerald-400'
            }`}
          >
            Pre-Owned
          </Link>
        </div>
      </div>

      {/* Main Grid Layout with Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters */}
        <div className="space-y-6 lg:col-span-1 bg-[#111726] p-6 rounded-2xl border border-slate-800 h-fit">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-cyan-400" /> Filter Store
            </h3>
            <Link href="/shop" className="text-[11px] text-cyan-400 hover:underline">
              Reset Filters
            </Link>
          </div>

          {/* Condition Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Condition</label>
            <div className="space-y-1.5 text-xs text-slate-400">
              <Link
                href="/shop"
                className={`block px-3 py-2 rounded-lg ${
                  !condition ? 'bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/30' : 'hover:bg-slate-900'
                }`}
              >
                All Conditions
              </Link>
              <Link
                href="/shop?condition=NEW"
                className={`block px-3 py-2 rounded-lg ${
                  condition === 'NEW' ? 'bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/30' : 'hover:bg-slate-900'
                }`}
              >
                Brand New
              </Link>
              <Link
                href="/shop?condition=MINT_PREOWNED"
                className={`block px-3 py-2 rounded-lg ${
                  condition === 'MINT_PREOWNED' ? 'bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/30' : 'hover:bg-slate-900'
                }`}
              >
                Mint Pre-Owned
              </Link>
            </div>
          </div>

          {/* Platform Filter */}
          <div className="space-y-2 pt-4 border-t border-slate-800">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Platform</label>
            <div className="space-y-1.5 text-xs text-slate-400">
              <Link
                href="/shop?platform=PS5"
                className={`block px-3 py-2 rounded-lg ${
                  platform === 'PS5' ? 'bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/30' : 'hover:bg-slate-900'
                }`}
              >
                PlayStation 5
              </Link>
              <Link
                href="/shop?platform=XBOX_SERIES"
                className={`block px-3 py-2 rounded-lg ${
                  platform === 'XBOX_SERIES' ? 'bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/30' : 'hover:bg-slate-900'
                }`}
              >
                Xbox Series X|S
              </Link>
              <Link
                href="/shop?platform=NINTENDO_SWITCH"
                className={`block px-3 py-2 rounded-lg ${
                  platform === 'NINTENDO_SWITCH' ? 'bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/30' : 'hover:bg-slate-900'
                }`}
              >
                Nintendo Switch
              </Link>
              <Link
                href="/shop?platform=PC"
                className={`block px-3 py-2 rounded-lg ${
                  platform === 'PC' ? 'bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/30' : 'hover:bg-slate-900'
                }`}
              >
                PC Gaming
              </Link>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="lg:col-span-3 space-y-6">
          {products.length === 0 ? (
            <div className="p-12 text-center bg-[#111726] rounded-3xl border border-slate-800 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
                <PackageSearch className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-extrabold text-white">No products available yet.</h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Malibu2u&apos;s catalog is being updated. Please check back soon.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((product) => {
                const primaryImage =
                  product.images.find((img: any) => img.isPrimary)?.url ||
                  product.images[0]?.url ||
                  'https://images.unsplash.com/photo-1606813907291-d86efa9b94db';
                return (
                  <ProductCard
                    key={product.id}
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
                  />
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
