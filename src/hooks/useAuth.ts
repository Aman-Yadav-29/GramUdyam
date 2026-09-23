import { useState, useEffect, useCallback, useRef } from 'react';
import { UserAccount, AuthSession } from '../types/auth.ts';
import { apiClient } from '../services/apiClient.ts';

const SESSION_STORAGE_KEY = 'gramudyam_auth_session';

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(() => {
    try {
      const saved = localStorage.getItem(SESSION_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isVerifyingRef = useRef(false);

  /**
   * Initializes a non-blocking Guest session if none exists.
   * Enables immediate exploration of all features.
   */
  const initializeGuest = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const guestSession = await apiClient.createGuestSession();
      setSession(guestSession);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(guestSession));
      return guestSession;
    } catch (err: any) {
      console.warn('Backend guest initialization failed, falling back to local guest session:', err);
      const fallbackGuest: AuthSession = {
        user: {
          id: `guest_${Date.now()}`,
          fullName: 'Guest Entrepreneur',
          isGuest: true,
          createdAt: new Date().toISOString()
        },
        token: `gu_guest_fallback_${Date.now()}`,
        expiresAt: new Date(Date.now() + 30 * 86400000).toISOString()
      };
      setSession(fallbackGuest);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(fallbackGuest));
      return fallbackGuest;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Verifies current session on mount / page refresh via GET /api/auth/me.
   */
  const verifyCurrentSession = useCallback(async () => {
    if (isVerifyingRef.current) return;
    isVerifyingRef.current = true;

    try {
      const saved = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!saved) {
        await initializeGuest();
        return;
      }

      const parsed: AuthSession = JSON.parse(saved);
      if (!parsed.token) {
        await initializeGuest();
        return;
      }

      // If already a guest session, no need to force refresh unless expired
      if (parsed.user.isGuest) {
        setSession(parsed);
        return;
      }

      // Verify authenticated user with backend
      const res = await apiClient.getCurrentUser();
      if (res && res.user) {
        const updatedSession: AuthSession = {
          ...parsed,
          user: res.user
        };
        setSession(updatedSession);
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedSession));
      } else {
        // Session invalid on server, switch to guest
        await initializeGuest();
      }
    } catch {
      // If token expired or network issue, revert gracefully to guest without blocking user
      await initializeGuest();
    } finally {
      isVerifyingRef.current = false;
    }
  }, [initializeGuest]);

  useEffect(() => {
    verifyCurrentSession();
  }, [verifyCurrentSession]);

  /**
   * Log in with Email and Password
   */
  const login = async (email: string, password: string): Promise<AuthSession> => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.login({ email, password });
      setSession(res);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(res));
      return res;
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register a new account
   */
  const register = async (payload: {
    name: string;
    email: string;
    password: string;
    confirmPassword?: string;
  }): Promise<AuthSession> => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.register({
        name: payload.name,
        email: payload.email,
        password: payload.password,
        confirmPassword: payload.confirmPassword
      });
      setSession(res);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(res));
      return res;
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Log out and seamlessly transition to guest session
   */
  const logout = async () => {
    try {
      await apiClient.logout();
    } catch {
      // non-blocking
    }
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setSession(null);
    await initializeGuest();
  };

  return {
    user: session?.user || null,
    session,
    isAuthenticated: Boolean(session?.user && !session.user.isGuest),
    isGuest: Boolean(!session?.user || session.user.isGuest),
    loading,
    error,
    login,
    register,
    logout,
    initializeGuest,
    refreshSession: verifyCurrentSession
  };
}
