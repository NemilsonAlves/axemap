'use client';

import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { api } from '@/lib/api-client';

interface AnalyticsContextValue {
  track: (evento: string, metadata?: Record<string, unknown>) => void;
}

const AnalyticsContext = createContext<AnalyticsContextValue>({
  track: () => {},
});

function generateSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sid = sessionStorage.getItem('axemap_session');
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem('axemap_session', sid);
  }
  return sid;
}

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const sessaoId = useRef(generateSessionId());

  const track = (evento: string, metadata?: Record<string, unknown>) => {
    api.post('/analytics/track', {
      evento,
      sessaoId: sessaoId.current,
      metadata: metadata || {},
    }, token || undefined).catch(() => {});
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    track('pagina_visitada', { pathname: window.location.pathname, url: window.location.href });

    let prevPath = window.location.pathname;
    const observer = new MutationObserver(() => {
      const currentPath = window.location.pathname;
      if (currentPath !== prevPath) {
        prevPath = currentPath;
        track('pagina_visitada', { pathname: currentPath, url: window.location.href });
      }
    });
    observer.observe(document.querySelector('main') || document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return (
    <AnalyticsContext.Provider value={{ track }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  return useContext(AnalyticsContext);
}
