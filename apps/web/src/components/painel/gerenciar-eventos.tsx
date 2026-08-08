'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api-client';

const TIPOS = ['GIRA', 'TOQUE', 'FESTA_RELIGIOSA', 'PALESTRA', 'CURSO', 'DESENVOLVIMENTO_MEDIUNICO', 'ACAO_SOCIAL'];

interface Evento {
  id: string;
  titulo: string;
  descricao: string | null;
  tipo: string;
  dataInicio: string;
  dataFim: string | null;
  capacidade: number | null;
  isPublico: boolean;
}

interface FormEvento {
  id?: string;
  titulo: string;
  descricao: string;
  tipo: string;
  dataInicio: string;
  dataFim: string;
  capacidade: string;
  isPublico: boolean;
}

const vazio: FormEvento = {
  titulo: '', descricao: '', tipo: 'GIRA', dataInicio: '', dataFim: '', capacidade: '', isPublico: true,
};

export function GerenciarEventos({ terreiroId }: { terreiroId: string }) {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [form, setForm] = useState<FormEvento | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    try {
      const res = await api.get<{ data: Evento[] }>(`/eventos?terreiroId=${terreiroId}&limit=100`);
      setEventos(res.data || []);
    } catch {}
    setCarregando(false);
  }, [terreiroId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const editar = (e: Evento) => {
    setForm({
      id: e.id, titulo: e.titulo, descricao: e.descricao || '', tipo: e.tipo,
      dataInicio: toLocalInput(e.dataInicio), dataFim: e.dataFim ? toLocalInput(e.dataFim) : '',
      capacidade: e.capacidade ? String(e.capacidade) : '', isPublico: e.isPublico,
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
        titulo: form.titulo,
        descricao: form.descricao || null,
        tipo: form.tipo,
        dataInicio: new Date(form.dataInicio).toISOString(),
        dataFim: form.dataFim ? new Date(form.dataFim).toISOString() : null,
        capacidade: form.capacidade ? Number(form.capacidade) : null,
        isPublico: form.isPublico,
      };
      if (form.id) {
        await api.patch(`/eventos/${form.id}`, payload);
      } else {
        await api.post('/eventos', { ...payload, terreiroId });
      }
      setForm(null);
      await carregar();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao salvar evento');
    } finally {
      setSalvando(false);
    }
  };

  const remover = async (id: string) => {
    if (!window.confirm('Excluir este evento?')) return;
    await api.delete(`/eventos/${id}`);
    await carregar();
  };

  if (carregando) return <p className="painel-empty">Carregando eventos...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>Eventos ({eventos.length})</h2>
        {!form && <button className="painel-btn" onClick={() => { setForm({ ...vazio }); setErro(''); }}>+ Novo evento</button>}
      </div>

      {erro && <div className="painel-error">{erro}</div>}

      {form && (
        <form onSubmit={salvar} className="painel-form-card">
          <div className="painel-form-grid">
            <div className="painel-field" style={{ gridColumn: '1 / -1' }}>
              <label>Título *</label>
              <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required />
            </div>
            <div className="painel-field" style={{ gridColumn: '1 / -1' }}>
              <label>Descrição</label>
              <textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
            </div>
            <div className="painel-field">
              <label>Tipo *</label>
              <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                {TIPOS.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div className="painel-field">
              <label>Data de início *</label>
              <input type="datetime-local" value={form.dataInicio} onChange={(e) => setForm({ ...form, dataInicio: e.target.value })} required />
            </div>
            <div className="painel-field">
              <label>Data de fim</label>
              <input type="datetime-local" value={form.dataFim} onChange={(e) => setForm({ ...form, dataFim: e.target.value })} />
            </div>
            <div className="painel-field">
              <label>Capacidade</label>
              <input type="number" min={0} value={form.capacidade} onChange={(e) => setForm({ ...form, capacidade: e.target.value })} />
            </div>
            <div className="painel-field" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input id="ev-pub" type="checkbox" checked={form.isPublico} onChange={(e) => setForm({ ...form, isPublico: e.target.checked })} style={{ width: 'auto' }} />
              <label htmlFor="ev-pub" style={{ marginBottom: 0 }}>Evento público</label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="painel-btn" type="submit" disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar'}</button>
            <button className="painel-btn ghost" type="button" onClick={() => setForm(null)}>Cancelar</button>
          </div>
        </form>
      )}

      {eventos.length === 0 && !form ? (
        <p className="painel-empty">Nenhum evento cadastrado ainda.</p>
      ) : (
        <div className="painel-list">
          {eventos.map((ev) => (
            <div key={ev.id} className="painel-item">
              <div>
                <div className="painel-item-title">{ev.titulo}</div>
                <div className="painel-item-meta">
                  {new Date(ev.dataInicio).toLocaleString('pt-BR')} · {ev.tipo.replace(/_/g, ' ')}
                  {ev.capacidade ? ` · ${ev.capacidade} lugares` : ''}
                </div>
              </div>
              <div className="painel-item-actions">
                <button className="painel-icon-btn" onClick={() => editar(ev)}>Editar</button>
                <button className="painel-icon-btn danger" onClick={() => remover(ev.id)}>Excluir</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
