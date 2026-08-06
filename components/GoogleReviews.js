import { useEffect, useState } from 'react';
import Reveal from './Reveal';

export default function GoogleReviews({ content }) {
  const [data, setData] = useState(null);
  const reviewUrl = content.contact?.googleReviewUrl;

  useEffect(() => {
    fetch('/api/google-reviews')
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ configured: false, reviews: [] }));
  }, []);

  if (!reviewUrl) return null;
  const hasLiveReviews = data?.configured && data.reviews?.length > 0;

  return (
    <Reveal className="google-reviews-block">
      <div className="google-reviews-head">
        <span className="google-g-icon">G</span>
        <div>
          <h4>Google Reviews</h4>
          {data?.rating ? (
            <p>
              <strong>{data.rating}</strong> ★ average from {data.totalRatings} reviews
            </p>
          ) : (
            <p>See what customers say about us on Google, or leave your own review.</p>
          )}
        </div>
        <a className="btn btn-gold" href={reviewUrl} target="_blank" rel="noreferrer">
          ⭐ Rate Us on Google
        </a>
      </div>

      {hasLiveReviews ? (
        <div className="google-reviews-grid">
          {data.reviews.map((rv, i) => (
            <div className="google-review-card" key={i}>
              <div className="google-review-stars">{'★'.repeat(rv.rating)}{'☆'.repeat(5 - rv.rating)}</div>
              <p className="google-review-text">&ldquo;{rv.text}&rdquo;</p>
              <div className="google-review-author">
                {rv.author} <span>· {rv.relativeTime}</span>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </Reveal>
  );
}
