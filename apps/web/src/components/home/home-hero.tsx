'use client';

import Image from 'next/image';
import Link from 'next/link';
import { HeroSearch } from './home-hero-search';
import { useI18n } from '@/lib/i18n/i18n-context';
import { LogoMark } from '@/components/brand/logo';
import { MapPin, ShieldCheck, CalendarDays, Users, HousePlus } from 'lucide-react';
import type { HomeData } from './data';

interface HeroProps {
  data: HomeData;
}

export function HomeHero({ data }: HeroProps) {
  const { formatNumber } = useI18n();
  const stats = data.explore?.stats;
  const totalComunidades = stats?.totalTerreiro ?? data.stats?.totalTerreiro ?? 0;
  const totalVerificados = stats?.totalVerificados ?? data.stats?.totalVerificados ?? 0;
  const totalEventos     = stats?.totalEventos    ?? data.stats?.totalEventos    ?? 0;

  return (
    <section
      className="relative flex min-h-svh flex-col overflow-hidden bg-[hsl(var(--obsidiana-deep))] text-[hsl(var(--marfim))] lg:min-h-[720px]"
      aria-labelledby="hero-titulo"
    >
      {/* ── CAMADA 0: Foto de fundo ── */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <Image
          src="/images/hero-ilustracao.jpg"
          alt=""
          fill
          priority
          className="object-cover object-center opacity-[0.45] filter brightness-[0.85] contrast-[1.05] transition-opacity duration-1000"
          sizes="100vw"
        />
      </div>

      {/* ── CAMADA 1: Overlay cinematográfico — escuro em gradiente, imagem legível ── */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        aria-hidden="true"
        style={{
          background: [
            'linear-gradient(112deg, hsl(var(--obsidiana-deep)/0.62) 0%, hsl(var(--obsidiana-deep)/0.48) 32%, hsl(var(--obsidiana-deep)/0.28) 60%, hsl(var(--obsidiana-deep)/0.10) 100%)',
            'linear-gradient(to bottom, hsl(var(--obsidiana-deep)/0.55) 0%, transparent 18%, transparent 60%, hsl(var(--obsidiana-deep)/0.80) 100%)',
            'radial-gradient(ellipse 480px 380px at 26% 52%, hsl(var(--copper)/0.12), transparent 55%)',
          ].join(', '),
        }}
      />

      {/* ── CAMADA 2: Grain cinematográfico sutil ── */}
      <div
        className="animate-grain pointer-events-none absolute inset-0 z-[2] opacity-[0.03]"
        aria-hidden="true"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '180px 180px',
        }}
      />

      {/* ── CAMADA 3: Faixa cromática topo (identidade) ── */}
      <div
        className="absolute inset-x-0 top-0 z-[4] h-[3px]"
        aria-hidden="true"
        style={{
          background: 'linear-gradient(90deg, hsl(var(--verde-floresta)), hsl(var(--acafrao)), hsl(var(--copper)), hsl(var(--terracota)), hsl(var(--roxo-ancestral)), hsl(var(--azul-atlantico)), hsl(var(--verde-floresta)))',
        }}
      />

      {/* ── CONTEÚDO PRINCIPAL — logo preenche espaço esquerdo + conteúdo à direita ── */}
      <div className="container-page relative z-[5] flex flex-1 flex-col justify-center py-14 lg:py-16">
        <div className="flex w-full items-stretch gap-8 lg:gap-16">

          {/* ── Logo coluna esquerda: preenche toda a altura disponível (desktop) ── */}
          <div className="hidden lg:flex lg:w-1/2 lg:items-center lg:justify-center">
            <Link
              href="/"
              aria-label="AxéMap — o mapa vivo das tradições de matriz africana no Brasil"
              className="group flex w-full items-center justify-center"
            >
              <LogoMark
                className="aspect-square w-full max-w-115 rounded-[2.5rem] shadow-2xl shadow-copper/40 ring-2 ring-copper/50 transition-transform duration-500 hover:scale-[1.03] xl:max-w-130"
              />
            </Link>
          </div>

          {/* ── Conteúdo coluna direita ── */}
          <div className="flex w-full flex-col items-center text-center lg:w-1/2 lg:items-start lg:text-left">
            {/* Eyebrow editorial */}
            <div className="animate-hero-rise mb-7 flex flex-col items-center gap-6 lg:items-start">
              {/* Logo mobile: centralizada acima do texto */}
              <Link
                href="/"
                aria-label="AxéMap — o mapa vivo das tradições de matriz africana no Brasil"
                className="lg:hidden"
              >
                <LogoMark className="size-60 rounded-3xl shadow-xl shadow-copper/30 ring-2 ring-copper/40 transition-transform hover:scale-105" />
              </Link>
              <span className="eyebrow-editorial">
                Religiões de Matriz Africana
                <span className="hidden text-[hsl(var(--acafrao)/0.55)] sm:inline" aria-hidden="true">·</span>
                <span className="hidden sm:inline">Brasil</span>
              </span>
            </div>

            {/* Headline */}
            <h1
              id="hero-titulo"
              className="animate-hero-rise animate-hero-rise-1 hero-headline mb-6 w-full text-center text-[hsl(var(--marfim))] lg:text-left"
              style={{ textShadow: '0 2px 28px hsl(var(--obsidiana-deep)/0.85)' }}
            >
              O mapa vivo das{' '}
              <span
                style={{
                  background: 'linear-gradient(120deg, hsl(var(--acafrao)), hsl(var(--copper)))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                tradições de Axé Asé
              </span>{' '}
              no Brasil
            </h1>

            {/* Subtítulo */}
            <p
              className="animate-hero-rise animate-hero-rise-2 mb-9 w-full max-w-[680px] text-base leading-[1.7] text-[hsl(var(--marfim)/0.82)] sm:text-lg lg:max-w-full"
              style={{ textShadow: '0 1px 12px hsl(var(--obsidiana-deep)/0.75)' }}
            >
              Ifá, Candomblé, Umbanda, Batuque, Tambor de Mina, Xangô, Jurema —
              e todas as expressões que resistiram, se transformaram e permanecem{' '}
              <strong className="font-semibold text-[hsl(var(--marfim))]">vivas</strong> nas
              casas, terreiros e comunidades de todo o Brasil.
            </p>

            {/* Busca principal */}
            <div className="animate-hero-rise animate-hero-rise-3 mb-9 w-full max-w-xl lg:max-w-full">
              <HeroSearch />
            </div>

            {/* CTAs */}
            <div className="animate-hero-rise animate-hero-rise-4 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <Link
                href="/mapa"
                className="group inline-flex items-center gap-2.5 rounded-2xl px-7 py-4 text-sm font-black text-[hsl(var(--obsidiana-deep))] transition-all hover:brightness-110 hover:scale-[1.02] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--obsidiana-deep))]"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--acafrao)), hsl(var(--copper)))',
                  boxShadow: '0 8px 28px hsl(var(--copper)/0.45)',
                }}
              >
                <MapPin className="size-4" aria-hidden="true" />
                Explorar o mapa
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
              </Link>

              <Link
                href="/auth/cadastro"
                className="inline-flex items-center gap-2.5 rounded-2xl border border-[hsl(var(--marfim)/0.28)] bg-[hsl(var(--marfim)/0.07)] px-7 py-4 text-sm font-bold text-[hsl(var(--marfim))] backdrop-blur-sm transition-all hover:border-[hsl(var(--acafrao)/0.65)] hover:bg-[hsl(var(--marfim)/0.14)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper"
              >
                <HousePlus className="size-4" aria-hidden="true" />
                Cadastrar Casa de Axé
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* ── Stats bar (dados reais da API) ── */}
      <div className="relative z-[5] w-full">
        <div className="container-page pb-7">
          <div
            className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl sm:grid-cols-4"
            style={{
              background: 'hsl(var(--marfim)/0.10)',
              border: '1px solid hsl(var(--marfim)/0.10)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            {[
              { value: totalComunidades, label: 'Comunidades', sublabel: 'cadastradas', color: 'hsl(var(--marfim))',          Icon: Users },
              { value: totalVerificados, label: 'Casas',        sublabel: 'verificadas',  color: 'hsl(var(--verde-floresta))',   Icon: ShieldCheck },
              { value: totalEventos,     label: 'Eventos',      sublabel: 'ativos',       color: 'hsl(var(--acafrao))',          Icon: CalendarDays },
              { value: 0,                label: 'Federações',   sublabel: 'na rede',       color: 'hsl(var(--roxo-ancestral))',   Icon: MapPin },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-1 px-5 py-4 text-center"
                style={{ background: 'hsl(var(--obsidiana-deep)/0.55)' }}
              >
                <stat.Icon className="mb-0.5 size-4 opacity-60" style={{ color: stat.color }} aria-hidden="true" />
                <strong
                  className="font-display text-2xl font-black leading-none sm:text-3xl"
                  style={{ color: stat.color }}
                >
                  {stat.value > 0 ? formatNumber(stat.value) : '—'}
                </strong>
                <span className="text-[11px] font-semibold text-[hsl(var(--marfim)/0.85)]">{stat.label}</span>
                <span className="text-[10px] text-[hsl(var(--marfim)/0.40)]">{stat.sublabel}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
