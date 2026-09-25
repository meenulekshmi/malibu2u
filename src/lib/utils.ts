import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateDiscount(price: number, discountPrice?: number | null): number {
  if (!discountPrice || discountPrice >= price) return 0;
  return Math.round(((price - discountPrice) / price) * 100);
}

export function getConditionBadge(condition: string) {
  switch (condition) {
    case 'NEW':
      return { label: 'Brand New', className: 'badge-condition-new' };
    case 'MINT_PREOWNED':
      return { label: 'Mint Pre-Owned', className: 'badge-condition-mint' };
    case 'GOOD_PREOWNED':
      return { label: 'Good Pre-Owned', className: 'badge-condition-good' };
    default:
      return { label: condition, className: 'badge-condition-new' };
  }
}

export function getPlatformBadge(platform: string) {
  switch (platform) {
    case 'PS5':
      return { label: 'PlayStation 5', color: 'bg-blue-600/20 text-blue-400 border-blue-500/30' };
    case 'PS4':
      return { label: 'PlayStation 4', color: 'bg-sky-600/20 text-sky-400 border-sky-500/30' };
    case 'XBOX_SERIES':
      return { label: 'Xbox Series X|S', color: 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30' };
    case 'NINTENDO_SWITCH':
      return { label: 'Nintendo Switch', color: 'bg-red-600/20 text-red-400 border-red-500/30' };
    case 'PC':
      return { label: 'PC Gaming', color: 'bg-purple-600/20 text-purple-400 border-purple-500/30' };
    case 'ACCESSORIES':
      return { label: 'Gaming Accessory', color: 'bg-cyan-600/20 text-cyan-400 border-cyan-500/30' };
    default:
      return { label: platform, color: 'bg-gray-600/20 text-gray-400 border-gray-500/30' };
  }
}
