/**
 * AxéMap — Detecção de país e idioma (FASE 02/03/04/09/10)
 *
 * PAÍS e IDIOMA são conceitos INDEPENDENTES:
 *  - país detectado é uma SUGESTÃO;
 *  - idioma nunca é forçado por país.
 *
 * Prioridade do IDIOMA:
 *   1. preferência manual salva (cookie)
 *   2. idioma selecionado manualmente na sessão
 *   3. idioma do navegador (navigator.language)
 *   4. idioma associado ao país detectado
 *   5. fallback pt-BR
 *
 * Prioridade do PAÍS:
 *   1. preferência manual (cookie/localStorage)
 *   2. país detectado pelo request/middleware (header)
 *   3. país inferido por timezone/idioma do navegador
 *   4. fallback explícito via defaultCode (padrão do produto: 'BR')
 *   5. último recurso: WORLD
 */

import { type Locale, LOCALES } from '@/lib/i18n/translations';
import {
  COUNTRIES,
  countryByCode,
  countryName,
  WORLD_CODE,
  type Country,
} from './countries';

/** Cookie de preferência persistente. */
export const LOCALE_PREFERENCE_COOKIE = 'locale_preference';
export const COUNTRY_PREFERENCE_COOKIE = 'country_preference';

const LOCALE_IDS = LOCALES.map((l) => l.id) as string[];

/* ──────────────────────────────────────────────────────────────
 * Mapeamento navegador → locale
 * ────────────────────────────────────────────────────────────── */

export function localeFromBrowserLanguage(lang?: string): Locale {
  const l = (lang ?? '').toLowerCase();
  if (l.startsWith('pt-pt') || l === 'pt') return 'pt-PT';
  if (l.startsWith('pt')) return 'pt-BR';
  if (l.startsWith('es')) return 'es';
  if (l.startsWith('yo')) return 'yo';
  if (l.startsWith('fr')) return 'fr';
  if (l.startsWith('en')) return 'en';
  return 'pt-BR';
}

/* ──────────────────────────────────────────────────────────────
 * Detecção de país
 * ────────────────────────────────────────────────────────────── */

function countryFromTimezone(tz?: string): Country | null {
  const t = (tz ?? '').toLowerCase();
  const map: Array<[string, string]> = [
    ['america/sao_paulo', 'BR'],
    ['america/fortaleza', 'BR'],
    ['america/rio_branco', 'BR'],
    ['america/new_york', 'US'],
    ['america/los_angeles', 'US'],
    ['america/chicago', 'US'],
    ['america/toronto', 'CA'],
    ['america/vancouver', 'CA'],
    ['europe/london', 'GB'],
    ['europe/paris', 'FR'],
    ['europe/lisbon', 'PT'],
    ['europe/madrid', 'ES'],
    ['africa/lagos', 'NG'],
    ['africa/accra', 'GH'],
    ['africa/porto-novo', 'BJ'],
    ['africa/dakar', 'SN'],
    ['africa/luanda', 'AO'],
    ['africa/maputo', 'MZ'],
    ['america/havana', 'CU'],
    ['america/port-au-prince', 'HT'],
    ['america/jamaica', 'JM'],
  ];
  for (const [zone, code] of map) {
    if (t.startsWith(zone)) return countryByCode(code);
  }
  return null;
}

function countryFromLocale(locale: Locale): Country | null {
  const suggested = COUNTRIES.find((c) => c.suggestedLocales[0] === locale);
  return suggested ?? null;
}

/**
 * Detecta o país provável. A prioridade:
 *   1. preferência manual (cookie) — nunca muda sozinha;
 *   2. país do request (header do middleware);
 *   3. país inferido por timezone do navegador;
 *   4. país inferido por idioma do navegador;
 *   5. fallback WORLD.
 */
export function detectCountry(opts: {
  preference?: string | null;
  requestCountry?: string | null;
  timezone?: string | null;
  browserLanguage?: string | null;
  /** Código de país fallback quando nenhuma detecção funcionar. Padrão: 'BR'. */
  defaultCode?: string;
}): Country {
  // 1. Preferência manual
  if (opts.preference && opts.preference !== WORLD_CODE) {
    const c = countryByCode(opts.preference);
    if (c.code === opts.preference) return c;
  }
  // 2. País do request (header do middleware / cookie)
  if (opts.requestCountry && opts.requestCountry !== WORLD_CODE) {
    const c = countryByCode(opts.requestCountry);
    if (c.code === opts.requestCountry) return c;
  }
  // 3. Timezone do navegador
  const fromTz = countryFromTimezone(opts.timezone ?? undefined);
  if (fromTz) return fromTz;
  // 4. Idioma do navegador
  if (opts.browserLanguage) {
    const locale = localeFromBrowserLanguage(opts.browserLanguage);
    const fromLocale = countryFromLocale(locale);
    if (fromLocale) return fromLocale;
  }
  // 5. Fallback explícito (padrão: Brasil — produto centrado no Brasil)
  const fallback = opts.defaultCode ?? 'BR';
  const fallbackCountry = countryByCode(fallback);
  if (fallbackCountry.code === fallback) return fallbackCountry;
  // 6. Último recurso: WORLD
  return countryByCode(WORLD_CODE);
}

/* ──────────────────────────────────────────────────────────────
 * Detecção de idioma
 * ────────────────────────────────────────────────────────────── */

export interface DetectLocaleInput {
  preference?: string | null;
  /** Idioma escolhido manualmente na sessão (fora de cookie). */
  manual?: Locale | null;
  browserLanguage?: string | null;
  country?: Country;
}

/**
 * Detecta o idioma provável. A prioridade:
 *   1. preferência manual persistida (cookie) — vence SEMPRE;
 *   2. seleção manual da sessão;
 *   3. idioma do navegador;
 *   4. idioma sugerido pelo país;
 *   5. fallback pt-BR.
 */
export function detectLocale(input: DetectLocaleInput): Locale {
  // 1. Preferência manual persistida
  if (input.preference && LOCALE_IDS.includes(input.preference)) {
    return input.preference as Locale;
  }
  // 2. Seleção manual da sessão
  if (input.manual && LOCALE_IDS.includes(input.manual)) {
    return input.manual;
  }
  // 3. Idioma do navegador
  const browserLocale = localeFromBrowserLanguage(input.browserLanguage ?? undefined);
  if (input.browserLanguage) return browserLocale;
  // 4. Idioma sugerido pelo país detectado
  if (input.country && input.country.suggestedLocales.length > 0) {
    return input.country.suggestedLocales[0];
  }
  // 5. Fallback
  return 'pt-BR';
}

/* ──────────────────────────────────────────────────────────────
 * Utilidades de leitura/escrita de cookie (client-side)
 * ────────────────────────────────────────────────────────────── */

export function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

export function writeCookie(name: string, value: string, days = 365): void {
  if (typeof document === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

export function countryLabel(country: Country, locale: Locale): string {
  return countryName(country, locale);
}