'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { api } from '@/lib/api-client';
import {
  ArrowLeft,
  BarChart2,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  MousePointerClick,
  XCircle,
} from 'lucide-react';

interface AdCampanha {
  id: string;
  titulo: string;
  descricao?: string;
  destinatarioUrl?: string;
  imagemUrl?: string;
  placement: string;
  category: string;
  cidadeAlvo?: string;
  estadoAlvo?: string;
  orcamentoBRL: number;
  status: string;
  motivoRejeicao?: string;
  impressoes: number;
  cliques: number;
  dataInicio: string;
  dataFim?: string;
  publicadoEm?: string;
  createdAt: string;
}

const STATUS_LABEL: Record<string, { label: string; icon: typeof CheckCircle2; cls: string; bg: string }> = {
  RASCUNHO:            { label: 'Rascunho',       icon: Clock,        cls: 'text-muted-foreground', bg: 'bg-muted' },
  AGUARDANDO_PAGAMENTO:{ label: 'Ag. Pagamento',   icon: Clock,        cls: 'text-amber-600',       bg: 'bg-amber-100 dark:bg-amber-900/20' },
  EM_REVISAO:          { label: 'Em Revisão',      icon: Clock,        cls: 'text-azul-atlantico',  bg: 'bg-azul-atlantico/10' },
  APROVADO:            { label: 'Aprovado',        icon: CheckCircle2, cls: 'text-verde-floresta',  bg: 'bg-verde-floresta/10' },
  PUBLICADO:           { label: 'Publicado',       icon: CheckCircle2, cls: 'text-verde-floresta',  bg: 'bg-verde-floresta/10' },
  PAUSADO:             { label: 'Pausado',         icon: Clock,        cls: 'text-amber-600',       bg: 'bg-amber-100 dark:bg-amber-900/20' },
  REJEITADO:           { label: 'Rejeitado',       icon: XCircle,      cls: 'text-destructive',     bg: 'bg-destructive/10' },
  BLOQUEADO:           { label: 'Bloqueado',       icon: XCircle,      cls: 'text-destructive',     bg: 'bg-destructive/10' },
  ENCERRADO:           { label: 'Encerrado',       icon: Clock,        cls: 'text-muted-foreground', bg: 'bg-muted' },
};

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AdCampanhaDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, loading: authLoading } = useAuth();
  const [campanha, setCampanha] = useState<AdCampanha | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await api.get<AdCampanha>(`/ads/pedidos/${id}`);
        setCampanha(res);
      } catch {
        setError('Campanha não encontrada.');
      } finally {
        setLoading(false);
      }
    })();
  }, [user, id]);

  if (authLoading || loading) {
    return (
      <div className="container-page py-20">
        <div className="space-y-4">
          <div className="h-8 w-48 animate-pulse rounded-xl bg-muted" />
          <div className="h-64 animate-pulse rounded-2xl bg-muted" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-page py-24 text-center">
        <p className="text-muted-foreground">Faça login para ver os detalhes da campanha.</p>
        <Link href="/auth/login" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
          Entrar
        </Link>
      </div>
    );
  }

  if (error || !campanha) {
    return (
      <div className="container-page py-24 text-center">
        <XCircle className="mx-auto size-12 text-destructive/40" />
        <p className="mt-4 text-muted-foreground">Campanha não encontrada.</p>
        <Link href="/ads/campanhas" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-copper">
          <ArrowLeft className="size-4" /> Voltar
        </Link>
      </div>
    );
  }

  const st = STATUS_LABEL[campanha.status] ?? STATUS_LABEL.RASCUNHO;
  const Icon = st.icon;
  const ctr = campanha.impressoes > 0 ? ((campanha.cliques / campanha.impressoes) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container-page max-w-4xl py-10">
        <Link href="/ads/campanhas" className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition hover:text-foreground">
          <ArrowLeft className="size-3.5" /> Minhas Campanhas
        </Link>

        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-black tracking-tight">{campanha.titulo}</h1>
            <div className="mt-2 flex items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${st.bg} ${st.cls}`}>
                <Icon className="size-3.5" /> {st.label}
              </span>
              <span className="text-xs text-muted-foreground">
                {campanha.placement.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
          {campanha.destinatarioUrl && (
            <a
              href={campanha.destinatarioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground transition hover:border-copper/40 hover:text-copper"
            >
              <ExternalLink className="size-3.5" /> Destino
            </a>
          )}
        </div>

        {campanha.descricao && (
          <p className="mb-8 text-sm leading-relaxed text-muted-foreground">{campanha.descricao}</p>
        )}

        {campanha.motivoRejeicao && (
          <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <strong>Motivo da rejeição:</strong> {campanha.motivoRejeicao}
          </div>
        )}

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Eye className="size-4" /> Impressões
            </div>
            <p className="mt-2 font-display text-3xl font-black">{campanha.impressoes.toLocaleString('pt-BR')}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <MousePointerClick className="size-4" /> Cliques
            </div>
            <p className="mt-2 font-display text-3xl font-black">{campanha.cliques.toLocaleString('pt-BR')}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <BarChart2 className="size-4" /> CTR
            </div>
            <p className="mt-2 font-display text-3xl font-black">{ctr.toFixed(2)}%</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">Detalhes da Campanha</h2>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-foreground">Orçamento</dt>
              <dd className="text-muted-foreground">{formatCurrency(campanha.orcamentoBRL)}</dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">Categoria</dt>
              <dd className="text-muted-foreground">{campanha.category}</dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">Data Início</dt>
              <dd className="text-muted-foreground">{formatDate(campanha.dataInicio)}</dd>
            </div>
            {campanha.dataFim && (
              <div>
                <dt className="font-semibold text-foreground">Data Fim</dt>
                <dd className="text-muted-foreground">{formatDate(campanha.dataFim)}</dd>
              </div>
            )}
            {campanha.estadoAlvo && (
              <div>
                <dt className="font-semibold text-foreground">Estado Alvo</dt>
                <dd className="text-muted-foreground">{campanha.estadoAlvo}</dd>
              </div>
            )}
            {campanha.cidadeAlvo && (
              <div>
                <dt className="font-semibold text-foreground">Cidade Alvo</dt>
                <dd className="text-muted-foreground">{campanha.cidadeAlvo}</dd>
              </div>
            )}
            <div>
              <dt className="font-semibold text-foreground">Criado em</dt>
              <dd className="text-muted-foreground">{formatDate(campanha.createdAt)}</dd>
            </div>
            {campanha.publicadoEm && (
              <div>
                <dt className="font-semibold text-foreground">Publicado em</dt>
                <dd className="text-muted-foreground">{formatDate(campanha.publicadoEm)}</dd>
              </div>
            )}
          </dl>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Todo anúncio publicado exibe o rótulo <strong className="font-bold">PATROCINADO</strong>.
          Publicidade nunca afeta Trust Score ou verificação.
        </p>
      </div>
    </div>
  );
}
