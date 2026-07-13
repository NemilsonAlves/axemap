import type { TrustScoreInfo } from '@/types/terreiro';

const nivelColors: Record<string, { bg: string; text: string; label: string }> = {
  INITIATE: { bg: '#e2e8f0', text: '#475569', label: 'Iniciante' },
  EMERGING: { bg: '#fef3c7', text: '#92400e', label: 'Emergente' },
  ESTABLISHED: { bg: '#dbeafe', text: '#1e40af', label: 'Estabelecido' },
  AUTHORITY: { bg: '#d1fae5', text: '#065f46', label: 'Autoridade' },
  LEGENDARY: { bg: '#fef08a', text: '#713f12', label: 'Lendário' },
};

export function TrustScoreSection({ trustScoreInfo }: { trustScoreInfo: TrustScoreInfo }) {
  const colors = nivelColors[trustScoreInfo.nivel] || nivelColors.INITIATE;

  return (
    <div className="section-card">
      <h2 className="section-title">Trust Score</h2>
      <div className="ts-display" style={{ textAlign: 'center' }}>
        <div
          className="ts-circle"
          style={{
            background: `conic-gradient(${colors.text} ${trustScoreInfo.score}%, var(--color-gray-200) ${trustScoreInfo.score}%)`,
          }}
        >
          <div className="ts-circle-inner" style={{ background: 'var(--color-white)' }}>
            <span className="ts-score">{trustScoreInfo.score}</span>
          </div>
        </div>
        <div className="ts-level" style={{ color: colors.text, background: colors.bg }}>
          {colors.label}
        </div>
        <p className="ts-meta" style={{ fontSize: '0.8rem', color: 'var(--color-gray-300)', marginTop: '0.5rem' }}>
          Nível: {trustScoreInfo.nivel}
        </p>
      </div>
    </div>
  );
}
