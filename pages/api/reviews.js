import { isAuthenticated } from '../../lib/auth';
import { getReviews, appendReview, saveAllReviews } from '../../lib/github';

function makeId() {
  return `rv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const all = await getReviews();
    if (isAuthenticated(req)) {
      // Admin sees everything (pending + approved + rejected) for moderation.
      return res.status(200).json({ reviews: all.slice().reverse() });
    }
    // Public only ever sees approved reviews.
    return res.status(200).json({ reviews: all.filter((r) => r.status === 'approved').slice().reverse() });
  }

  if (req.method === 'POST') {
    const { name, rating, text } = req.body || {};
    const trimmedName = String(name || '').trim().slice(0, 60);
    const trimmedText = String(text || '').trim().slice(0, 600);
    const numRating = parseInt(rating, 10);

    if (!trimmedName || !trimmedText || Number.isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: 'Please add your name, a star rating, and a short review.' });
    }

    const review = {
      id: makeId(),
      name: trimmedName,
      rating: numRating,
      text: trimmedText,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    try {
      await appendReview(review);
      return res.status(200).json({ ok: true, message: 'Thanks! Your review will appear once approved.' });
    } catch (e) {
      return res.status(500).json({ error: e.message || 'Could not save your review right now.' });
    }
  }

  if (req.method === 'PATCH') {
    if (!isAuthenticated(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { id, status } = req.body || {};
    if (!id || !['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid request.' });
    }
    const all = await getReviews();
    const updated = all.map((r) => (r.id === id ? { ...r, status } : r));
    try {
      await saveAllReviews(updated, `Review ${id} marked ${status}`);
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: e.message || 'Could not update review.' });
    }
  }

  if (req.method === 'DELETE') {
    if (!isAuthenticated(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: 'Missing review id.' });
    const all = await getReviews();
    const updated = all.filter((r) => r.id !== id);
    try {
      await saveAllReviews(updated, `Review ${id} deleted`);
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: e.message || 'Could not delete review.' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
  return res.status(405).json({ error: 'Method not allowed' });
}
