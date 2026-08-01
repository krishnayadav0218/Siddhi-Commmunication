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
