import Head from 'next/head';
import content from '../content/site-content.json';
import { FAVICON_HREF } from '../lib/favicon';
import BackgroundFX from '../components/BackgroundFX';
import ScrollProgress from '../components/ScrollProgress';
import AnnouncementBar from '../components/AnnouncementBar';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Marquee from '../components/Marquee';
import FlashSale from '../components/FlashSale';
import Services from '../components/Services';
import Products from '../components/Products';
import EMIInfo from '../components/EMIInfo';
import FinderQuiz from '../components/FinderQuiz';
import Repair from '../components/Repair';
import Gallery from '../components/Gallery';
import Testimonials from '../components/Testimonials';
import Trust from '../components/Trust';
import FAQ from '../components/FAQ';
import CallbackForm from '../components/CallbackForm';
import Footer from '../components/Footer';
import FloatingWhatsapp from '../components/FloatingWhatsapp';
import ChatAssistant from '../components/ChatAssistant';
import CartDrawer, { FloatingCartButton } from '../components/CartDrawer';
import BackToTop from '../components/BackToTop';

function buildLocalBusinessSchema(c) {
  const reviewCountDigits = (c.contact.googleReviewCount || '').replace(/\D/g, '');
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ElectronicsStore',
    name: c.brand,
    image: c.hero.heroImage || undefined,
    telephone: `+91${c.contact.phone1}`,
    priceRange: '₹₹',
    address: {
      '@type': 'PostalAddress',
      streetAddress: c.contact.address,
      addressLocality: 'Varanasi',
      addressRegion: 'Uttar Pradesh',
      addressCountry: 'IN',
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: c.contact.openTime || '09:00',
      closes: c.contact.closeTime || '21:30',
    },
    aggregateRating: c.contact.googleRating
      ? {
          '@type': 'AggregateRating',
          ratingValue: c.contact.googleRating,
          reviewCount: reviewCountDigits || '1',
        }
      : undefined,
  };
  return schema;
}

export default function Home() {
  const schema = buildLocalBusinessSchema(content);

  return (
    <>
      <Head>
        <title>{content.brand} — Khojwa Bazar, Varanasi</title>
        <meta name="description" content={content.hero.subheadline} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#07080c" />
        <meta property="og:title" content={`${content.brand} — Khojwa Bazar, Varanasi`} />
        <meta property="og:description" content={content.hero.subheadline} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={content.hero.heroImage || '/logo.svg'} />
        <meta name="twitter:card" content="summary" />
        <link
          rel="icon"
          href={FAVICON_HREF}
        />
        <link rel="apple-touch-icon" href={FAVICON_HREF} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </Head>
      <ScrollProgress />
      <BackgroundFX />
      <AnnouncementBar content={content} />
      <Header content={content} />
      <Hero content={content} />
      <Marquee content={content} />
      <FlashSale content={content} />
      <Services content={content} />
      <Products content={content} />
      <div className="wrap">
        <EMIInfo content={content} />
      </div>
      <FinderQuiz content={content} />
      <Repair content={content} />
      <Gallery content={content} />
      <Testimonials content={content} />
      <Trust content={content} />
      <FAQ content={content} />
      <CallbackForm content={content} />
      <Footer content={content} />
      <FloatingWhatsapp content={content} />
      <FloatingCartButton />
      <CartDrawer content={content} />
      <ChatAssistant content={content} />
      <BackToTop />
    </>
  );
}
