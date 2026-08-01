import { Rajdhani, Manrope, JetBrains_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import '../styles/globals.css';

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
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
  return (
    <div className={`${rajdhani.variable} ${manrope.variable} ${jetbrainsMono.variable}`}>
      <Component {...pageProps} />
      <Analytics />
    </div>
  );
}
