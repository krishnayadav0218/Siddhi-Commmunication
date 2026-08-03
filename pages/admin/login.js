import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { FAVICON_HREF } from '../../lib/favicon';
import LogoMark from '../../components/Logo';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push('/admin');
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.error || 'Login failed');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Admin Login — Siddhi Communication</title>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="icon" href={FAVICON_HREF} />
      </Head>
      <div style={s.wrap}>
        <form onSubmit={handleSubmit} style={s.card}>
          <div style={s.badge}>
            <LogoMark size={26} />
          </div>
          <h1 style={s.title}>Siddhi Admin</h1>
          <p style={s.sub}>Enter the admin password to edit the website content.</p>
          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={s.input}
            autoFocus
          />
          {error ? <p style={s.error}>{error}</p> : null}
          <button type="submit" disabled={loading} style={s.btn}>
            {loading ? 'Checking…' : 'Login'}
          </button>
        </form>
      </div>
    </>
  );
}

const s = {
  wrap: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#07080c',
    fontFamily: 'system-ui, sans-serif',
    padding: 20,
  },
  card: {
    width: 360,
    maxWidth: '100%',
    background: '#12141c',
    border: '1px solid rgba(255,255,255,.09)',
    borderRadius: 18,
    padding: 34,
    color: '#eef1f8',
    boxShadow: '0 30px 60px -20px rgba(0,0,0,.6)',
  },
  badge: {
    width: 46,
    height: 46,
    borderRadius: 12,
    background: 'linear-gradient(140deg,#8b5cf6,#ffb020)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    marginBottom: 16,
  },
  title: { margin: '0 0 6px', fontSize: 22, fontWeight: 800 },
  sub: { margin: '0 0 22px', color: '#a4abc0', fontSize: 13.5, lineHeight: 1.5 },
  input: {
    width: '100%',
    padding: '13px 14px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,.12)',
    background: '#0f1119',
    color: '#fff',
    marginBottom: 14,
    fontSize: 14,
    outline: 'none',
  },
  error: { color: '#ff5c72', fontSize: 13, marginBottom: 12 },
  btn: {
    width: '100%',
    padding: '13px',
    borderRadius: 10,
    border: 'none',
    background: 'linear-gradient(120deg,#8b5cf6,#6d28d9)',
    color: '#fff',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: 14,
  },
};
