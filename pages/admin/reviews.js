import { useEffect, useState } from 'react';
import Head from 'next/head';
import { isAuthenticated } from '../../lib/auth';

export async function getServerSideProps({ req }) {
  if (!isAuthenticated(req)) {
    return { redirect: { destination: '/admin/login', permanent: false } };
  }
  return { props: {} };
}

const TABS = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

export default function ReviewsPage() {
  const [reviews, setReviews] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('pending');
  const [busyId, setBusyId] = useState(null);

  function load() {
    fetch('/api/reviews')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setReviews(data.reviews || []);
      })
      .catch(() => setError('Could not load reviews.'));
  }

  useEffect(() => {
    load();
  }, []);

  async function setStatus(id, status) {
    setBusyId(id);
    try {
      const res = await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      load();
    } catch (e) {
      setError(e.message || 'Could not update review.');
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id) {
    if (!confirm('Delete this review permanently?')) return;
    setBusyId(id);
    try {
      const res = await fetch('/api/reviews', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      load();
    } catch (e) {
      setError(e.message || 'Could not delete review.');
    } finally {
      setBusyId(null);
    }
  }

  const filtered = (reviews || []).filter((r) => (r.status || 'pending') === tab);

  return (
    <>
      <Head>
        <title>Reviews — Siddhi Communication Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div style={s.page}>
        <div style={s.topbar}>
          <div>
            <h1 style={s.h1}>Customer Reviews</h1>
            <p style={s.hint}>Anyone can submit a review from the site — approve or reject before it goes live.</p>
          </div>
          <a href="/admin" style={s.btnGhost}>← Back to Admin</a>
        </div>

        {error ? <div style={s.err}>{error}</div> : null}

        <div style={s.tabs}>
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              style={{ ...s.tabBtn, ...(tab === t.key ? s.tabBtnActive : {}) }}
            >
              {t.label} {reviews ? `(${reviews.filter((r) => (r.status || 'pending') === t.key).length})` : ''}
            </button>
          ))}
        </div>

        {reviews === null && !error ? <p style={s.hint}>Loading…</p> : null}

        {reviews && filtered.length === 0 ? (
          <div style={s.empty}>
            <p>No {tab} reviews.</p>
          </div>
        ) : null}

        {reviews && filtered.length > 0 ? (
          <div style={s.list}>
            {filtered.map((r) => (
              <div style={s.card} key={r.id}>
                <div style={s.cardHead}>
                  <strong>{r.name}</strong>
                  <span style={s.stars}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                </div>
                <p style={s.text}>{r.text}</p>
                <div style={s.metaRow}>
                  <span>{r.createdAt ? new Date(r.createdAt).toLocaleString('en-IN') : ''}</span>
                </div>
                <div style={s.actions}>
                  {tab !== 'approved' ? (
                    <button disabled={busyId === r.id} onClick={() => setStatus(r.id, 'approved')} style={s.btnApprove}>
                      ✓ Approve
                    </button>
                  ) : null}
                  {tab !== 'rejected' ? (
                    <button disabled={busyId === r.id} onClick={() => setStatus(r.id, 'rejected')} style={s.btnReject}>
                      ✕ Reject
                    </button>
                  ) : null}
                  <button disabled={busyId === r.id} onClick={() => remove(r.id)} style={s.btnDelete}>
                    🗑 Delete
                  </button>
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
  topbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 20 },
  h1: { fontSize: 22, margin: '0 0 6px', fontWeight: 800 },
  hint: { fontSize: 13, color: '#a4abc0', margin: 0, lineHeight: 1.5 },
  btnGhost: {
    padding: '10px 16px', borderRadius: 100, border: '1px solid rgba(255,255,255,.12)',
    background: 'rgba(255,255,255,.05)', color: '#eef1f8', fontSize: 13, fontWeight: 700,
    cursor: 'pointer', textDecoration: 'none',
  },
  err: { padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 13.5, background: 'rgba(255,92,114,.12)', border: '1px solid rgba(255,92,114,.35)', color: '#ff5c72' },
  tabs: { display: 'flex', gap: 8, marginBottom: 20 },
  tabBtn: {
    padding: '9px 16px', borderRadius: 100, border: '1px solid rgba(255,255,255,.1)',
    background: 'transparent', color: '#a4abc0', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
  },
  tabBtnActive: { background: 'rgba(21,155,160,.15)', borderColor: 'rgba(21,155,160,.4)', color: '#5cd6d9' },
  empty: { background: '#12141c', border: '1px solid rgba(255,255,255,.09)', borderRadius: 16, padding: 32, textAlign: 'center' },
  list: { display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 640 },
  card: { background: '#12141c', border: '1px solid rgba(255,255,255,.09)', borderRadius: 14, padding: 18 },
  cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, fontSize: 15 },
  stars: { color: '#f2a324', fontSize: 13 },
  text: { fontSize: 13.5, color: '#d7dbe8', lineHeight: 1.6, margin: '0 0 10px' },
  metaRow: { fontSize: 11.5, color: '#6a7189', marginBottom: 12 },
  actions: { display: 'flex', gap: 8 },
  btnApprove: { padding: '8px 14px', borderRadius: 100, border: '1px solid rgba(61,220,151,.4)', background: 'rgba(61,220,151,.12)', color: '#3ddc97', fontSize: 12, fontWeight: 700, cursor: 'pointer' },
  btnReject: { padding: '8px 14px', borderRadius: 100, border: '1px solid rgba(255,197,66,.4)', background: 'rgba(255,197,66,.1)', color: '#ffc766', fontSize: 12, fontWeight: 700, cursor: 'pointer' },
  btnDelete: { padding: '8px 14px', borderRadius: 100, border: '1px solid rgba(255,92,114,.4)', background: 'rgba(255,92,114,.1)', color: '#ff5c72', fontSize: 12, fontWeight: 700, cursor: 'pointer' },
};
