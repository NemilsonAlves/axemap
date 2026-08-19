import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ShieldCheck, ShieldAlert, BadgeCheck, Users, Activity, MessagesSquare } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface TrustIndicatorItem {
  /** Rótulo do indicador (ex.: "Verificação documental"). */
  label: string;
  /** Valor de 0 a 100. */
  value: number;
  /** Descrição curta (ex.: "Perfil confirmado em 2026"). */
  hint?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface TrustIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Score geral (0-100) mostrado em destaque. */
  score: number;
  /** Indicadores por pilar. Padrão: 4 pilares clássicos. */
  indicadores?: TrustIndicatorItem[];
  label?: string;
  compact?: boolean;
}

export const INDICADORES_PADRAO: TrustIndicatorItem[] = [
  { label: 'Verificação documental', value: 88, hint: 'Documentos confirmados', icon: BadgeCheck },
  { label: 'Avaliações da comunidade', value: 76, hint: 'Sem sinais de manipulação', icon: Users },
  { label: 'Atividade e presença', value: 84, hint: 'Eventos e atualizações', icon: Activity },
  { label: 'Resposta e mediação', value: 90, hint: 'Direito de resposta ativo', icon: MessagesSquare },
];

function tone(score: number) {
  if (score >= 80) return 'success';
  if (score >= 50) return 'warning';
  return 'danger';
}

export function TrustIndicator({
  score,
  indicadores = INDICADORES_PADRAO,
  label = 'Índice de Confiança AxéMap',
  compact,
  className,
  ...props
}: TrustIndicatorProps) {
  const safe = Math.min(100, Math.max(0, score));
  const t = tone(safe);
  const Shield = safe >= 60 ? ShieldCheck : ShieldAlert;
  return (
    <Card className={cn('p-5', className)} {...props}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-full',
              t === 'success' && 'bg-success/10 text-success',
              t === 'warning' && 'bg-warning/10 text-warning',
              t === 'danger' && 'bg-danger/10 text-danger',
            )}
          >
            <Shield className="size-5" strokeWidth={2} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground">Indicadores, não estrelas</p>
          </div>
        </div>
        <div className="text-right">
          <span className="font-display text-2xl font-semibold tracking-tight">{safe}</span>
          <span className="text-sm text-muted-foreground">/100</span>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {indicadores.map((ind) => (
          <div key={ind.label}>
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                {ind.icon && <ind.icon className="size-3.5 text-muted-foreground" aria-hidden="true" />}
                {ind.label}
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                {Math.min(100, Math.max(0, ind.value))}
              </span>
            </div>
            <Progress
              value={Math.min(100, Math.max(0, ind.value))}
              className="h-1.5"
              indicatorClassName={cn(
                ind.value >= 80 && 'from-fern to-fern',
                ind.value >= 50 && ind.value < 80 && 'from-ochre to-ochre',
                ind.value < 50 && 'from-danger to-danger',
              )}
            />
            {ind.hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{ind.hint}</p>}
          </div>
        ))}
      </div>

      {!compact && (
        <p className="mt-4 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
          Os indicadores combinam verificação, avaliações verificadas, atividade e mediação. Nenhum pagamento
          altera a pontuação.
        </p>
      )}
    </Card>
  );
}