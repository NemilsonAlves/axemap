'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api-client';

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
        api.get<User>('/auth/me', parsed.accessToken)
          .then(setUser)
          .catch(() => { localStorage.removeItem('axemap_auth'); });
      } catch {
        localStorage.removeItem('axemap_auth');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, senha: string) => {
    const res = await api.post<{ user: User; accessToken: string; refreshToken: string }>(
      '/auth/login', { email, senha },
    );
    setUser(res.user);
    setToken(res.accessToken);
    localStorage.setItem('axemap_auth', JSON.stringify(res));
  }, []);

  const signup = useCallback(async (email: string, nome: string, senha: string) => {
    const res = await api.post<{ user: User; accessToken: string; refreshToken: string }>(
      '/auth/signup', { email, nome, senha },
    );
    setUser(res.user);
    setToken(res.accessToken);
    localStorage.setItem('axemap_auth', JSON.stringify(res));
  }, []);

  const logout = useCallback(async () => {
    try { await api.delete('/auth/logout', token || undefined); } catch {}
    setUser(null);
    setToken(null);
    localStorage.removeItem('axemap_auth');
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
