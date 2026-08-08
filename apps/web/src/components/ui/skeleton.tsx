import { cn } from '@/lib/cn';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted/70', className)}
      {...props}
    />
  );
}

export { Skeleton };