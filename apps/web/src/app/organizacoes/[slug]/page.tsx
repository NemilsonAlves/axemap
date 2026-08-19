import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import {
  labelTipoOrganizacao,
  descricaoTipoOrganizacao,
  nomePaisPublico,
  VERIFICACAO_ORGANIZACAO,
} from '@/lib/organizacoes';
import { labelTradicao } from '@/lib/tradicoes';
import {
  MapPin,
  Globe2,
  CalendarDays,
  Building2,
  ShieldCheck,
  Network,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface Comunidade {
  id: string;
  nome: string;
  slug: string;
  tradicao: string;
  cidade?: string | null;
  estado?: string | null;
  pais?: string | null;
  fotoUrl?: string | null;
  isVerified?: boolean;
  verificationLevel?: string;
}

interface OrgRel {
  id: string;
  status: string;
  terreiro: Comunidade;
}

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
  historia?: string | null;
  tradicoes?: string[];
  anoFundacao?: number | null;
  areaAtuacao?: string | null;
  numOrganizacoesAssociadas?: number;
  verificacao?: string;
  trustScore?: number;
  publicadoEm?: string | null;
  createdAt?: string;
  comunidades: Comunidade[];
  totalTerreiros: number;
}

const badgeClass: Record<string, string> = {
  NAO_VERIFICADA: 'bg-muted text-muted-foreground border border-border',
  REIVINDICADA: 'bg-warning/15 text-warning border border-warning/30',
  VERIFICADA: 'bg-success/15 text-success border border-success/30',
  ORGANIZACAO_VERIFICADA: 'bg-success/15 text-success border border-success/30',
  PARCEIRO_INSTITUCIONAL: 'bg-info/15 text-info border border-info/30',
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const org = await api.get<Organizacao>(`/organizacoes/${encodeURIComponent(slug)}`);
    const title = `${org.nomePublico ?? org.nome} | AxéMap`;
    return {
      title,
      description: org.descricao?.slice(0, 160) ?? `Perfil de ${labelTipoOrganizacao(org.tipo)} na Rede AxéMap.`,
      alternates: { canonical: `https://axemap.com.br/organizacoes/${slug}` },
      openGraph: { title, description: org.descricao?.slice(0, 160), locale: 'pt_BR', siteName: 'AxéMap', type: 'website' },
    };
  } catch {
    return { title: 'Organização não encontrada' };
  }
}

export default async function OrganizacaoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let org: Organizacao;
  let rels: OrgRel[] = [];
  try {
    org = await api.get<Organizacao>(`/organizacoes/${encodeURIComponent(slug)}`);
  } catch {
    notFound();
  }

  try {
    const dados = await api.get<OrgRel[]>(`/organizacoes/${encodeURIComponent(slug)}/relacionamentos`);
    rels = Array.isArray(dados) ? dados.filter((r) => r.status === 'ACEITA') : [];
  } catch {
    /* sem relacionamentos */
  }

  const verif = org.verificacao ? VERIFICACAO_ORGANIZACAO[org.verificacao] : undefined;
  const nome = org.nomePublico ?? org.nome;
  const localizacao = ([org.cidade, org.estado].filter(Boolean).join(', ') + (org.pais ? ` · ${nomePaisPublico(org.pais)}` : '')).trim();

  return (
    <main className="container-page py-12 lg:py-16">
      <nav aria-label="Trilha" className="mb-6 text-sm text-muted-foreground">
        <Link href="/organizacoes" className="hover:text-copper-strong">Rede AxéMap</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{nome}</span>
      </nav>

      <header className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(720px 380px at 92% -10%, hsl(var(--copper) / 0.3), transparent 60%), radial-gradient(600px 360px at -10% 110%, hsl(var(--bronze) / 0.22), transparent 55%)',
          }}
          aria-hidden="true"
        />
        <div className="relative grid gap-10 p-8 lg:grid-cols-[1.3fr_0.7fr] lg:p-12">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-copper/30 bg-copper-soft/40 px-3 py-1 text-xs font-bold text-copper-strong">
                <Building2 className="size-3.5" aria-hidden="true" />
                {labelTipoOrganizacao(org.tipo)}
              </span>
              {verif && (
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${badgeClass[org.verificacao ?? 'NAO_VERIFICADA']}`}>
                  <ShieldCheck className="size-3.5" aria-hidden="true" />
                  {verif.label}
                </span>
              )}
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">{nome}</h1>
            {org.areaAtuacao && (
              <p className="mt-2 text-sm font-semibold text-copper-strong">{org.areaAtuacao}</p>
            )}
            <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground">
              {org.descricao || descricaoTipoOrganizacao(org.tipo)}
            </p>

            <dl className="mt-6 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              {localizacao && (
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 shrink-0 text-copper" aria-hidden="true" />
                  <span>{localizacao}</span>
                </div>
              )}
              {org.anoFundacao && (
                <div className="flex items-center gap-2">
                  <CalendarDays className="size-4 shrink-0 text-copper" aria-hidden="true" />
                  <span>Fundação em {org.anoFundacao}</span>
                </div>
              )}
              {org.website && (
                <div className="flex items-center gap-2">
                  <Globe2 className="size-4 shrink-0 text-copper" aria-hidden="true" />
                  <a href={org.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-copper-strong hover:underline">
                    Site oficial <ExternalLink className="size-3" aria-hidden="true" />
                  </a>
                </div>
              )}
            </dl>
          </div>

          <div className="flex flex-col gap-4 lg:items-end">
            <div className="inline-flex flex-col items-center rounded-2xl border border-border bg-background/70 px-8 py-6">
              <span className="font-display text-4xl font-extrabold text-brand-gradient">{org.totalTerreiros}</span>
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                comunidades vinculadas
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Network className="size-4 text-copper" aria-hidden="true" />
              Vínculos confirmados e verificáveis
            </span>
          </div>
        </div>
      </header>

      {org.tradicoes && org.tradicoes.length > 0 && (
        <section className="mt-10" aria-label="Tradições relacionadas">
          <h2 className="font-display text-xl font-bold tracking-tight text-foreground">Tradições e expressões culturais</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {org.tradicoes.map((t) => (
              <Link
                key={t}
                href={`/tradicao/${t.toLowerCase().replace(/_/g, '-')}`}
                className="inline-flex items-center rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition hover:border-copper/50 hover:text-copper-strong"
              >
                {labelTradicao(t)}
              </Link>
            ))}
          </div>
        </section>
      )}

      {rels.length > 0 && (
        <section className="mt-10" aria-label="Comunidades vinculadas">
          <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
            Comunidades e casas vinculadas
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {rels.length} {rels.length === 1 ? 'comunidade vinculada' : 'comunidades vinculadas'} com vínculo confirmado.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {rels.map((r) => (
              <Link
                key={r.id}
                href={`/terreiro/${r.terreiro.slug}`}
                className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition hover:border-copper/50 hover:shadow-md hover:shadow-copper/10"
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-gradient font-display text-lg font-bold text-white">
                  {r.terreiro.nome.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">{r.terreiro.nome}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {r.terreiro.tradicao ? labelTradicao(r.terreiro.tradicao) : 'Comunidade'} ·{' '}
                    {[r.terreiro.cidade, r.terreiro.estado].filter(Boolean).join(', ') || nomePaisPublico(r.terreiro.pais)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {org.historia && (
        <section className="mt-10" aria-label="História">
          <h2 className="font-display text-xl font-bold tracking-tight text-foreground">História</h2>
          <p className="mt-3 max-w-3xl whitespace-pre-line text-pretty text-sm leading-relaxed text-muted-foreground">
            {org.historia}
          </p>
        </section>
      )}

      <section className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border bg-card p-6">
        <div className="max-w-xl">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-foreground">
            <Network className="size-5 text-copper" aria-hidden="true" /> Ver no Axé Graph
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Explore as conexões desta organização com comunidades, territórios, eventos e conteúdos no grafo de conhecimento.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/protecao?tipo=ORGANIZACAO&entidadeId=${encodeURIComponent(slug)}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground underline-offset-2 hover:text-destructive hover:underline"
          >
            Denunciar esta página
          </Link>
          <Link
            href={`/grafo?q=${encodeURIComponent(nome)}`}
            className="inline-flex items-center gap-2 rounded-2xl bg-brand-gradient px-5 py-3 text-sm font-bold text-white shadow-md shadow-copper/25 transition hover:brightness-105"
          >
            Abrir no grafo <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
