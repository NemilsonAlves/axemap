'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Compass,
  Globe2,
  MapPin,
  Pause,
  Play,
  Sparkles,
} from 'lucide-react';
import { SectionHeading } from './section-heading';
import type { ExploreData } from './data';
import {
  FILTROS_TRADICOES,
  GRADIENTE_POR_FAMILIA,
  slugTradicao,
  tradicoesPorFiltro,
} from '@/lib/tradicoes';

const GAP = 20;

function monograma(label: string): string {
  const limpo = label
    .replace(/\/.*/, '')
    .replace(/[^A-Za-zÀ-ÿ]/g, '')
    .trim();
  return limpo ? limpo.charAt(0).toUpperCase() : '·';
}

interface HomeTraditionsProps {
  explore: ExploreData | null;
}

export function HomeTraditions({ explore }: HomeTraditionsProps) {
  const [filtro, setFiltro] = React.useState('todas');
  const [perView, setPerView] = React.useState(3);
  const [active, setActive] = React.useState(0);
  const [canPrev, setCanPrev] = React.useState(false);
  const [canNext, setCanNext] = React.useState(false);
  const [autoplay, setAutoplay] = React.useState(true);

  const viewportRef = React.useRef<HTMLDivElement>(null);

  const counts = React.useMemo(() => {
    const m: Record<string, number> = {};
    for (const t of explore?.tradicoes ?? []) m[t.nome] = t.count;
    return m;
  }, [explore]);

  const itens = React.useMemo(() => tradicoesPorFiltro(filtro), [filtro]);
  const totalPages = Math.max(1, Math.ceil(itens.length / perView));

  React.useEffect(() => {
    function update() {
      const w = window.innerWidth;
      setPerView(w < 640 ? 1 : w < 1100 ? 2 : 3);
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const passo = React.useCallback(() => {
    const el = viewportRef.current;
    const slide = el?.querySelector<HTMLElement>('[data-slide]');
    if (!el || !slide) return 0;
    return slide.getBoundingClientRect().width + GAP;
  }, []);

  const sync = React.useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const p = passo();
    if (p === 0) return;
    const page = Math.round(el.scrollLeft / p);
    setActive(Math.max(0, Math.min(page, totalPages - 1)));
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, [passo, totalPages]);

  React.useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onScroll = () => sync();
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    sync();
    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [sync]);

  React.useEffect(() => {
    const el = viewportRef.current;
    if (el) el.scrollTo({ left: 0, behavior: 'auto' });
    setActive(0);
  }, [filtro, perView]);

  React.useEffect(() => {
    if (!autoplay) return;
    const id = window.setInterval(() => {
      const el = viewportRef.current;
      if (!el || el.matches(':hover')) return;
      const p = passo();
      if (p === 0) return;
      const page = Math.round(el.scrollLeft / p);
      if (page >= totalPages - 1) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: p, behavior: 'smooth' });
      }
    }, 4500);
    return () => window.clearInterval(id);
  }, [autoplay, passo, totalPages]);

  function scrollDir(dir: 1 | -1) {
    const el = viewportRef.current;
    if (!el) return;
    const p = passo();
    el.scrollBy({ left: dir * p, behavior: 'smooth' });
  }

  function goTo(page: number) {
    const el = viewportRef.current;
    if (!el) return;
    const p = passo();
    el.scrollTo({ left: page * p, behavior: 'smooth' });
  }

  return (
    <section className="container-page relative py-20 lg:py-24" aria-labelledby="tradicoes-titulo">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <SectionHeading
              eyebrow="África · Diáspora · Conhecimento · Memória"
              id="tradicoes-titulo"
              title="Explore as tradições africanas e suas diásporas"
              description="Tradições, sistemas de conhecimento, povos e expressões culturais que atravessaram gerações e territórios — cada um com identidade, origem, língua e história próprias. União sem unificação."
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAutoplay((v) => !v)}
              aria-label={autoplay ? 'Pausar rotação automática' : 'Retomar rotação automática'}
              className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:border-copper/40 hover:text-copper-strong"
            >
              {autoplay ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />}
            </button>
            <button
              type="button"
              onClick={() => scrollDir(-1)}
              disabled={!canPrev}
              aria-label="Anterior"
              className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:border-copper/40 hover:text-copper-strong disabled:pointer-events-none disabled:opacity-35"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => scrollDir(1)}
              disabled={!canNext}
              aria-label="Próximo"
              className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:border-copper/40 hover:text-copper-strong disabled:pointer-events-none disabled:opacity-35"
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtros de tradições">
          {FILTROS_TRADICOES.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFiltro(f.id)}
              aria-pressed={filtro === f.id}
              className={
                filtro === f.id
                  ? 'inline-flex items-center rounded-full bg-brand-gradient px-4 py-2 text-xs font-bold text-white shadow-md shadow-copper/25 transition'
                  : 'inline-flex items-center rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground transition hover:border-copper/40 hover:text-copper-strong'
              }
            >
              {f.label}
            </button>
          ))}
        </div>

        <div
          ref={viewportRef}
          role="region"
          aria-roledescription="carrossel"
          aria-label="Tradições africanas e suas diásporas"
          className="flex snap-x snap-mandatory overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ gap: GAP }}
        >
          {itens.map((t) => (
            <div
              key={t.nome}
              data-slide
              className="min-w-0 shrink-0 snap-start"
              style={{ width: `calc((100% - ${GAP * (perView - 1)}px) / ${perView})` }}
            >
              <Link
                href={`/tradicao/${slugTradicao(t.nome)}`}
                className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card transition hover:-translate-y-1 hover:border-copper/50 hover:shadow-lg hover:shadow-copper/10"
              >
                <div className={`relative h-32 overflow-hidden bg-gradient-to-br ${GRADIENTE_POR_FAMILIA[t.familia] ?? 'from-copper to-terracota'}`}>
                  <svg className="absolute inset-0 h-full w-full opacity-30" viewBox="0 0 320 128" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                    <g fill="none" stroke="hsl(0 0% 100% / 0.55)" strokeWidth="1.5">
                      {[18, 42, 66, 90].map((r) => (
                        <circle key={r} cx="272" cy="64" r={r} />
                      ))}
                      {[14, 34, 54].map((r) => (
                        <circle key={r} cx="48" cy="40" r={r} />
                      ))}
                    </g>
                  </svg>
                  <span className="absolute bottom-3 left-4 font-display text-5xl font-extrabold text-white/90 drop-shadow-sm" aria-hidden="true">
                    {monograma(t.label)}
                  </span>
                  {t.destaque && (
                    <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-ancestral/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-nevoa">
                      <Sparkles className="size-3" aria-hidden="true" />
                      UNESCO 2008
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-5">
                  {/* Tipo conceitual — diferencia sistemas de conhecimento, tradições, religiões, etc. */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex w-fit rounded-full border border-copper/30 bg-copper-soft/40 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-copper-strong">
                      {t.categoria}
                    </span>
                    {t.tipo === 'sistema-conhecimento' && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-dourado-sol/40 bg-dourado-sol/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-dourado-sol">
                        Sistema de conhecimento
                      </span>
                    )}
                    {t.continente === 'África' && t.tipo !== 'sistema-conhecimento' && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-fern/40 bg-fern/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-fern">
                        Africana
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 text-lg font-bold tracking-tight text-foreground">{t.label}</h3>
                  <p className="mt-2 line-clamp-3 text-pretty text-sm leading-relaxed text-muted-foreground">
                    {t.descricao}
                  </p>

                  <dl className="mt-4 grid gap-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <dt className="flex items-center gap-1.5 font-semibold text-foreground">
                        <MapPin className="size-3.5 text-copper" aria-hidden="true" />
                        Origem
                      </dt>
                      <dd className="min-w-0">{t.regiao}</dd>
                    </div>
                    <div className="flex items-start gap-2">
                      <dt className="flex items-center gap-1.5 font-semibold text-foreground">
                        <Globe2 className="size-3.5 text-copper" aria-hidden="true" />
                        Países
                      </dt>
                      <dd className="min-w-0">{t.paises.join(', ')}</dd>
                    </div>
                    {t.diaspora.length > 0 && (
                      <div className="flex items-start gap-2">
                        <dt className="flex items-center gap-1.5 font-semibold text-foreground">
                          <Compass className="size-3.5 text-copper" aria-hidden="true" />
                          Fora da África
                        </dt>
                        <dd className="min-w-0">{t.diaspora.join(', ')}</dd>
                      </div>
                    )}
                  </dl>

                  <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                    <span className="text-xs font-semibold text-muted-foreground">
                      {counts[t.nome] ?? 0} {counts[t.nome] === 1 ? 'comunidade' : 'comunidades'} cadastradas
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-copper/30 bg-copper-soft/40 px-3.5 py-1.5 text-xs font-bold text-copper-strong transition group-hover:bg-copper-soft/70">
                      Explorar
                      <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2" role="tablist" aria-label="Navegação do carrossel">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Ir para o grupo ${i + 1}`}
              aria-current={i === active}
              className={
                i === active
                  ? 'h-2 w-6 rounded-full bg-brand-gradient transition-all'
                  : 'h-2 w-2 rounded-full bg-border transition-all hover:bg-copper/40'
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}