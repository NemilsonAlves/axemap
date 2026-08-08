import * as React from 'react';
import { X } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const tagVariants = cva(
  'inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-2 px-2.5 py-1 text-xs font-medium text-foreground transition-colors duration-[var(--duration-fast)] [&_svg]:size-3.5 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'border-border bg-surface-2 text-foreground hover:bg-accent',
        copper: 'border-copper/30 bg-copper-soft/50 text-copper-strong',
        outline: 'border-dashed border-border bg-transparent text-muted-foreground',
      },
      size: {
        sm: 'px-2 py-0.5 text-[11px]',
        md: 'px-2.5 py-1 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

export interface TagProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof tagVariants> {
  onRemove?: () => void;
  removeLabel?: string;
}

function Tag({ className, variant, size, onRemove, removeLabel, children, ...props }: TagProps) {
  return (
    <span className={cn(tagVariants({ variant, size }), className)} {...props}>
      {children}
      {onRemove && (
        <button
          type="button"
          aria-label={removeLabel || 'Remover'}
          onClick={onRemove}
          className="rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-copper/15 hover:text-copper-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <X />
        </button>
      )}
    </span>
  );
}

export { Tag, tagVariants };