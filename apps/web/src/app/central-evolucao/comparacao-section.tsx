import type { ComparacaoMedia } from '@/types/evolution';

function ComparacaoBar({
  label, valor, media, max,
}: {
  label: string;
  valor: number;
  media: number;
  max: number;
}) {
  return (
    <div className="comparacao-item">
      <div className="comparacao-label">{label}</div>
      <div className="comparacao-bar-group">
        <div className="comparacao-bar-row">
          <span className="bar-label">Você</span>
          <div className="bar-track">
            <div className="bar-fill voce" style={{ width: `${(valor / max) * 100}%` }} />
          </div>
          <span className="bar-value">{valor}</span>
        </div>
        <div className="comparacao-bar-row">
          <span className="bar-label">Média</span>
          <div className="bar-track">
            <div className="bar-fill media" style={{ width: `${(media / max) * 100}%` }} />
          </div>
          <span className="bar-value">{media}</span>
        </div>
      </div>
    </div>
  );
}

export function ComparacaoSection({
  comparacao, score,
}: {
  comparacao: { cidade: ComparacaoMedia; estado: ComparacaoMedia };
  score: number;
}) {
  return (
    <div className="evo-card">
      <div className="evo-card-title">Comparação</div>
      <div className="evo-card-subtitle">Como seu perfil se compara</div>

      <div style={{ marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-gray-300)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Na sua cidade
      </div>
      <ComparacaoBar
        label="Trust Score"
        valor={score}
        media={comparacao.cidade.trustScoreMedio}
        max={100}
      />
      <div style={{ margin: '0.75rem 0', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-gray-300)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        No seu estado
      </div>
      <ComparacaoBar
        label="Trust Score"
        valor={score}
        media={comparacao.estado.trustScoreMedio}
        max={100}
      />
    </div>
  );
}
