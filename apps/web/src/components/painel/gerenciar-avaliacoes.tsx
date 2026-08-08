'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api-client';

interface Avaliacao {
  id: string;
  nota: number;
  texto: string | null;
  createdAt: string;
  usuario: { id: string; nome: string; avatarUrl: string | null };
  resposta: { id: string; texto: string; createdAt: string } | null;
}

export function GerenciarAvaliacoes({ terreiroId }: { terreiroId: string }) {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState<string | null>(null);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    try {
      const res = await api.get<{ data: Avaliacao[] }>(`/avaliacoes?terreiroId=${terreiroId}&limit=100`);
      setAvaliacoes(res.data || []);
    } catch {}
    setCarregando(false);
  }, [terreiroId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const responder = async (id: string) => {
    const texto = (respostas[id] || '').trim();
    if (!texto) return;
    setEnviando(id);
    setErro('');
    try {
      await api.post(`/avaliacoes/${id}/responder`, { texto });
      setRespostas((r) => ({ ...r, [id]: '' }));
      await carregar();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao responder');
    } finally {
      setEnviando(null);
    }
  };

  if (carregando) return <p className="painel-empty">Carregando avaliações...</p>;

  const semResposta = avaliacoes.filter((a) => !a.resposta);
  const respondidas = avaliacoes.filter((a) => a.resposta);

  return (
    <div>
      <h2 style={{ fontSize: '1.1rem', color: 'var(--color-primary)', marginBottom: '1rem' }}>
        Avaliações ({avaliacoes.length})
      </h2>

      {erro && <div className="painel-error">{erro}</div>}

      <h3 style={{ fontSize: '0.95rem', color: 'var(--color-gray-500)', marginBottom: '0.75rem' }}>Pendentes de resposta ({semResposta.length})</h3>
      {semResposta.length === 0 ? (
        <p className="painel-empty" style={{ padding: '1rem', fontSize: '0.85rem' }}>Todas as avaliações foram respondidas. ✨</p>
      ) : (
        <div className="painel-list" style={{ marginBottom: '1.5rem' }}>
          {semResposta.map((a) => (
            <div key={a.id} className="painel-item" style={{ flexDirection: 'column' }}>
              <div>
                <div className="painel-item-title">{'★'.repeat(a.nota)}{'☆'.repeat(5 - a.nota)} · {a.usuario.nome}</div>
                <div className="painel-item-meta">{new Date(a.createdAt).toLocaleDateString('pt-BR')}</div>
                {a.texto && <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>{a.texto}</p>}
              </div>
              <div style={{ width: '100%' }}>
                <textarea
                  placeholder="Escreva sua resposta pública..."
                  value={respostas[a.id] || ''}
                  onChange={(e) => setRespostas((r) => ({ ...r, [a.id]: e.target.value }))}
                  className="painel-field"
                  style={{ width: '100%', minHeight: 70, padding: '0.625rem 0.875rem', border: '1.5px solid var(--color-gray-200)', borderRadius: 8, fontFamily: 'inherit' }}
                />
                <button className="painel-btn" disabled={!respostas[a.id]?.trim() || enviando === a.id} onClick={() => responder(a.id)}>
                  {enviando === a.id ? 'Enviando...' : 'Responder'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {respondidas.length > 0 && (
        <>
          <h3 style={{ fontSize: '0.95rem', color: 'var(--color-gray-500)', marginBottom: '0.75rem' }}>Respondidas ({respondidas.length})</h3>
          <div className="painel-list">
            {respondidas.map((a) => (
              <div key={a.id} className="painel-item" style={{ flexDirection: 'column' }}>
                <div className="painel-item-title">{'★'.repeat(a.nota)} · {a.usuario.nome}</div>
                {a.texto && <p style={{ fontSize: '0.9rem' }}>{a.texto}</p>}
                <div style={{ background: 'var(--color-gray-100)', borderRadius: 8, padding: '0.75rem', fontSize: '0.9rem', width: '100%' }}>
                  <strong style={{ color: 'var(--color-accent)' }}>Sua resposta:</strong> {a.resposta?.texto}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
