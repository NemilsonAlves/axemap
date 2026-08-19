'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { SectionHeading } from './section-heading';
import { Reveal } from './reveal';
import { labelTipoOrganizacao, descricaoTipoOrganizacao } from '@/lib/organizacoes';
import {
  Building2,
  ShieldCheck,
  ArrowRight,
  ArrowUpRight,
  Landmark,
  Handshake,
  Network,
  Users,
} from 'lucide-react';

interface Organizacao {
  id: string;
  nome: string;
  nomePublico?: string | null;
  slug: string;
  tipo: string;
  pais?: string | null;
  estado?: string | null;
  cidade?: string | null;
  descricao?: string | null;
  verificacao?: string;
  numOrganizacoesAssociadas?: number;
}

const tiposDestaque = [
  { tipo: 'FEDERACAO', icon: Building2, cor: 'text-roxo-ancestral bg-roxo-ancestral/10', ring: 'hover:border-roxo-ancestral/40' },
  { tipo: 'ASSOCIACAO', icon: Handshake, cor: 'text-coral bg-coral/10', ring: 'hover:border-coral/40' },
  { tipo: 'INSTITUTO', icon: Landmark, cor: 'text-azul-atlantico bg-azul-atlantico/10', ring: 'hover:border-azul-atlantico/40' },
  { tipo: 'ORGANIZACAO', icon: Network, cor: 'text-fern bg-fern/10', ring: 'hover:border-fern/40' },
];

export function HomeRedeInstitucional() {
  const [organizacoes, setOrganizacoes] = useState<Organizacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<{ items: Organizacao[] }>('/organizacoes?limit=60');
        setOrganizacoes(res?.items ?? []);
      } catch {
        setOrganizacoes([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const federacoes = useMemo(
    () => organizacoes.filter((o) => o.tipo === 'FEDERACAO').slice(0, 4),
    [organizacoes],
  );
  const demais = useMemo(
    () => organizacoes.filter((o) => o.tipo !== 'FEDERACAO').slice(0, 4),
    [organizacoes],
  );

  const categoriaIcon = (tipo: string) =>
    tiposDestaque.find((t) => t.tipo === tipo) ?? tiposDestaque[3];

  return (
    <section
      className="relative overflow-hidden border-y border-border/60 bg-gradient-to-b from-background via-roxo-ancestral/[0.03] to-background py-20 lg:py-28"
      aria-labelledby="rede-institucional-titulo"
    >
      <div className="container-page">
        <Reveal>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Rede AxéMap"
              id="rede-institucional-titulo"
              title={
                <>
                  Uma rede que{' '}
                  <span className="text-brand-gradient">conecta o axé.</span>
                </>
              }
              description="Casas de axé, federações, organizações, instituições, pesquisadores e projetos culturais — conectados por vínculos verificáveis, com identidade e história próprias."
            />
            <Link
              href="/organizacoes"
              className="group inline-flex shrink-0 items-center gap-2 rounded-2xl bg-universo-rede px-5 py-3 text-sm font-bold text-white shadow-md shadow-roxo-ancestral/25 transition hover:brightness-110"
            >
              Conhecer a Rede AxéMap
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>
        </Reveal>

        {loading ? (
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-44 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : organizacoes.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-roxo-ancestral/30 bg-card p-12 text-center">
            <Network className="mx-auto size-12 text-roxo-ancestral/60" aria-hidden="true" />
            <p className="mt-4 font-display text-lg font-semibold text-foreground">
              A Rede AxéMap está em formação
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              Federações, associações e institutos começam a ser cadastrados em breve. Enquanto isso, explore as
              comunidades e tradições já presentes no mapa.
            </p>
            <Link
              href="/auth/cadastro"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-roxo-ancestral/40 bg-roxo-ancestral/10 px-5 py-3 text-sm font-bold text-roxo-ancestral transition hover:bg-roxo-ancestral/20"
            >
              Cadastrar uma organização
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {federacoes.map((o, i) => {
              const cat = categoriaIcon(o.tipo);
              return (
                <Reveal key={o.id} delay={i * 0.05}>
                  <Link
                    href={`/organizacoes/${o.slug}`}
                    className={`group flex h-full flex-col rounded-3xl border border-border bg-card p-5 shadow-sm transition-all duration-[var(--duration-base)] hover:-translate-y-1 hover:shadow-lg ${cat.ring}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className={`inline-flex size-11 items-center justify-center rounded-xl ${cat.cor}`}>
                        <cat.icon className="size-5" aria-hidden="true" />
                      </span>
                      <span className="inline-flex rounded-full border border-border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                        {labelTipoOrganizacao(o.tipo)}
                      </span>
                    </div>
                    <h3 className="mt-4 font-display text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-roxo-ancestral">
                      {o.nomePublico ?? o.nome}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                      {o.descricao || descricaoTipoOrganizacao(o.tipo)}
                    </p>
                    <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        {o.verificacao === 'verificada' && (
                          <>
                            <ShieldCheck className="size-3.5 text-fern" aria-hidden="true" />
                            Verificada
                          </>
                        )}
                        {o.numOrganizacoesAssociadas
                          ? `${o.numOrganizacoesAssociadas} comunidades`
                          : o.verificacao === 'verificada'
                            ? ''
                            : 'Rede em formação'}
                      </span>
                      <ArrowUpRight className="size-4 text-roxo-ancestral transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                    </div>
                  </Link>
                </Reveal>
              );
            })}

            {demais.slice(0, 4 - federacoes.length).map((o, i) => {
              const cat = categoriaIcon(o.tipo);
              return (
                <Reveal key={o.id} delay={i * 0.05}>
                  <Link
                    href={`/organizacoes/${o.slug}`}
                    className={`group flex h-full flex-col rounded-3xl border border-border bg-card p-5 shadow-sm transition-all duration-[var(--duration-base)] hover:-translate-y-1 hover:shadow-lg ${cat.ring}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className={`inline-flex size-11 items-center justify-center rounded-xl ${cat.cor}`}>
                        <cat.icon className="size-5" aria-hidden="true" />
                      </span>
                      <span className="inline-flex rounded-full border border-border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                        {labelTipoOrganizacao(o.tipo)}
                      </span>
                    </div>
                    <h3 className="mt-4 font-display text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-roxo-ancestral">
                      {o.nomePublico ?? o.nome}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                      {o.descricao || descricaoTipoOrganizacao(o.tipo)}
                    </p>
                    <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        {o.verificacao === 'verificada' && (
                          <>
                            <ShieldCheck className="size-3.5 text-fern" aria-hidden="true" />
                            Verificada
                          </>
                        )}
                        {o.numOrganizacoesAssociadas
                          ? `${o.numOrganizacoesAssociadas} comunidades`
                          : o.verificacao === 'verificada'
                            ? ''
                            : 'Rede em formação'}
                      </span>
                      <ArrowUpRight className="size-4 text-roxo-ancestral transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        )}

        <Reveal>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground">
            {tiposDestaque.map((t) => (
              <span key={t.tipo} className="inline-flex items-center gap-2">
                <span className={`inline-flex size-7 items-center justify-center rounded-lg ${t.cor}`}>
                  <t.icon className="size-3.5" aria-hidden="true" />
                </span>
                {labelTipoOrganizacao(t.tipo)}
              </span>
            ))}
            <span className="inline-flex items-center gap-2">
              <span className="inline-flex size-7 items-center justify-center rounded-lg bg-fern/10 text-fern">
                <Users className="size-3.5" aria-hidden="true" />
              </span>
              Comunidades
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}