'use client';

/**
 * ConsentScriptLoader — Carrega scripts de terceiros APENAS quando o consentimento
 * foi concedido para a categoria correspondente.
 *
 * Uso:
 *   <ConsentScriptLoader category="analytics" src="https://..." />
 *   <ConsentScriptLoader category="marketing" inline={`console.log('pixel')`} />
 *
 * Regras:
 *  - Sem consentimento → nenhum script é carregado.
 *  - Se o consentimento for revogado → o componente remove o script (se possível via estado React).
 *  - Categorias: 'analytics' | 'marketing' | 'preferencias'
 */

import * as React from 'react';
import { useConsent } from '@/lib/consent/consent-manager';
import type { ConsentCategory } from '@/lib/consent/consent-manager';

interface ConsentScriptLoaderProps {
  /** Categoria de consentimento necessária para este script ser carregado. */
  category: ConsentCategory;
  /** URL externa do script (src). Use `src` ou `inline`, não ambos. */
  src?: string;
  /** Conteúdo inline do script. Use `src` ou `inline`, não ambos. */
  inline?: string;
  /** Atributos extras para a tag <script>. */
  scriptProps?: React.ScriptHTMLAttributes<HTMLScriptElement>;
}

export function ConsentScriptLoader({
  category,
  src,
  inline,
  scriptProps,
}: ConsentScriptLoaderProps) {
  const { shouldLoad } = useConsent();
  const [loaded, setLoaded] = React.useState(false);
  const allowed = shouldLoad(category);

  React.useEffect(() => {
    if (!allowed) {
      setLoaded(false);
      return;
    }
    setLoaded(true);
  }, [allowed]);

  if (!loaded) return null;

  if (src) {
    return (
      <script
        src={src}
        async
        {...scriptProps}
      />
    );
  }

  if (inline) {
    return (
      <script
        dangerouslySetInnerHTML={{ __html: inline }}
        {...scriptProps}
      />
    );
  }

  return null;
}
