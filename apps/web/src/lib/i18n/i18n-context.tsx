'use client';

/**
 * Camada de compatibilidade: o antigo I18nProvider agora é o GeoProvider,
 * que adiciona detecção de país, timezone e formatação localizada.
 *
 * `useI18n` continua expondo `{ locale, setLocale, t, locales }` para os
 * consumidores existentes, além dos campos de geo (país, timezone, formatos).
 */

export { GeoProvider as I18nProvider, useGeo as useI18n } from './geo-context';
export type { GeoContextValue as I18nContextValue } from './geo-context';
export { translate, TRANSLATIONS, LOCALES } from './translations';
export type { Locale, TranslationKey } from './translations';