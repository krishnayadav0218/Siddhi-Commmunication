import {
  createSessionToken,
  sessionCookieString,
  clearLoginAttemptCookies,
  recordFailedLoginCookies,
  getLoginLockRemainingMs,
  getLoginAttemptCount,
  MAX_LOGIN_ATTEMPTS,
} from '../../../lib/auth';
import { parseCookies } from '../../../lib/cookies';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const cookies = parseCookies(req);
  const lockRemainingMs = getLoginLockRemainingMs(cookies);
  if (lockRemainingMs > 0) {
    const minsLeft = Math.ceil(lockRemainingMs / 60000);
    return res.status(429).json({
      error: `Too many failed attempts. Try again in ${minsLeft} minute${minsLeft === 1 ? '' : 's'}.`,
    });
  }

  const { password } = req.body || {};

  if (!process.env.ADMIN_PASSWORD) {
    return res.status(500).json({
      error: 'ADMIN_PASSWORD is not set on the server. Add it in your Vercel project environment variables.',
    });
  }

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    const currentAttempts = getLoginAttemptCount(cookies);
    const result = recordFailedLoginCookies(currentAttempts);
    res.setHeader('Set-Cookie', result.cookies);
    if (result.lockedOut) {
      return res.status(429).json({ error: 'Too many failed attempts. Try again in 10 minutes.' });
    }
    const attemptsLeft = MAX_LOGIN_ATTEMPTS - result.attemptsUsed;
    return res.status(401).json({
      error: `Incorrect password. ${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} left before a temporary lockout.`,
    });
  }

  const token = createSessionToken();
  res.setHeader('Set-Cookie', [sessionCookieString(token), ...clearLoginAttemptCookies()]);
  return res.status(200).json({ ok: true });
}
