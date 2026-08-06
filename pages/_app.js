import { Poppins, Manrope, JetBrains_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { useEffect } from 'react';
import { CartProvider } from '../lib/cart';
import { LanguageProvider } from '../lib/LanguageContext';
import { ThemeProvider } from '../lib/ThemeContext';
import '../styles/globals.css';

// Loaded into the same --font-rajdhani CSS variable the whole site already
// uses for headings/buttons/prices — swapping the font here (instead of
// renaming the variable everywhere) is a lower-risk way to change the
// display typeface site-wide for the new playful look.
const displayFont = Poppins({
  subsets: ['latin'],
  weight: ['600', '700', '800', '900'],
  variable: '--font-rajdhani',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export default function App({ Component, pageProps }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  return (
    <div className={`${displayFont.variable} ${manrope.variable} ${jetbrainsMono.variable}`}>
      <LanguageProvider>
        <ThemeProvider>
          <CartProvider>
            <Component {...pageProps} />
          </CartProvider>
        </ThemeProvider>
      </LanguageProvider>
      <Analytics />
    </div>
  );
}
