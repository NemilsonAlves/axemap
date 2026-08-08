import * as React from 'react';
import { cn } from '@/lib/cn';

type TimelineItem = {
  title: string;
  description?: string;
  date?: string;
  status?: 'default' | 'success' | 'danger' | 'warning' | 'copper';
};

interface TimelineProps extends React.HTMLAttributes<HTMLOListElement> {
  items: TimelineItem[];
}

const statusColor: Record<string, string> = {
  default: 'bg-muted-foreground/40',
  success: 'bg-success',
  danger: 'bg-danger',
  warning: 'bg-warning',
  copper: 'bg-copper',
};

export function Timeline({ items, className, ...props }: TimelineProps) {
  return (
    <ol className={cn('relative space-y-6 border-l-2 border-border pl-6', className)} {...props}>
      {items.map((item, i) => (
        <li key={i} className="relative">
          <span
            aria-hidden="true"
            className={cn(
              'absolute -left-[31px] top-1 size-2.5 rounded-full ring-4 ring-background',
              statusColor[item.status ?? 'default'],
            )}
          />
          <div className="flex flex-col gap-0.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-display text-sm font-semibold text-foreground">{item.title}</span>
              {item.date && <span className="shrink-0 text-xs text-muted-foreground">{item.date}</span>}
            </div>
            {item.description && (
              <p className="text-sm text-muted-foreground">{item.description}</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}