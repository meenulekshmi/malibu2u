import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export function Malibu2uLogo({ className = '', size = 'md' }: LogoProps) {
  const containerClasses = {
    sm: 'h-12 sm:h-14',
    md: 'h-14 sm:h-16',
    lg: 'h-16 sm:h-20',
  };

  const scaleClasses = {
    sm: 'scale-130 -translate-x-2',
    md: 'scale-[1.45] sm:scale-[1.65] md:scale-[1.75] -translate-x-4 sm:-translate-x-7 md:-translate-x-10',
    lg: 'scale-[1.6] sm:scale-[1.85] -translate-x-8',
  };

  return (
    <Link
      href="/"
      className={`inline-flex items-center group select-none shrink-0 ${className}`}
      aria-label="Malibu2u Gaming Marketplace Home"
    >
      <div className={`relative ${containerClasses[size]} w-auto flex items-center justify-start overflow-visible`}>
        <Image
          src="/WhatsApp_Image_2026-09-20_at_11.09.39_PM-removebg-preview.png"
          alt="Malibu2u Gaming Marketplace"
          width={800}
          height={600}
          className={`h-full w-auto object-contain origin-left ${scaleClasses[size]} filter drop-shadow-[0_0_14px_rgba(0,242,254,0.65)] drop-shadow-[0_0_28px_rgba(255,59,154,0.45)] group-hover:scale-[1.72] group-hover:drop-shadow-[0_0_20px_rgba(0,242,254,0.95)] group-hover:drop-shadow-[0_0_32px_rgba(255,59,154,0.65)] transition-all duration-300`}
          priority
        />
      </div>
    </Link>
  );
}


