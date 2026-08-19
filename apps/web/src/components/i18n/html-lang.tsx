'use client';

import * as React from 'react';
import { useI18n } from '@/lib/i18n/i18n-context';

/**
 * Sincroniza o atributo `lang` do <html> com o idioma ativo.
 * A definição inicial (SSR) fica com o provider; este componente
 * atualiza após a detecção client-side.
 */
export function HtmlLang() {
  const { locale } = useI18n();
  React.useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}