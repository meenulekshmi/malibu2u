import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatPrice, calculateDiscount, getConditionBadge, getPlatformBadge } from '@/lib/utils';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductDetailClient } from './ProductDetailClient';
import { ShieldCheck, Truck, RotateCcw, Star, CheckCircle2, ChevronRight, Gamepad2, Award } from 'lucide-react';

export const revalidate = 0;

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: true,
      category: true,
      reviews: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!product) {
    notFound();
  }

  // Fetch related products in same category
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    take: 4,
    include: { images: true },
  });

  const conditionBadge = getConditionBadge(product.condition);
  const platformBadge = getPlatformBadge(product.platform);
  const discountPercent = calculateDiscount(product.price, product.discountPrice);
  const activePrice = product.discountPrice ?? product.price;

  let specsObj: Record<string, string> = {};
  if (product.specsJson) {
    try {
      specsObj = JSON.parse(product.specsJson);
    } catch (e) {
      console.error('Failed to parse specsJson:', e);
    }
  }

  return (
    <div className="space-y-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 font-medium overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-white transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <Link href={`/shop?category=${product.category.slug}`} className="hover:text-white transition-colors">
          {product.category.name}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-cyan-400 truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Gallery & Spec Client Component */}
        <ProductDetailClient
          product={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            discountPrice: product.discountPrice,
            condition: product.condition,
            platform: product.platform,
            brand: product.brand,
            stock: product.stock,
            rating: product.rating,
            reviewCount: product.reviewCount,
            sku: product.sku,
            images: product.images.map((img) => img.url),
          }}
          conditionBadge={conditionBadge}
          platformBadge={platformBadge}
          discountPercent={discountPercent}
          specsObj={specsObj}
        />
      </div>

      {/* Product Specifications & Details Table */}
      <div className="p-8 rounded-3xl bg-[#111726] border border-slate-800 space-y-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-cyan-400" /> Product Specifications & Overview
        </h3>

        <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
          {product.description}
        </p>

        {Object.keys(specsObj).length > 0 && (
          <div className="pt-4 border-t border-slate-800">
            <h4 className="text-sm font-bold text-slate-300 mb-3 uppercase tracking-wider text-[11px] font-mono">
              Technical Specifications
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(specsObj).map(([key, val]) => (
                <div key={key} className="p-3 rounded-xl bg-slate-900 border border-slate-800/80">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">{key}</span>
                  <span className="text-xs font-bold text-white mt-0.5 block">{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Customer Reviews Section */}
      <div className="p-8 rounded-3xl bg-[#111726] border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" /> Customer Ratings & Reviews
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Based on {product.reviews.length || product.reviewCount} verified purchases
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-white font-mono">{product.rating.toFixed(1)}</span>
            <span className="text-xs text-slate-400 font-medium">/ 5.0</span>
          </div>
        </div>

        {product.reviews.length === 0 ? (
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
            No customer reviews yet for this product. Be the first to share your experience!
          </div>
        ) : (
          <div className="space-y-4">
            {product.reviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{rev.userName}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      Verified Buyer
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <h5 className="text-xs font-bold text-white">{rev.title}</h5>
                <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related Products Carousel */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-xl font-bold text-white">Related Products You Might Like</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => {
              const primaryImg =
                rel.images.find((img) => img.isPrimary)?.url ||
                rel.images[0]?.url ||
                'https://images.unsplash.com/photo-1606813907291-d86efa9b94db';
              return (
                <ProductCard
                  key={rel.id}
                  id={rel.id}
                  name={rel.name}
                  slug={rel.slug}
                  price={rel.price}
                  discountPrice={rel.discountPrice}
                  condition={rel.condition}
                  platform={rel.platform}
                  brand={rel.brand}
                  rating={rel.rating}
                  reviewCount={rel.reviewCount}
                  image={primaryImg}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
