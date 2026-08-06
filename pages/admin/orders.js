import { useEffect, useState } from 'react';
import Head from 'next/head';
import { isAuthenticated } from '../../lib/auth';
import { FAVICON_HREF } from '../../lib/favicon';

export async function getServerSideProps({ req }) {
  if (!isAuthenticated(req)) {
    return { redirect: { destination: '/admin/login', permanent: false } };
  }
  return { props: {} };
}

const STATUS_FLOW = ['paid', 'processing', 'ready', 'completed', 'cancelled'];
const STATUS_MESSAGES = {
  processing: (o) => `Hi ${o.customer?.name}, your order ${o.orderNumber} is now being processed. We'll update you once it's ready!`,
  ready: (o) => `Hi ${o.customer?.name}, great news — your order ${o.orderNumber} is ready for pickup at Siddhi Communication, Khojwa Bazar!`,
  completed: (o) => `Hi ${o.customer?.name}, your order ${o.orderNumber} is marked complete. Thanks for shopping with us!`,
  cancelled: (o) => `Hi ${o.customer?.name}, your order ${o.orderNumber} has been cancelled. Message us if you have any questions.`,
};

function formatINR(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(null);

  function load() {
    fetch('/api/orders')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setOrders(data.orders || []);
      })
      .catch(() => setError('Could not load orders.'));
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(orderNumber, status) {
    setBusy(orderNumber);
    try {
      const res = await fetch('/api/track-order', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      load();
    } catch (e) {
      setError(e.message || 'Could not update status.');
    } finally {
      setBusy(null);
    }
  }

  function notifyLink(order) {
    const status = order.status || 'paid';
    const buildMsg = STATUS_MESSAGES[status];
    const text = buildMsg ? buildMsg(order) : `Hi ${order.customer?.name}, update on your order ${order.orderNumber}: ${status}.`;
    return `https://wa.me/91${order.customer?.phone}?text=${encodeURIComponent(text)}`;
  }

  return (
    <>
      <Head>
        <title>Orders — Siddhi Communication Admin</title>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="icon" href={FAVICON_HREF} />
      </Head>
      <div style={s.page}>
        <div style={s.topbar}>
          <div>
            <h1 style={s.h1}>Online Orders</h1>
            <p style={s.hint}>Paid checkouts from the website. Update status and notify customers on WhatsApp.</p>
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
                <div style={s.statusRow}>
                  <select
                    value={o.status || 'paid'}
                    onChange={(e) => updateStatus(o.orderNumber, e.target.value)}
                    disabled={busy === o.orderNumber}
                    style={s.statusSelect}
                  >
                    {STATUS_FLOW.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                  <a href={notifyLink(o)} target="_blank" rel="noreferrer" style={s.notifyBtn}>
                    💬 Notify on WhatsApp
                  </a>
                </div>
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
  hint: { fontSize: 13, color: '#a4abc0', margin: 0, lineHeight: 1.5, maxWidth: 480 },
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
  link: { color: '#d9b3ff' },
  items: { margin: '0 0 14px', paddingLeft: 18, fontSize: 13, color: '#d7dbe8', lineHeight: 1.6 },
  statusRow: { display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' },
  statusSelect: {
    padding: '8px 12px', borderRadius: 100, fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '.04em', background: 'rgba(139,92,246,.12)', color: '#d9b3ff', border: '1px solid rgba(139,92,246,.35)',
  },
  notifyBtn: {
    padding: '8px 14px', borderRadius: 100, fontSize: 12, fontWeight: 700, background: 'rgba(61,220,151,.12)',
    color: '#3ddc97', border: '1px solid rgba(61,220,151,.35)', textDecoration: 'none',
  },
};
