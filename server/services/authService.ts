import { entityRepository } from '../models/schema.ts';
import { UserAccount, AuthSession } from '../../src/types/auth.ts';
import { hashPassword, verifyPassword, createSessionToken, verifySessionToken, invalidateToken } from '../utils/cryptoAuth.ts';

export class DuplicateAccountError extends Error {
  constructor(message = 'An account with this email address already exists.') {
    super(message);
    this.name = 'DuplicateAccountError';
  }
}

export class InvalidCredentialsError extends Error {
  constructor(message = 'Invalid email or password.') {
    super(message);
    this.name = 'InvalidCredentialsError';
  }
}

export class AuthService {
  /**
   * Initializes a non-blocking Guest session.
   * Guests have 100% full access to all analysis engines without credentials.
   */
  public createGuestSession(): AuthSession {
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const guestUser: UserAccount = {
      id: guestId,
      isGuest: true,
      fullName: 'Guest Entrepreneur',
      createdAt: new Date().toISOString()
    };

    entityRepository.createUser(guestUser);

    const token = createSessionToken({
      userId: guestId,
      isGuest: true
    });

    return {
      user: guestUser,
      token,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
  }

  /**
   * Registers a new user account with scrypt password hashing and cryptographic salt.
   * Never stores plaintext passwords. Rejects duplicate emails safely.
   */
  public registerUser(payload: {
    email: string;
    fullName: string;
    password: string;
    state?: string;
    district?: string;
  }): AuthSession {
    const normalizedEmail = payload.email.trim().toLowerCase();

    const existing = entityRepository.getUserByEmail(normalizedEmail);
    if (existing && !existing.isGuest) {
      throw new DuplicateAccountError('An account with this email address already exists.');
    }

    // Hash password with scrypt + secure salt
    const passwordHash = hashPassword(payload.password);

    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const newUser: UserAccount = {
      id: userId,
      email: normalizedEmail,
      fullName: payload.fullName.trim(),
      isGuest: false,
      state: payload.state?.trim(),
      district: payload.district?.trim(),
      createdAt: new Date().toISOString()
    };

    entityRepository.createUser(newUser);
    entityRepository.setPasswordHash(userId, passwordHash);

    const token = createSessionToken({
      userId,
      email: newUser.email,
      isGuest: false
    });

    return {
      user: newUser,
      token,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
  }

  /**
   * Authenticates user against stored scrypt hash with timing-safe comparison.
   */
  public loginUser(payload: { email: string; password: string }): AuthSession {
    const normalizedEmail = payload.email.trim().toLowerCase();
    const user = entityRepository.getUserByEmail(normalizedEmail);

    if (!user || user.isGuest) {
      throw new InvalidCredentialsError('Invalid email or password.');
    }

    const storedHash = entityRepository.getPasswordHash(user.id);
    if (!storedHash) {
      throw new InvalidCredentialsError('Invalid email or password.');
    }

    const isValid = verifyPassword(payload.password, storedHash);
    if (!isValid) {
      throw new InvalidCredentialsError('Invalid email or password.');
    }

    const token = createSessionToken({
      userId: user.id,
      email: user.email,
      isGuest: false
    });

    return {
      user,
      token,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
  }

  /**
   * Verifies an active session token and returns the current user.
   */
  public verifySession(token: string): UserAccount | null {
    const payload = verifySessionToken(token);
    if (!payload || !payload.userId) {
      return null;
    }

    const user = entityRepository.getUserById(payload.userId);
    return user || null;
  }

  /**
   * Logs out the user by blacklisting their session token.
   */
  public logoutUser(token: string): void {
    if (token) {
      invalidateToken(token);
    }
  }
}

export const authService = new AuthService();
