'use client';

import * as React from 'react';
import { type Locale, type TranslationKey, translate, LOCALES } from './translations';

const STORAGE_KEY = 'axemap_locale';

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
  locales: typeof LOCALES;
}

const I18nContext = React.createContext<I18nContextValue | null>(null);

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'pt-BR';
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && ['pt-BR', 'pt-PT', 'en', 'es', 'yo'].includes(stored)) return stored;
    // Detecta idioma do browser
    const lang = navigator.language;
    if (lang.startsWith('pt-PT') || lang === 'pt') return 'pt-PT';
    if (lang.startsWith('pt')) return 'pt-BR';
    if (lang.startsWith('es')) return 'es';
    if (lang.startsWith('yo')) return 'yo';
    if (lang.startsWith('en')) return 'en';
  } catch { /* noop */ }
  return 'pt-BR';
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>('pt-BR');

  React.useEffect(() => {
    setLocaleState(getInitialLocale());
  }, []);

  const setLocale = React.useCallback((l: Locale) => {
    setLocaleState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch { /* noop */ }
  }, []);

  const t = React.useCallback((key: TranslationKey) => translate(locale, key), [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, locales: LOCALES }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = React.useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}
