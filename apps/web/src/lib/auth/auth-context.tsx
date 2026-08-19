'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api-client';

const SESSION_COOKIE = 'axemap_auth';
const ROLE_COOKIE    = 'axemap_role';

function setSessionCookie(hasSession: boolean, role?: string) {
  if (typeof document === 'undefined') return;
  const secure = `; secure=${location.protocol === 'https:'}`;
  const maxAge7d = 60 * 60 * 24 * 7;

  // Session presence cookie
  const sessionValue = hasSession ? '1' : '';
  const sessionMaxAge = hasSession ? maxAge7d : 0;
  document.cookie = `${SESSION_COOKIE}=${sessionValue}; path=/; max-age=${sessionMaxAge}; samesite=lax${secure}`;

  // Role cookie — read by middleware to guard /admin routes.
  // Not a security boundary; the API guards remain authoritative.
  const roleValue = hasSession && role ? role : '';
  const roleMaxAge = hasSession && role ? maxAge7d : 0;
  document.cookie = `${ROLE_COOKIE}=${roleValue}; path=/; max-age=${roleMaxAge}; samesite=lax${secure}`;
}

interface User {
  id: string;
  email: string;
  nome: string;
  role: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  signup: (email: string, nome: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('axemap_auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setToken(parsed.accessToken);
        setSessionCookie(true);
        api
          .get<User>('/auth/me', parsed.accessToken)
          .then((u) => {
            setUser(u);
            setSessionCookie(true, u.role);
          })
          .catch(() => {
            localStorage.removeItem('axemap_auth');
            setSessionCookie(false);
          });
      } catch {
        localStorage.removeItem('axemap_auth');
        setSessionCookie(false);
      }
    }
    setLoading(false);

    const onSessionRefresh = () => {
      const current = localStorage.getItem('axemap_auth');
      if (!current) {
        setUser(null);
        setToken(null);
        setSessionCookie(false);
        return;
      }
      try {
        const parsed = JSON.parse(current);
        setToken(parsed.accessToken);
        setSessionCookie(true);
        if (parsed.user) setUser(parsed.user);
      } catch {}
    };
    window.addEventListener('axemap:session-refresh', onSessionRefresh);
    const onSessionExpired = () => {
      setUser(null);
      setToken(null);
      setSessionCookie(false);
    };
    window.addEventListener('axemap:session-expired', onSessionExpired);
    return () => {
      window.removeEventListener('axemap:session-refresh', onSessionRefresh);
      window.removeEventListener('axemap:session-expired', onSessionExpired);
    };
  }, []);

  const login = useCallback(async (email: string, senha: string) => {
    const res = await api.post<{ user: User; accessToken: string; refreshToken: string }>(
      '/auth/login',
      { email, senha },
    );
    setUser(res.user);
    setToken(res.accessToken);
    localStorage.setItem('axemap_auth', JSON.stringify(res));
    setSessionCookie(true, res.user.role);
  }, []);

  const signup = useCallback(async (email: string, nome: string, senha: string) => {
    const res = await api.post<{ user: User; accessToken: string; refreshToken: string }>(
      '/auth/signup',
      { email, nome, senha },
    );
    setUser(res.user);
    setToken(res.accessToken);
    localStorage.setItem('axemap_auth', JSON.stringify(res));
    setSessionCookie(true, res.user.role);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.delete('/auth/logout', token || undefined);
    } catch {}
    setUser(null);
    setToken(null);
    localStorage.removeItem('axemap_auth');
    setSessionCookie(false);
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
