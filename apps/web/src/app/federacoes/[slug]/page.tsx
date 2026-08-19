import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import {
  labelTipoOrganizacao,
  nomePaisPublico,
  VERIFICACAO_ORGANIZACAO,
} from '@/lib/organizacoes';
import { labelTradicao } from '@/lib/tradicoes';
import {
  MapPin,
  Globe2,
  CalendarDays,
  ShieldCheck,
  Users,
  ArrowRight,
  ExternalLink,
  Landmark,
  Scale,
} from 'lucide-react';

interface Comunidade {
  id: string;
  nome: string;
  slug: string;
  tradicao: string;
  cidade?: string | null;
  estado?: string | null;
  pais?: string | null;
}

interface OrgRel {
  id: string;
  status: string;
  terreiro: Comunidade;
}

interface Federacao {
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
    const fed = await api.get<Federacao>(`/federacoes/${encodeURIComponent(slug)}`);
    const title = `${fed.nomePublico ?? fed.nome} — Federação | AxéMap`;
    return {
      title,
      description: fed.descricao?.slice(0, 160) ?? `Perfil de federação na Rede AxéMap.`,
      alternates: { canonical: `https://axemap.com.br/federacoes/${slug}` },
      openGraph: { title, description: fed.descricao?.slice(0, 160), locale: 'pt_BR', siteName: 'AxéMap', type: 'website' },
    };
  } catch {
    return { title: 'Federação não encontrada' };
  }
}

export default async function FederacaoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let fed: Federacao;
  let rels: OrgRel[] = [];
  try {
    fed = await api.get<Federacao>(`/federacoes/${encodeURIComponent(slug)}`);
  } catch {
    notFound();
  }

  try {
    const dados = await api.get<OrgRel[]>(`/organizacoes/${encodeURIComponent(slug)}/relacionamentos`);
    rels = Array.isArray(dados) ? dados.filter((r) => r.status === 'ACEITA') : [];
  } catch {
    /* sem relacionamentos */
  }

  const verif = fed.verificacao ? VERIFICACAO_ORGANIZACAO[fed.verificacao] : undefined;
  const nome = fed.nomePublico ?? fed.nome;
  const localizacao = ([fed.cidade, fed.estado].filter(Boolean).join(', ') + (fed.pais ? ` · ${nomePaisPublico(fed.pais)}` : '')).trim();

  return (
    <main className="container-page py-12 lg:py-16">
      <nav aria-label="Trilha" className="mb-6 text-sm text-muted-foreground">
        <Link href="/federacoes" className="hover:text-copper-strong">Federações</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{nome}</span>
      </nav>

      <header className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(720px 380px at 92% -10%, hsl(var(--copper) / 0.3), transparent 60%), radial-gradient(600px 360px at -10% 110%, hsl(var(--terre) / 0.2), transparent 55%)',
          }}
          aria-hidden="true"
        />
        <div className="relative grid gap-10 p-8 lg:grid-cols-[1.3fr_0.7fr] lg:p-12">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-copper/30 bg-copper-soft/40 px-3 py-1 text-xs font-bold text-copper-strong">
                <Landmark className="size-3.5" aria-hidden="true" />
                {labelTipoOrganizacao(fed.tipo)}
              </span>
              {verif && (
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${badgeClass[fed.verificacao ?? 'NAO_VERIFICADA']}`}>
                  <ShieldCheck className="size-3.5" aria-hidden="true" />
                  {verif.label}
                </span>
              )}
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">{nome}</h1>
            {fed.areaAtuacao && (
              <p className="mt-2 text-sm font-semibold text-copper-strong">{fed.areaAtuacao}</p>
            )}
            <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground">
              {fed.descricao || 'Federação de comunidades e tradições de matriz africana — articula casas, templos e comunidades sob uma estrutura comum de representação, sem apagar a autonomia de cada uma.'}
            </p>

            <dl className="mt-6 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              {localizacao && (
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 shrink-0 text-copper" aria-hidden="true" />
                  <span>{localizacao}</span>
                </div>
              )}
              {fed.anoFundacao && (
                <div className="flex items-center gap-2">
                  <CalendarDays className="size-4 shrink-0 text-copper" aria-hidden="true" />
                  <span>Fundada em {fed.anoFundacao}</span>
                </div>
              )}
              {fed.website && (
                <div className="flex items-center gap-2">
                  <Globe2 className="size-4 shrink-0 text-copper" aria-hidden="true" />
                  <a href={fed.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-copper-strong hover:underline">
                    Site institucional <ExternalLink className="size-3" aria-hidden="true" />
                  </a>
                </div>
              )}
            </dl>
          </div>

          <div className="flex flex-col gap-4 lg:items-end">
            <div className="inline-flex flex-col items-center rounded-2xl border border-border bg-background/70 px-8 py-6">
              <span className="font-display text-4xl font-extrabold text-brand-gradient">{rels.length}</span>
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                comunidades associadas
              </span>
            </div>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Scale className="size-4 text-copper" aria-hidden="true" />
              Vínculos confirmados pelas próprias comunidades
            </p>
          </div>
        </div>
      </header>

      {fed.tradicoes && fed.tradicoes.length > 0 && (
        <section className="mt-10" aria-label="Tradições representadas">
          <h2 className="font-display text-xl font-bold tracking-tight text-foreground">Tradições representadas</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {fed.tradicoes.map((t) => (
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

      {rels.length > 0 ? (
        <section className="mt-10" aria-label="Comunidades associadas">
          <h2 className="font-display text-xl font-bold tracking-tight text-foreground">Comunidades associadas</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {rels.length} {rels.length === 1 ? 'comunidade vinculada' : 'comunidades vinculadas'} com vínculo confirmado
            pela própria comunidade — nunca criado automaticamente.
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
      ) : (
        <section className="mt-10 rounded-3xl border border-border bg-card p-8">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold tracking-tight text-foreground">
            <Users className="size-5 text-copper" aria-hidden="true" />
            Comunidades associadas
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Esta federação ainda não tem associações confirmadas públicas. Os vínculos são criados somente quando a própria
            comunidade aceita o pedido de associação — a federação nunca inclui comunidades sem o consentimento delas.
          </p>
        </section>
      )}

      {fed.historia && (
        <section className="mt-10" aria-label="História">
          <h2 className="font-display text-xl font-bold tracking-tight text-foreground">História</h2>
          <p className="mt-3 max-w-3xl whitespace-pre-line text-pretty text-sm leading-relaxed text-muted-foreground">
            {fed.historia}
          </p>
        </section>
      )}

      <section className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border bg-card p-6">
        <div className="max-w-xl">
          <h2 className="font-display text-lg font-bold tracking-tight text-foreground">Como as associações funcionam</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            A federação solicita; a comunidade decide. Um relacionamento só se torna público após a aceitação da
            comunidade, preservando a autonomia de cada casa e templo.
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