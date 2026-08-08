'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, ArrowRight } from 'lucide-react';

/** Busca principal do Hero — redireciona para /busca?q= */
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
    <form onSubmit={submit} className="relative w-full max-w-xl" role="search">
      <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/95 p-2 shadow-lg shadow-black/20 backdrop-blur">
        <span className="pl-2 text-copper" aria-hidden="true">
          <Search className="size-5" />
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por cidade, nação, nome da casa, evento…"
          aria-label="Buscar no AxéMap"
          className="h-11 w-full min-w-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70 sm:text-base"
        />
        <button
          type="button"
          onClick={nearMe}
          title="Usar minha localização"
          aria-label="Buscar casas próximas de mim"
          className="hidden h-11 shrink-0 items-center gap-1.5 rounded-xl border border-border px-3 text-xs font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 sm:flex"
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
          className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-brand-gradient px-4 text-sm font-semibold text-white shadow-md shadow-copper/30 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          Buscar
          <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      </div>
      {geo === 'denied' && (
        <p className="mt-2 text-xs text-ivory/80">
          Não foi possível acessar sua localização. Abrimos o mapa para você explorar.
        </p>
      )}
    </form>
  );
}
