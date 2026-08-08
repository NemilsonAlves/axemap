import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/cn';

interface TrustScoreCardProps extends React.HTMLAttributes<HTMLDivElement> {
  score: number;
  label?: string;
  level?: 'BASICO' | 'DOCUMENTAL' | 'COMUNITARIO' | 'AVANCADO' | 'COMPLETO';
  compact?: boolean;
}

function scoreTone(score: number) {
  if (score >= 80) return 'success';
  if (score >= 50) return 'warning';
  return 'danger';
}

const levelLabel: Record<string, string> = {
  BASICO: 'Básico',
  DOCUMENTAL: 'Documental',
  COMUNITARIO: 'Comunitário',
  AVANCADO: 'Avançado',
  COMPLETO: 'Completo',
};

export function TrustScoreCard({
  score,
  label = 'Trust Score',
  level,
  compact,
  className,
  ...props
}: TrustScoreCardProps) {
  const tone = scoreTone(score);
  const safe = Math.min(100, Math.max(0, score));
  const ShieldIcon = score >= 60 ? ShieldCheck : ShieldAlert;
  return (
    <Card className={cn('p-5', className)} {...props}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              'flex size-9 items-center justify-center rounded-full',
              tone === 'success' && 'bg-success/10 text-success',
              tone === 'warning' && 'bg-warning/10 text-warning',
              tone === 'danger' && 'bg-danger/10 text-danger',
            )}
          >
            <ShieldIcon className="size-5" strokeWidth={2} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{label}</p>
            {level && (
              <p className="text-xs text-muted-foreground">{levelLabel[level] ?? level}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <span className="font-display text-2xl font-semibold tracking-tight">{safe}</span>
          <span className="text-sm text-muted-foreground">/100</span>
        </div>
      </div>
      <div className="mt-4">
        <Progress
          value={safe}
          className={cn('h-2', tone === 'danger' && '[&>div]:from-danger [&>div]:to-danger')}
          indicatorClassName={cn(
            tone === 'warning' && 'from-ochre to-ochre',
            tone === 'danger' && 'from-danger to-danger',
          )}
        />
      </div>
      {!compact && (
        <div className="mt-3 flex items-center gap-2">
          <Badge variant={tone === 'success' ? 'success' : tone === 'warning' ? 'warning' : 'danger'}>
            {safe >= 80 ? 'Alta confiança' : safe >= 50 ? 'Confiança média' : 'Baixa confiança'}
          </Badge>
          <span className="text-xs text-muted-foreground">Verificado pela comunidade</span>
        </div>
      )}
    </Card>
  );
}