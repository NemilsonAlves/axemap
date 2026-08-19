'use client';

import * as React from 'react';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * Bandeiras reais em SVG inline (sem biblioteca pesada), com proporção
 * 3:2 e `role="img"` + `aria-label` para acessibilidade.
 */

interface FlagProps {
  code: string;
  label: string;
  className?: string;
}

function BrazilFlag() {
  return (
    <svg viewBox="0 0 3 2" className="size-full" aria-hidden="true">
      <rect width="3" height="2" fill="#009C3B" />
      <polygon points="1.5,0.25 2.9,1 1.5,1.75 0.1,1" fill="#FFDF00" />
      <circle cx="1.5" cy="1" r="0.55" fill="#002776" />
      <path d="M1.5 0.82 a0.3 0.3 0 0 0 0 0.36 a0.34 0.34 0 0 0 0 -0.36 Z" fill="#fff" />
    </svg>
  );
}

function UsFlag() {
  const stripes = Array.from({ length: 13 });
  return (
    <svg viewBox="0 0 3 2" className="size-full" aria-hidden="true">
      {stripes.map((_, i) => (
        <rect key={i} y={i * (2 / 13)} width="3" height={2 / 13} fill={i % 2 === 0 ? '#B22234' : '#fff'} />
      ))}
      <rect width="1.25" height="1.077" fill="#3C3B6E" />
      {Array.from({ length: 9 }).map((_, r) =>
        Array.from({ length: 11 }).map((_, c) => {
          const top = r * 0.12 + 0.054;
          const left = (c * 1.25) / 11 + 0.057;
          const inRow = r % 2 === 0 ? c < 6 : c < 5;
          if (!inRow) return null;
          return <circle key={`${r}-${c}`} cx={left} cy={top} r="0.02" fill="#fff" />;
        }),
      )}
    </svg>
  );
}

function FranceFlag() {
  return (
    <svg viewBox="0 0 3 2" className="size-full" aria-hidden="true">
      <rect width="1" height="2" fill="#0055A4" />
      <rect x="1" width="1" height="2" fill="#fff" />
      <rect x="2" width="1" height="2" fill="#EF4135" />
    </svg>
  );
}

function PortugalFlag() {
  return (
    <svg viewBox="0 0 3 2" className="size-full" aria-hidden="true">
      <rect width="3" height="2" fill="#046A38" />
      <rect width="1.6" height="2" fill="#DA291C" />
      <circle cx="1.6" cy="1" r="0.55" fill="#FFE900" />
      <circle cx="1.6" cy="1" r="0.32" fill="#fff" />
      <circle cx="1.6" cy="1" r="0.18" fill="#DA291C" />
      <path d="M1.6 0.45 l0.1 0.08 l0.05 -0.12 l0.1 0.02 l-0.06 0.09 l0.12 0.02 l-0.11 0.06 l0.11 0.06 l-0.12 0.02 l0.06 0.09 l-0.1 0.02 l-0.1 0.08 l-0.1 -0.08 l-0.1 -0.02 l0.06 -0.09 l-0.12 -0.02 l0.11 -0.06 l-0.11 -0.06 l0.12 -0.02 l-0.06 -0.09 l0.1 -0.02 Z" fill="#DA291C" transform="translate(0,0.1) scale(1.6)" style={{ transformOrigin: '1.6px 0.5px' }} />
    </svg>
  );
}

function SpainFlag() {
  return (
    <svg viewBox="0 0 3 2" className="size-full" aria-hidden="true">
      <rect width="3" height="2" fill="#AA151B" />
      <rect y="0.5" width="3" height="1" fill="#F1BF00" />
      <rect x="1.32" y="0.55" width="0.36" height="0.9" fill="#AA151B" />
      <rect x="1.38" y="0.72" width="0.24" height="0.24" fill="#F1BF00" />
    </svg>
  );
}

function NigeriaFlag() {
  return (
    <svg viewBox="0 0 3 2" className="size-full" aria-hidden="true">
      <rect width="1" height="2" fill="#008751" />
      <rect x="1" width="1" height="2" fill="#fff" />
      <rect x="2" width="1" height="2" fill="#008751" />
    </svg>
  );
}

function GhanaFlag() {
  return (
    <svg viewBox="0 0 3 2" className="size-full" aria-hidden="true">
      <rect y="0" width="3" height={2 / 3} fill="#CE1126" />
      <rect y={2 / 3} width="3" height={2 / 3} fill="#006B3F" />
      <rect y={4 / 3} width="3" height={2 / 3} fill="#FCD116" />
      <polygon points="1.5,0.68 1.62,1.02 1.98,1.02 1.68,1.22 1.78,1.56 1.5,1.37 1.22,1.56 1.32,1.22 1.02,1.02 1.38,1.02" fill="#000" />
    </svg>
  );
}

function BeninFlag() {
  return (
    <svg viewBox="0 0 3 2" className="size-full" aria-hidden="true">
      <rect width="1" height="2" fill="#008751" />
      <rect x="1" y="0" width="2" height="1" fill="#FCD116" />
      <rect x="1" y="1" width="2" height="1" fill="#E8112D" />
    </svg>
  );
}

function SenegalFlag() {
  return (
    <svg viewBox="0 0 3 2" className="size-full" aria-hidden="true">
      <rect width="1" height="2" fill="#00853F" />
      <rect x="1" width="1" height="2" fill="#FDEF42" />
      <rect x="2" width="1" height="2" fill="#E31B23" />
      <polygon points="1.5,0.6 1.64,1.0 2.06,1.0 1.71,1.25 1.83,1.66 1.5,1.44 1.17,1.66 1.29,1.25 0.94,1.0 1.36,1.0" fill="#00853F" />
    </svg>
  );
}

function AngolaFlag() {
  return (
    <svg viewBox="0 0 3 2" className="size-full" aria-hidden="true">
      <rect y="0" width="3" height="1" fill="#CC092F" />
      <rect y="1" width="3" height="1" fill="#000" />
      <path d="M1.5 1.0 m-0.4 0 a0.4 0.4 0 0 0 0.8 0 Z" fill="#FFCB00" />
      <path d="M1.5 0.7 v0.6 l0.16 0.18 v-0.36 Z" fill="#000" />
      <rect x="1.44" y="0.66" width="0.12" height="0.14" fill="#FFCB00" />
    </svg>
  );
}

function MozambiqueFlag() {
  return (
    <svg viewBox="0 0 3 2" className="size-full" aria-hidden="true">
      <rect y="0" width="3" height={2 / 3} fill="#009739" />
      <rect y={2 / 3} width="3" height={2 / 3} fill="#000" />
      <rect y={4 / 3} width="3" height={2 / 3} fill="#FCEF09" />
      <rect y={2 / 3} width="3" height={1 / 6} fill="#fff" />
      <rect y="1.167" width="3" height={1 / 6} fill="#fff" />
      <polygon points="0,0 1.2,1 0,2" fill="#CF0921" />
      <polygon points="1.5,0.86 1.56,1.04 1.75,1.04 1.6,1.16 1.66,1.34 1.5,1.25 1.34,1.34 1.4,1.16 1.25,1.04 1.44,1.04" fill="#FCEF09" />
    </svg>
  );
}

function CubaFlag() {
  return (
    <svg viewBox="0 0 3 2" className="size-full" aria-hidden="true">
      <rect y="0" width="3" height={2 / 5} fill="#0051A8" />
      <rect y={2 / 5} width="3" height={2 / 5} fill="#fff" />
      <rect y={4 / 5} width="3" height={2 / 5} fill="#0051A8" />
      <rect y="1.2" width="3" height="0.4" fill="#fff" />
      <rect y="1.6" width="3" height="0.4" fill="#0051A8" />
      <polygon points="0,0 1.1,1 0,2" fill="#CF0921" />
      <polygon points="0.55,0.62 0.62,0.82 0.83,0.82 0.66,0.95 0.72,1.16 0.55,1.05 0.38,1.16 0.44,0.95 0.27,0.82 0.48,0.82" fill="#fff" />
    </svg>
  );
}

function HaitiFlag() {
  return (
    <svg viewBox="0 0 3 2" className="size-full" aria-hidden="true">
      <rect y="0" width="3" height="1" fill="#00209F" />
      <rect y="1" width="3" height="1" fill="#D21034" />
      <rect x="1.3" y="0.72" width="0.4" height="0.56" fill="#fff" />
      <rect x="1.4" y="0.85" width="0.2" height="0.3" fill="#00209F" />
    </svg>
  );
}

function JamaicaFlag() {
  return (
    <svg viewBox="0 0 3 2" className="size-full" aria-hidden="true">
      <rect width="3" height="2" fill="#FED100" />
      <polygon points="0,0 0.6,0 0,1.33" fill="#000" />
      <polygon points="3,0 2.4,0 3,1.33" fill="#000" />
      <polygon points="0,2 0.6,2 0,0.67" fill="#000" />
      <polygon points="3,2 2.4,2 3,0.67" fill="#000" />
      <polygon points="1.5,0 2.0,0 1.5,0.4" fill="#009B3A" />
      <polygon points="1.5,2 2.0,2 1.5,1.6" fill="#009B3A" />
      <polygon points="0,0.3 0,1.2 0.4,1.5" fill="#009B3A" />
      <polygon points="3,0.3 3,1.2 2.6,1.5" fill="#009B3A" />
    </svg>
  );
}

function CanadaFlag() {
  return (
    <svg viewBox="0 0 3 2" className="size-full" aria-hidden="true">
      <rect width="3" height="2" fill="#fff" />
      <rect x="0.9" width="1.2" height="2" fill="#D52B1E" />
      <path d="M1.5 0.3 l0.08 0.16 l0.18 -0.06 l-0.1 0.18 l0.18 0.06 l-0.2 0.06 l0.0 0.2 l-0.14 -0.12 l-0.14 0.12 l0.0 -0.2 l-0.2 -0.06 l0.18 -0.06 l-0.1 -0.18 l0.18 0.06 Z" fill="#D52B1E" />
    </svg>
  );
}

function UkFlag() {
  return (
    <svg viewBox="0 0 3 2" className="size-full" aria-hidden="true">
      <rect width="3" height="2" fill="#012169" />
      <path d="M0 0 L3 2 M3 0 L0 2" stroke="#fff" strokeWidth="0.4" />
      <path d="M0 0 L3 2 M3 0 L0 2" stroke="#C8102E" strokeWidth="0.22" />
      <path d="M0 1 H3 M1.5 0 V2" stroke="#fff" strokeWidth="0.4" />
      <path d="M0 1 H3 M1.5 0 V2" stroke="#C8102E" strokeWidth="0.22" />
    </svg>
  );
}

function WorldFlag() {
  return (
    <svg viewBox="0 0 3 2" className="size-full" aria-hidden="true">
      <rect width="3" height="2" fill="#0ea5e9" opacity="0.15" />
      <circle cx="1.5" cy="1" r="0.8" fill="none" stroke="currentColor" strokeWidth="0.14" />
      <ellipse cx="1.5" cy="1" rx="0.32" ry="0.8" fill="none" stroke="currentColor" strokeWidth="0.12" />
      <path d="M0.7 1 H2.3 M1.5 0.2 V1.8" stroke="currentColor" strokeWidth="0.12" fill="none" />
    </svg>
  );
}

const FLAG_MAP: Record<string, React.ComponentType> = {
  BR: BrazilFlag,
  US: UsFlag,
  CA: CanadaFlag,
  GB: UkFlag,
  FR: FranceFlag,
  PT: PortugalFlag,
  ES: SpainFlag,
  NG: NigeriaFlag,
  GH: GhanaFlag,
  BJ: BeninFlag,
  SN: SenegalFlag,
  AO: AngolaFlag,
  MZ: MozambiqueFlag,
  CU: CubaFlag,
  HT: HaitiFlag,
  JM: JamaicaFlag,
  WORLD: WorldFlag,
};

export function Flag({ code, label, className }: FlagProps) {
  const FlagIcon = FLAG_MAP[code];
  if (!FlagIcon) {
    return (
      <span
        role="img"
        aria-label={label}
        className={cn('inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[2px]', className)}
      >
        <Globe className="size-full p-[15%] text-muted-foreground" aria-hidden="true" />
      </span>
    );
  }
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[2px] ring-1 ring-border/50 shadow-[0_0_0_0.5px_rgba(0,0,0,0.08)]',
        className,
      )}
    >
      <FlagIcon />
    </span>
  );
}

/** Dimensões padrão para uso em listas/selectores. */
export function FlagSm({ code, label }: { code: string; label: string }) {
  return <Flag code={code} label={label} className="size-5" />;
}

export function FlagMd({ code, label }: { code: string; label: string }) {
  return <Flag code={code} label={label} className="size-6" />;
}