import Link from 'next/link';
import { Compass, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <section className="container-page flex min-h-[60vh] items-center justify-center py-16 text-center">
      <div className="max-w-lg rounded-3xl border border-border bg-card p-8 shadow-sm sm:p-12">
        <Compass className="mx-auto size-12 text-copper" aria-hidden="true" />
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-copper-strong">Página não encontrada</p>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Este caminho não está no mapa.
        </h1>
        <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
          A página pode ter mudado de lugar ou não estar mais disponível. Explore as comunidades, territórios e tradições no AxéMap.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 text-sm font-bold text-white shadow-md shadow-copper/20 transition hover:brightness-105">
            <Home className="size-4" aria-hidden="true" />
            Ir para o início
          </Link>
          <Link href="/busca" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 text-sm font-bold text-foreground transition hover:border-copper/40 hover:text-copper-strong">
            <Search className="size-4" aria-hidden="true" />
            Buscar no mapa
          </Link>
        </div>
      </div>
    </section>
  );
}
