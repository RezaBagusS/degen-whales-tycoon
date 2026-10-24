import crypto from 'crypto';

const SESSION_SECRET = process.env.SESSION_SECRET || 'degen_whale_syndicate_secret_salt_2026';
const COOKIE_NAME = 'degen_session';

/**
 * Hash a plain text password using PBKDF2 with a secure salt
 */
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify a plain text password against a stored salt:hash string
 */
export function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, originalHash] = storedHash.split(':');
  const computedHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(computedHash, 'hex'), Buffer.from(originalHash, 'hex'));
}

/**
 * Generate a signed session token
 */
export function createSessionToken(user) {
  const payload = {
    userId: user.id,
    username: user.username,
    createdAt: Date.now()
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadB64)
    .digest('base64url');
  return `${payloadB64}.${signature}`;
}

/**
 * Verify and decode a session token
 */
export function verifySessionToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [payloadB64, signature] = token.split('.');
  if (!payloadB64 || !signature) return null;

  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadB64)
    .digest('base64url');

  if (signature.length !== expectedSig.length) return null;
  const valid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig));
  if (!valid) return null;

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    return payload;
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
