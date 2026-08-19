'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { OrganizationVerificationLevel } from '@axemap/shared';
import { labelTipoOrganizacao, nomePaisPublico, VERIFICACAO_ORGANIZACAO } from '@/lib/organizacoes';

interface OrganizacaoAdmin {
  id: string;
  nome: string;
  nomePublico?: string | null;
  slug: string;
  tipo: string;
  pais?: string | null;
  cidade?: string | null;
  estado?: string | null;
  verificacao?: string | null;
  isPublished: boolean;
  createdAt: string;
}

const NIVEIS = [
  OrganizationVerificationLevel.NAO_VERIFICADA,
  OrganizationVerificationLevel.REIVINDICADA,
  OrganizationVerificationLevel.VERIFICADA,
  OrganizationVerificationLevel.ORGANIZACAO_VERIFICADA,
  OrganizationVerificationLevel.PARCEIRO_INSTITUCIONAL,
];

export function OrganizacoesVerificacaoPanel() {
  const [itens, setItens] = useState<OrganizacaoAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [salvandoId, setSalvandoId] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      const res = await api.get<{ data: OrganizacaoAdmin[] }>('/admin/organizacoes?limit=100');
      setItens(res?.data ?? []);
      setErro('');
    } catch {
      setErro('Não foi possível carregar as organizações.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function definirNivel(org: OrganizacaoAdmin, nivel: string) {
    setSalvandoId(org.id);
    try {
      await api.post(`/admin/organizacoes/${org.id}/verificacao`, {
        nivel,
        justificativa: `Alteração de nível para ${nivel} via console de moderação`,
      });
      setItens((prev) => prev.map((o) => (o.id === org.id ? { ...o, verificacao: nivel } : o)));
    } catch {
      setErro('Falha ao atualizar verificação. Verifique se você é ADMIN/SUPER_ADMIN.');
    } finally {
      setSalvandoId(null);
    }
  }

  if (loading) return <p className="admin-empty">Carregando organizações...</p>;

  return (
    <div>
      <h2 className="admin-card-title">Verificação de organizações (Rede AxéMap)</h2>
      <p style={{ fontSize: '0.85rem', color: 'var(--color-gray-300)', marginBottom: '1rem' }}>
        O selo reflete o que foi verificado — nunca legitimidade espiritual ou religiosa. Cada alteração é auditada.
      </p>
      {erro && <p className="admin-empty" style={{ color: 'var(--color-red-500)' }}>{erro}</p>}
      {itens.length === 0 ? (
        <p className="admin-empty">Nenhuma organização cadastrada ainda.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="terreiros-table">
            <thead>
              <tr>
                <th>Organização</th>
                <th>Tipo</th>
                <th>Localização</th>
                <th>Status</th>
                <th>Nível de verificação</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((org) => (
                <tr key={org.id}>
                  <td>
                    <strong>{org.nomePublico ?? org.nome}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-300)' }}>/{org.slug}</div>
                  </td>
                  <td>{labelTipoOrganizacao(org.tipo)}</td>
                  <td>
                    {[org.cidade, org.estado].filter(Boolean).join(', ')}
                    {org.pais ? ` · ${nomePaisPublico(org.pais)}` : ''}
                  </td>
                  <td>
                    <span className={`status-badge ${org.isPublished ? 'aprovado' : 'pendente'}`}>
                      {org.isPublished ? 'Publicada' : 'Rascunho'}
                    </span>
                  </td>
                  <td>
                    <select
                      value={org.verificacao ?? OrganizationVerificationLevel.NAO_VERIFICADA}
                      disabled={salvandoId === org.id}
                      onChange={(e) => definirNivel(org, e.target.value)}
                      style={{ padding: '0.35rem 0.5rem', borderRadius: '0.375rem', border: '1px solid var(--color-gray-400)' }}
                      aria-label={`Nível de verificação de ${org.nome}`}
                    >
                      {NIVEIS.map((n) => (
                        <option key={n} value={n}>
                          {VERIFICACAO_ORGANIZACAO[n]?.label ?? n}
                        </option>
                      ))}
                    </select>
                    {salvandoId === org.id && <span style={{ marginLeft: '0.5rem' }}>Salvando...</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
