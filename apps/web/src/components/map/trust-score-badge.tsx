'use client';

import { cn } from '@/lib/cn';

/**
 * AxéMap — Trust Score Visual Component
 *
 * Maps the 0-100 internal score to 5 visual levels.
 */

export type TrustLevel =
  | 'LENDAIRO'
  | 'AUTORIDADE'
  | 'ESTABELECIDO'
  | 'EMERGENTE'
  | 'INICIANTE';

interface TrustScoreConfig {
  level: TrustLevel;
  label: string;
  shortLabel: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  minScore: number;
  maxScore: number;
}

const TRUST_LEVELS = {
  LENDAIRO: {
    level: 'LENDAIRO' as TrustLevel,
    label: 'Lend\u00e1rio',
    shortLabel: 'Lend.',
    color: 'hsl(150,42%,36%)',
    bgColor: 'hsl(150,42%,36%)',
    borderColor: 'hsl(150,42%,46%)',
    icon: '\u25C6',
    minScore: 80,
    maxScore: 100,
  },
  AUTORIDADE: {
    level: 'AUTORIDADE' as TrustLevel,
    label: 'Autoridade',
    shortLabel: 'Autor.',
    color: 'hsl(150,46%,44%)',
    bgColor: 'hsl(150,46%,44%)',
    borderColor: 'hsl(150,46%,54%)',
    icon: '\u25C6',
    minScore: 60,
    maxScore: 79,
  },
  ESTABELECIDO: {
    level: 'ESTABELECIDO' as TrustLevel,
    label: 'Estabelecido',
    shortLabel: 'Estab.',
    color: 'hsl(36,85%,44%)',
    bgColor: 'hsl(36,85%,44%)',
    borderColor: 'hsl(36,85%,54%)',
    icon: '\u25C6',
    minScore: 40,
    maxScore: 59,
  },
  EMERGENTE: {
    level: 'EMERGENTE' as TrustLevel,
    label: 'Emergente',
    shortLabel: 'Emer.',
    color: 'hsl(38,90%,40%)',
    bgColor: 'hsl(38,90%,40%)',
    borderColor: 'hsl(38,90%,50%)',
    icon: '\u25C7',
    minScore: 20,
    maxScore: 39,
  },
  INICIANTE: {
    level: 'INICIANTE' as TrustLevel,
    label: 'Iniciante',
    shortLabel: 'Inic.',
    color: 'hsl(18,66%,47%)',
    bgColor: 'hsl(18,66%,47%)',
    borderColor: 'hsl(18,66%,57%)',
    icon: '\u25CB',
    minScore: 0,
    maxScore: 19,
  },
} as const satisfies Record<TrustLevel, TrustScoreConfig>;

/**
 * Convert a 0-100 score to its Trust Level.
 */
export function scoreToTrustLevel(score: number): TrustLevel {
  if (score >= 80) return 'LENDAIRO';
  if (score >= 60) return 'AUTORIDADE';
  if (score >= 40) return 'ESTABELECIDO';
  if (score >= 20) return 'EMERGENTE';
  return 'INICIANTE';
}

/**
 * Get full config for a trust level.
 */
export function getTrustConfig(level: TrustLevel): TrustScoreConfig {
  return TRUST_LEVELS[level] as TrustScoreConfig;
}

/**
 * Get trust config from a 0-100 score.
 */
export function getTrustConfigFromScore(score: number): TrustScoreConfig {
  return getTrustConfig(scoreToTrustLevel(score));
}

interface TrustScoreBadgeProps {
  score: number;
  variant?: 'full' | 'compact' | 'minimal';
  showScore?: boolean;
  showBar?: boolean;
  className?: string;
}

export function TrustScoreBadge({
  score,
  variant = 'compact',
  showScore = true,
  showBar = false,
  className,
}: TrustScoreBadgeProps) {
  const clampedScore = Math.min(100, Math.max(0, score));
  const level = scoreToTrustLevel(clampedScore);
  const config = getTrustConfig(level);

  if (variant === 'minimal') {
    return (
      <span
        className={cn('inline-flex items-center gap-1 text-xs font-semibold', className)}
        style={{ color: config.color }}
      >
        <span className="text-sm">{config.icon}</span>
        {showScore && <span>{clampedScore.toFixed(1)}</span>}
      </span>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('inline-flex items-center gap-1.5', className)}>
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold text-white"
          style={{ backgroundColor: config.bgColor }}
        >
          <span className="text-sm">{config.icon}</span>
          {config.shortLabel}
        </span>
        {showScore && (
          <span className="text-xs font-bold" style={{ color: config.color }}>
            {clampedScore.toFixed(1)}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Trust Score
        </span>
        <div className="flex items-center gap-1.5">
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold text-white"
            style={{ backgroundColor: config.bgColor }}
          >
            <span className="text-sm">{config.icon}</span>
            {config.label}
          </span>
          {showScore && (
            <span className="text-sm font-bold" style={{ color: config.color }}>
              {clampedScore.toFixed(1)}
            </span>
          )}
        </div>
      </div>
      {showBar && (
        <div className="relative h-2 rounded-full overflow-hidden bg-secondary">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${clampedScore}%`,
              backgroundColor: config.color,
            }}
          />
          {[20, 40, 60, 80].map((mark) => (
            <div
              key={mark}
              className="absolute top-0 bottom-0 w-px bg-foreground/20"
              style={{ left: `${mark}%` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface TrustScoreBarProps {
  score: number;
  className?: string;
}

export function TrustScoreBar({ score, className }: TrustScoreBarProps) {
  const clampedScore = Math.min(100, Math.max(0, score));
  const level = scoreToTrustLevel(clampedScore);
  const config = getTrustConfig(level);

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 font-semibold" style={{ color: config.color }}>
          <span>{config.icon}</span>
          {config.label}
        </span>
        <span className="font-bold tabular-nums" style={{ color: config.color }}>
          {clampedScore.toFixed(1)}
        </span>
      </div>
      <div className="relative h-1.5 rounded-full overflow-hidden bg-secondary/60">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${clampedScore}%`,
            backgroundColor: config.color,
          }}
        />
      </div>
    </div>
  );
}
