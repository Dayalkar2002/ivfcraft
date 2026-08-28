'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import type { AuthUser, LoginResponse } from '@/lib/types/auth';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(
    async (username: string, password: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch<LoginResponse>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ username, password }),
        });

        if (!res.token || !res.user) {
          throw new Error('Login response was incomplete.');
        }

        setToken(res.token);
        setUser(res.user);
        router.push('/dashboard');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Login failed.';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setError(null);
    router.push('/login');
  }, [router]);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(
    () => ({ user, token, loading, error, login, logout, clearError }),
    [user, token, loading, error, login, logout, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

export function useRequireAuth() {
  const auth = useAuth();
  return auth;
}
