import Link from 'next/link';
import { HeroSearch } from './home-hero-search';
import { HeroMapVisual } from './hero-map-visual';
import type { HomeData } from './data';

interface HeroProps {
  data: HomeData;
}

export function HomeHero({ data }: HeroProps) {
  const stats = data.explore?.stats;
  const totalComunidades = stats?.totalTerreiro ?? data.stats?.totalTerreiro ?? 0;
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
            'radial-gradient(900px 520px at 85% -10%, hsl(var(--copper) / 0.35), transparent 60%), radial-gradient(700px 420px at -10% 110%, hsl(var(--verde-floresta) / 0.25), transparent 55%)',
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background to-transparent" aria-hidden="true" />

      <div className="container-page relative grid items-center gap-12 pb-20 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28 lg:pt-20">
        <div className="flex flex-col gap-6">

          {/* Tagline institucional */}
          <div className="flex flex-col gap-2">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-ivory/20 bg-ivory/10 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-ivory/80 backdrop-blur">
              <span className="relative flex size-1.5" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fern opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-fern" />
              </span>
              Infraestrutura digital global · África e suas diásporas
            </span>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ivory/45">
              MAPA&nbsp;·&nbsp;MEMÓRIA&nbsp;·&nbsp;ANCESTRALIDADE&nbsp;·&nbsp;CONEXÃO
            </p>
          </div>

          {/* Headline principal */}
          <h1
            id="hero-titulo"
            className="max-w-2xl font-display text-4xl font-bold leading-[1.04] tracking-tight sm:text-5xl lg:text-6xl"
          >
            Onde a ancestralidade{' '}
            <span className="text-brand-gradient">encontra o mundo.</span>
          </h1>

          <p className="max-w-xl text-lg leading-relaxed text-ivory/85 md:text-xl">
            Explore tradições, comunidades, histórias, conhecimentos e conexões que atravessam
            África e suas diásporas — da origem aos territórios onde a memória ainda vive.
          </p>

          <HeroSearch />

          {/* Estatísticas */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-1">
            <span className="flex items-baseline gap-1.5 text-sm text-ivory/85">
              <strong className="font-display text-2xl font-bold text-white">
                {totalComunidades}
              </strong>
              comunidades
            </span>
            <span className="hidden h-4 w-px bg-ivory/20 sm:block" aria-hidden="true" />
            <span className="flex items-baseline gap-1.5 text-sm text-ivory/85">
              <strong className="font-display text-2xl font-bold text-fern">
                {totalVerificados}
              </strong>
              verificadas
            </span>
            <span className="hidden h-4 w-px bg-ivory/20 sm:block" aria-hidden="true" />
            <span className="flex items-baseline gap-1.5 text-sm text-ivory/85">
              <strong className="font-display text-2xl font-bold text-ochre">
                {totalEventos}
              </strong>
              eventos
            </span>
          </div>

          {/* 3 CTAs principais */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href="/mapa"
              className="inline-flex items-center gap-2 rounded-2xl bg-copper px-5 py-3 text-sm font-bold text-white shadow-md shadow-copper/30 transition hover:brightness-110"
            >
              Explorar o Mapa
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/tradicao"
              className="inline-flex items-center gap-2 rounded-2xl border border-ivory/25 bg-ivory/10 px-5 py-3 text-sm font-bold text-ivory backdrop-blur transition hover:bg-ivory/20"
            >
              Explorar Tradições
            </Link>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 text-sm font-semibold text-ivory/70 underline-offset-4 transition hover:text-white hover:underline"
            >
              Fazer parte da Rede
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
