import { useEffect, useState } from 'react';
import Head from 'next/head';
import { isAuthenticated } from '../../lib/auth';

export async function getServerSideProps({ req }) {
  if (!isAuthenticated(req)) {
    return { redirect: { destination: '/admin/login', permanent: false } };
  }
  return { props: {} };
}

function formatINR(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/orders')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setOrders(data.orders || []);
      })
      .catch(() => setError('Could not load orders.'));
  }, []);

  return (
    <>
      <Head>
        <title>Orders — Siddhi Communication Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div style={s.page}>
        <div style={s.topbar}>
          <div>
            <h1 style={s.h1}>Online Orders</h1>
            <p style={s.hint}>Paid checkouts from the website. Newest first.</p>
          </div>
          <a href="/admin" style={s.btnGhost}>← Back to Admin</a>
        </div>

        {error ? <div style={s.err}>{error}</div> : null}

        {orders === null && !error ? <p style={s.hint}>Loading…</p> : null}

        {orders && orders.length === 0 ? (
          <div style={s.empty}>
            <p>No online orders yet.</p>
            <p style={{ ...s.hint, marginTop: 6 }}>
              Orders will appear here automatically once a customer pays through the website cart.
            </p>
          </div>
        ) : null}

        {orders && orders.length > 0 ? (
          <div style={s.list}>
            {orders.map((o) => (
              <div style={s.card} key={o.razorpayPaymentId || o.orderNumber}>
                <div style={s.cardHead}>
                  <strong>{o.orderNumber}</strong>
                  <span style={s.amount}>{formatINR(o.amount)}</span>
                </div>
                <div style={s.metaRow}>
                  <span>{o.customer?.name}</span>
                  <span>·</span>
                  <a href={`tel:+91${o.customer?.phone}`} style={s.link}>{o.customer?.phone}</a>
                  <span>·</span>
                  <span>{o.createdAt ? new Date(o.createdAt).toLocaleString('en-IN') : ''}</span>
                </div>
                <ul style={s.items}>
                  {(o.items || []).map((it, i) => (
                    <li key={i}>
                      {it.name} × {it.qty} — {formatINR(it.price * it.qty)}
                    </li>
                  ))}
                </ul>
                <span style={s.statusPill}>{o.status || 'paid'}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#07080c', color: '#eef1f8', padding: '32px 24px 80px', fontFamily: 'sans-serif' },
  topbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 24 },
  h1: { fontSize: 22, margin: '0 0 6px', fontWeight: 800 },
  hint: { fontSize: 13, color: '#a4abc0', margin: 0, lineHeight: 1.5 },
  btnGhost: {
    padding: '10px 16px', borderRadius: 100, border: '1px solid rgba(255,255,255,.12)',
    background: 'rgba(255,255,255,.05)', color: '#eef1f8', fontSize: 13, fontWeight: 700,
    cursor: 'pointer', textDecoration: 'none',
  },
  err: { padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 13.5, background: 'rgba(255,92,114,.12)', border: '1px solid rgba(255,92,114,.35)', color: '#ff5c72' },
  empty: { background: '#12141c', border: '1px solid rgba(255,255,255,.09)', borderRadius: 16, padding: 32, textAlign: 'center' },
  list: { display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 720 },
  card: { background: '#12141c', border: '1px solid rgba(255,255,255,.09)', borderRadius: 14, padding: 18 },
  cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, fontSize: 15 },
  amount: { color: '#3ddc97', fontWeight: 800 },
  metaRow: { display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 12.5, color: '#a4abc0', marginBottom: 10 },
  link: { color: '#6db4ff' },
  items: { margin: '0 0 10px', paddingLeft: 18, fontSize: 13, color: '#d7dbe8', lineHeight: 1.6 },
  statusPill: {
    display: 'inline-block', padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '.04em', background: 'rgba(61,220,151,.12)', color: '#3ddc97',
  },
};
