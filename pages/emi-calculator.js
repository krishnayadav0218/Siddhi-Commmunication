import Head from 'next/head';
import content from '../content/site-content.json';
import { FAVICON_HREF } from '../lib/favicon';
import EMICalculator from '../components/EMICalculator';

export default function EMICalculatorPage() {
  return (
    <>
      <Head>
        <title>EMI Calculator — {content.brand}</title>
        <meta name="description" content="Calculate your monthly EMI instantly for any purchase or repair at Siddhi Communication." />
        <link rel="icon" href={FAVICON_HREF} />
      </Head>
      <div className="track-wrap">
        <div className="track-card" style={{ maxWidth: 480 }}>
          <a href="/" style={{ fontSize: 13, color: 'var(--text-3)', textDecoration: 'none' }}>← Back to site</a>
          <h1 style={{ marginTop: 10 }}>EMI Calculator</h1>
          <p className="sub">Type your own amount and tenure — see your exact monthly installment instantly.</p>
          <EMICalculator contact={content.contact} />
        </div>
      </div>
    </>
  );
}
