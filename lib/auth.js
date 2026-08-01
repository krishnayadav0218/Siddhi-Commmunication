import crypto from 'crypto';
import { parseCookies } from './cookies';

const SECRET = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || 'change-me';
const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 12; // 12 hours

export function createSessionToken() {
  const expires = Date.now() + SESSION_MAX_AGE_MS;
  const payload = `${expires}`;
  const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

export function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
  const sigBuf = Buffer.from(sig, 'hex');
  const expBuf = Buffer.from(expected, 'hex');
  if (sigBuf.length !== expBuf.length) return false;
  if (!crypto.timingSafeEqual(sigBuf, expBuf)) return false;
  if (Date.now() > parseInt(payload, 10)) return false;
  return true;
}

export function isAuthenticated(req) {
  const cookies = parseCookies(req);
  return verifySessionToken(cookies.admin_session);
}

export function sessionCookieString(token) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `admin_session=${token}; HttpOnly; Path=/; Max-Age=${SESSION_MAX_AGE_MS / 1000}; SameSite=Lax${secure}`;
}

export function clearSessionCookieString() {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `admin_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}

// --- Login brute-force protection -----------------------------------------
// Cookie-based since there's no external store (Redis/KV) in this project.
// This stops naive/scripted brute-force attempts; it is not a substitute
// for a server-side rate limiter, since a determined attacker who clears
// cookies between requests can bypass it. Good enough given the threat
// model of a small local shop's admin panel.

export const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_SECONDS = 10 * 60; // 10 minutes
const ATTEMPT_WINDOW_SECONDS = 15 * 60; // failed-attempt counter resets after 15 min idle

function cookieSecureFlag() {
  return process.env.NODE_ENV === 'production' ? '; Secure' : '';
}

export function getLoginLockRemainingMs(cookies) {
  const lockUntil = parseInt(cookies.login_lock_until || '0', 10);
  if (!lockUntil) return 0;
  const remaining = lockUntil - Date.now();
  return remaining > 0 ? remaining : 0;
}

export function getLoginAttemptCount(cookies) {
  return parseInt(cookies.login_attempts || '0', 10) || 0;
}

// Returns Set-Cookie strings to record a failed attempt. If this attempt
// crosses the threshold, also locks out further attempts for a while.
export function recordFailedLoginCookies(currentAttempts) {
  const secure = cookieSecureFlag();
  const attempts = currentAttempts + 1;
  if (attempts >= MAX_LOGIN_ATTEMPTS) {
    const lockUntil = Date.now() + LOCK_DURATION_SECONDS * 1000;
    return {
      attemptsUsed: attempts,
      lockedOut: true,
      cookies: [
        `login_attempts=0; HttpOnly; Path=/; Max-Age=${ATTEMPT_WINDOW_SECONDS}; SameSite=Lax${secure}`,
        `login_lock_until=${lockUntil}; HttpOnly; Path=/; Max-Age=${LOCK_DURATION_SECONDS}; SameSite=Lax${secure}`,
      ],
    };
  }
  return {
    attemptsUsed: attempts,
    lockedOut: false,
    cookies: [`login_attempts=${attempts}; HttpOnly; Path=/; Max-Age=${ATTEMPT_WINDOW_SECONDS}; SameSite=Lax${secure}`],
  };
}

export function clearLoginAttemptCookies() {
  const secure = cookieSecureFlag();
  return [
    `login_attempts=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${secure}`,
    `login_lock_until=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${secure}`,
  ];
}
