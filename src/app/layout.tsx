import type { Metadata } from 'next';
import { Caveat } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { CartProvider } from '@/lib/cart-context';
import { WishlistProvider } from '@/lib/wishlist-context';
import { AuthProvider } from '@/lib/auth-context';

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-caveat',
});

export const metadata: Metadata = {
  title: 'Malibu2u | Premier Gaming Marketplace - Buy, Sell & Trade Games & Consoles',
  description:
    'Malibu2u is India’s ultimate gaming marketplace to buy, sell, and trade new and pre-owned video games, consoles, controllers, accessories, and PC gaming hardware with 42-point quality checks.',
  keywords: [
    'Malibu2u',
    'Gaming Marketplace',
    'Buy PS5',
    'Pre-owned games',
    'Sell PS4',
    'Trade gaming console',
    'Xbox Series X',
    'Nintendo Switch',
    'PC Hardware',
  ],
  icons: {
    icon: '/WhatsApp_Image_2026-09-20_at_11.09.39_PM-removebg-preview.png',
    shortcut: '/WhatsApp_Image_2026-09-20_at_11.09.39_PM-removebg-preview.png',
    apple: '/WhatsApp_Image_2026-09-20_at_11.09.39_PM-removebg-preview.png',
  },
};

import { AmbientBackground } from '@/components/ui/AmbientBackground';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark scroll-smooth ${caveat.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#090D16] text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-slate-950 relative">
        <AmbientBackground />
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Header />
              <CartDrawer />
              <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:py-8 space-y-12">
                {children}
              </main>
              <Footer />
              <WhatsAppButton />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
