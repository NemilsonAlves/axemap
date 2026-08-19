/**
 * consent-manager.ts — AxéMap Consent Manager
 *
 * Centraliza leitura/escrita de preferências de consentimento e
 * fornece helpers reativos para o sistema de carregamento de trackers.
 *
 * Regra: consentimento de marketing NUNCA altera Trust Score ou verificação.
 */

export type ConsentCategory = 'analytics' | 'marketing' | 'preferencias';

export interface ConsentPreferences {
  essenciais: true;
  analytics: boolean;
  marketing: boolean;
  preferencias: boolean;
}

export interface StoredConsent extends ConsentPreferences {
  version: string;
  savedAt: number; // Date.now()
}

export const CONSENT_KEY = 'axemap:cookie-consent';
export const CONSENT_VERSION = '1';

// ─── Listeners (pub/sub simples) ─────────────────────────────────────────────

type ConsentListener = (prefs: ConsentPreferences | null) => void;

const listeners = new Set<ConsentListener>();

/** Emite um evento de mudança de consentimento para todos os ouvintes registrados. */
function emit(prefs: ConsentPreferences | null) {
  listeners.forEach((fn) => {
    try {
      fn(prefs);
    } catch {}
  });
}

// ─── Leitura / Escrita ────────────────────────────────────────────────────────

/** Lê as preferências armazenadas. Retorna null se não houver consentimento ou versão diferente. */
export function getStoredConsent(): StoredConsent | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed: StoredConsent = JSON.parse(raw);
    if (parsed?.version !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Persiste as preferências e notifica os ouvintes. */
export function saveConsent(prefs: ConsentPreferences): void {
  if (typeof window === 'undefined') return;
  const stored: StoredConsent = {
    ...prefs,
    version: CONSENT_VERSION,
    savedAt: Date.now(),
  };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(stored));
  emit(prefs);
}

/** Remove as preferências armazenadas e notifica ouvintes (revogação). */
export function revokeConsent(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CONSENT_KEY);
  emit(null);
}

// ─── Helper ──────────────────────────────────────────────────────────────────

/**
 * Retorna `true` apenas quando o consentimento para a categoria informada foi
 * explicitamente concedido. Por padrão (sem consentimento salvo) retorna `false`
 * para qualquer categoria não-essencial.
 */
export function shouldLoad(category: ConsentCategory): boolean {
  const stored = getStoredConsent();
  if (!stored) return false;
  return stored[category] === true;
}

// ─── Evento reativo ──────────────────────────────────────────────────────────

/**
 * Registra um ouvinte que será chamado toda vez que o consentimento mudar.
 * Retorna uma função de remoção.
 */
export function onConsentChange(fn: ConsentListener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// ─── Hook React ──────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';

export function useConsent() {
  const [prefs, setPrefs] = useState<ConsentPreferences | null>(() => {
    if (typeof window === 'undefined') return null;
    const s = getStoredConsent();
    if (!s) return null;
    const { version: _v, savedAt: _s, ...p } = s;
    return p as ConsentPreferences;
  });

  useEffect(() => {
    const unsubscribe = onConsentChange(setPrefs);
    // Sincroniza caso outra aba tenha alterado o consentimento
    const onStorage = (e: StorageEvent) => {
      if (e.key === CONSENT_KEY) {
        const s = getStoredConsent();
        if (!s) {
          setPrefs(null);
        } else {
          const { version: _v, savedAt: _sa, ...p } = s;
          setPrefs(p as ConsentPreferences);
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => {
      unsubscribe();
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return {
    prefs,
    shouldLoad,
    saveConsent,
    revokeConsent,
  };
}
