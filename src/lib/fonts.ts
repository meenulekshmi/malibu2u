import localFont from 'next/font/local';

export const pricedownFont = localFont({
  src: '../../public/fonts/pricedown.otf',
  variable: '--font-pricedown',
  display: 'swap',
  weight: '400 900',
  preload: true,
});
