import Link from 'next/link';
import Head from 'next/head';
import { FAVICON_HREF } from '../lib/favicon';
import LogoMark from '../components/Logo';

export default function Custom404() {
  return (
    <>
      <Head>
        <title>Page Not Found — Siddhi Communication</title>
        <meta name="robots" content="noindex" />
        <link rel="icon" href={FAVICON_HREF} />
      </Head>
      <div style={s.wrap}>
        <div style={s.badge}>
          <LogoMark size={30} />
        </div>
        <h1 style={s.title}>Page Not Found</h1>
        <p style={s.text}>The page you&apos;re looking for doesn&apos;t exist. Let&apos;s get you back to Siddhi Communication.</p>
        <Link href="/" style={s.btn}>
          ← Back to Home
        </Link>
      </div>
    </>
  );
}

const s = {
  wrap: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#07080c',
    color: '#eef1f8',
    fontFamily: 'system-ui, sans-serif',
    textAlign: 'center',
    padding: 20,
  },
  icon: { fontSize: 56, marginBottom: 10 },
  badge: {
    width: 56,
    height: 56,
    borderRadius: 14,
    background: 'linear-gradient(140deg,#159ba0,#f2a324)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    boxShadow: '0 0 30px -6px #159ba0, 0 0 40px -10px #f2a324',
  },
  title: { fontSize: 26, marginBottom: 10, fontWeight: 800 },
  text: { color: '#a4abc0', marginBottom: 26, maxWidth: 360, lineHeight: 1.6, fontSize: 14 },
  btn: {
    padding: '13px 30px',
    borderRadius: 100,
    background: 'linear-gradient(120deg,#159ba0,#0c6a6e)',
    color: '#fff',
    fontWeight: 700,
    textDecoration: 'none',
    fontSize: 14,
  },
};
