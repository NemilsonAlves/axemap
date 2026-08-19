'use client';

/**
 * CookieConsent — Banner de consentimento conforme LGPD (Lei 13.709/2018)
 * e boas práticas internacionais (GDPR-friendly).
 *
 * Categorias:
 *  - essenciais:   sempre ativados (sessão, autenticação, segurança)
 *  - analytics:    métricas anônimas de uso (Plausible/GA)
 *  - marketing:    AxéMap ADS (anúncios patrocinados identificados)
 *  - preferencias: idioma, tema, localização (localStorage)
 *
 * REGRA: consentimento de marketing nunca altera Trust Score ou verificação.
 *
 * Para reabrir o painel, dispare o evento `axemap:open-cookie-consent`:
 *   window.dispatchEvent(new CustomEvent('axemap:open-cookie-consent'))
 */

import * as React from 'react';
import Link from 'next/link';
import { X, ChevronDown, ChevronUp, ShieldCheck, ToggleLeft, ToggleRight } from 'lucide-react';
import {
  getStoredConsent,
  saveConsent,
  type ConsentCategory,
  type ConsentPreferences,
} from '@/lib/consent/consent-manager';

// Re-export types for backwards compatibility
export type { ConsentCategory, ConsentPreferences };
export { getStoredConsent as useCookieConsentStorage };

// ─── Legacy hook (kept for backwards compat) ─────────────────────────────────

export function useCookieConsent() {
  const [prefs, setPrefs] = React.useState<ConsentPreferences | null>(null);

  React.useEffect(() => {
    const stored = getStoredConsent();
    if (stored) {
      const { version: _v, savedAt: _s, ...p } = stored as any;
      setPrefs(p as ConsentPreferences);
    }
  }, []);

  const accept = React.useCallback((p: ConsentPreferences) => {
    saveConsent(p);
    setPrefs(p);
  }, []);

  return { prefs, accept };
}

// ─── Main component ──────────────────────────────────────────────────────────

export function CookieConsent() {
  const [visible, setVisible] = React.useState(false);
  const [showDetails, setShowDetails] = React.useState(false);
  const [draft, setDraft] = React.useState<ConsentPreferences>({
    essenciais: true,
    analytics: false,
    marketing: false,
    preferencias: true,
  });

  // Show banner only when no consent stored yet
  React.useEffect(() => {
    if (!getStoredConsent()) setVisible(true);
  }, []);

  // Listen for external "reopen" requests (e.g. from footer button)
  React.useEffect(() => {
    const handler = () => {
      const stored = getStoredConsent();
      if (stored) {
        const { version: _v, savedAt: _s, ...p } = stored as any;
        setDraft(p as ConsentPreferences);
        setShowDetails(true);
      }
      setVisible(true);
    };
    window.addEventListener('axemap:open-cookie-consent', handler);
    return () => window.removeEventListener('axemap:open-cookie-consent', handler);
  }, []);

  if (!visible) return null;

  function handleAcceptAll() {
    const p: ConsentPreferences = {
      essenciais: true,
      analytics: true,
      marketing: true,
      preferencias: true,
    };
    saveConsent(p);
    setVisible(false);
  }

  function handleRejectAll() {
    const p: ConsentPreferences = {
      essenciais: true,
      analytics: false,
      marketing: false,
      preferencias: false,
    };
    saveConsent(p);
    setVisible(false);
  }

  function handleSaveChoices() {
    saveConsent(draft);
    setVisible(false);
  }

  function toggle(cat: ConsentCategory) {
    setDraft((prev) => ({ ...prev, [cat]: !prev[cat] }));
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Configurações de cookies"
      className="fixed inset-x-0 bottom-0 z-[var(--z-modal)] px-4 pb-4 sm:px-6 sm:pb-6"
    >
      <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-background shadow-2xl ring-1 ring-black/5">
        {/* Top bar */}
        <div className="flex items-start justify-between gap-4 px-6 pt-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 shrink-0 text-verde-floresta" aria-hidden="true" />
            <h2 className="font-display text-base font-black leading-tight">
              Privacidade &amp; Cookies
            </h2>
          </div>
          <button
            onClick={handleRejectAll}
            aria-label="Recusar cookies opcionais e fechar"
            className="rounded-lg p-1 text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pt-3 pb-2">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Usamos cookies essenciais para o funcionamento do site. Cookies opcionais nos ajudam a
            melhorar a experiência e a exibir publicidade identificada como{' '}
            <strong className="font-semibold text-foreground">PATROCINADO</strong>. Conforme a{' '}
            <Link href="/privacidade" className="font-medium text-primary underline-offset-2 hover:underline">
              LGPD
            </Link>
            , você pode ajustar suas preferências a qualquer momento.{' '}
            <Link href="/cookies" className="font-medium text-primary underline-offset-2 hover:underline">
              Política de Cookies
            </Link>
            .
          </p>

          {/* Expandable details */}
          <button
            type="button"
            onClick={() => setShowDetails((v) => !v)}
            className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground underline-offset-2 hover:text-foreground"
            aria-expanded={showDetails}
          >
            {showDetails ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
            {showDetails ? 'Ocultar detalhes' : 'Personalizar preferências'}
          </button>

          {showDetails && (
            <div className="mt-4 space-y-3">
              <CategoryRow
                label="Essenciais"
                desc="Sessão, autenticação e segurança. Obrigatórios, não podem ser desativados."
                enabled
                locked
              />
              <CategoryRow
                label="Análise &amp; métricas"
                desc="Dados anônimos de visita (páginas, origem). Nenhum dado pessoal identificável."
                enabled={draft.analytics}
                onChange={() => toggle('analytics')}
              />
              <CategoryRow
                label="Publicidade (AxéMap ADS)"
                desc="Exibe anúncios PATROCINADOS relevantes. Nunca afeta Trust Score ou verificação."
                enabled={draft.marketing}
                onChange={() => toggle('marketing')}
              />
              <CategoryRow
                label="Preferências"
                desc="Salva idioma, tema e localização preferidos no dispositivo."
                enabled={draft.preferencias}
                onChange={() => toggle('preferencias')}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border/60 px-6 py-4">
          <button
            type="button"
            onClick={handleRejectAll}
            className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            Recusar opcionais
          </button>

          {showDetails && (
            <button
              type="button"
              onClick={handleSaveChoices}
              className="rounded-xl border border-border px-4 py-2 text-xs font-semibold transition hover:bg-accent"
            >
              Salvar escolhas
            </button>
          )}

          <button
            type="button"
            onClick={handleAcceptAll}
            className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            Aceitar todos
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CategoryRow sub-component ───────────────────────────────────────────────

interface CategoryRowProps {
  label: string;
  desc: string;
  enabled: boolean;
  locked?: boolean;
  onChange?: () => void;
}

function CategoryRow({ label, desc, enabled, locked, onChange }: CategoryRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-muted/30 px-4 py-3">
      <div className="flex-1">
        <p
          className="text-sm font-semibold text-foreground"
          dangerouslySetInnerHTML={{ __html: label }}
        />
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{desc}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={`Toggle ${label}`}
        disabled={locked}
        onClick={onChange}
        className="mt-0.5 shrink-0 disabled:cursor-default"
      >
        {enabled ? (
          <ToggleRight
            className={`size-7 ${locked ? 'text-muted-foreground/50' : 'text-verde-floresta'}`}
            aria-hidden="true"
          />
        ) : (
          <ToggleLeft className="size-7 text-muted-foreground/40" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
