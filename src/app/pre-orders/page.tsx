import React from 'react';
import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/product/ProductCard';
import { Sparkles, Calendar } from 'lucide-react';

export const revalidate = 0;

export default async function PreOrdersPage() {
  const preOrderProducts = await prisma.product.findMany({
    where: { isPreOrder: true },
    include: { images: true },
  });

  return (
    <div className="space-y-8">
      <div className="p-8 rounded-3xl bg-gradient-to-r from-violet-950 via-slate-900 to-cyan-950 border border-violet-500/30">
        <span className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" /> DAY-ONE LAUNCH RESERVATIONS
        </span>
        <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
          Exclusive Pre-Order Vault
        </h1>
        <p className="text-xs text-slate-300 mt-1">
          Reserve upcoming blockbuster game titles and limited edition hardware with launch day delivery guarantee.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {preOrderProducts.map((product) => {
          const primaryImage =
            product.images.find((img) => img.isPrimary)?.url ||
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
              isPreOrder={true}
            />
          );
        })}
      </div>
    </div>
  );
}
