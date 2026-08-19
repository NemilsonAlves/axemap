import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, Compass, Globe2, MapPin, Sparkles } from 'lucide-react';
import { api } from '@/lib/api-client';
import { ORDEM_FAMILIAS, TRADICOES_CATALOGO, labelTradicao, slugTradicao } from '@/lib/tradicoes';

export const metadata: Metadata = {
  title: 'Tradições | AxéMap',
  description:
    'Explore as tradições africanas e suas diásporas no AxéMap: Ifá, Candomblé, Umbanda, Egungun, Santería, Vodou, Jurema, Batuque, Tambor de Mina e mais — da África para o mundo.',
};

export default async function TradicaoIndexPage() {
  let counts: Record<string, number> = {};

  try {
    const explore = await api.get<{ tradicoes?: Array<{ nome: string; count: number }> }>('/discovery/explore');
    const lista = explore?.tradicoes;
    if (Array.isArray(lista)) {
      counts = Object.fromEntries(lista.map((t) => [t.nome, t.count]));
    }
  } catch {}

  const destaque = TRADICOES_CATALOGO.find((t) => t.destaque) ?? TRADICOES_CATALOGO[0];
  const demais = TRADICOES_CATALOGO.filter((t) => t !== destaque);
  const familias = ORDEM_FAMILIAS.map((familia) => ({
    familia,
    itens: demais.filter((t) => t.familia === familia),
  })).filter((f) => f.itens.length > 0);

  const naoCatalogadas = Object.keys(counts).filter(
    (nome) => !TRADICOES_CATALOGO.some((t) => t.nome === nome),
  );

  return (
    <main className="relative bg-background">
      <section className="container-page relative px-4 pt-16 pb-10 lg:pt-24 lg:pb-14">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-xs font-bold tracking-[0.2em] text-copper uppercase">
            Das tradições africanas para suas diásporas
          </p>
          <h1 className="text-balance text-4xl font-extrabold tracking-tight text-foreground lg:text-5xl">
            As tradições de matriz africana, <span className="text-brand-gradient">da África para o mundo</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground lg:text-lg">
            Ifá, Candomblé, Umbanda, Egungun, Santería, Vodou, Jurema, Batuque, Tambor de Mina e tantas outras — na África, no
            Caribe, nas Américas, na Europa e além. Cada tradição tem história, povo, língua, raiz e forma própria, com suas
            origens, influências, continuidades e transformações. Nenhuma é mais ou menos que a outra: o AxéMap é uma
            plataforma de descoberta e conhecimento, não uma autoridade religiosa.
          </p>
        </div>
      </section>

      <div className="container-page px-4 pb-20 lg:pb-28">
        <Link
          href={`/tradicao/${slugTradicao(destaque.nome)}`}
          className="group relative block overflow-hidden rounded-3xl border border-copper/40 bg-card p-6 shadow-lg shadow-copper/10 transition hover:-translate-y-0.5 hover:border-copper/70 hover:shadow-copper/20 lg:p-10"
        >
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-gradient px-3 py-1 text-xs font-bold text-white">
                  <Sparkles className="size-3.5" aria-hidden="true" />
                  Sistema de conhecimento yorùbá
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-copper/30 bg-copper-soft/40 px-3 py-1 text-xs font-semibold text-copper-strong">
                  <BookOpen className="size-3.5" aria-hidden="true" />
                  Patrimônio da UNESCO desde 2008
                </span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground lg:text-4xl">{destaque.label}</h2>
              <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground lg:text-base">
                {destaque.descricao}
              </p>
              <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
                <Globe2 className="size-4 text-copper" aria-hidden="true" /> Origem: {destaque.regiao} · {destaque.paises.join(', ')}
              </p>
            </div>
<div className="flex flex-col items-start gap-4 lg:items-end">
              <div className="text-3xl font-extrabold text-brand-gradient">{counts[destaque.nome] ?? 0}</div>
              <div className="text-sm font-medium text-muted-foreground">comunidades cadastradas</div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-copper/30 bg-copper-soft/40 px-4 py-2 text-sm font-semibold text-copper-strong transition group-hover:bg-copper-soft/70">
                Explorar {destaque.label}
                <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden="true" />
              </span>
              {destaque.nome === 'IFA' && (
                <Link
                  href="/ifa"
                  className="inline-flex items-center gap-1.5 rounded-full border border-dourado-sol/40 bg-dourado-sol/10 px-4 py-2 text-sm font-semibold text-copper-strong transition hover:bg-dourado-sol/20"
                >
                  Conhecer Ifá em profundidade
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              )}
            </div>
          </div>
        </Link>

        <div className="mt-14 grid gap-10">
          {familias.map(({ familia, itens }) => (
            <section key={familia} aria-label={`Tradições ${familia}`}>
              <div className="mb-4 flex items-baseline gap-3">
                <h3 className="text-lg font-bold tracking-tight text-foreground">{familia}</h3>
                <span className="h-px flex-1 bg-border" aria-hidden="true" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {itens.map((t) => (
                  <Link
                    key={t.nome}
                    href={`/tradicao/${slugTradicao(t.nome)}`}
                    className="group flex flex-col rounded-3xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-copper/50 hover:shadow-md hover:shadow-copper/10"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                      <span className="inline-flex w-fit rounded-full border border-copper/30 bg-copper-soft/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-copper-strong">
                        {t.categoria}
                      </span>
                      <h4 className="mt-2 text-lg font-bold text-foreground">{t.label}</h4>
                      <p className="mt-2 line-clamp-3 text-pretty text-sm leading-relaxed text-muted-foreground">
                        {t.descricao}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="size-3.5 shrink-0 text-copper" aria-hidden="true" />
                      <span className="truncate">{t.regiao}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Globe2 className="size-3.5 shrink-0 text-copper" aria-hidden="true" />
                      <span className="truncate">{t.paises.join(', ')}</span>
                    </span>
                    {t.diaspora.length > 0 && (
                      <span className="flex items-center gap-1.5">
                        <Compass className="size-3.5 shrink-0 text-copper" aria-hidden="true" />
                        <span className="truncate">Na diáspora (fora da África): {t.diaspora.join(', ')}</span>
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1 rounded-full border border-copper/30 bg-copper-soft/40 px-2.5 py-1 text-xs font-semibold text-copper-strong">
                      {counts[t.nome] ?? 0} comunidades
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-copper-strong transition group-hover:translate-x-0.5">
                      Explorar tradição <ArrowRight className="size-3.5" aria-hidden="true" />
                    </span>
                  </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        {naoCatalogadas.length > 0 && (
          <section className="mt-14" aria-label="Outras tradições">
            <div className="mb-4 flex items-baseline gap-3">
              <h3 className="text-lg font-bold tracking-tight text-foreground">Outras tradições cadastradas</h3>
              <span className="h-px flex-1 bg-border" aria-hidden="true" />
            </div>
            <div className="flex flex-wrap gap-3">
              {naoCatalogadas.map((nome) => (
                <Link
                  key={nome}
                  href={`/tradicao/${slugTradicao(nome)}`}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition hover:border-copper/50 hover:text-copper-strong"
                >
                  {labelTradicao(nome)}
                  <span className="text-xs font-semibold text-copper">({counts[nome]})</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mt-16 overflow-hidden rounded-3xl bg-brand-gradient p-8 text-white lg:p-12">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <h3 className="text-2xl font-extrabold tracking-tight">Nem todas as comunidades estão cadastradas ainda</h3>
              <p className="mt-3 text-pretty text-sm leading-relaxed text-white/85 lg:text-base">
                Se você integra uma casa, terreiro, templo ou comunidade de qualquer uma dessas tradições — na África, no
                Brasil, no Caribe, nas Américas, na Europa ou em outro território da diáspora — o AxéMap é aberto a você.
                Cadastre sua comunidade e alcance quem procura por ela.
              </p>
            </div>
            <div className="lg:justify-self-end">
              <Link
                href="/cadastro"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-copper-strong shadow-lg transition hover:brightness-95"
              >
                Cadastrar minha comunidade
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}