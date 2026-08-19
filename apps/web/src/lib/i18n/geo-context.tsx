'use client';

import * as React from 'react';
import { type Locale, type TranslationKey, translate, LOCALES } from './translations';
import {
  LOCALE_PREFERENCE_COOKIE,
  COUNTRY_PREFERENCE_COOKIE,
  detectCountry,
  detectLocale,
  readCookie,
  writeCookie,
} from '@/lib/geo/detect';
import { countryByCode, countryName, WORLD_CODE, type Country } from '@/lib/geo/countries';

const STORAGE_KEY = 'axemap_locale';

export interface GeoContextValue {
  /** Idioma ativo. */
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
  locales: typeof LOCALES;
  /** País ativo (sugestão ou manual). */
  country: Country;
  setCountry: (code: string) => void;
  /** True quando o país veio de preferência manual persistida. */
  countryManual: boolean;
  /** True quando o idioma veio de preferência manual persistida. */
  localeManual: boolean;
  /** Idioma do navegador (para exibição de sugestão). */
  browserLanguage: string;
  /** Timezone do usuário. */
  timeZone: string;
  /** Formatação localizada de data/hora. */
  formatDate: (value: Date | string | number, opts?: Intl.DateTimeFormatOptions) => string;
  /** Formatação localizada de números. */
  formatNumber: (value: number, opts?: Intl.NumberFormatOptions) => string;
  /** Formatação localizada de moeda. */
  formatCurrency: (value: number, currency?: string) => string;
  /** Moeda sugerida pelo país ativo. */
  currency: string;
}

const GeoContext = React.createContext<GeoContextValue | null>(null);

function intlLocale(locale: Locale): string {
  return locale === 'yo' ? 'yo' : locale;
}

export function GeoProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>('pt-BR');
  const [country, setCountryState] = React.useState<Country>(countryByCode(WORLD_CODE));
  const [localeManual, setLocaleManual] = React.useState(false);
  const [countryManual, setCountryManual] = React.useState(false);
  const [browserLanguage, setBrowserLanguage] = React.useState('pt-BR');
  const [timeZone, setTimeZone] = React.useState('UTC');

  // Inicialização (client-only): detecta país + idioma na primeira visita.
  React.useEffect(() => {
    const prefLocale = readCookie(LOCALE_PREFERENCE_COOKIE);
    const prefCountry = readCookie(COUNTRY_PREFERENCE_COOKIE);
    const navLang = navigator.language ?? 'pt-BR';
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC';

    setBrowserLanguage(navLang);
    setTimeZone(tz);

    // País: 1. preferência manual → 2. request (cookie sugerido pelo middleware) → 3. timezone → 4. idioma → fallback
    const requestCountry =
      readCookie('axemap_country_suggest') ?? readCookie('x-country') ?? readCookie('axemap_country') ?? null;

    const detected = detectCountry({
      preference: prefCountry,
      requestCountry,
      timezone: tz,
      browserLanguage: navLang,
      // Fallback explícito: se não houver preferência nem detecção, Brasil é o default
      defaultCode: 'BR',
    });
    setCountryState(detected);
    setCountryManual(Boolean(prefCountry && countryByCode(prefCountry).code === prefCountry));

    // Idioma: 1. preferência → 2. manual (localStorage legado) → 3. browser → 4. país → fallback
    const legacy = (() => {
      try {
        return localStorage.getItem(STORAGE_KEY) as Locale | null;
      } catch {
        return null;
      }
    })();

    const detectedLocale = detectLocale({
      preference: prefLocale,
      manual: legacy && LOCALES.some((l) => l.id === legacy) ? legacy : null,
      browserLanguage: navLang,
      country: detected,
    });

    setLocaleState(detectedLocale);
    setLocaleManual(Boolean(prefLocale));
  }, []);

  const setLocale = React.useCallback((l: Locale) => {
    setLocaleState(l);
    setLocaleManual(true);
    try { localStorage.setItem(STORAGE_KEY, l); } catch { /* noop */ }
    writeCookie(LOCALE_PREFERENCE_COOKIE, l);
  }, []);

  const setCountry = React.useCallback((code: string) => {
    const c = countryByCode(code);
    setCountryState(c);
    setCountryManual(code !== WORLD_CODE);
    if (code === WORLD_CODE) {
      // Limpar preferência de país
      writeCookie(COUNTRY_PREFERENCE_COOKIE, WORLD_CODE);
    } else {
      writeCookie(COUNTRY_PREFERENCE_COOKIE, code);
    }
  }, []);

  const t = React.useCallback((key: TranslationKey) => translate(locale, key), [locale]);

  const formatDate = React.useCallback(
    (value: Date | string | number, opts?: Intl.DateTimeFormatOptions) => {
      const date = typeof value === 'string' || typeof value === 'number' ? new Date(value) : value;
      try {
        return new Intl.DateTimeFormat(intlLocale(locale), {
          timeZone,
          ...opts,
        }).format(date);
      } catch {
        return date.toLocaleString();
      }
    },
    [locale, timeZone],
  );

  const formatNumber = React.useCallback(
    (value: number, opts?: Intl.NumberFormatOptions) => {
      try {
        return new Intl.NumberFormat(intlLocale(locale), opts).format(value);
      } catch {
        return String(value);
      }
    },
    [locale],
  );

  const formatCurrency = React.useCallback(
    (value: number, currency?: string) => {
      const cur = currency || country.currency || 'BRL';
      try {
        return new Intl.NumberFormat(intlLocale(locale), {
          style: 'currency',
          currency: cur,
        }).format(value);
      } catch {
        return `${cur} ${value}`;
      }
    },
    [locale, country],
  );

  const value = React.useMemo<GeoContextValue>(
    () => ({
      locale,
      setLocale,
      t,
      locales: LOCALES,
      country,
      setCountry,
      countryManual,
      localeManual,
      browserLanguage,
      timeZone,
      formatDate,
      formatNumber,
      formatCurrency,
      currency: country.currency || 'BRL',
    }),
    [locale, setLocale, t, country, setCountry, countryManual, localeManual, browserLanguage, timeZone, formatDate, formatNumber, formatCurrency],
  );

  return <GeoContext.Provider value={value}>{children}</GeoContext.Provider>;
}

export function useGeo(): GeoContextValue {
  const ctx = React.useContext(GeoContext);
  if (!ctx) throw new Error('useGeo must be used inside GeoProvider');
  return ctx;
}

/** Nome do país no idioma ativo. */
export function useCountryName(): string {
  const { country, locale } = useGeo();
  return countryName(country, locale);
}