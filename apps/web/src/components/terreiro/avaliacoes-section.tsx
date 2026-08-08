'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Avaliacao, ProfileStats } from '@/types/terreiro';
import { useAuth } from '@/lib/auth/auth-context';
import { api } from '@/lib/api-client';

function Stars({ nota }: { nota: number }) {
  return (
    <div className="rating-stars" aria-label={`${nota} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} style={{ color: star <= nota ? 'var(--color-accent)' : 'var(--color-gray-200)' }}>★</span>
      ))}
    </div>
  );
}

function AvaliarForm({ terreiroId }: { terreiroId: string }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [minha, setMinha] = useState<{ id: string; nota: number; texto: string } | null | undefined>(undefined);
  const [nota, setNota] = useState(0);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!user) return;
    api
      .get<any>('/avaliacoes/me')
      .then((res) => {
        const lista = Array.isArray(res) ? res : (res.data ?? []);
        const a = lista.find((x: any) => x.terreiro?.id === terreiroId);
        if (a) {
          setMinha({ id: a.id, nota: a.nota, texto: a.texto || '' });
          setNota(a.nota);
          setTexto(a.texto || '');
        } else {
          setMinha(null);
        }
      })
      .catch(() => setMinha(null));
  }, [user, terreiroId]);

  if (loading) return null;

  if (!user) {
    return (
      <p className="avaliar-login">
        Já visitou este terreiro? <a href="/auth/login" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Entre</a> e deixe sua avaliação.
      </p>
    );
  }

  if (minha === undefined) return null;

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nota) return;
    setEnviando(true);
    setErro('');
    try {
      await api.post('/avaliacoes', { terreiroId, nota, texto: texto.trim() || undefined });
      router.refresh();
      setMinha({ id: minha?.id ?? 'atualizada', nota, texto });
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao salvar avaliação');
    } finally {
      setEnviando(false);
    }
  };

  const excluir = async () => {
    if (!minha?.id || minha.id === 'atualizada') return;
    if (!window.confirm('Remover sua avaliação deste terreiro?')) return;
    try {
      await api.delete(`/avaliacoes/${minha.id}`);
      setMinha(null);
      setNota(0);
      setTexto('');
      router.refresh();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao remover');
    }
  };

  return (
    <div className="avaliar-box">
      {erro && <div className="avaliar-erro">{erro}</div>}
      <h3 className="avaliar-titulo">{minha ? 'Sua avaliação' : 'Avalie este terreiro'}</h3>
      <div className="avaliar-estrelas" role="radiogroup" aria-label="Nota">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={star <= nota}
            onClick={() => setNota(star)}
            style={{ color: star <= nota ? 'var(--color-accent)' : 'var(--color-gray-200)' }}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        className="avaliar-texto"
        placeholder="Conte sua experiência (opcional)"
        value={texto}
        maxLength={2000}
        onChange={(e) => setTexto(e.target.value)}
      />
      <div className="avaliar-acoes">
        <button className="avaliar-btn" onClick={salvar} disabled={enviando || !nota}>
          {enviando ? 'Enviando...' : minha ? 'Atualizar avaliação' : 'Enviar avaliação'}
        </button>
        {minha && (
          <button className="avaliar-btn-ghost" onClick={excluir}>Remover</button>
        )}
      </div>
    </div>
  );
}

export function AvaliacoesSection({
  avaliacoes,
  terreiroId,
  stats,
}: {
  avaliacoes: Avaliacao[];
  terreiroId: string;
  stats: ProfileStats;
}) {
  return (
    <section className="section-card" id="avaliacoes">
      <h2 className="section-title">Avaliações</h2>

      <div className="avaliacoes-header">
        <div className="avaliacoes-media">
          <span className="avaliacoes-nota">{stats.mediaNota || '–'}</span>
          <Stars nota={Math.round(stats.mediaNota)} />
          <span className="avaliacoes-total">
            {stats.totalAvaliacoes > 0 ? `${stats.totalAvaliacoes} avaliação${stats.totalAvaliacoes > 1 ? 'ões' : ''}` : 'Sem avaliações ainda'}
          </span>
        </div>
      </div>

      <AvaliarForm terreiroId={terreiroId} />

      <div className="avaliacoes-lista">
        {avaliacoes.map((avaliacao) => (
          <div key={avaliacao.id} className="avaliacao-card">
            <div className="avaliacao-header">
              <div className="avaliacao-user">
                <div className="avaliacao-avatar">
                  {avaliacao.usuario.nome.charAt(0).toUpperCase()}
                </div>
                <div>
                  <strong>{avaliacao.usuario.nome}</strong>
                  <Stars nota={avaliacao.nota} />
                </div>
              </div>
              <span className="avaliacao-data">
                {new Date(avaliacao.createdAt).toLocaleDateString('pt-BR')}
              </span>
            </div>

            {avaliacao.texto && <p className="avaliacao-texto">{avaliacao.texto}</p>}

            {avaliacao.resposta && (
              <div className="avaliacao-resposta">
                <strong>Resposta do dirigente:</strong>
                <p>{avaliacao.resposta.texto}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
