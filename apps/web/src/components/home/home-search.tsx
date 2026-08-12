'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, MapPin, ArrowRight, Sparkles, Building2, Globe2, House, BookOpen, GraduationCap, CalendarDays, MapPinned } from 'lucide-react';
import { SectionHeading } from './section-heading';
import { Reveal } from './reveal';
import type { ExploreData } from './data';
import { labelTradicao } from '@/lib/tradicoes';

const capacidades = [
  { label: 'Cidade', icon: Building2 },
  { label: 'Estado', icon: MapPinned },
  { label: 'Bairro', icon: House },
  { label: 'Nome da casa', icon: Globe2 },
  { label: 'Nação / Linhagem', icon: BookOpen },
  { label: 'Eventos', icon: CalendarDays },
  { label: 'Cursos', icon: GraduationCap },
];

export function HomeSearch({ explore }: { explore: ExploreData | null }) {
  const router = useRouter();
  const [query, setQuery] = React.useState('');

  const tradicoes = (explore?.tradicoes ?? []).slice(0, 8);
  const cidades = (explore?.cidades ?? []).slice(0, 6);

  function go(q: string) {
    router.push(`/busca?q=${encodeURIComponent(q)}`);
  }

  return (
    <section className="container-page relative py-20 lg:py-28" aria-labelledby="busca-titulo">
      <div className="flex flex-col items-center gap-10">
        <Reveal>
          <SectionHeading
            eyebrow="Busca inteligente"
            id="busca-titulo"
            title="Encontre a casa certa para você"
            description="A busca é o coração do AxéMap. Filtre por cidade, estado, bairro, nação ou nome da casa — e entenda a tradição antes de visitar."
          />
        </Reveal>

        <Reveal delay={0.05} className="w-full max-w-3xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              go(query);
            }}
            role="search"
            className="rounded-3xl border border-border bg-card p-3 shadow-lg shadow-copper/5"
          >
            <div className="flex items-center gap-2">
              <span className="pl-2 text-copper" aria-hidden="true">
                <Search className="size-5" />
              </span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex.: casa com eventos abertos perto de mim"
                aria-label="Busca inteligente"
                className="h-12 w-full min-w-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70 sm:text-base"
              />
              <button
                type="submit"
                className="inline-flex h-12 shrink-0 items-center gap-1.5 rounded-2xl bg-brand-gradient px-4 text-sm font-semibold text-white shadow-md shadow-copper/30 transition hover:brightness-110 sm:px-5"
              >
                Buscar
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
              <button
                type="button"
                onClick={() => go('perto de mim')}
                className="inline-flex items-center gap-1.5 rounded-full border border-copper/30 bg-copper-soft/40 px-3 py-1.5 text-xs font-semibold text-copper-strong transition hover:bg-copper-soft/70"
              >
                <MapPin className="size-3.5" aria-hidden="true" />
                Perto de mim
              </button>
              <button
                type="button"
                onClick={() => go('eventos abertos')}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-accent/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
              >
                <Sparkles className="size-3.5" aria-hidden="true" />
                Quero uma casa que tenha eventos abertos
              </button>
              <span className="hidden items-center gap-1.5 rounded-full border border-border bg-accent/60 px-3 py-1.5 text-xs font-medium text-muted-foreground sm:inline-flex">
                <Sparkles className="size-3.5" aria-hidden="true" />
                Busca semântica com IA
              </span>
            </div>
          </form>
        </Reveal>

        <Reveal delay={0.1} className="w-full">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="flex flex-col gap-4">
              <p className="text-sm font-semibold text-foreground">Cidades em destaque</p>
              <div className="flex flex-wrap gap-2">
                {cidades.map((c) => (
                  <Link
                    key={`${c.cidade}-${c.estado}`}
                    href={`/cidade/${c.cidade.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[\s']+/g, '-')}-${c.estado.toLowerCase()}`}
                    className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-copper/50 hover:text-copper-strong"
                  >
                    {c.cidade} <span className="text-xs">({c.count})</span>
                  </Link>
                ))}
                {cidades.length === 0 && (
                  <p className="text-sm text-muted-foreground">Explore o mapa abaixo para descobrir as cidades.</p>
                )}
              </div>

              <p className="mt-2 text-sm font-semibold text-foreground">Nações e tradições</p>
              <div className="flex flex-wrap gap-2">
                {tradicoes.map((t) => (
                  <Link
                    key={t.nome}
                    href={`/tradicao/${t.nome.toLowerCase().replace(/_/g, '-')}`}
                    className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-copper/50 hover:text-copper-strong"
                  >
                    {labelTradicao(t.nome)} <span className="text-xs">({t.count})</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <p className="text-sm font-semibold text-foreground">O que você pode buscar</p>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {capacidades.map((c) => (
                  <li
                    key={c.label}
                    className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-copper/40 hover:text-foreground"
                  >
                    <c.icon className="size-4 shrink-0 text-copper" aria-hidden="true" />
                    {c.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
