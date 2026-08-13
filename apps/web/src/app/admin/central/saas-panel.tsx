'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';

interface Plano {
  id: string;
  slug: string;
  nome: string;
  descricao: string | null;
  precoMensal: number;
  precoAnual: number | null;
  destaque: boolean;
  funcionalidades: string[];
  ordem: number;
  ativo: boolean;
}

interface Assinatura {
  id: string;
  status: string;
  ciclo: string;
  valor: number;
  iniciadoEm: string;
  renovarEm: string | null;
  canceladoEm: string | null;
  plano: { nome: string; slug: string };
  terreiro: { id: string; nome: string; slug: string; cidade: string; estado: string };
}

interface PagamentoPendente {
  id: string;
  valor: number;
  metodo: string;
  status: string;
  referencia: string | null;
  createdAt: string;
  assinatura: {
    terreiro: { nome: string; slug: string };
    plano: { nome: string };
  };
}

export function SaasAdminPanel() {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([]);
  const [pendentes, setPendentes] = useState<PagamentoPendente[]>([]);
  const [form, setForm] = useState({ slug: '', nome: '', descricao: '', precoMensal: '', precoAnual: '', ordem: '0' });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  const load = async () => {
    try {
      const [p, a, pend] = await Promise.all([
        api.get<Plano[]>('/admin/saas/planos?incluirInativos=true'),
        api.get<Assinatura[]>('/admin/saas/assinaturas'),
        api.get<PagamentoPendente[]>('/admin/saas/pagamentos/pendentes'),
      ]);
      setPlanos(Array.isArray(p) ? p : []);
      setAssinaturas(Array.isArray(a) ? a : []);
      setPendentes(Array.isArray(pend) ? pend : []);
    } catch {
      setErro('Erro ao carregar planos');
    }
    setCarregando(false);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleAtivo = async (plano: Plano) => {
    await api.patch(`/admin/saas/planos/${plano.id}`, { ativo: !plano.ativo });
    load();
  };

  const criarPlano = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    try {
      await api.post('/admin/saas/planos', {
        slug: form.slug,
        nome: form.nome,
        descricao: form.descricao || undefined,
        precoMensal: Number(form.precoMensal) || 0,
        precoAnual: form.precoAnual ? Number(form.precoAnual) : undefined,
        ordem: Number(form.ordem) || 0,
      });
      setForm({ slug: '', nome: '', descricao: '', precoMensal: '', precoAnual: '', ordem: '0' });
      load();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao criar plano');
    }
  };

  const confirmarPagamento = async (id: string) => {
    // Reutiliza a rota de admin que confirma via qual rol
    await api.post(`/admin/saas/pagamentos/${id}/confirmar`, {});
    load();
  };

  const dt = (s?: string) => (s ? new Date(s).toLocaleDateString('pt-BR') : '—');

  if (carregando) {
    return <div className="admin-loading"><div className="admin-spinner" /><p>Carregando SaaS...</p></div>;
  }

  return (
    <div>
      {erro && <div className="admin-error-msg">{erro}</div>}

      <div className="admin-card">
        <h2 className="admin-card-title">Planos (catálogo)</h2>
        <form onSubmit={criarPlano} className="flag-form">
          <input placeholder="Slug (ex: PREMIUM)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
          <input placeholder="Nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
          <input placeholder="Descrição" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
          <input placeholder="Preço mensal (R$)" type="number" step="0.01" value={form.precoMensal} onChange={(e) => setForm({ ...form, precoMensal: e.target.value })} />
          <input placeholder="Preço anual (R$)" type="number" step="0.01" value={form.precoAnual} onChange={(e) => setForm({ ...form, precoAnual: e.target.value })} />
          <input placeholder="Ordem" type="number" value={form.ordem} onChange={(e) => setForm({ ...form, ordem: e.target.value })} />
          <button type="submit" className="btn-create">Criar plano</button>
        </form>
        <div className="flags-list" style={{ marginTop: '1rem' }}>
          {planos.length === 0 ? (
            <p className="admin-empty">Nenhum plano ainda.</p>
          ) : (
            planos.map((p) => (
              <div key={p.id} className={`flag-item ${p.ativo ? 'on' : 'off'}`}>
                <div className="flag-info">
                  <strong>{p.nome}</strong>
                  <code>{p.slug}</code>
                  <span className="flag-desc">
                    {p.precoMensal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/mês ·{' '}
                    {p.funcionalidades.length} recursos
                  </span>
                </div>
                <button className={`flag-toggle ${p.ativo ? 'on' : 'off'}`} onClick={() => toggleAtivo(p)}>
                  {p.ativo ? 'Ativo' : 'Inativo'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="admin-card">
        <h2 className="admin-card-title">Pagamentos pendentes ({pendentes.length})</h2>
        {pendentes.length === 0 ? (
          <p className="admin-empty">Nenhum pagamento aguardando confirmação.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pendentes.map((pg) => (
              <div key={pg.id} className="claim-item">
                <div>
                  <strong>{pg.assinatura.terreiro.nome}</strong> — {pg.assinatura.plano.nome}
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-300)' }}>
                    {pg.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} · {pg.metodo} · criado em {dt(pg.createdAt)}
                  </div>
                </div>
                <div className="claim-actions">
                  <button className="btn-admin-approve" onClick={() => confirmarPagamento(pg.id)}>Confirmar pagamento</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="admin-card">
        <h2 className="admin-card-title">Assinaturas</h2>
        {assinaturas.length === 0 ? (
          <p className="admin-empty">Nenhuma assinatura registrada.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="terreiros-table">
              <thead>
                <tr>
                  <th>Terreiro</th>
                  <th>Plano</th>
                  <th>Status</th>
                  <th>Ciclo</th>
                  <th>Valor</th>
                  <th>Renova em</th>
                </tr>
              </thead>
              <tbody>
                {assinaturas.map((a) => (
                  <tr key={a.id}>
                    <td>{a.terreiro.nome} <span style={{ fontSize: '0.7rem', color: 'var(--color-gray-400)' }}>({a.terreiro.cidade})</span></td>
                    <td>{a.plano.nome}</td>
                    <td><span className={`status-badge ${a.status.toLowerCase()}`}>{a.status}</span></td>
                    <td>{a.ciclo}</td>
                    <td>{a.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    <td>{dt(a.renovarEm ?? undefined)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}