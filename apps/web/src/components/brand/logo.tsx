import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';

/**
 * Marca AxéMap — grafismo geométrico inspirado em formas orgânicas
 * e fibra, sem uso de símbolos religiosos.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('relative inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-gradient shadow-md shadow-copper/25', className)}
    >
      <svg viewBox="0 0 32 32" fill="none" className="size-5">
        <path
          d="M16 5 C 21 9, 27 13, 26 21 C 25.4 25.5, 21 27, 16 27 C 11 27, 6.6 25.5, 6 21 C 5 13, 11 9, 16 5 Z"
          fill="rgba(255,255,255,0.96)"
        />
        <path
          d="M16 11 C 18 12.8, 21 14.6, 20.4 18 C 20 20, 18.2 21, 16 21 C 13.8 21, 12 20, 11.6 18 C 11 14.6, 14 12.8, 16 11 Z"
          fill="hsl(18 66% 40%)"
        />
      </svg>
    </span>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn('group inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40', className)}
      aria-label="AxéMap — página inicial"
    >
      <LogoMark />
      <span className="font-display text-lg font-bold tracking-tight text-foreground">
        Axé<span className="text-copper-strong">Map</span>
      </span>
    </Link>
  );
}