'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api-client';

interface Membro {
  id: string;
  papel: string;
  conviteStatus: string;
  desde: string;
  usuario: { id: string; nome: string; avatarUrl: string | null; email: string };
  convidadoPor: { id: string; nome: string } | null;
}

const PAPEIS = ['DIRIGENTE', 'COLABORADOR', 'FILHO_DE_SANTO', 'VISITANTE'];

const STATUS_LABEL: Record<string, string> = {
  ACEITO: 'Membro',
  PENDENTE: 'Convite pendente',
  RECUSADO: 'Recusado',
};

function statusClasse(status: string) {
  return `painel-status ${status === 'ACEITO' ? 'ok' : status === 'RECUSADO' ? 'bad' : 'pend'}`;
}

export function GerenciarMembros({ terreiroId }: { terreiroId: string }) {
  const [membros, setMembros] = useState<Membro[]>([]);
  const [email, setEmail] = useState('');
  const [papel, setPapel] = useState('COLABORADOR');
  const [convidando, setConvidando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const carregar = useCallback(async () => {
    try {
      const data = await api.get<Membro[]>(`/growth/terreiros/${terreiroId}/membros`);
      setMembros(Array.isArray(data) ? data : []);
    } catch {}
  }, [terreiroId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const convidar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setConvidando(true);
    setErro('');
    setSucesso('');
    try {
      await api.post(`/growth/terreiros/${terreiroId}/membros/convidar`, { email: email.trim(), papel });
      setEmail('');
      setSucesso('Convite enviado! A pessoa verá o convite na sua conta.');
      await carregar();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao convidar');
    } finally {
      setConvidando(false);
    }
  };

  const mudarPapel = async (m: Membro, novo: string) => {
    try {
      await api.patch(`/growth/membros/${m.id}`, { papel: novo });
      await carregar();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao alterar papel');
    }
  };

  const remover = async (m: Membro) => {
    if (!window.confirm(`Remover ${m.usuario.nome} dos membros?`)) return;
    try {
      await api.delete(`/growth/membros/${m.id}`);
      await carregar();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao remover membro');
    }
  };

  return (
    <div>
      <form onSubmit={convidar} className="painel-form-card">
        <h3 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>Convidar membro</h3>
        <div className="painel-form-grid">
          <div className="painel-field">
            <label>Email do usuário *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@exemplo.com"
              required
            />
          </div>
          <div className="painel-field">
            <label>Papel</label>
            <select value={papel} onChange={(e) => setPapel(e.target.value)}>
              {PAPEIS.map((p) => (
                <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="painel-item-actions">
          <button className="painel-btn" type="submit" disabled={convidando}>
            {convidando ? 'Convidando...' : 'Convidar'}
          </button>
        </div>
        {erro && <p className="painel-erro">{erro}</p>}
        {sucesso && <p style={{ color: 'var(--success)', fontSize: '0.85rem' }}>{sucesso}</p>}
      </form>

      <div className="painel-form-card">
        <h3 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>Membros ({membros.length})</h3>
        {membros.length === 0 ? (
          <p className="painel-empty">Nenhum membro ainda. Convide alguém pelo email.</p>
        ) : (
          <div className="painel-list">
            {membros.map((m) => (
              <div key={m.id} className="painel-item">
                <div>
                  <div className="painel-item-title">{m.usuario.nome}</div>
                  <div className="painel-item-meta">
                    {m.usuario.email} ·{' '}
                    {m.convidadoPor ? `convidado por ${m.convidadoPor.nome}` : 'membro inicial'} ·{' '}
                    {new Date(m.desde).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className={statusClasse(m.conviteStatus)}>{STATUS_LABEL[m.conviteStatus] || m.conviteStatus}</span>
                  {m.conviteStatus === 'ACEITO' && (
                    <>
                      <select
                        value={m.papel}
                        onChange={(e) => mudarPapel(m, e.target.value)}
                        style={{ fontSize: '0.75rem', padding: '0.2rem 0.4rem', borderRadius: '6px', border: '1px solid var(--color-gray-200)' }}
                      >
                        {PAPEIS.map((p) => (
                          <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>
                        ))}
                      </select>
                      <button className="painel-icon-btn danger" onClick={() => remover(m)}>Remover</button>
                    </>
                  )}
                  {m.conviteStatus === 'PENDENTE' && (
                    <button className="painel-icon-btn danger" onClick={() => remover(m)}>Cancelar convite</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
