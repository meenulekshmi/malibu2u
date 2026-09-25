import React from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/product/ProductCard';
import { prisma } from '@/lib/prisma';
import { Cpu, HardDrive, Monitor, Keyboard, Laptop, PackageSearch } from 'lucide-react';

export const revalidate = 0;

interface PCHardwarePageProps {
  searchParams: Promise<{
    sub?: string;
    sort?: string;
  }>;
}

export default async function PCHardwarePage({ searchParams }: PCHardwarePageProps) {
  const params = await searchParams;
  const { sub, sort = 'newest' } = params;

  const where: any = {
    OR: [
      { platform: 'PC' },
      { category: { slug: 'pc-hardware' } },
    ],
  };

  if (sub) {
    where.AND = [
      {
        OR: [
          { name: { contains: sub } },
          { brand: { contains: sub } },
          { description: { contains: sub } },
        ],
      },
    ];
  }

  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'price_asc') orderBy = { price: 'asc' };
  if (sort === 'price_desc') orderBy = { price: 'desc' };

  let pcProducts: any[] = [];
  try {
    pcProducts = await prisma.product.findMany({
      where,
      include: { images: true, category: true },
      orderBy,
    });
  } catch (e) {
    console.error('Error fetching PC hardware products:', e);
  }

  const subcategories = [
    { name: 'All PC Hardware', href: '/pc-hardware' },
    { name: 'Graphics Cards (GPUs)', href: '/pc-hardware?sub=GPU' },
    { name: 'Processors (CPUs)', href: '/pc-hardware?sub=CPU' },
    { name: 'RAM Memory', href: '/pc-hardware?sub=RAM' },
    { name: 'SSD & Storage', href: '/pc-hardware?sub=SSD' },
    { name: 'Gaming Monitors', href: '/pc-hardware?sub=Monitor' },
    { name: 'Keyboards & Mice', href: '/pc-hardware?sub=Keyboard' },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-cyan-950 border border-purple-500/30 space-y-4">
        <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest flex items-center gap-2">
          <Cpu className="w-4 h-4 text-purple-400" /> HIGH-PERFORMANCE PC GAMING VAULT
        </span>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          PC Hardware, Components & Peripherals
        </h1>
        <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
          Upgrade your rig with graphics cards, high-frequency RAM, ultra-fast SSD storage, mechanical keyboards, and precision gaming monitors.
        </p>

        {/* Subcategory Pills */}
        <div className="pt-2 flex flex-wrap gap-2">
          {subcategories.map((sc) => (
            <Link
              key={sc.name}
              href={sc.href}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 hover:border-purple-400 text-xs font-bold text-slate-200 transition-colors"
            >
              {sc.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="space-y-6">
        {pcProducts.length === 0 ? (
          <div className="p-12 text-center bg-[#111726] rounded-3xl border border-slate-800 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
              <PackageSearch className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-extrabold text-white">No PC components available yet.</h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              PC hardware inventory is being added by the Malibu2u admin team. Please check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {pcProducts.map((product) => {
              const primaryImage =
                product.images.find((img: any) => img.isPrimary)?.url ||
                product.images[0]?.url ||
                'https://images.unsplash.com/photo-1587202372775-e229f172b9d7';
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
  );
}
