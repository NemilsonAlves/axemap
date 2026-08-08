import Link from 'next/link';
import { HeroSearch } from './home-hero-search';
import { HeroMapVisual } from './hero-map-visual';
import type { HomeData } from './data';

interface HeroProps {
  data: HomeData;
}

export function HomeHero({ data }: HeroProps) {
  const stats = data.explore?.stats;
  const totalTerreiro = stats?.totalTerreiro ?? data.stats?.totalTerreiro ?? 0;
  const totalVerificados = stats?.totalVerificados ?? data.stats?.totalVerificados ?? 0;
  const totalEventos = stats?.totalEventos ?? data.stats?.totalEventos ?? 0;

  return (
    <section
      className="relative overflow-hidden bg-hero text-ivory"
      aria-labelledby="hero-titulo"
    >
      {/* Textura e brilhos */}
      <div className="absolute inset-0 bg-fiber opacity-60" aria-hidden="true" />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(900px 520px at 85% -10%, hsl(var(--copper) / 0.35), transparent 60%), radial-gradient(700px 420px at -10% 110%, hsl(var(--bronze) / 0.25), transparent 55%)',
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background to-transparent" aria-hidden="true" />

      <div className="container-page relative grid items-center gap-12 pb-20 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28 lg:pt-20">
        <div className="flex flex-col gap-6">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-ivory/20 bg-ivory/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-ivory/90 backdrop-blur">
            <span className="relative flex size-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fern opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-fern" />
            </span>
            O ecossistema das religiões de matriz africana
          </span>

          <h1
            id="hero-titulo"
            className="max-w-2xl font-display text-4xl font-bold leading-[1.04] tracking-tight sm:text-5xl lg:text-6xl"
          >
            A ancestralidade brasileira,{' '}
            <span className="text-brand-gradient">em um mapa vivo.</span>
          </h1>

          <p className="max-w-xl text-lg leading-relaxed text-ivory/85 md:text-xl">
            Encontre, conheça e fortaleça terreiros, eventos, cursos e
            comunidades de matriz africana em todo o Brasil — com confiança,
            transparência e respeito.
          </p>

          <HeroSearch />

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
            <span className="flex items-baseline gap-1.5 text-sm text-ivory/85">
              <strong className="font-display text-2xl font-bold text-white">
                {totalTerreiro}
              </strong>
              terreiros cadastrados
            </span>
            <span className="hidden h-5 w-px bg-ivory/25 sm:block" aria-hidden="true" />
            <span className="flex items-baseline gap-1.5 text-sm text-ivory/85">
              <strong className="font-display text-2xl font-bold text-fern">
                {totalVerificados}
              </strong>
              casas verificadas
            </span>
            <span className="hidden h-5 w-px bg-ivory/25 sm:block" aria-hidden="true" />
            <span className="flex items-baseline gap-1.5 text-sm text-ivory/85">
              <strong className="font-display text-2xl font-bold text-ochre">
                {totalEventos}
              </strong>
              eventos abertos
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 text-sm font-semibold text-ivory underline-offset-4 transition-colors hover:text-white hover:underline"
            >
              Cadastrar meu terreiro
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/eventos"
              className="inline-flex items-center gap-2 text-sm font-semibold text-ivory/70 underline-offset-4 transition-colors hover:text-white hover:underline"
            >
              Ver eventos desta semana
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div className="relative hidden lg:block" aria-hidden="true">
          <HeroMapVisual />
        </div>
      </div>
    </section>
  );
}
