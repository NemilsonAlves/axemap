/**
 * AxéMap — Catálogo de países (globalização)
 *
 * País e idioma são conceitos independentes. Cada país indica apenas
 * idiomas SUGERIDOS (nunca obrigatórios). A detecção respeita:
 *   1. preferência manual → 2. cookie → 3. browser → 4. request → 5. fallback.
 *
 * As bandeiras são SVG inline (sem biblioteca pesada), com `role="img"`
 * e `aria-label` para acessibilidade.
 */

import type { Locale } from '@/lib/i18n/translations';

export type Continent =
  | 'africa'
  | 'america-sul'
  | 'america-norte'
  | 'caribe'
  | 'europa'
  | 'asia'
  | 'oceania'
  | 'mundo';

export interface Country {
  code: string;
  /** Nome exibido conforme o idioma ativo da interface. */
  names: Partial<Record<Locale, string>>;
  continent: Continent;
  /** Região usada para priorização (diáspora relacionada). */
  region: string;
  /** Idiomas sugeridos em ordem de prioridade. */
  suggestedLocales: Locale[];
  /** Moeda representativa (exibição localizada). */
  currency: string;
  /** Timezone representativa (exibição local). */
  timezone: string;
  /** Idioma do rótulo acessível da bandeira. */
  flagLabel: string;
}

/** Fallback global — país não detectado. */
export const WORLD_CODE = 'WORLD';

export const COUNTRIES: Country[] = [
  {
    code: 'BR',
    names: { 'pt-BR': 'Brasil', 'pt-PT': 'Brasil', en: 'Brazil', es: 'Brasil', fr: 'Brésil', yo: 'Brasili' },
    continent: 'america-sul',
    region: 'América do Sul',
    suggestedLocales: ['pt-BR'],
    currency: 'BRL',
    timezone: 'America/Sao_Paulo',
    flagLabel: 'Brasil',
  },
  {
    code: 'US',
    names: { 'pt-BR': 'Estados Unidos', 'pt-PT': 'Estados Unidos', en: 'United States', es: 'Estados Unidos', fr: 'États-Unis', yo: 'Amẹ́ríkà' },
    continent: 'america-norte',
    region: 'América do Norte',
    suggestedLocales: ['en'],
    currency: 'USD',
    timezone: 'America/New_York',
    flagLabel: 'United States',
  },
  {
    code: 'CA',
    names: { 'pt-BR': 'Canadá', 'pt-PT': 'Canadá', en: 'Canada', es: 'Canadá', fr: 'Canada', yo: 'Kánádà' },
    continent: 'america-norte',
    region: 'América do Norte',
    suggestedLocales: ['en', 'fr'],
    currency: 'CAD',
    timezone: 'America/Toronto',
    flagLabel: 'Canada',
  },
  {
    code: 'GB',
    names: { 'pt-BR': 'Reino Unido', 'pt-PT': 'Reino Unido', en: 'United Kingdom', es: 'Reino Unido', fr: 'Royaume-Uni', yo: 'Ìlú Gẹ̀ẹ́sì' },
    continent: 'europa',
    region: 'Europa',
    suggestedLocales: ['en'],
    currency: 'GBP',
    timezone: 'Europe/London',
    flagLabel: 'United Kingdom',
  },
  {
    code: 'FR',
    names: { 'pt-BR': 'França', 'pt-PT': 'França', en: 'France', es: 'Francia', fr: 'France', yo: 'Faranse' },
    continent: 'europa',
    region: 'Europa',
    suggestedLocales: ['fr'],
    currency: 'EUR',
    timezone: 'Europe/Paris',
    flagLabel: 'France',
  },
  {
    code: 'PT',
    names: { 'pt-BR': 'Portugal', 'pt-PT': 'Portugal', en: 'Portugal', es: 'Portugal', fr: 'Portugal', yo: 'Pọ́túgàl' },
    continent: 'europa',
    region: 'Europa',
    suggestedLocales: ['pt-PT'],
    currency: 'EUR',
    timezone: 'Europe/Lisbon',
    flagLabel: 'Portugal',
  },
  {
    code: 'ES',
    names: { 'pt-BR': 'Espanha', 'pt-PT': 'Espanha', en: 'Spain', es: 'España', fr: 'Espagne', yo: 'Sípéìnì' },
    continent: 'europa',
    region: 'Europa',
    suggestedLocales: ['es'],
    currency: 'EUR',
    timezone: 'Europe/Madrid',
    flagLabel: 'España',
  },
  {
    code: 'NG',
    names: { 'pt-BR': 'Nigéria', 'pt-PT': 'Nigéria', en: 'Nigeria', es: 'Nigeria', fr: 'Nigéria', yo: 'Nàìjíríà' },
    continent: 'africa',
    region: 'África Ocidental',
    suggestedLocales: ['en', 'yo'],
    currency: 'NGN',
    timezone: 'Africa/Lagos',
    flagLabel: 'Nigeria',
  },
  {
    code: 'GH',
    names: { 'pt-BR': 'Gana', 'pt-PT': 'Gana', en: 'Ghana', es: 'Ghana', fr: 'Ghana', yo: 'Gánà' },
    continent: 'africa',
    region: 'África Ocidental',
    suggestedLocales: ['en'],
    currency: 'GHS',
    timezone: 'Africa/Accra',
    flagLabel: 'Ghana',
  },
  {
    code: 'BJ',
    names: { 'pt-BR': 'Benim', 'pt-PT': 'Benim', en: 'Benin', es: 'Benín', fr: 'Bénin', yo: 'Bẹ̀nẹ̀' },
    continent: 'africa',
    region: 'África Ocidental',
    suggestedLocales: ['fr', 'yo'],
    currency: 'XOF',
    timezone: 'Africa/Porto-Novo',
    flagLabel: 'Benin',
  },
  {
    code: 'SN',
    names: { 'pt-BR': 'Senegal', 'pt-PT': 'Senegal', en: 'Senegal', es: 'Senegal', fr: 'Sénégal', yo: 'Sẹ́nẹ̀gàl' },
    continent: 'africa',
    region: 'África Ocidental',
    suggestedLocales: ['fr'],
    currency: 'XOF',
    timezone: 'Africa/Dakar',
    flagLabel: 'Sénégal',
  },
  {
    code: 'AO',
    names: { 'pt-BR': 'Angola', 'pt-PT': 'Angola', en: 'Angola', es: 'Angola', fr: 'Angola', yo: 'Àngólà' },
    continent: 'africa',
    region: 'África Central',
    suggestedLocales: ['pt-PT'],
    currency: 'AOA',
    timezone: 'Africa/Luanda',
    flagLabel: 'Angola',
  },
  {
    code: 'MZ',
    names: { 'pt-BR': 'Moçambique', 'pt-PT': 'Moçambique', en: 'Mozambique', es: 'Mozambique', fr: 'Mozambique', yo: 'Mòsámbíìkì' },
    continent: 'africa',
    region: 'África Oriental',
    suggestedLocales: ['pt-PT'],
    currency: 'MZN',
    timezone: 'Africa/Maputo',
    flagLabel: 'Moçambique',
  },
  {
    code: 'CU',
    names: { 'pt-BR': 'Cuba', 'pt-PT': 'Cuba', en: 'Cuba', es: 'Cuba', fr: 'Cuba', yo: 'Kúbà' },
    continent: 'caribe',
    region: 'Caribe',
    suggestedLocales: ['es'],
    currency: 'CUP',
    timezone: 'America/Havana',
    flagLabel: 'Cuba',
  },
  {
    code: 'HT',
    names: { 'pt-BR': 'Haiti', 'pt-PT': 'Haiti', en: 'Haiti', es: 'Haití', fr: 'Haïti', yo: 'Háítì' },
    continent: 'caribe',
    region: 'Caribe',
    suggestedLocales: ['fr'],
    currency: 'HTG',
    timezone: 'America/Port-au-Prince',
    flagLabel: 'Haïti',
  },
  {
    code: 'JM',
    names: { 'pt-BR': 'Jamaica', 'pt-PT': 'Jamaica', en: 'Jamaica', es: 'Jamaica', fr: 'Jamaïque', yo: 'Jámáíkà' },
    continent: 'caribe',
    region: 'Caribe',
    suggestedLocales: ['en'],
    currency: 'JMD',
    timezone: 'America/Jamaica',
    flagLabel: 'Jamaica',
  },
];

/** País fallback (Mundo) quando não há detecção. */
export const WORLD: Country = {
  code: WORLD_CODE,
  names: { 'pt-BR': 'Mundo', 'pt-PT': 'Mundo', en: 'World', es: 'Mundo', fr: 'Monde', yo: 'Àgbáyé' },
  continent: 'mundo',
  region: 'Global',
  suggestedLocales: [],
  currency: '',
  timezone: 'UTC',
  flagLabel: 'World',
};

export function countryByCode(code: string): Country {
  return COUNTRIES.find((c) => c.code === code) ?? WORLD;
}

export function countryName(country: Country, locale: Locale): string {
  return country.names[locale] ?? country.names['en'] ?? country.names['pt-BR'] ?? country.code;
}

/** Moeda por país (para formatação localizada). */
export function currencyOf(countryCode: string): string {
  return countryByCode(countryCode).currency;
}

/** Timezone por país (para exibição local). */
export function timezoneOf(countryCode: string): string {
  return countryByCode(countryCode).timezone;
}