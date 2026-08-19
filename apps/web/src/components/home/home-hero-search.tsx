'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, ArrowRight } from 'lucide-react';

/**
 * Busca principal do Hero — redireciona para /busca?q=
 * Barra clara e elevada (64px desktop), botão de ação separado,
 * foco acessível por teclado e composição vertical no mobile.
 */
export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = React.useState('');
  const [geo, setGeo] = React.useState<'idle' | 'loading' | 'denied'>('idle');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/busca?q=${encodeURIComponent(query.trim())}`);
  }

  function nearMe() {
    if (!('geolocation' in navigator)) {
      router.push('/busca?view=mapa');
      return;
    }
    setGeo('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        router.push(`/busca?view=mapa&lat=${latitude}&lng=${longitude}`);
      },
      () => {
        setGeo('denied');
        router.push('/busca?view=mapa');
      },
    );
  }

  return (
    <form
      onSubmit={submit}
      className="relative w-full max-w-xl"
      role="search"
      aria-label="Busca principal"
    >
      {/* Barra principal */}
      <div className="hero-search flex flex-col gap-2 rounded-2xl border border-white/15 bg-white/95 p-2 shadow-lg shadow-black/25 sm:flex-row sm:items-center sm:gap-1.5">
        <label className="flex min-w-0 flex-1 items-center gap-2.5 pl-2 sm:pl-3">
          <span className="shrink-0 text-copper" aria-hidden="true">
            <Search className="size-5" />
          </span>
          <span className="sr-only">Buscar no AxéMap</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar cidade, tradição, casa ou entidade"
            aria-label="Buscar no AxéMap"
            className="h-[3.25rem] w-full min-w-0 rounded-xl bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground/60 sm:h-[3.5rem]"
          />
        </label>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={nearMe}
            title="Usar minha localização"
            aria-label="Buscar casas próximas de mim"
            className="inline-flex h-[3rem] shrink-0 items-center gap-1.5 rounded-xl border border-border bg-accent/60 px-3 text-xs font-semibold text-foreground transition-colors hover:bg-accent hover:text-copper-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 sm:h-[3.5rem]"
          >
            {geo === 'loading' ? (
              <span className="size-4 animate-spin rounded-full border-2 border-muted-foreground/40 border-t-copper" aria-hidden="true" />
            ) : (
              <MapPin className="size-4" aria-hidden="true" />
            )}
            Perto de mim
          </button>
          <button
            type="submit"
            className="inline-flex h-[3rem] shrink-0 items-center gap-1.5 rounded-xl bg-brand-gradient px-5 text-sm font-bold text-white shadow-md shadow-copper/40 transition hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper/70 focus-visible:ring-offset-2 sm:h-[3.5rem] sm:px-6"
          >
            Buscar
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      {geo === 'denied' && (
        <p className="mt-2 text-xs text-ivory/80">
          Não foi possível acessar sua localização. Abrimos o mapa para você explorar.
        </p>
      )}
    </form>
  );
}
