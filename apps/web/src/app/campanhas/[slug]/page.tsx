import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchDiscovery } from '@/lib/seo/fetch-discovery';
import { JsonLd, websiteSchema } from '@/lib/seo/json-ld';
import { ApoiarButton } from '@/components/campanhas/apoiar-button';
import { CATEGORIA_LABEL } from '@/components/campanhas/campaign-card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BadgeCheck, Heart, MapPin, Megaphone, ReceiptText, Users } from 'lucide-react';

export const revalidate = 120;
export const dynamicParams = true;

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

interface Atualizacao {
  id: string;
  titulo: string | null;
  texto: string;
  tipo: string;
  createdAt: string;
  autor: { id: string; nome: string } | null;
}

interface Prestacao {
  id: string;
  titulo: string;
  descricao: string;
  valorAplicado: number | null;
  data: string;
}

interface CampanhaDetalhe {
  id: string;
  slug: string;
  titulo: string;
  descricao: string;
  historia: string | null;
  objetivo: string | null;
  categoria: string;
  modeloArrecad: string;
  metaFinanceira: number;
  arrecadado: number;
  apoiadoresCount: number;
  nivelVerificacao: string;
  trustScore: number | null;
  cidade: string | null;
  estado: string | null;
  latitude: number | null;
  longitude: number | null;
  imagemUrl: string | null;
  responsavelNome: string | null;
  atualizacoes: Atualizacao[];
  prestacoesContas: Prestacao[];
  terreiro: { id: string; nome: string; slug: string; trustScore: number | null } | null;
  instituicao: { id: string; nome: string; slug: string } | null;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const campanha = await fetchDiscovery<CampanhaDetalhe>(`/campanhas/${slug}`, 120);
  if (!campanha) return { title: 'Campanha não encontrada — AxéMap' };
  return {
    title: `${campanha.titulo} — Axé Map Impacto`,
    description: campanha.descricao.slice(0, 155),
    openGraph: {
      title: campanha.titulo,
      description: campanha.descricao.slice(0, 200),
      locale: 'pt_BR',
      siteName: 'AxéMap',
    },
    robots: { index: true, follow: true },
  };
}

function formatPct(arrecadado: number, meta: number) {
  return meta > 0 ? Math.min(100, Math.round((arrecadado / meta) * 100)) : 0;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function CampanhaDetalhePage({ params }: PageProps) {
  const { slug } = await params;
  const campanha = await fetchDiscovery<CampanhaDetalhe>(`/campanhas/${slug}`, 120);
  if (!campanha) notFound();

  const pct = formatPct(campanha.arrecadado, campanha.metaFinanceira);
  const verificada = campanha.nivelVerificacao !== 'NAO_VERIFICADA';

  return (
    <>
      <JsonLd data={websiteSchema()} />
      <div className="container-page py-8">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge variant="outline">{CATEGORIA_LABEL[campanha.categoria] ?? campanha.categoria}</Badge>
          {verificada && (
            <Badge variant="success">
              <BadgeCheck className="size-3" /> Campanha {campanha.nivelVerificacao === 'OFICIAL' ? 'oficial' : 'verificada'}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
          {/* Conteúdo principal */}
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-card-foreground md:text-4xl">
              {campanha.titulo}
            </h1>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground md:text-lg">{campanha.descricao}</p>

            {campanha.historia && (
              <section className="mt-8">
                <h2 className="font-display text-xl font-semibold text-card-foreground">História</h2>
                <p className="mt-2 whitespace-pre-line leading-relaxed text-muted-foreground">{campanha.historia}</p>
              </section>
            )}

            {campanha.atualizacoes.length > 0 && (
              <section className="mt-8">
                <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-card-foreground">
                  <Megaphone className="size-5 text-turquoise" /> Atualizações
                </h2>
                <div className="mt-3 space-y-4">
                  {campanha.atualizacoes.map((u) => (
                    <article key={u.id} className="rounded-xl border border-border bg-card p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{formatDate(u.createdAt)}</span>
                        {u.autor && <span className="text-xs text-muted-foreground">por {u.autor.nome}</span>}
                      </div>
                      {u.titulo && <h3 className="mt-1 font-semibold text-card-foreground">{u.titulo}</h3>}
                      <p className="mt-1 text-sm text-muted-foreground">{u.texto}</p>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {campanha.prestacoesContas.length > 0 && (
              <section className="mt-8">
                <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-card-foreground">
                  <ReceiptText className="size-5 text-turquoise" /> Prestação de contas
                </h2>
                <div className="mt-3 space-y-4">
                  {campanha.prestacoesContas.map((p) => (
                    <article key={p.id} className="rounded-xl border border-border bg-card p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{formatDate(p.data)}</span>
                        {p.valorAplicado != null && (
                          <span className="font-semibold text-turquoise-strong">{brl.format(p.valorAplicado)}</span>
                        )}
                      </div>
                      <h3 className="mt-1 font-semibold text-card-foreground">{p.titulo}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{p.descricao}</p>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-bold text-turquoise-strong">{brl.format(campanha.arrecadado)}</div>
                  <div className="text-sm text-muted-foreground">
                    de {brl.format(campanha.metaFinanceira)} · {pct}%
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="size-4" /> {campanha.apoiadoresCount}
                </div>
              </div>
              <Progress value={pct} className="mt-3" indicatorClassName="bg-turquoise" />
              <div className="mt-5">
                <ApoiarButton slug={campanha.slug} />
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 text-sm">
              <div className="flex flex-wrap gap-2">
                <span className="flex items-center gap-1.5 text-turquoise-strong">
                  <Heart className="size-4" /> Axé
                </span>
                {campanha.cidade && (
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="size-4" /> {campanha.cidade}{campanha.estado ? `, ${campanha.estado}` : ''}
                  </span>
                )}
              </div>
              {(campanha.terreiro || campanha.instituicao) && (
                <div className="mt-3 border-t border-border pt-3">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">Responsável</span>
                  <div className="mt-1 font-medium text-card-foreground">
                    {campanha.terreiro?.nome ?? campanha.instituicao?.nome ?? campanha.responsavelNome}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}