import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Inbox, CircleAlert, CheckCircle2, SearchX } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { LucideIcon } from 'lucide-react';

const stateVariants = cva('flex flex-col items-center justify-center gap-3 text-center p-10', {
  variants: {
    variant: {
      empty: 'text-muted-foreground',
      error: '',
      success: '',
      notfound: 'text-muted-foreground',
    },
  },
  defaultVariants: { variant: 'empty' },
});

const stateIconMap: Record<
  string,
  { icon: LucideIcon; className: string }
> = {
  empty: { icon: Inbox, className: 'text-sand' },
  error: { icon: CircleAlert, className: 'text-danger' },
  success: { icon: CheckCircle2, className: 'text-success' },
  notfound: { icon: SearchX, className: 'text-sand' },
};

export interface StateCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stateVariants> {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}

function StateCard({
  className,
  variant = 'empty',
  title,
  description,
  icon: customIcon,
  action,
  ...props
}: StateCardProps) {
  const { icon: Icon, className: iconCls } = stateIconMap[variant as keyof typeof stateIconMap] ?? stateIconMap.empty;
  const Comp = customIcon ?? Icon;
  return (
    <div className={cn(stateVariants({ variant }), className)} {...props}>
      <div className={cn('flex size-14 items-center justify-center rounded-2xl bg-surface-2 text-current', iconCls)}>
        <Comp className="size-7" strokeWidth={1.75} />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-display text-base font-semibold text-foreground">{title}</h3>
        {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export { StateCard };