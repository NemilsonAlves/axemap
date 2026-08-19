'use client';

import * as React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { api } from '@/lib/api-client';
import {
  BarChart2,
  CheckCircle2,
  Clock,
  Megaphone,
  PlusCircle,
  XCircle,
} from 'lucide-react';

interface AdCampanha {
  id: string;
  titulo: string;
  status: string;
  placement: string;
  orcamentoBRL: number;
  dataInicio: string;
  dataFim?: string;
  impressoes?: number;
  cliques?: number;
  createdAt: string;
}

const STATUS_LABEL: Record<string, { label: string; icon: typeof CheckCircle2; cls: string }> = {
  RASCUNHO:            { label: 'Rascunho',            icon: Clock,          cls: 'text-muted-foreground' },
  AGUARDANDO_PAGAMENTO:{ label: 'Ag. Pagamento',        icon: Clock,          cls: 'text-amber-600' },
  EM_REVISAO:          { label: 'Em Revisão',           icon: Clock,          cls: 'text-azul-atlantico' },
  APROVADO:            { label: 'Aprovado',             icon: CheckCircle2,   cls: 'text-verde-floresta' },
  PUBLICADO:           { label: 'Publicado',            icon: CheckCircle2,   cls: 'text-verde-floresta' },
  PAUSADO:             { label: 'Pausado',              icon: Clock,          cls: 'text-amber-600' },
  REJEITADO:           { label: 'Rejeitado',            icon: XCircle,        cls: 'text-destructive' },
  BLOQUEADO:           { label: 'Bloqueado',            icon: XCircle,        cls: 'text-destructive' },
  ENCERRADO:           { label: 'Encerrado',            icon: Clock,          cls: 'text-muted-foreground' },
};

export default function AdsCampanhasPage() {
  const { user, loading } = useAuth();
  const [campanhas, setCampanhas] = React.useState<AdCampanha[]>([]);
  const [fetching, setFetching] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await api.get<{ data: AdCampanha[]; total: number }>('/ads/pedidos/meus');
        setCampanhas(res?.data ?? []);
      } catch {
        setError('Não foi possível carregar as campanhas.');
      } finally {
        setFetching(false);
      }
    })();
  }, [user]);

  if (loading || fetching) {
    return (
      <div className="container-page py-20">
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-page py-24 text-center">
        <p className="text-muted-foreground">Faça login para gerenciar suas campanhas.</p>
        <Link href="/auth/login" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
          Entrar
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container-page py-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-black tracking-tight">Minhas Campanhas</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Gerencie seus anúncios no AxéMap.
            </p>
          </div>
          <Link
            href="/ads/anunciar"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            <PlusCircle className="size-4" aria-hidden="true" />
            Nova campanha
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {campanhas.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card py-20 text-center">
            <Megaphone className="mx-auto size-12 text-muted-foreground/40" aria-hidden="true" />
            <p className="mt-4 font-display text-lg font-semibold">Nenhuma campanha ainda</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              Crie sua primeira campanha e alcance a comunidade afro-brasileira.
            </p>
            <Link
              href="/ads/anunciar"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              <PlusCircle className="size-4" aria-hidden="true" />
              Criar campanha
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Campanha</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Placement</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Orçamento</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Impressões</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Cliques</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {campanhas.map((c) => {
                  const st = STATUS_LABEL[c.status] ?? STATUS_LABEL['RASCUNHO'];
                  const Icon = st.icon;
                  return (
                    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3.5 font-medium text-foreground">{c.titulo}</td>
                      <td className="px-4 py-3.5 text-muted-foreground">{c.placement.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${st.cls}`}>
                          <Icon className="size-3.5" aria-hidden="true" />
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right text-muted-foreground">
                        R$ {c.orcamentoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3.5 text-right text-muted-foreground hidden md:table-cell">
                        {(c.impressoes ?? 0).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-4 py-3.5 text-right text-muted-foreground hidden md:table-cell">
                        {(c.cliques ?? 0).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Link
                          href={`/ads/campanhas/${c.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-copper transition hover:text-copper/70"
                        >
                          <BarChart2 className="size-3.5" aria-hidden="true" />
                          Detalhes
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Todo anúncio publicado exibe o rótulo{' '}
          <strong className="font-bold">PATROCINADO</strong>. Publicidade nunca afeta Trust Score ou verificação.{' '}
          <Link href="/ads" className="underline hover:text-foreground">Saiba mais</Link>
        </p>
      </div>
    </div>
  );
}
