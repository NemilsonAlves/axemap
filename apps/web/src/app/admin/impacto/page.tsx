'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { api } from '@/lib/api-client';
import { useToast } from '@/components/ui/use-toast';
import '../admin.css';

interface CampanhaAdmin {
  id: string;
  titulo: string;
  slug: string;
  status: string;
  categoria: string;
  modeloArrecad: string;
  metaFinanceira: number;
  arrecadado: number;
  apoiadoresCount: number;
  nivelVerificacao: string;
  trustScore: number;
  createdAt: string;
  cidade?: string | null;
  terreiro?: { id: string; nome: string } | null;
  instituicao?: { id: string; nome: string } | null;
}

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export default function AdminImpactoPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = !!user && ['ADMIN', 'SUPER_ADMIN'].includes(user.role);

  const [campanhas, setCampanhas] = useState<CampanhaAdmin[]>([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const carregar = useCallback(async (filtro?: string) => {
    setLoading(true);
    setErro('');
    try {
      let url = '/admin/campanhas';
      if (filtro) url += `?status=${filtro}`;
      const res = await api.get<{ data: CampanhaAdmin[] }>(url);
      setCampanhas(res?.data ?? []);
    } catch (e: any) {
      setErro(e?.message || 'Erro ao carregar campanhas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    carregar();
  }, [isAdmin, carregar]);

  async function acao(id: string, path: string, body?: Record<string, unknown>) {
    setBusyId(id);
    try {
      await api.post(path, body);
      toast({ title: 'Ação concluída', variant: 'success' });
      carregar(filtro || undefined);
    } catch (e: any) {
      toast({ title: 'Falha na ação', description: e?.message, variant: 'danger' });
    } finally {
      setBusyId(null);
    }
  }

  function hasAdmin() {
    return !!user && ['ADMIN', 'SUPER_ADMIN'].includes(user.role);
  }

  if (!hasAdmin()) {
    return (
      <div className="admin-page">
        <div className="admin-error">
          <h2>Acesso restrito</h2>
          <p>Você precisa ser administrador para gerenciar campanhas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Gestão de Campanhas · Axé Map Impacto</h1>
        <p>Workflow: cadastro → análise de IA (advisória) → revisão humana → aprovação → publicação → prestação de contas.</p>
      </div>

      <div className="admin-card" style={{ marginBottom: 16 }}>
        <label className="admin-label" htmlFor="filtro-status">Filtrar por status</label>
        <select id="filtro-status" className="admin-input" value={filtro} onChange={(e) => { setFiltro(e.target.value); carregar(e.target.value || undefined); }}>
          <option value="">Todos</option>
          <option>RASCUNHO</option>
          <option>PENDENTE_ANALISE</option>
          <option>EM_ANALISE_IA</option>
          <option>AGUARDANDO_DOCUMENTOS</option>
          <option>EM_REVISAO_HUMANA</option>
          <option>APROVADA</option>
          <option>PUBLICADA</option>
          <option>ENCERRADA</option>
          <option>PRESTACAO_CONTAS</option>
          <option>RECUSADA</option>
          <option>BLOQUEADA</option>
        </select>
      </div>

      {erro && <div className="admin-error"><p>{erro}</p></div>}
      {loading && (
        <div className="admin-card">
          <div className="admin-loading"><p>Carregando campanhas...</p></div>
        </div>
      )}

      {!loading && campanhas.length === 0 && (
        <div className="admin-card"><p>Nenhuma campanha encontrada.</p></div>
      )}

      {campanhas.map((c) => (
        <div key={c.id} className="admin-card" style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <strong>{c.titulo}</strong>
              <div className="admin-meta">
                {c.categoria} · {c.slug}
              </div>
              <div className="admin-meta">
                {c.terreiro?.nome ?? c.instituicao?.nome ?? 'Sem responsável'} ·{' '}
                {c.cidade || 'Sem cidade'}
              </div>
              <div className="admin-meta">
                Arrecadado {brl.format(c.arrecadado)} de {brl.format(c.metaFinanceira)} ({c.apoiadoresCount} apoios)
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
              <span className={`badge badge-${c.status.toLowerCase()}`}>{c.status}</span>
              <span className="admin-meta">Verificação: {c.nivelVerificacao} · Trust {c.trustScore?.toFixed?.(1) ?? c.trustScore}</span>
            </div>
          </div>

          <div className="admin-actions" style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn-admin-approve" disabled={busyId === c.id} onClick={() => acao(c.id, `/admin/campanhas/${c.id}/analise-ia`)}>
              Análise de IA
            </button>
            <button className="btn-admin-approve" disabled={busyId === c.id} onClick={() => acao(c.id, `/admin/campanhas/${c.id}/aprovar`)}>
              Aprovar
            </button>
            <button className="btn-admin-approve" disabled={busyId === c.id} onClick={() => acao(c.id, `/admin/campanhas/${c.id}/publicar`)}>
              Publicar
            </button>
            <button className="btn-admin" disabled={busyId === c.id} onClick={() => acao(c.id, `/admin/campanhas/${c.id}/verificar`, { nivel: c.nivelVerificacao === 'OFICIAL' ? 'NAO_VERIFICADA' : c.nivelVerificacao === 'VERIFICADA' ? 'OFICIAL' : 'VERIFICADA' })}>
              Alternar verificação
            </button>
            <button className="btn-admin" disabled={busyId === c.id} onClick={() => acao(c.id, `/admin/campanhas/${c.id}/recusar`, {})}>
              Recusar
            </button>
            <button className="btn-admin" disabled={busyId === c.id} onClick={() => acao(c.id, `/admin/campanhas/${c.id}/bloquear`, {})}>
              Bloquear
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
