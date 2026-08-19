'use client';

import * as React from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { LogoMark } from '@/components/brand/logo';

const STORAGE_KEY = 'axemap_welcome_seen';

/**
 * HomeWelcomePopup
 *
 * Institutional first-visit popup — rich African visual identity.
 * - Shows only once per browser (localStorage flag).
 * - Accessible: ESC key, focus trap, aria-modal, role=dialog.
 * - Mobile-safe.
 */
export function HomeWelcomePopup() {
  const [visible, setVisible] = React.useState(false);
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const dialogRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      const t = setTimeout(() => setVisible(true), 900);
      return () => clearTimeout(t);
    }
  }, []);

  const close = React.useCallback(() => {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  }, []);

  // ESC to close
  React.useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [visible, close]);

  // Focus the close button on open
  React.useEffect(() => {
    if (visible) closeRef.current?.focus();
  }, [visible]);

  // Focus trap
  React.useEffect(() => {
    if (!visible) return;
    const el = dialogRef.current;
    if (!el) return;
    const focusable = el.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
      else            { if (document.activeElement === last)  { e.preventDefault(); first.focus(); } }
    };
    document.addEventListener('keydown', trap);
    return () => document.removeEventListener('keydown', trap);
  }, [visible]);

  if (!visible) return null;

  const values = [
    { emoji: '🗺️', label: 'Mapa gratuito e aberto',     color: 'hsl(var(--azul-atlantico))' },
    { emoji: '🏛️', label: 'Federações e instituições',  color: 'hsl(var(--roxo-ancestral))' },
    { emoji: '🔒', label: 'Privacidade das comunidades', color: 'hsl(var(--verde-floresta))' },
    { emoji: '🌱', label: 'Sem pagar para aparecer',     color: 'hsl(var(--acafrao))' },
  ];

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: 'hsl(var(--obsidiana-deep)/0.80)' }}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-titulo"
        aria-describedby="welcome-desc"
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl shadow-2xl"
        style={{ background: 'hsl(var(--obsidiana))' }}
      >
        {/* ── Rainbow kente stripe top ── */}
        <div
          className="h-1.5 w-full"
          style={{
            background: 'linear-gradient(90deg, hsl(var(--verde-floresta)), hsl(var(--acafrao)), hsl(var(--copper)), hsl(var(--terracota)), hsl(var(--roxo-ancestral)), hsl(var(--azul-atlantico)), hsl(var(--verde-floresta)))',
          }}
          aria-hidden="true"
        />

        {/* ── Background radial glow ── */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: [
              'radial-gradient(ellipse 500px 400px at 80% 0%, hsl(var(--copper)/0.18), transparent 55%)',
              'radial-gradient(ellipse 400px 300px at 10% 100%, hsl(var(--terracota)/0.15), transparent 55%)',
            ].join(', '),
          }}
          aria-hidden="true"
        />

        {/* ── Adinkra SVG watermark ── */}
        <svg
          className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 opacity-[0.04]"
          viewBox="0 0 200 200"
          aria-hidden="true"
        >
          <circle cx="100" cy="100" r="80" fill="none" stroke="hsl(var(--acafrao))" strokeWidth="4" />
          <circle cx="100" cy="100" r="50" fill="none" stroke="hsl(var(--copper))" strokeWidth="3" />
          <circle cx="100" cy="100" r="25" fill="none" stroke="hsl(var(--acafrao))" strokeWidth="2" />
          <line x1="20" y1="100" x2="180" y2="100" stroke="hsl(var(--copper))" strokeWidth="2" />
          <line x1="100" y1="20"  x2="100" y2="180" stroke="hsl(var(--copper))" strokeWidth="2" />
          <line x1="43"  y1="43"  x2="157" y2="157" stroke="hsl(var(--acafrao))" strokeWidth="1.5" />
          <line x1="157" y1="43"  x2="43"  y2="157" stroke="hsl(var(--acafrao))" strokeWidth="1.5" />
        </svg>

        <div className="relative p-6 sm:p-8">
          {/* Close button */}
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label="Fechar boas-vindas"
            className="absolute right-4 top-4 inline-flex size-8 items-center justify-center rounded-full text-[hsl(var(--marfim)/0.50)] transition hover:bg-white/10 hover:text-[hsl(var(--marfim))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--copper))]"
          >
            <X className="size-4" aria-hidden="true" />
          </button>

          {/* Logo + heading */}
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="relative">
              {/* Glow ring behind logo */}
              <div
                className="absolute -inset-2 rounded-3xl blur-xl opacity-60"
                style={{ background: 'radial-gradient(circle, hsl(var(--copper)/0.6), hsl(var(--acafrao)/0.3), transparent 70%)' }}
                aria-hidden="true"
              />
              <LogoMark className="relative size-16 rounded-3xl shadow-xl" aria-hidden="true" />
            </div>

            <div>
              <h2
                id="welcome-titulo"
                className="font-display text-2xl font-black tracking-tight sm:text-3xl"
                style={{ color: 'hsl(var(--marfim))' }}
              >
                Bem-vindo ao{' '}
                <span
                  style={{
                    background: 'linear-gradient(135deg, hsl(var(--acafrao)), hsl(var(--copper)))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  AxéMap
                </span>
              </h2>
              <p
                id="welcome-desc"
                className="mt-3 text-sm leading-relaxed sm:text-base"
                style={{ color: 'hsl(var(--marfim)/0.70)' }}
              >
                O mapa vivo das tradições africanas e afro-brasileiras.
                Explore comunidades, descubra tradições, conheça organizações —{' '}
                <strong style={{ color: 'hsl(var(--marfim))' }}>sempre de graça.</strong>
              </p>
            </div>
          </div>

          {/* Value grid */}
          <div className="mt-6 grid grid-cols-2 gap-2.5">
            {values.map(({ emoji, label, color }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 rounded-2xl p-3"
                style={{
                  background: 'hsl(var(--obsidiana-deep)/0.60)',
                  border: `1px solid ${color}30`,
                }}
              >
                <span className="text-xl" aria-hidden="true">{emoji}</span>
                <span className="text-xs font-semibold" style={{ color: 'hsl(var(--marfim)/0.90)' }}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="mt-6 flex flex-col gap-2.5">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href="/mapa"
                onClick={close}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black transition hover:brightness-110"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--acafrao)), hsl(var(--copper)))',
                  color: 'hsl(var(--obsidiana-deep))',
                  boxShadow: '0 4px 16px hsl(var(--copper)/0.40)',
                }}
              >
                Explorar o Mapa
              </Link>
              <Link
                href="/auth/cadastro"
                onClick={close}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-sm font-semibold transition hover:bg-white/10"
                style={{
                  borderColor: 'hsl(var(--acafrao)/0.40)',
                  color: 'hsl(var(--acafrao))',
                }}
              >
                Cadastrar minha casa — Grátis
              </Link>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href="/tv"
                onClick={close}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border px-5 py-2.5 text-sm font-semibold transition hover:bg-white/5"
                style={{
                  borderColor: 'hsl(var(--marfim)/0.15)',
                  color: 'hsl(var(--marfim)/0.60)',
                }}
              >
                Conhecer a TV AxéMap
              </Link>
              <button
                type="button"
                onClick={close}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border px-5 py-2.5 text-sm font-semibold transition hover:bg-white/5"
                style={{
                  borderColor: 'hsl(var(--marfim)/0.10)',
                  color: 'hsl(var(--marfim)/0.40)',
                }}
              >
                Continuar navegando
              </button>
            </div>
          </div>

          <p
            className="mt-4 text-center text-[11px]"
            style={{ color: 'hsl(var(--marfim)/0.35)' }}
          >
            O AxéMap é gratuito para a comunidade.{' '}
            <Link
              href="/apoie"
              onClick={close}
              className="underline underline-offset-2 hover:text-[hsl(var(--copper))]"
              style={{ color: 'hsl(var(--marfim)/0.45)' }}
            >
              Apoie para manter a plataforma viva.
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
