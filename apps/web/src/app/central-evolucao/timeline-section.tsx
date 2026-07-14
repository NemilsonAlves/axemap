import type { AxScorePoint } from '@/types/evolution';

export function TimelineSection({ historico }: { historico: AxScorePoint[] }) {
  if (historico.length === 0) {
    return (
      <div className="evo-card">
        <div className="evo-card-title">Histórico de Evolução</div>
        <div className="evo-card-subtitle">Nenhuma alteração registrada ainda</div>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-gray-300)' }}>
          Complete missões e melhore seu perfil para começar a construir seu histórico.
        </p>
      </div>
    );
  }

  return (
    <div className="evo-card">
      <div className="evo-card-title">Histórico de Evolução</div>
      <div className="evo-card-subtitle">
        Score atual: {historico[0]?.score || 0}
        {historico.length > 1 && historico[0]?.score > (historico[historico.length - 1]?.score || 0) &&
          ` (${historico[0].score - (historico[historico.length - 1]?.score || 0)} pts conquistados)`}
      </div>
      <div className="timeline">
        {historico.map((ponto) => (
          <div key={ponto.id} className={`timeline-item ${ponto.delta < 0 ? 'negativo' : ''}`}>
            <div className="timeline-razao">{ponto.razao}</div>
            <div className={`timeline-delta ${ponto.delta >= 0 ? 'positivo' : 'negativo'}`}>
              {ponto.delta >= 0 ? '+' : ''}{ponto.delta} pts
            </div>
            <div className="timeline-data">
              {new Date(ponto.createdAt).toLocaleDateString('pt-BR', {
                day: 'numeric', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
