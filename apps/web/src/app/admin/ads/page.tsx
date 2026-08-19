'use client';

import * as React from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import {
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  XCircle,
} from 'lucide-react';

interface AdCampanha {
  id: string;
  titulo: string;
  status: string;
  placement: string;
  category: string;
  orcamentoBRL: number;
  dataInicio: string;
  dataFim?: string;
  impressoes: number;
  cliques: number;
  anuncianteId: string;
  createdAt: string;
}

export default function AdminAdsPage() {
  const [campanhas, setCampanhas] = React.useState<AdCampanha[]>([]);
  const [statusFilter, setStatusFilter] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const carregar = React.useCallback(async (status?: string) => {
    setLoading(true);
    try {
      const qs = status ? `?status=${status}` : '';
      const res = await api.get<{ data: AdCampanha[]; total: number }>(`/admin/ads${qs}`);
      setCampanhas(res?.data ?? []);
    } catch {
      setError('Erro ao carregar campanhas.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { carregar(statusFilter || undefined); }, [statusFilter, carregar]);

  const acao = async (id: string, endpoint: string) => {
    setActionLoading(id + endpoint);
    try {
      await api.post(`/admin/ads/${id}/${endpoint}`, {});
      await carregar(statusFilter || undefined);
    } catch {
      setError('Ação falhou. Tente novamente.');
    } finally {
      setActionLoading(null);
    }
  };

  const STATUS_OPTS = ['', 'RASCUNHO', 'AGUARDANDO_PAGAMENTO', 'EM_REVISAO', 'APROVADO', 'PUBLICADO', 'PAUSADO', 'REJEITADO', 'BLOQUEADO'];

  return (
    <div className="min-h-screen bg-background">
      <div className="container-page py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-xl font-black">ADS — Moderação</h1>
            <p className="text-sm text-muted-foreground">Gerencie campanhas publicitárias do AxéMap ADS.</p>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="status-filter" className="text-xs font-semibold text-muted-foreground sr-only">Filtrar por status</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {STATUS_OPTS.map((s) => (
                <option key={s} value={s}>{s || 'Todos os status'}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Aviso sobre separação ADS / Trust */}
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800 dark:border-amber-800/30 dark:bg-amber-900/10 dark:text-amber-400">
          ⚠️ Aprovar ou publicar uma campanha <strong>nunca</strong> altera Trust Score, verificação, certificação ou posição orgânica.
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : campanhas.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card py-16 text-center text-sm text-muted-foreground">
            Nenhuma campanha com este filtro.
          </div>
        ) : (
          <div className="overflow-auto rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Campanha</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Placement</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Orçamento</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">Impressões / Cliques</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {campanhas.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium text-foreground max-w-[200px] truncate">{c.titulo}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{c.placement.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-bold text-foreground">
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      R$ {c.orcamentoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground hidden lg:table-cell">
                      {c.impressoes.toLocaleString('pt-BR')} / {c.cliques.toLocaleString('pt-BR')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {c.status === 'EM_REVISAO' && (
                          <button
                            onClick={() => acao(c.id, 'aprovar')}
                            disabled={actionLoading === c.id + 'aprovar'}
                            className="inline-flex items-center gap-1 rounded-lg bg-verde-floresta/10 px-2.5 py-1 text-[11px] font-bold text-verde-floresta transition hover:bg-verde-floresta/20 disabled:opacity-50"
                          >
                            <CheckCircle2 className="size-3.5" aria-hidden="true" />
                            Aprovar
                          </button>
                        )}
                        {c.status === 'APROVADO' && (
                          <button
                            onClick={() => acao(c.id, 'publicar')}
                            disabled={actionLoading === c.id + 'publicar'}
                            className="inline-flex items-center gap-1 rounded-lg bg-azul-atlantico/10 px-2.5 py-1 text-[11px] font-bold text-azul-atlantico transition hover:bg-azul-atlantico/20 disabled:opacity-50"
                          >
                            <PlayCircle className="size-3.5" aria-hidden="true" />
                            Publicar
                          </button>
                        )}
                        {c.status === 'PUBLICADO' && (
                          <button
                            onClick={() => acao(c.id, 'pausar')}
                            disabled={actionLoading === c.id + 'pausar'}
                            className="inline-flex items-center gap-1 rounded-lg bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-700 transition hover:bg-amber-200 disabled:opacity-50"
                          >
                            <PauseCircle className="size-3.5" aria-hidden="true" />
                            Pausar
                          </button>
                        )}
                        {!['REJEITADO', 'BLOQUEADO', 'ENCERRADO'].includes(c.status) && (
                          <button
                            onClick={() => acao(c.id, 'rejeitar')}
                            disabled={!!actionLoading}
                            className="inline-flex items-center gap-1 rounded-lg bg-destructive/10 px-2.5 py-1 text-[11px] font-bold text-destructive transition hover:bg-destructive/20 disabled:opacity-50"
                          >
                            <XCircle className="size-3.5" aria-hidden="true" />
                            Rejeitar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link href="/admin" className="underline">← Voltar ao painel admin</Link>
        </p>
      </div>
    </div>
  );
}
