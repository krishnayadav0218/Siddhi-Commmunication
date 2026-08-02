import { useEffect, useState } from 'react';
import Reveal from './Reveal';

function StarInput({ value, onChange }) {
  return (
    <div className="review-star-row">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`review-star${n <= value ? ' active' : ''}`}
          onClick={() => onChange(n)}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function ReviewForm({ onSubmitted }) {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [status, setStatus] = useState(null); // {type:'ok'|'err', msg}
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(null);
    if (!name.trim() || !text.trim()) {
      setStatus({ type: 'err', msg: 'Please add your name and a short review.' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, rating, text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not submit review.');
      setStatus({ type: 'ok', msg: data.message || 'Thanks for your review!' });
      setName('');
      setRating(5);
      setText('');
      onSubmitted?.();
    } catch (err) {
      setStatus({ type: 'err', msg: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h4>Share Your Experience</h4>
      <p className="helper">Anyone can leave a review — it'll appear here once our team approves it.</p>
      <StarInput value={rating} onChange={setRating} />
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" maxLength={60} required />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Tell others about your experience…"
        maxLength={600}
        required
      />
      {status ? <p className={`review-form-msg ${status.type === 'ok' ? 'ok' : 'err'}`}>{status.msg}</p> : null}
      <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
        {loading ? 'Submitting…' : 'Submit Review'}
      </button>
      <p className="review-pending-note">Reviews are moderated before going live, so spam and abuse never get through.</p>
    </form>
  );
}

export default function Testimonials({ content }) {
  const curated = content.testimonials || [];
  const [publicReviews, setPublicReviews] = useState([]);

  function loadReviews() {
    fetch('/api/reviews')
      .then((r) => r.json())
      .then((data) => setPublicReviews(data.reviews || []))
      .catch(() => {});
  }

  useEffect(() => {
    loadReviews();
  }, []);

  const combined = [
    ...curated.map((t) => ({ name: t.name, location: t.location, rating: t.rating, text: t.text })),
    ...publicReviews.map((r) => ({ name: r.name, location: 'Verified visitor', rating: r.rating, text: r.text })),
  ];

  if (!combined.length && !curated.length) return null;

  return (
    <section className="section-pad testimonials-section">
      <div className="wrap">
        <Reveal className="sec-head">
          <span className="sec-eyebrow">Customer Love</span>
          <h2>What Khojwa Bazar Says</h2>
          <p>Real feedback from customers who walked in for a repair, a ticket, or just a cable.</p>
        </Reveal>
        <Reveal className="testimonial-grid">
          {combined.map((t, i) => (
            <div className="testimonial-card" key={i}>
              <div className="stars" aria-hidden="true">
                {'★'.repeat(t.rating)}
                {'☆'.repeat(Math.max(0, 5 - t.rating))}
              </div>
              <p className="quote">&ldquo;{t.text}&rdquo;</p>
              <div className="author">
                <div className="avatar">{t.name.charAt(0)}</div>
                <div>
                  <div className="name">{t.name}</div>
                  <div className="loc">{t.location}</div>
                </div>
              </div>
            </div>
          ))}
        </Reveal>

        <ReviewForm onSubmitted={loadReviews} />
      </div>
    </section>
  );
}
