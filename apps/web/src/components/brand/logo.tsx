import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/cn';

/**
 * Marca AxéMap — imagem oficial (logo.png) usada como referência
 * da identidade visual. Proporções preservadas (quadrada, 1254x1254).
 * Substitui o grafismo SVG anterior, conforme Prompt 01 (AXÉMAP 2.2).
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[var(--surface-1)] ring-1 ring-border/60',
        className,
      )}
    >
      <Image
        src="/logo-mark.png"
        alt=""
        width={256}
        height={256}
        className="size-full object-contain"
        priority={false}
        draggable={false}
      />
    </span>
  );
}

export function Logo({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        'group inline-flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
        className,
      )}
      aria-label="AxéMap — o mapa vivo das tradições de matriz africana no Brasil"
    >
      <LogoMark className={cn('size-10 transition-transform duration-[var(--duration-base)] group-hover:scale-105', markClassName)} />
      <span className="flex flex-col leading-none">
        <span className="font-display text-xl font-extrabold tracking-tight">
          <span className="text-foreground">Axé</span>
          <span className="text-copper">Map</span>
          <span className="ml-1 text-base" aria-hidden="true">🇧🇷</span>
        </span>
        <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          Brasil · Ancestralidade
        </span>
      </span>
    </Link>
  );
}

export function LogoHero({ className }: { className?: string }) {
  return (
    <div className={cn('inline-flex items-center gap-5', className)}>
      <LogoMark className="size-20 rounded-3xl shadow-xl shadow-copper/30 ring-2 ring-copper/40 sm:size-24" />
      <div className="flex flex-col leading-none">
        <span className="font-display text-4xl font-extrabold tracking-tight text-ivory sm:text-5xl">
          <span className="text-brand-gradient">Axé</span>
          <span className="text-[var(--copper)]">Map</span>
          <span className="ml-2 text-3xl" aria-hidden="true">🇧🇷</span>
        </span>
        <span className="mt-2.5 text-[10px] font-bold uppercase tracking-[0.22em] text-ivory/60">
          Brasil&nbsp;·&nbsp;Memória&nbsp;·&nbsp;Ancestralidade&nbsp;·&nbsp;Conexão
        </span>
      </div>
    </div>
  );
}

/** Logo no rodapé — versão compacta horizontal */
export function LogoFooter({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn('group inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40', className)}
      aria-label="AxéMap — início"
    >
      <LogoMark className="size-8 rounded-xl" />
      <span className="font-display text-lg font-extrabold tracking-tight">
        <span className="text-foreground">Axé</span>
        <span className="text-copper">Map</span>
        <span className="ml-1 text-sm" aria-hidden="true">🇧🇷</span>
      </span>
    </Link>
  );
}

/** Logo monocromática — para fundo escuro */
export function LogoDark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn('group inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory/40', className)}
      aria-label="AxéMap — início"
    >
      <LogoMark className="size-9 rounded-2xl brightness-90" />
      <span className="font-display text-xl font-extrabold tracking-tight text-ivory">
        Axé<span className="text-copper">Map</span>
        <span className="ml-1 text-base" aria-hidden="true">🇧🇷</span>
      </span>
    </Link>
  );
}

/** Logo para fundo claro — monocromática */
export function LogoLight({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn('group inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40', className)}
      aria-label="AxéMap — início"
    >
      <LogoMark className="size-9 rounded-2xl" />
      <span className="font-display text-xl font-extrabold tracking-tight text-foreground">
        Axé<span className="text-copper">Map</span>
        <span className="ml-1 text-base" aria-hidden="true">🇧🇷</span>
      </span>
    </Link>
  );
}

/** Logo monocromática em escala de cinza (impressão, documentos) */
export function LogoMonochrome({ className, dark = false }: { className?: string; dark?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <LogoMark className={cn('size-8 rounded-xl grayscale', dark ? 'brightness-200' : 'brightness-75')} />
      <span
        className={cn('font-display text-lg font-extrabold tracking-tight', dark ? 'text-white' : 'text-gray-900')}
      >
        AxéMap
      </span>
    </span>
  );
}