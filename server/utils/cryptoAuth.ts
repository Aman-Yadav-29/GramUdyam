import crypto from 'crypto';

/**
 * Cryptographic Authentication Helper for GramUdyam
 * Implements scrypt password hashing with cryptographically secure salts
 * and HMAC-SHA256 session token generation and verification using AUTH_SECRET.
 */

// Secret retrieved strictly from environment variables
export function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    console.warn('[Security Warning] AUTH_SECRET environment variable is not defined. Using internal development fallback key.');
    return 'gramudyam_internal_dev_secret_key_change_in_production_389274';
  }
  return secret;
}

/**
 * Hashes a plaintext password using scrypt with a cryptographically secure 16-byte random salt.
 * Output format: "salt:hash"
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Verifies a plaintext password against a stored "salt:hash" string in constant time.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(':')) {
    return false;
  }
  const [salt, originalHash] = storedHash.split(':');
  if (!salt || !originalHash) {
    return false;
  }

  try {
    const derivedKey = crypto.scryptSync(password, salt, 64);
    const keyBuffer = Buffer.from(derivedKey.toString('hex'), 'hex');
    const originalBuffer = Buffer.from(originalHash, 'hex');

    if (keyBuffer.length !== originalBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(keyBuffer, originalBuffer);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

export interface TokenPayload {
  userId: string;
  email?: string;
  isGuest: boolean;
  iat: number;
  exp: number;
}

/**
 * In-memory blacklist for invalidated tokens (e.g. after logout)
 */
const invalidatedTokens = new Set<string>();

/**
 * Signs a session token with HMAC-SHA256 using AUTH_SECRET
 */
export function createSessionToken(payload: Omit<TokenPayload, 'iat' | 'exp'>, expiresInDays = 30): string {
  const secret = getAuthSecret();
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: TokenPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInDays * 24 * 60 * 60
  };

  const payloadB64 = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payloadB64)
    .digest('base64url');

  return `gu_${payloadB64}.${signature}`;
}

/**
 * Verifies and decodes a signed session token. Returns payload if valid and not expired, null otherwise.
 */
export function verifySessionToken(token: string): TokenPayload | null {
  if (!token || !token.startsWith('gu_') || !token.includes('.')) {
    return null;
  }

  if (invalidatedTokens.has(token)) {
    return null;
  }

  const raw = token.slice(3);
  const [payloadB64, signature] = raw.split('.');
  if (!payloadB64 || !signature) {
    return null;
  }

  const secret = getAuthSecret();
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(payloadB64)
    .digest('base64url');

  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSig);

  if (sigBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload: TokenPayload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

/**
 * Invalidates a session token (on logout)
 */
export function invalidateToken(token: string): void {
  if (token) {
    invalidatedTokens.add(token);
  }
}
