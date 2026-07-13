'use client';

import type { Avaliacao, ProfileStats } from '@/types/terreiro';

function Stars({ nota }: { nota: number }) {
  return (
    <div className="rating-stars" aria-label={`${nota} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star}>{star <= nota ? '★' : '☆'}</span>
      ))}
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
  if (avaliacoes.length === 0) return null;

  return (
    <section className="section-card" id="avaliacoes">
      <h2 className="section-title">Avaliações</h2>

      <div className="avaliacoes-header">
        <div className="avaliacoes-media">
          <span className="avaliacoes-nota">{stats.mediaNota}</span>
          <Stars nota={Math.round(stats.mediaNota)} />
          <span className="avaliacoes-total">{stats.totalAvaliacoes} avaliações</span>
        </div>
      </div>

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
