import { Skeleton } from '@/components/ui/skeleton';

export function HeroSkeleton() {
  return (
    <section className="relative overflow-hidden bg-hero pb-20 pt-14 lg:pb-28 lg:pt-20">
      <div className="container-page flex flex-col gap-10 lg:grid lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <Skeleton className="h-8 w-64 rounded-full bg-ivory/20" />
          <Skeleton className="h-14 w-full max-w-xl rounded-xl bg-ivory/20" />
          <Skeleton className="h-4 w-3/4 max-w-md rounded-full bg-ivory/15" />
          <Skeleton className="h-14 w-full max-w-xl rounded-2xl bg-ivory/20" />
          <div className="flex gap-4">
            <Skeleton className="h-8 w-24 rounded-full bg-ivory/15" />
            <Skeleton className="h-8 w-24 rounded-full bg-ivory/15" />
            <Skeleton className="h-8 w-24 rounded-full bg-ivory/15" />
          </div>
        </div>
        <div className="hidden items-center justify-center lg:flex">
          <Skeleton className="h-96 w-full max-w-md rounded-[2rem] bg-ivory/10" />
        </div>
      </div>
    </section>
  );
}

export function SectionsSkeleton() {
  return (
    <div className="container-page flex flex-col gap-6 py-16">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-3">
        <Skeleton className="h-6 w-32 rounded-full" />
        <Skeleton className="h-10 w-full max-w-lg rounded-xl" />
        <Skeleton className="h-4 w-full max-w-md rounded-full" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
            <Skeleton className="aspect-[4/3] w-full rounded-none" />
            <div className="space-y-3 p-5">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
