import type { TrustScoreInfo } from '@/types/terreiro';

/* Níveis do Trust Score mapeados aos tokens semânticos do Design System.
   Mantém contraste AA por usar os tokens de texto ± um fundo 12% do mesmo tom. */
const nivelColors: Record<string, { color: string; label: string }> = {
  INITIATE: { color: 'var(--muted-foreground)', label: 'Iniciante' },
  EMERGING: { color: 'var(--ochre)', label: 'Emergente' },
  ESTABLISHED: { color: 'var(--info)', label: 'Estabelecido' },
  AUTHORITY: { color: 'var(--success)', label: 'Autoridade' },
  LEGENDARY: { color: 'var(--copper)', label: 'Lendário' },
};

export function TrustScoreSection({ trustScoreInfo }: { trustScoreInfo: TrustScoreInfo }) {
  const colors = nivelColors[trustScoreInfo.nivel] || nivelColors.INITIATE;
  const levelBg = `color-mix(in srgb, ${colors.color} 14%, transparent)`;

  return (
    <div className="section-card">
      <h2 className="section-title">Trust Score</h2>
      <div className="ts-display" style={{ textAlign: 'center' }}>
        <div
          className="ts-circle"
          style={{
            background: `conic-gradient(${colors.color} ${trustScoreInfo.score}%, var(--color-gray-200) ${trustScoreInfo.score}%)`,
          }}
        >
          <div className="ts-circle-inner" style={{ background: 'var(--color-surface-1)' }}>
            <span className="ts-score">{trustScoreInfo.score}</span>
          </div>
        </div>
        <div className="ts-level" style={{ color: colors.color, background: levelBg }}>
          {colors.label}
        </div>
        <p className="ts-meta" style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>
          Nível: {trustScoreInfo.nivel}
        </p>
      </div>
    </div>
  );
}
