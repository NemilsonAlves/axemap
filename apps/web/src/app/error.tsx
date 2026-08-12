'use client';

import Link from 'next/link';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="container-page flex min-h-[60vh] items-center justify-center py-16 text-center">
      <div className="max-w-lg rounded-3xl border border-destructive/30 bg-card p-8 shadow-sm sm:p-12">
        <AlertTriangle className="mx-auto size-12 text-destructive" aria-hidden="true" />
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-destructive">Algo saiu do caminho</p>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Não foi possível abrir esta página.
        </h1>
        <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
          Tente novamente. Se o problema continuar, volte ao início e navegue por outra rota.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={reset} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 text-sm font-bold text-white shadow-md shadow-copper/20 transition hover:brightness-105">
            <RotateCcw className="size-4" aria-hidden="true" />
            Tentar novamente
          </button>
          <Link href="/" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 text-sm font-bold text-foreground transition hover:border-copper/40 hover:text-copper-strong">
            <Home className="size-4" aria-hidden="true" />
            Ir para o início
          </Link>
        </div>
      </div>
    </section>
  );
}
