import { cn } from '@/lib/cn';

export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('size-5 animate-spin text-copper', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-20"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        d="M22 12a10 10 0 0 0-10-10"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        className="opacity-90"
      />
    </svg>
  );
}

export function PageLoader({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex min-h-40 flex-col items-center justify-center gap-3 text-muted-foreground',
        className,
      )}
    >
      <div className="relative flex size-10 items-center justify-center">
        <Spinner className="size-8" />
      </div>
      <span className="text-sm font-medium">Carregando…</span>
    </div>
  );
}