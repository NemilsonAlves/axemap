const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const AUTH_KEY = 'axemap_auth';

interface StoredAuth {
  accessToken: string;
  refreshToken: string;
  user?: unknown;
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  token?: string;
  skipAuthRefresh?: boolean;
}

function getStoredAuth(): StoredAuth | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(AUTH_KEY);
    return stored ? (JSON.parse(stored) as StoredAuth) : null;
  } catch {
    return null;
  }
}

function persistAuth(auth: StoredAuth) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
}

function clearAuth() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_KEY);
  window.dispatchEvent(new CustomEvent('axemap:session-expired'));
}

let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshSession(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    const stored = getStoredAuth();
    if (!stored?.refreshToken) return false;
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: stored.refreshToken }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      const accessToken = data.accessToken ?? data.access_token;
      const refreshToken = data.refreshToken ?? data.refresh_token ?? stored.refreshToken;
      if (!accessToken) return false;
      persistAuth({ accessToken, refreshToken, user: stored.user });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('axemap:session-refresh'));
      }
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

function getStoredToken(): string | undefined {
  return getStoredAuth()?.accessToken;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, token, skipAuthRefresh = false } = options;
  const authToken = token ?? getStoredToken();

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  };

  const response = await fetch(`${API_URL}/api/v1${path}`, config);

  if (response.status === 401 && !skipAuthRefresh) {
    const ok = await tryRefreshSession();
    if (ok) {
      return request<T>(path, { ...options, skipAuthRefresh: true });
    }
    clearAuth();
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro na requisição' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  if (response.status === 204) return undefined as T;

  return response.json();
}

export const api = {
  get: <T>(path: string, token?: string) => request<T>(path, { token }),
  post: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, { method: 'POST', body, token }),
  put: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, { method: 'PUT', body, token }),
  patch: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, { method: 'PATCH', body, token }),
  delete: <T>(path: string, token?: string) =>
    request<T>(path, { method: 'DELETE', token }),
};
