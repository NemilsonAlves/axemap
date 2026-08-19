import type { Metadata } from 'next';
import Link from 'next/link';
import { Tv2, ArrowRight, Upload, Play } from 'lucide-react';
import { LogoMark } from '@/components/brand/logo';

export const metadata: Metadata = {
  title: 'TV AxéMap — Documentários, Entrevistas e Cultura Afro-Brasileira',
  description:
    'Documentários, entrevistas, rituais públicos, festas, conferências e conteúdo cultural produzido pelas comunidades de matriz africana no Brasil. Envie o conteúdo da sua casa gratuitamente.',
  alternates: { canonical: '/tv' },
  openGraph: {
    title: 'TV AxéMap — Memória viva em imagem e som',
    description:
      'Conteúdo cultural produzido pelas comunidades afro-brasileiras. Documentários, entrevistas e muito mais.',
    url: 'https://axemap.com.br/tv',
    siteName: 'AxéMap',
    locale: 'pt_BR',
    type: 'website',
  },
};

const TIPOS = [
  { slug: 'DOCUMENTARIO',        label: 'Documentários' },
  { slug: 'ENTREVISTA',          label: 'Entrevistas' },
  { slug: 'RITUAL_PUBLICO',      label: 'Rituais Públicos' },
  { slug: 'FESTA_CULTURAL',      label: 'Festas Culturais' },
  { slug: 'MUSICA',              label: 'Música' },
  { slug: 'EDUCATIVO',           label: 'Educativo' },
  { slug: 'CONTEUDO_COMUNIDADE', label: 'Das Comunidades' },
];

export default function TvPage() {
  return (
    <div className="min-h-screen bg-[hsl(var(--obsidiana-deep))] text-[hsl(var(--marfim))]">

      {/* ── Header da TV ── */}
      <section
        className="relative overflow-hidden border-b border-ivory/10 pb-16 pt-14"
        aria-labelledby="tv-titulo"
      >
        {/* Gradientes de fundo */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background: [
              'radial-gradient(ellipse 700px 500px at 80% -5%, hsl(var(--copper)/0.35), transparent 55%)',
              'radial-gradient(ellipse 500px 400px at -5% 110%, hsl(var(--terracota)/0.25), transparent 55%)',
            ].join(', '),
          }}
        />
        {/* Stripe kente */}
        <div
          className="absolute inset-x-0 top-0 h-1"
          aria-hidden="true"
          style={{ background: 'linear-gradient(90deg, hsl(var(--verde-floresta)), hsl(var(--acafrao)), hsl(var(--copper)), hsl(var(--terracota)), hsl(var(--roxo-ancestral)), hsl(var(--azul-atlantico)), hsl(var(--verde-floresta)))' }}
        />

        <div className="container-page relative">
          <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <LogoMark className="size-10 rounded-2xl" aria-hidden="true" />
                <span className="inline-flex items-center gap-2 rounded-full border border-ivory/20 bg-ivory/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-ivory/90">
                  <Tv2 className="size-3.5" aria-hidden="true" />
                  TV AxéMap
                </span>
              </div>
              <h1
                id="tv-titulo"
                className="font-display text-4xl font-black leading-tight tracking-tight sm:text-5xl"
              >
                Memória viva em{' '}
                <span
                  style={{
                    background: 'linear-gradient(135deg, hsl(var(--acafrao)), hsl(var(--copper)))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  imagem e som
                </span>
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-ivory/70 md:text-lg">
                Documentários, entrevistas, rituais públicos, festas, conferências e conteúdo cultural
                produzido pelas comunidades. A TV AxéMap preserva e difunde o conhecimento das tradições
                afro-brasileiras.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="https://www.youtube.com/@axemap"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl bg-copper px-6 py-3 text-sm font-bold text-white shadow-md shadow-copper/30 transition hover:brightness-110"
              >
                <Tv2 className="size-4" aria-hidden="true" />
                Canal no YouTube
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
              <Link
                href="/painel"
                className="inline-flex items-center gap-2 rounded-2xl border border-ivory/25 bg-ivory/10 px-6 py-3 text-sm font-bold text-ivory backdrop-blur transition hover:bg-ivory/20"
              >
                <Upload className="size-4" aria-hidden="true" />
                Enviar conteúdo da sua casa
              </Link>
            </div>
          </div>

          {/* Filtros por tipo */}
          <div className="mt-10 flex flex-wrap gap-2" role="navigation" aria-label="Filtros de conteúdo">
            <Link
              href="/tv"
              className="rounded-full border border-ivory/20 bg-ivory/10 px-4 py-1.5 text-xs font-semibold text-ivory/80 transition hover:bg-ivory/20"
            >
              Todos
            </Link>
            {TIPOS.map((t) => (
              <Link
                key={t.slug}
                href={`/tv?tipo=${t.slug}`}
                className="rounded-full border border-ivory/10 bg-ivory/5 px-4 py-1.5 text-xs font-semibold text-ivory/60 transition hover:border-ivory/30 hover:bg-ivory/15 hover:text-ivory/90"
              >
                {t.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Conteúdo — estado vazio (canal em formação) ── */}
      <section className="container-page py-20">
        <div className="flex flex-col items-center gap-8 rounded-3xl border border-ivory/10 bg-ivory/5 px-6 py-20 text-center">
          {/* Ícone decorativo */}
          <div
            className="flex size-20 items-center justify-center rounded-3xl shadow-xl"
            style={{ background: 'linear-gradient(135deg, hsl(var(--copper)/0.3), hsl(var(--acafrao)/0.15))' }}
            aria-hidden="true"
          >
            <Play className="size-9 fill-[hsl(var(--copper))] text-[hsl(var(--copper))]" />
          </div>

          <div className="max-w-lg">
            <h2 className="font-display text-2xl font-bold text-ivory">
              O canal está em formação
            </h2>
            <p className="mt-3 text-base leading-relaxed text-ivory/60">
              Em breve a TV AxéMap estará repleta de documentários, entrevistas e conteúdo
              cultural produzido pelas comunidades. Você já pode enviar o conteúdo da sua
              casa e ele entrará em fila de revisão.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/painel"
              className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-[hsl(var(--obsidiana-deep))] shadow-lg transition hover:brightness-110"
              style={{ background: 'linear-gradient(135deg, hsl(var(--acafrao)), hsl(var(--copper)))' }}
            >
              <Upload className="size-4" aria-hidden="true" />
              Enviar conteúdo gratuitamente
            </Link>
            <a
              href="https://www.youtube.com/@axemap"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border border-ivory/25 bg-ivory/10 px-6 py-3 text-sm font-bold text-ivory backdrop-blur transition hover:bg-ivory/20"
            >
              <Tv2 className="size-4" aria-hidden="true" />
              Ver canal no YouTube
            </a>
          </div>
        </div>

        {/* Informações sobre o fluxo */}
        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {[
            { num: '01', titulo: 'Cadastre sua casa', texto: 'Crie o perfil da sua casa de axé gratuitamente no AxéMap.' },
            { num: '02', titulo: 'Envie seu conteúdo', texto: 'Documentários, entrevistas, músicas, rituais públicos — o que a sua casa tem a mostrar.' },
            { num: '03', titulo: 'Publicação gratuita', texto: 'Após moderação rápida, seu conteúdo estará na TV AxéMap para todo o Brasil.' },
          ].map((step) => (
            <div
              key={step.num}
              className="flex flex-col gap-3 rounded-2xl border border-ivory/10 bg-ivory/5 p-6"
            >
              <span
                className="inline-flex size-10 items-center justify-center rounded-xl text-sm font-black"
                style={{ background: 'hsl(var(--copper)/0.2)', color: 'hsl(var(--copper))' }}
                aria-hidden="true"
              >
                {step.num}
              </span>
              <h3 className="font-display text-base font-bold text-ivory">{step.titulo}</h3>
              <p className="text-sm leading-relaxed text-ivory/60">{step.texto}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
