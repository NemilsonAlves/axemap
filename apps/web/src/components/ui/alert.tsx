import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '@/lib/cn';

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:size-4 [&>svg~*]:pl-7 transition-all duration-[var(--duration-base)]',
  {
    variants: {
      variant: {
        default: 'border-border bg-card text-foreground [&>svg]:text-foreground',
        info: 'border-info/25 bg-info/8 text-foreground [&>svg]:text-info',
        success: 'border-success/25 bg-success/8 text-foreground [&>svg]:text-success',
        warning: 'border-warning/30 bg-warning/8 text-foreground [&>svg]:text-warning',
        danger: 'border-danger/30 bg-danger/8 text-foreground [&>svg]:text-danger',
        copper: 'border-copper/30 bg-copper-soft/40 text-foreground [&>svg]:text-copper',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

const iconMap = {
  default: Info,
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: AlertCircle,
  copper: Info,
} as const;

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof alertVariants> & { onClose?: () => void }
>(({ className, variant = 'default', onClose, children, ...props }, ref) => {
  const Icon = iconMap[variant as keyof typeof iconMap];
  return (
    <div
      ref={ref}
      role={variant === 'danger' ? 'alert' : 'status'}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      <Icon aria-hidden="true" />
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">{children}</div>
        {onClose && (
          <button
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            className="ml-2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  );
});
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('mb-1 font-display font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('text-sm leading-relaxed text-muted-foreground [&_p]:leading-relaxed', className)} {...props} />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };