import type { EvolutionAction } from '@/types/evolution';

export function AcoesSection({ acoes }: { acoes: EvolutionAction[] }) {
  if (acoes.length === 0) {
    return (
      <div className="evo-card">
        <div className="evo-card-title">Ações Recentes</div>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-gray-300)' }}>
          Suas ações aparecerão aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="evo-card">
      <div className="evo-card-title">Ações Recentes</div>
      <div className="acoes-lista">
        {acoes.slice(0, 10).map((acao) => (
          <div key={acao.id} className="acao-item">
            <div className="acao-descricao">{acao.descricao}</div>
            {acao.axScoreDelta !== 0 && (
              <span className={`acao-score ${acao.axScoreDelta > 0 ? 'positivo' : ''}`}>
                {acao.axScoreDelta > 0 ? '+' : ''}{acao.axScoreDelta}
              </span>
            )}
            <span className="acao-data">
              {new Date(acao.createdAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
