import { useState } from 'react';
import Head from 'next/head';
import { FAVICON_HREF } from '../lib/favicon';
import { useLanguage } from '../lib/LanguageContext';

const STEP_ICONS = { paid: '💳', processing: '🔧', ready: '📦', completed: '✅', cancelled: '✕' };

function formatINR(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`;
}

export default function TrackOrderPage() {
  const { t } = useLanguage();
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch('/api/track-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Order not found.');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const currentIdx = result ? result.statusFlow.indexOf(result.order.status) : -1;
  const isCancelled = result?.order.status === 'cancelled';

  return (
    <>
      <Head>
        <title>Track Order — Siddhi Communication</title>
        <link rel="icon" href={FAVICON_HREF} />
      </Head>
      <div className="track-wrap">
        <div className="track-card">
          <a href="/" style={{ fontSize: 13, color: 'var(--text-3)', textDecoration: 'none' }}>← Back to site</a>
          <h1>{t('trackOrderTitle')}</h1>
          <p className="sub">{t('trackOrderSub')}</p>

          <form onSubmit={handleSubmit}>
            <label className="track-field">
              <span>{t('orderNumber')}</span>
              <input
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="SC-XXXXXXXX"
                required
              />
            </label>
            <label className="track-field">
              <span>{t('phoneNumber')}</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="10-digit mobile number"
                inputMode="numeric"
                required
              />
            </label>
            {error ? <p className="track-error">{error}</p> : null}
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Checking…' : `🔍 ${t('trackBtn')}`}
            </button>
          </form>

          {result ? (
            <div className="track-result">
              <span className="track-status-badge">
                {STEP_ICONS[result.order.status] || '•'} {result.order.status}
              </span>

              {!isCancelled ? (
                <div className="track-timeline">
                  {result.statusFlow.map((step, i) => (
                    <div key={step} className={`track-step${i <= currentIdx ? ' done' : ''}`}>
                      <span className="track-step-dot">{i <= currentIdx ? '✓' : i + 1}</span>
                      <span className="track-step-label">{step}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--danger)', fontSize: '.86rem' }}>This order was cancelled.</p>
              )}

              <div className="track-items">
                <strong style={{ display: 'block', marginBottom: 8, color: 'var(--text-1)' }}>
                  Order {result.order.orderNumber} · {formatINR(result.order.amount)}
                </strong>
                <ul>
                  {(result.order.items || []).map((it, i) => (
                    <li key={i}>{it.name} × {it.qty}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
