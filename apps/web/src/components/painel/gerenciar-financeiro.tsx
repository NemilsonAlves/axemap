'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api-client';

interface Transacao {
  id: string;
  tipo: string;
  categoria: string;
  valor: number;
  descricao: string | null;
  data: string;
  origem: string;
}

interface Resumo {
  periodo: string | null;
  receitas: { total: number; quantidade: number };
  despesas: { total: number; quantidade: number };
  saldo: number;
  recentes: Transacao[];
  pix: {
    id: string;
    chave: string;
    tipoChave: string;
    titulo: string | null;
    ativo: boolean;
  } | null;
}

interface PixForm {
  chave: string;
  tipoChave: string;
  titulo: string;
  ativo: boolean;
}

const CATEGORIAS = [
  'DOACOES', 'MENSALIDADES', 'PIX', 'VENDAS', 'EVENTOS', 'CURSOS',
  'CONTAS', 'ALIMENTACAO', 'MANUTENCAO', 'TRANSPORTE', 'OUTROS',
];

export function GerenciarFinanceiro({ terreiroId }: { terreiroId: string }) {
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [ok, setOk] = useState('');
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);

  const [form, setForm] = useState({ tipo: 'RECEITA', categoria: 'DOACOES', valor: '', descricao: '', data: '' });
  const [formPix, setFormPix] = useState<PixForm | null>(null);

  const carregar = useCallback(async () => {
    try {
      const [r, t] = await Promise.all([
        api.get<Resumo>(`/financeiro/resumo?terreiroId=${terreiroId}`),
        api.get<{ data: Transacao[] }>(`/financeiro/transacoes?terreiroId=${terreiroId}&limit=100`),
      ]);
      setResumo(r);
      setTransacoes(t.data || []);
      if (r.pix) setFormPix({ chave: r.pix.chave, tipoChave: r.pix.tipoChave, titulo: r.pix.titulo || '', ativo: r.pix.ativo });
    } catch {}
    setCarregando(false);
  }, [terreiroId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setOk('');
    try {
      await api.post('/financeiro/transacoes', {
        terreiroId,
        tipo: form.tipo,
        categoria: form.categoria,
        valor: Number(form.valor),
        descricao: form.descricao || undefined,
        data: form.data ? new Date(form.data).toISOString() : undefined,
      });
      setForm({ tipo: 'RECEITA', categoria: 'DOACOES', valor: '', descricao: '', data: '' });
      await carregar();
      setOk('Transação lançada.');
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao lançar transação');
    }
  };

  const remover = async (id: string) => {
    if (!window.confirm('Excluir esta transação?')) return;
    await api.delete(`/financeiro/transacoes/${id}`);
    await carregar();
  };

  const salvarPix = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPix) return;
    setErro('');
    setOk('');
    try {
      await api.put(`/financeiro/pix/${terreiroId}`, formPix);
      await carregar();
      setOk('Chave Pix salva.');
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao salvar chave Pix');
    }
  };

  const fmt = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

  if (carregando) return <p className="painel-empty">Carregando financeiro...</p>;

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>Financeiro</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-gray-300)', marginTop: '0.25rem' }}>
          Controle de receitas e despesas do terreiro, com chave Pix para doações.
        </p>
      </div>

      {erro && <div className="painel-error">{erro}</div>}
      {ok && <div className="painel-ok">{ok}</div>}

      {resumo && (
        <div className="painel-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: '1.25rem' }}>
          <div className="painel-card" style={{ padding: '1rem' }}>
            <div className="painel-card-sub">Receitas</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-success)' }}>{fmt(resumo.receitas.total)}</div>
            <div className="painel-card-sub">{resumo.receitas.quantidade} lançamentos</div>
          </div>
          <div className="painel-card" style={{ padding: '1rem' }}>
            <div className="painel-card-sub">Despesas</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-error)' }}>{fmt(resumo.despesas.total)}</div>
            <div className="painel-card-sub">{resumo.despesas.quantidade} lançamentos</div>
          </div>
          <div className="painel-card" style={{ padding: '1rem' }}>
            <div className="painel-card-sub">Saldo</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-primary)' }}>{fmt(resumo.saldo)}</div>
            <div className="painel-card-sub">atual</div>
          </div>
        </div>
      )}

      <div className="painel-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', marginBottom: '1.25rem', gap: '1rem' }}>
        <form onSubmit={salvar} className="painel-form-card" style={{ marginBottom: 0 }}>
          <h3 style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>Novo lançamento</h3>
          <div className="painel-form-grid">
            <div className="painel-field">
              <label>Tipo *</label>
              <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                <option value="RECEITA">Receita</option>
                <option value="DESPESA">Despesa</option>
              </select>
            </div>
            <div className="painel-field">
              <label>Categoria *</label>
              <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
                {CATEGORIAS.map((c) => <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>)}
              </select>
            </div>
            <div className="painel-field">
              <label>Valor (R$) *</label>
              <input type="number" step="0.01" min="0.01" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} required />
            </div>
            <div className="painel-field">
              <label>Data</label>
              <input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
            </div>
            <div className="painel-field" style={{ gridColumn: '1 / -1' }}>
              <label>Descrição</label>
              <input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
            </div>
          </div>
          <button className="painel-btn" type="submit">Lançar</button>
        </form>

        <form onSubmit={salvarPix} className="painel-form-card" style={{ marginBottom: 0 }}>
          <h3 style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>Chave Pix para doações</h3>
          {formPix ? (
            <div className="painel-form-grid">
              <div className="painel-field">
                <label>Chave *</label>
                <input value={formPix.chave} onChange={(e) => setFormPix({ ...formPix, chave: e.target.value })} required />
              </div>
              <div className="painel-field">
                <label>Tipo de chave</label>
                <select value={formPix.tipoChave} onChange={(e) => setFormPix({ ...formPix, tipoChave: e.target.value })}>
                  <option value="CPF">CPF</option>
                  <option value="CNPJ">CNPJ</option>
                  <option value="TELEFONE">Telefone</option>
                  <option value="EMAIL">E-mail</option>
                  <option value="ALEATORIA">Aleatória</option>
                </select>
              </div>
              <div className="painel-field" style={{ gridColumn: '1 / -1' }}>
                <label>Título (ex: Doação para o terreiro)</label>
                <input value={formPix.titulo} onChange={(e) => setFormPix({ ...formPix, titulo: e.target.value })} />
              </div>
            </div>
          ) : (
            <p className="painel-empty">Nenhuma chave cadastrada.</p>
          )}
          <button className="painel-btn" type="submit" disabled={!formPix}>Salvar chave</button>
        </form>
      </div>

      <h3 style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>Lançamentos</h3>
      {transacoes.length === 0 ? (
        <p className="painel-empty">Nenhuma transação registrada.</p>
      ) : (
        <div className="painel-list">
          {transacoes.map((t) => (
            <div key={t.id} className="painel-item">
              <div>
                <div className="painel-item-title">
                  {t.categoria.charAt(0) + t.categoria.slice(1).toLowerCase()}
                  {t.descricao ? ` — ${t.descricao}` : ''}
                </div>
                <div className="painel-item-meta">{new Date(t.data).toLocaleDateString('pt-BR')}</div>
              </div>
              <div className="painel-item-actions">
                <span style={{ fontWeight: 700, color: t.tipo === 'RECEITA' ? 'var(--color-success)' : 'var(--color-error)' }}>
                  {t.tipo === 'RECEITA' ? '+' : '−'}{fmt(t.valor)}
                </span>
                <button className="painel-icon-btn danger" onClick={() => remover(t.id)}>Excluir</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}