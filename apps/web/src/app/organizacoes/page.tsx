'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { Skeleton } from '@/components/ui/skeleton';
import {
  labelTipoOrganizacao,
  descricaoTipoOrganizacao,
  nomePaisPublico,
  VERIFICACAO_ORGANIZACAO,
  TIPOS_ORGANIZACAO,
} from '@/lib/organizacoes';
import { MapPin, Globe2, Building2, ShieldCheck, ArrowRight } from 'lucide-react';

interface Organizacao {
  id: string;
  nome: string;
  nomePublico?: string | null;
  slug: string;
  tipo: string;
  pais?: string | null;
  estado?: string | null;
  cidade?: string | null;
  website?: string | null;
  descricao?: string | null;
  tradicoes?: string[];
  anoFundacao?: number | null;
  areaAtuacao?: string | null;
  numOrganizacoesAssociadas?: number;
  verificacao?: string;
  trustScore?: number;
}

const badgesVerificacao: Record<string, string> = {
  nao: 'bg-muted text-muted-foreground',
  reivindicada: 'bg-warning/15 text-warning border border-warning/30',
  verificada: 'bg-success/15 text-success border border-success/30',
  parceiro: 'bg-info/15 text-info border border-info/30',
};

interface RedeAxemapProps {
  endpoint?: string;
  filtroInicial?: string;
  titulo?: ReactNode;
  subtitulo?: string;
}

export function RedeAxemapIndex({
  endpoint = '/organizacoes?limit=120',
  filtroInicial = 'TODAS',
  titulo,
  subtitulo,
}: RedeAxemapProps) {
  const [todas, setTodas] = useState<Organizacao[]>([]);
  const [filtro, setFiltro] = useState(filtroInicial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<{ items: Organizacao[] }>(endpoint);
        setTodas(res?.items ?? []);
      } catch {
        setError('Não foi possível carregar as organizações.');
      } finally {
        setLoading(false);
      }
    })();
  }, [endpoint]);

  const itens = useMemo(
    () => (filtro === 'TODAS' ? todas : todas.filter((o) => o.tipo === filtro)),
    [todas, filtro],
  );

  const contagens = useMemo(() => {
    const m: Record<string, number> = {};
    for (const o of todas) m[o.tipo] = (m[o.tipo] ?? 0) + 1;
    return m;
  }, [todas]);

  return (
    <main className="container-page space-y-10 py-16 lg:py-24" aria-labelledby="rede-titulo">
      <header className="mx-auto max-w-3xl text-center">
        <p className="mb-4 text-xs font-bold tracking-[0.2em] text-copper uppercase">Rede AxéMap</p>
        <h1 id="rede-titulo" className="font-display text-4xl font-extrabold tracking-tight text-foreground lg:text-5xl">
          {titulo ?? (<>
            Comunidades, federações, associações e{' '}
            <span className="text-brand-gradient">instituições da Rede AxéMap</span>
          </>)}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground lg:text-lg">
          {subtitulo ??
            'Terreiros, templos, federações, confederações, institutos, museus, universidades, centros culturais e projetos sociais — na África, no Brasil, no Caribe, nas Américas e na diáspora. Cada organização mantém identidade, história e forma próprias, conectadas por vínculos verificáveis e transparentes.'}
        </p>
      </header>

      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Filtros por tipo de organização">
        <button
          type="button"
          onClick={() => setFiltro('TODAS')}
          aria-pressed={filtro === 'TODAS'}
          className={
            filtro === 'TODAS'
              ? 'inline-flex items-center rounded-full bg-brand-gradient px-4 py-2 text-xs font-bold text-white shadow-md shadow-copper/25'
              : 'inline-flex items-center rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground transition hover:border-copper/40 hover:text-copper-strong'
          }
        >
          Todas <span className="ml-1.5 opacity-80">({todas.length})</span>
        </button>
        {TIPOS_ORGANIZACAO.filter((t) => (contagens[t.value] ?? 0) > 0).map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setFiltro(t.value)}
            aria-pressed={filtro === t.value}
            className={
              filtro === t.value
                ? 'inline-flex items-center rounded-full bg-brand-gradient px-4 py-2 text-xs font-bold text-white shadow-md shadow-copper/25'
                : 'inline-flex items-center rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground transition hover:border-copper/40 hover:text-copper-strong'
            }
          >
            {t.label} <span className="ml-1.5 opacity-80">({contagens[t.value] ?? 0})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-3xl" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-center text-destructive" role="alert">
          {error}
        </div>
      ) : itens.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-14 text-center">
          <Building2 className="mx-auto size-10 text-copper/60" aria-hidden="true" />
          <p className="mt-4 text-muted-foreground">
            Nenhuma organização desta categoria ainda. As primeiras organizações serão cadastradas nos próximos meses.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {itens.map((o) => {
            const verif = o.verificacao ? VERIFICACAO_ORGANIZACAO[o.verificacao] : undefined;
            return (
              <Link
                key={o.id}
                href={`/organizacoes/${o.slug}`}
                className="group flex h-full flex-col rounded-3xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-copper/50 hover:shadow-lg hover:shadow-copper/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="inline-flex w-fit rounded-full border border-copper/30 bg-copper-soft/40 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-copper-strong">
                    {labelTipoOrganizacao(o.tipo)}
                  </div>
                  {verif && (
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badgesVerificacao[verif.tom] ?? badgesVerificacao.nao}`}>
                      <ShieldCheck className="size-3" aria-hidden="true" />
                      {verif.label}
                    </span>
                  )}
                </div>
                <h2 className="mt-3 text-lg font-bold tracking-tight text-foreground">{o.nomePublico ?? o.nome}</h2>
                <p className="mt-2 line-clamp-3 text-pretty text-sm leading-relaxed text-muted-foreground">
                  {o.descricao || descricaoTipoOrganizacao(o.tipo)}
                </p>
                <dl className="mt-4 grid gap-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <dt className="flex items-center gap-1.5 font-semibold text-foreground">
                      <MapPin className="size-3.5 text-copper" aria-hidden="true" />
                      Localização
                    </dt>
                    <dd className="min-w-0">
                      {[o.cidade, o.estado && `${o.estado}`].filter(Boolean).join(', ')}
                      {[o.cidade, o.estado].filter(Boolean).some(Boolean) ? ' · ' : ''}
                      {nomePaisPublico(o.pais)}
                    </dd>
                  </div>
                  {o.anoFundacao && (
                    <div className="flex items-start gap-2">
                      <dt className="flex items-center gap-1.5 font-semibold text-foreground">
                        <Globe2 className="size-3.5 text-copper" aria-hidden="true" />
                        Fundação
                      </dt>
                      <dd>{o.anoFundacao}</dd>
                    </div>
                  )}
                  {o.tradicoes && o.tradicoes.length > 0 && (
                    <div className="flex items-start gap-2">
                      <dt className="font-semibold text-foreground">Tradições</dt>
                      <dd className="min-w-0 truncate">{o.tradicoes.join(', ')}</dd>
                    </div>
                  )}
                </dl>
                <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {o.numOrganizacoesAssociadas ? `${o.numOrganizacoesAssociadas} comunidades associadas` : 'Rede em formação'}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-copper/30 bg-copper-soft/40 px-3.5 py-1.5 text-xs font-bold text-copper-strong transition group-hover:bg-copper-soft/70">
                    Conhecer
                    <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <section className="mx-auto max-w-3xl rounded-3xl bg-brand-gradient p-8 text-white lg:p-10">
        <h2 className="font-display text-2xl font-extrabold tracking-tight">Sua comunidade faz parte da Rede</h2>
        <p className="mt-3 text-pretty text-sm leading-relaxed text-white/85">
          Federações, associações, institutos e projetos de qualquer tradição ou território podem se juntar ao AxéMap. Cada
          perfil mantém os campos que fazem sentido para o seu tipo, com verificação transparente e vínculos confirmados.
        </p>
        <Link
          href="/onboarding"
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-copper-strong shadow-lg transition hover:brightness-95"
        >
          Fazer parte da rede
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </section>
    </main>
  );
}

export default function OrganizacoesIndexPage() {
  return <RedeAxemapIndex />;
}
