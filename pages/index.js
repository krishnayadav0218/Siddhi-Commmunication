import Head from 'next/head';
import content from '../content/site-content.json';
import BackgroundFX from '../components/BackgroundFX';
import ScrollProgress from '../components/ScrollProgress';
import AnnouncementBar from '../components/AnnouncementBar';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Marquee from '../components/Marquee';
import Services from '../components/Services';
import Products from '../components/Products';
import EMIInfo from '../components/EMIInfo';
import Recommender from '../components/Recommender';
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
        {content.hero.heroImage ? <meta property="og:image" content={content.hero.heroImage} /> : null}
        <meta name="twitter:card" content="summary" />
        <link
          rel="icon"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect width='24' height='24' rx='6' fill='%230a0b0f'/%3E%3Cpath d='M12 3L5 6.5v6c0 4.5 3 7.7 7 9 4-1.3 7-4.5 7-9v-6z' fill='%232f8fff'/%3E%3Cpath d='M9.3 12l1.8 1.8L15 10' stroke='%23f5c542' stroke-width='1.6' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"
        />
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
      <Services content={content} />
      <Products content={content} />
      <div className="wrap">
        <EMIInfo content={content} />
      </div>
      <Recommender content={content} />
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
