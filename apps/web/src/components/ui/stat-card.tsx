import * as React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/cn';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  trend?: number;
  delay?: number;
}

export function StatCard({ label, value, hint, icon: Icon, trend, className, ...props }: StatCardProps) {
  const positive = (trend ?? 0) >= 0;
  return (
    <Card interactive className={cn('relative overflow-hidden p-6', className)} {...props}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          <span className="font-display text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </span>
        </div>
        {Icon && (
          <div className="flex size-11 items-center justify-center rounded-xl bg-copper-soft text-copper">
            <Icon className="size-5" strokeWidth={2} />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs">
        {trend !== undefined && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-semibold',
              positive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger',
            )}
          >
            {positive ? '▲' : '▼'} {Math.abs(trend)}%
          </span>
        )}
        {hint && <span className="text-muted-foreground">{hint}</span>}
      </div>
    </Card>
  );
}