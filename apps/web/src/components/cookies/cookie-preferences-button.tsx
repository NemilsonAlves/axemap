'use client';

/**
 * CookiePreferencesButton — Botão para reabrir o painel de preferências de cookies.
 *
 * Pode ser usado no rodapé ou em qualquer local da UI.
 * Ao clicar, dispara o evento customizado `axemap:open-cookie-consent` que o
 * componente CookieConsent escuta para exibir o painel.
 */

import * as React from 'react';
import { Settings2 } from 'lucide-react';

interface CookiePreferencesButtonProps {
  className?: string;
  label?: string;
}

export function CookiePreferencesButton({
  className = '',
  label = 'Preferências de privacidade',
}: CookiePreferencesButtonProps) {
  const handleClick = React.useCallback(() => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent('axemap:open-cookie-consent'));
  }, []);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 text-xs text-muted-foreground underline-offset-2 hover:text-copper-strong hover:underline transition-colors ${className}`}
      aria-label="Abrir painel de preferências de privacidade e cookies"
    >
      <Settings2 className="size-3.5 shrink-0" aria-hidden="true" />
      {label}
    </button>
  );
}
