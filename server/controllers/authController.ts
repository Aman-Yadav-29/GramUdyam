import type { Request, Response } from 'express';
import { authService, DuplicateAccountError, InvalidCredentialsError } from '../services/authService.ts';
import { validateLoginPayload, validateRegisterPayload } from '../../src/validation/authValidator.ts';

/**
 * Helper to extract Bearer token from Authorization header
 */
function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
    return parts[1];
  }
  return null;
}

/**
 * POST /api/auth/guest
 * Generates an unauthenticated Guest session with immediate access to all features.
 */
export const createGuestSessionHandler = async (_req: Request, res: Response) => {
  try {
    const session = authService.createGuestSession();
    res.json({
      success: true,
      data: session,
      message: 'Guest session initialized successfully without credentials',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'AUTH_ERROR', message: error.message || 'Internal server error' },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * POST /api/auth/register
 * Creates a registered user account with scrypt password hashing.
 * Rejects duplicate emails with 409 Conflict.
 */
export const registerHandler = async (req: Request, res: Response) => {
  try {
    const { name, fullName, email, password, confirmPassword, state, district } = req.body;
    const resolvedName = (name ?? fullName ?? '').trim();

    const validation = validateRegisterPayload({
      fullName: resolvedName,
      email,
      password,
      confirmPassword
    });

    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_FAILED', message: validation.errors.join('. ') },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const session = authService.registerUser({
      email,
      fullName: resolvedName,
      password,
      state,
      district
    });

    res.status(201).json({
      success: true,
      data: session,
      message: 'Account created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    if (error instanceof DuplicateAccountError || error.name === 'DuplicateAccountError') {
      res.status(409).json({
        success: false,
        error: { code: 'DUPLICATE_EMAIL', message: error.message },
        timestamp: new Date().toISOString()
      });
      return;
    }

    res.status(400).json({
      success: false,
      error: { code: 'REGISTRATION_FAILED', message: error.message || 'Registration failed' },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * POST /api/auth/login
 * Verifies email and scrypt password hash. Returns 401 on bad credentials.
 */
export const loginHandler = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const validation = validateLoginPayload({ email, password });
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_FAILED', message: validation.errors.join('. ') },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const session = authService.loginUser({ email, password });

    res.json({
      success: true,
      data: session,
      message: 'Logged in successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    if (error instanceof InvalidCredentialsError || error.name === 'InvalidCredentialsError') {
      res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    res.status(400).json({
      success: false,
      error: { code: 'LOGIN_FAILED', message: error.message || 'Login failed' },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * GET /api/auth/me
 * Returns current authenticated user profile by verifying the Bearer token.
 */
export const getCurrentUserHandler = async (req: Request, res: Response) => {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'No authorization token provided' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const user = authService.verifySession(token);
    if (!user) {
      res.status(401).json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Session expired or invalid' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    res.json({
      success: true,
      data: {
        user,
        isGuest: user.isGuest
      },
      message: 'Current user session verified',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'SESSION_VERIFICATION_ERROR', message: error.message },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * POST /api/auth/logout
 * Invalidates the session token on the server side.
 */
export const logoutHandler = async (req: Request, res: Response) => {
  try {
    const token = extractBearerToken(req);
    if (token) {
      authService.logoutUser(token);
    }

    res.json({
      success: true,
      message: 'Logged out successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'LOGOUT_ERROR', message: error.message },
      timestamp: new Date().toISOString()
    });
  }
};
