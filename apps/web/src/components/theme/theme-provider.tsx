'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  resolved: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'axemap-theme';

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(resolved: 'light' | 'dark') {
  const root = document.documentElement;
  root.classList.toggle('dark', resolved === 'dark');
  root.style.colorScheme = resolved;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolved, setResolved] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as Theme) || 'system';
    setThemeState(stored);
    const initial = stored === 'system' ? getSystemTheme() : stored;
    setResolved(initial);
    applyTheme(initial);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => {
      /* reage a mudanças do sistema apenas no modo "system" */
      const stored = (localStorage.getItem(STORAGE_KEY) as Theme) || 'system';
      if (stored === 'system') {
        const r = e.matches ? 'dark' : 'light';
        setResolved(r);
        applyTheme(r);
      }
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  function setTheme(next: Theme) {
    setThemeState(next);
    localStorage.setItem(STORAGE_KEY, next);
    const r = next === 'system' ? getSystemTheme() : next;
    setResolved(r);
    applyTheme(r);
  }

  function toggle() {
    setTheme(resolved === 'dark' ? 'light' : 'dark');
  }

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme deve ser usado dentro de <ThemeProvider>');
  return ctx;
}