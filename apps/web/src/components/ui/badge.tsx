import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors duration-[var(--duration-fast)] focus:outline-none focus:ring-2 focus:ring-ring/30 [&_svg]:size-3 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground shadow-xs',
        copper: 'border-copper/25 bg-copper-soft text-copper-strong',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'border-border bg-card text-foreground',
        success: 'border-success/25 bg-success/10 text-success',
        warning: 'border-warning/25 bg-warning/10 text-warning',
        danger: 'border-danger/25 bg-danger/10 text-danger',
        info: 'border-info/25 bg-info/10 text-info',
        muted: 'border-transparent bg-muted text-muted-foreground',
        solid: 'border-transparent bg-copper text-primary-foreground shadow-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };