'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api-client';

interface Acao {
  id: string;
  nome: string;
  descricao: string | null;
  tipo: string | null;
  data: string | null;
  alcance: number | null;
}

interface FormAcao {
  id?: string;
  nome: string;
  descricao: string;
  tipo: string;
  data: string;
  alcance: string;
}

const vazio: FormAcao = { nome: '', descricao: '', tipo: '', data: '', alcance: '' };

export function GerenciarAcoes({ terreiroId }: { terreiroId: string }) {
  const [acoes, setAcoes] = useState<Acao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [form, setForm] = useState<FormAcao | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    try {
      const res = await api.get<{ data: Acao[] }>(`/acoes-sociais?terreiroId=${terreiroId}&limit=100`);
      setAcoes(res.data || []);
    } catch {}
    setCarregando(false);
  }, [terreiroId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const editar = (a: Acao) => {
    setForm({
      id: a.id, nome: a.nome, descricao: a.descricao || '', tipo: a.tipo || '',
      data: a.data ? a.data.slice(0, 10) : '', alcance: a.alcance ? String(a.alcance) : '',
    });
    setErro('');
  };

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSalvando(true);
    setErro('');
    try {
      const payload = {
        nome: form.nome,
        descricao: form.descricao || null,
        tipo: form.tipo || null,
        data: form.data ? new Date(form.data).toISOString() : null,
        alcance: form.alcance ? Number(form.alcance) : null,
      };
      if (form.id) {
        await api.patch(`/acoes-sociais/${form.id}`, payload);
      } else {
        await api.post('/acoes-sociais', { ...payload, terreiroId });
      }
      setForm(null);
      await carregar();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao salvar ação social');
    } finally {
      setSalvando(false);
    }
  };

  const remover = async (id: string) => {
    if (!window.confirm('Excluir esta ação social?')) return;
    await api.delete(`/acoes-sociais/${id}`);
    await carregar();
  };

  if (carregando) return <p className="painel-empty">Carregando ações sociais...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>Ações sociais ({acoes.length})</h2>
        {!form && <button className="painel-btn" onClick={() => { setForm({ ...vazio }); setErro(''); }}>+ Nova ação</button>}
      </div>

      {erro && <div className="painel-error">{erro}</div>}

      {form && (
        <form onSubmit={salvar} className="painel-form-card">
          <div className="painel-form-grid">
            <div className="painel-field" style={{ gridColumn: '1 / -1' }}>
              <label>Nome *</label>
              <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
            </div>
            <div className="painel-field" style={{ gridColumn: '1 / -1' }}>
              <label>Descrição</label>
              <textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
            </div>
            <div className="painel-field">
              <label>Tipo</label>
              <input value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} />
            </div>
            <div className="painel-field">
              <label>Data</label>
              <input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
            </div>
            <div className="painel-field">
              <label>Alcance (pessoas)</label>
              <input type="number" min={0} value={form.alcance} onChange={(e) => setForm({ ...form, alcance: e.target.value })} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="painel-btn" type="submit" disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar'}</button>
            <button className="painel-btn ghost" type="button" onClick={() => setForm(null)}>Cancelar</button>
          </div>
        </form>
      )}

      {acoes.length === 0 && !form ? (
        <p className="painel-empty">Nenhuma ação social cadastrada ainda.</p>
      ) : (
        <div className="painel-list">
          {acoes.map((a) => (
            <div key={a.id} className="painel-item">
              <div>
                <div className="painel-item-title">{a.nome}</div>
                <div className="painel-item-meta">
                  {a.tipo}{a.tipo ? ' · ' : ''}{a.data ? new Date(a.data).toLocaleDateString('pt-BR') : ''}{a.alcance ? ` · alcance: ${a.alcance}` : ''}
                </div>
              </div>
              <div className="painel-item-actions">
                <button className="painel-icon-btn" onClick={() => editar(a)}>Editar</button>
                <button className="painel-icon-btn danger" onClick={() => remover(a.id)}>Excluir</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
