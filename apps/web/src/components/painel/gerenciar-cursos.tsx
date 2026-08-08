'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api-client';

interface Curso {
  id: string;
  titulo: string;
  descricao: string | null;
  modalidade: string | null;
  cargaHoraria: number | null;
  vagas: number | null;
  dataInicio: string | null;
  dataFim: string | null;
  _count?: { matriculas: number };
}

interface Matricula {
  id: string;
  status: string;
  createdAt: string;
  usuario: { id: string; nome: string; email: string; avatarUrl: string | null };
}

interface FormCurso {
  id?: string;
  titulo: string;
  descricao: string;
  modalidade: string;
  cargaHoraria: string;
  vagas: string;
  dataInicio: string;
  dataFim: string;
}

const vazio: FormCurso = { titulo: '', descricao: '', modalidade: '', cargaHoraria: '', vagas: '', dataInicio: '', dataFim: '' };

export function GerenciarCursos({ terreiroId }: { terreiroId: string }) {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [form, setForm] = useState<FormCurso | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [matriculas, setMatriculas] = useState<{ cursoId: string; data: Matricula[] } | null>(null);

  const carregar = useCallback(async () => {
    try {
      const res = await api.get<{ data: Curso[] }>(`/cursos?terreiroId=${terreiroId}&limit=100`);
      setCursos(res.data || []);
    } catch {}
    setCarregando(false);
  }, [terreiroId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const editar = (c: Curso) => {
    setForm({
      id: c.id, titulo: c.titulo, descricao: c.descricao || '', modalidade: c.modalidade || '',
      cargaHoraria: c.cargaHoraria ? String(c.cargaHoraria) : '', vagas: c.vagas ? String(c.vagas) : '',
      dataInicio: c.dataInicio ? c.dataInicio.slice(0, 10) : '', dataFim: c.dataFim ? c.dataFim.slice(0, 10) : '',
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
        modalidade: form.modalidade || null,
        cargaHoraria: form.cargaHoraria ? Number(form.cargaHoraria) : null,
        vagas: form.vagas ? Number(form.vagas) : null,
        dataInicio: form.dataInicio ? new Date(form.dataInicio).toISOString() : null,
        dataFim: form.dataFim ? new Date(form.dataFim).toISOString() : null,
      };
      if (form.id) {
        await api.patch(`/cursos/${form.id}`, payload);
      } else {
        await api.post('/cursos', { ...payload, terreiroId });
      }
      setForm(null);
      await carregar();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao salvar curso');
    } finally {
      setSalvando(false);
    }
  };

  const remover = async (id: string) => {
    if (!window.confirm('Excluir este curso?')) return;
    await api.delete(`/cursos/${id}`);
    if (matriculas?.cursoId === id) setMatriculas(null);
    await carregar();
  };

  const verMatriculas = async (cursoId: string) => {
    if (matriculas?.cursoId === cursoId) {
      setMatriculas(null);
      return;
    }
    try {
      const data = await api.get<Matricula[]>(`/cursos/${cursoId}/matriculas`);
      setMatriculas({ cursoId, data: Array.isArray(data) ? data : [] });
    } catch {
      setMatriculas({ cursoId, data: [] });
    }
  };

  const cancelarMatricula = async (cursoId: string, matriculaId: string, aluno: string) => {
    if (!window.confirm(`Cancelar a matrícula de ${aluno}?`)) return;
    try {
      await api.delete(`/cursos/${cursoId}/matriculas/${matriculaId}`);
      await verMatriculas(cursoId);
      await carregar();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao cancelar matrícula');
    }
  };

  if (carregando) return <p className="painel-empty">Carregando cursos...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>Cursos ({cursos.length})</h2>
        {!form && <button className="painel-btn" onClick={() => { setForm({ ...vazio }); setErro(''); }}>+ Novo curso</button>}
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
              <label>Modalidade</label>
              <input value={form.modalidade} onChange={(e) => setForm({ ...form, modalidade: e.target.value })} />
            </div>
            <div className="painel-field">
              <label>Carga horária (h)</label>
              <input type="number" min={0} value={form.cargaHoraria} onChange={(e) => setForm({ ...form, cargaHoraria: e.target.value })} />
            </div>
            <div className="painel-field">
              <label>Vagas</label>
              <input type="number" min={0} value={form.vagas} onChange={(e) => setForm({ ...form, vagas: e.target.value })} />
            </div>
            <div className="painel-field">
              <label>Data de início</label>
              <input type="date" value={form.dataInicio} onChange={(e) => setForm({ ...form, dataInicio: e.target.value })} />
            </div>
            <div className="painel-field">
              <label>Data de fim</label>
              <input type="date" value={form.dataFim} onChange={(e) => setForm({ ...form, dataFim: e.target.value })} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="painel-btn" type="submit" disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar'}</button>
            <button className="painel-btn ghost" type="button" onClick={() => setForm(null)}>Cancelar</button>
          </div>
        </form>
      )}

      {cursos.length === 0 && !form ? (
        <p className="painel-empty">Nenhum curso cadastrado ainda.</p>
      ) : (
        <div className="painel-list">
          {cursos.map((c) => (
            <div key={c.id} className="painel-item" style={{ flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: '1rem', alignItems: 'flex-start' }}>
                <div>
                  <div className="painel-item-title">{c.titulo}</div>
                  <div className="painel-item-meta">
                    {c.modalidade}{c.modalidade ? ' · ' : ''}{c.vagas ? `${c.vagas} vagas` : ''}{c.vagas && c.cargaHoraria ? ' · ' : ''}{c.cargaHoraria ? `${c.cargaHoraria}h` : ''}
                  </div>
                </div>
                <div className="painel-item-actions">
                  <button className="painel-icon-btn" onClick={() => verMatriculas(c.id)}>
                    Matrículas ({c._count?.matriculas ?? 0})
                  </button>
                  <button className="painel-icon-btn" onClick={() => editar(c)}>Editar</button>
                  <button className="painel-icon-btn danger" onClick={() => remover(c.id)}>Excluir</button>
                </div>
              </div>
              {matriculas?.cursoId === c.id && (
                <div style={{ width: '100%', borderTop: '1px solid var(--color-gray-200)', paddingTop: '0.75rem' }}>
                  {matriculas.data.length === 0 ? (
                    <p className="painel-empty" style={{ padding: '0.5rem', fontSize: '0.8rem' }}>Nenhuma matrícula confirmada.</p>
                  ) : (
                    <div className="painel-list" style={{ gap: '0.375rem' }}>
                      {matriculas.data.map((m) => (
                        <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', alignItems: 'center' }}>
                          <span>{m.usuario.nome} ({m.usuario.email})</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className="painel-status">{m.status}</span>
                            <button
                              className="painel-icon-btn danger"
                              onClick={() => cancelarMatricula(c.id, m.id, m.usuario.nome)}
                              style={{ padding: '0.15rem 0.5rem', fontSize: '0.7rem' }}
                            >
                              Cancelar
                            </button>
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
