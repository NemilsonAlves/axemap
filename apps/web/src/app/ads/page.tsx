import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BarChart2, MapPin, Megaphone, ShieldCheck, Tv2, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AxéMap ADS — Anuncie para a Comunidade Afro-Brasileira',
  description:
    'Alcance terreiros, casas de axé e toda a comunidade afro-brasileira com anúncios culturalmente relevantes. Publicidade transparente e ética — nunca confundida com verificação ou confiança.',
  alternates: { canonical: '/ads' },
};

const PRODUTOS = [
  {
    id: 'banner-home',
    titulo: 'Banner Home',
    descricao: 'Posição de destaque na página principal do AxéMap. Alta visibilidade para o público nacional.',
    icon: Megaphone,
    cor: 'text-copper bg-copper/10',
  },
  {
    id: 'banner-mapa',
    titulo: 'Banner no Mapa',
    descricao: 'Seu anúncio aparece na experiência do mapa interativo. Alcance quem está explorando comunidades.',
    icon: MapPin,
    cor: 'text-verde-floresta bg-verde-floresta/10',
  },
  {
    id: 'card-patrocinado',
    titulo: 'Card Patrocinado',
    descricao: 'Card identificado como PATROCINADO na listagem de casas e eventos.',
    icon: ShieldCheck,
    cor: 'text-azul-atlantico bg-azul-atlantico/10',
  },
  {
    id: 'evento-patrocinado',
    titulo: 'Evento Patrocinado',
    descricao: 'Destaque para seu evento cultural na seção de eventos do AxéMap.',
    icon: Users,
    cor: 'text-roxo-ancestral bg-roxo-ancestral/10',
  },
  {
    id: 'conteudo-patrocinado',
    titulo: 'Conteúdo Patrocinado',
    descricao: 'Artigo, vídeo ou material cultural produzido em parceria, identificado como patrocinado.',
    icon: Tv2,
    cor: 'text-terracota bg-terracota/10',
  },
  {
    id: 'midia-regional',
    titulo: 'Mídia Regional',
    descricao: 'Segmentação por estado ou cidade. Ideal para negócios e eventos locais.',
    icon: BarChart2,
    cor: 'text-acafrao bg-acafrao/10',
  },
];

export default function AdsPage() {
  return (
    <div className="min-h-screen">
      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden border-b border-border/60 bg-hero py-20 text-ivory lg:py-28"
        aria-labelledby="ads-titulo"
      >
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background: [
              'radial-gradient(ellipse 700px 500px at 80% -10%, hsl(var(--copper)/0.35), transparent 55%)',
              'radial-gradient(ellipse 500px 400px at -5% 110%, hsl(var(--verde-floresta)/0.20), transparent 55%)',
            ].join(', '),
          }}
        />
        <div
          className="absolute inset-x-0 top-0 h-1"
          aria-hidden="true"
          style={{ background: 'linear-gradient(90deg, hsl(var(--verde-floresta)), hsl(var(--acafrao)), hsl(var(--copper)), hsl(var(--terracota)), hsl(var(--roxo-ancestral)), hsl(var(--azul-atlantico)), hsl(var(--verde-floresta)))' }}
        />
        <div className="container-page relative">
          <div className="max-w-2xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-ivory/20 bg-ivory/10 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-ivory/90">
              <Megaphone className="size-3.5" aria-hidden="true" />
              AxéMap ADS
            </span>
            <h1
              id="ads-titulo"
              className="font-display text-4xl font-black leading-tight tracking-tight text-ivory sm:text-5xl"
            >
              Anuncie para quem{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--acafrao)), hsl(var(--copper)))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                vive a cultura
              </span>
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-ivory/70">
              Publicidade cultural, ética e transparente para o maior mapa de tradições afro-brasileiras
              do Brasil. Seu anúncio sempre identificado como{' '}
              <strong className="rounded bg-ivory/10 px-1.5 py-0.5 text-sm font-bold text-ivory">
                PATROCINADO
              </strong>
              {' '}— nunca confundido com verificação ou confiança.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/ads/anunciar"
                className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-black text-[hsl(var(--obsidiana-deep))] shadow-lg transition hover:brightness-110"
                style={{ background: 'linear-gradient(135deg, hsl(var(--acafrao)), hsl(var(--copper)))' }}
              >
                Quero anunciar
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/ads/campanhas"
                className="inline-flex items-center gap-2 rounded-2xl border border-ivory/25 bg-ivory/10 px-6 py-3 text-sm font-bold text-ivory backdrop-blur transition hover:bg-ivory/20"
              >
                Minhas campanhas
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Princípio ── */}
      <section className="border-b border-border/60 bg-muted/30 py-10">
        <div className="container-page">
          <div className="flex flex-wrap items-center justify-center gap-8 text-center text-sm">
            {[
              { emoji: '✅', txt: 'Sempre identificado como PATROCINADO' },
              { emoji: '🚫', txt: 'Nunca altera Trust Score ou Verificação' },
              { emoji: '🔒', txt: 'Não revela dados pessoais das casas' },
              { emoji: '🇧🇷', txt: 'Focado na comunidade brasileira' },
            ].map((item) => (
              <span key={item.txt} className="flex items-center gap-2 font-medium text-foreground">
                <span aria-hidden="true">{item.emoji}</span>
                {item.txt}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Produtos publicitários ── */}
      <section className="py-20 lg:py-28" aria-labelledby="produtos-titulo">
        <div className="container-page">
          <div className="mb-12 text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Produtos</p>
            <h2 id="produtos-titulo" className="font-display text-3xl font-black tracking-tight">
              Formatos de publicidade
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-base text-muted-foreground">
              Escolha o formato ideal para o seu objetivo. Todos com segmentação geográfica e relatório de métricas.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUTOS.map((p) => (
              <div
                key={p.id}
                className="group flex flex-col rounded-3xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <span className={`inline-flex size-11 items-center justify-center rounded-xl ${p.cor}`}>
                  <p.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-foreground">{p.titulo}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{p.descricao}</p>
                <div className="mt-5 pt-4 border-t border-border">
                  <Link
                    href="/ads/anunciar"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-copper transition hover:text-copper/80"
                  >
                    Solicitar orçamento
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-border/60 bg-muted/30 py-16 text-center">
        <div className="container-page">
          <h2 className="font-display text-2xl font-black">Pronto para anunciar?</h2>
          <p className="mx-auto mt-3 max-w-md text-base text-muted-foreground">
            Entre em contato ou crie sua campanha agora. Nossa equipe está pronta para ajudar.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/ads/anunciar"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-7 py-3 text-sm font-bold text-primary-foreground shadow-md transition hover:bg-primary/90"
            >
              Criar campanha
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <a
              href="mailto:ads@axemap.com.br"
              className="inline-flex items-center gap-2 rounded-2xl border border-border px-7 py-3 text-sm font-semibold transition hover:bg-accent"
            >
              Falar com a equipe
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
