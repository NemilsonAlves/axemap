export function AxScoreHeader({
  score, stats, completude,
}: {
  score: number;
  stats: { totalMissoes: number; missoesCompletas: number; totalConquistas: number; conquistasObtidas: number };
  completude: number;
}) {
  const cor = score >= 80 ? '#16a34a' : score >= 60 ? '#f59e0b' : score >= 40 ? '#f97316' : '#ef4444';

  return (
    <div className="axscore-header">
      <div
        className="axscore-circle"
        style={{ '--pct': `${score}%`, background: `conic-gradient(${cor} ${score}%, rgba(255,255,255,0.15) ${score}%)` } as React.CSSProperties}
      >
        <div className="axscore-circle-inner">
          <span className="axscore-number">{score}</span>
          <span className="axscore-label">AxéScore</span>
        </div>
      </div>
      <div className="axscore-info">
        <h1>Central de Evolução</h1>
        <p>
          {score < 40 ? 'Comece a melhorar seu perfil! Complete as missões abaixo para aumentar seu AxéScore.' :
           score < 60 ? 'Bom progresso! Continue completando as missões para evoluir ainda mais.' :
           score < 80 ? 'Ótimo trabalho! Você está no caminho para se tornar uma referência.' :
           'Excelente! Seu perfil é uma referência na plataforma.'}
        </p>
        <div className="axscore-stats">
          <div className="axscore-stat">
            <span className="axscore-stat-value">{completude}%</span>
            <span className="axscore-stat-label">Completeza</span>
          </div>
          <div className="axscore-stat">
            <span className="axscore-stat-value">{stats.missoesCompletas}/{stats.totalMissoes}</span>
            <span className="axscore-stat-label">Missões</span>
          </div>
          <div className="axscore-stat">
            <span className="axscore-stat-value">{stats.conquistasObtidas}/{stats.totalConquistas}</span>
            <span className="axscore-stat-label">Conquistas</span>
          </div>
        </div>
      </div>
    </div>
  );
}
