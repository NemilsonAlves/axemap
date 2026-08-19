import { LogoMark } from '@/components/brand/logo';

export default function Loading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-pulse rounded-2xl">
          <LogoMark className="size-12" />
        </div>
        <span className="text-sm text-muted-foreground">Carregando…</span>
      </div>
    </div>
  );
}