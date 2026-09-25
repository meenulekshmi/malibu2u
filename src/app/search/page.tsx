import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/product/ProductCard';
import { Search, PackageSearch } from 'lucide-react';

export const revalidate = 0;

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export default async function SearchResultsPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q || '';

  let products: any[] = [];
  if (query.trim()) {
    try {
      products = await prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { description: { contains: query } },
            { brand: { contains: query } },
            { platform: { contains: query } },
          ],
        },
        include: { images: true },
        orderBy: { createdAt: 'desc' },
      });
    } catch (e) {
      console.error('Search query error:', e);
    }
  }

  return (
    <div className="space-y-8">
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
        <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5" /> SEARCH RESULTS
        </span>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          {query ? `Results for "${query}"` : 'Search Products'}
        </h1>
        <p className="text-xs text-slate-400">Found {products.length} matching items in Malibu2u Vault.</p>
      </div>

      {products.length === 0 ? (
        <div className="p-12 text-center bg-[#111726] rounded-3xl border border-slate-800 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
            <PackageSearch className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-white">
            {query ? `No products found for '${query}'.` : 'No products found.'}
          </h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try checking spelling or search for games, consoles, controllers, or PC components.
          </p>
          <Link href="/shop" className="inline-block px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs">
            Browse Store Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
