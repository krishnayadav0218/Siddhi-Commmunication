import { createSessionToken, sessionCookieString } from '../../../lib/auth';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body || {};

  if (!process.env.ADMIN_PASSWORD) {
    return res.status(500).json({
      error: 'ADMIN_PASSWORD is not set on the server. Add it in your Vercel project environment variables.',
    });
  }

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Incorrect password' });
  }

  const token = createSessionToken();
  res.setHeader('Set-Cookie', sessionCookieString(token));
  return res.status(200).json({ ok: true });
}
