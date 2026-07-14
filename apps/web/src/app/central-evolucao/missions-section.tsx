import type { EvolutionMission } from '@/types/evolution';

const categLabels: Record<string, string> = {
  PERFIL: 'Perfil', EVENTOS: 'Eventos', CURSOS: 'Cursos',
  SOCIAL: 'Ações Sociais', DIVULGACAO: 'Divulgação',
  ENGAJAMENTO: 'Engajamento', CRESCIMENTO: 'Crescimento',
};

export function MissionsSection({
  missoes, total, completas,
}: {
  missoes: EvolutionMission[];
  total: number;
  completas: number;
}) {
  const agrupadas = missoes.reduce<Record<string, EvolutionMission[]>>((acc, m) => {
    const cat = m.categoria || 'OUTROS';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(m);
    return acc;
  }, {});

  const categorias = Object.entries(agrupadas);

  return (
    <div className="evo-card">
      <div className="evo-card-title">Missões</div>
      <div className="evo-card-subtitle">
        {completas} de {total} missões concluídas — cada missão aumenta seu AxéScore
      </div>

      {categorias.map(([cat, lista]) => (
        <div key={cat} style={{ marginBottom: '1rem' }}>
          <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-gray-300)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            {categLabels[cat] || cat}
          </h4>
          <div className="missoes-grid">
            {lista.map((missao) => (
              <div key={missao.id} className={`missao-card ${missao.completo ? 'completa' : ''}`}>
                <div className="missao-icon">
                  {missao.completo ? '✓' : '○'}
                </div>
                <div className="missao-body">
                  <div className="missao-titulo">{missao.titulo}</div>
                  <div className="missao-descricao">{missao.descricao}</div>
                  <div className="missao-footer">
                    <span className="missao-reward">
                      +{missao.rewardAxScore} AxéScore
                      {missao.rewardTrustScore > 0 && ` · +${missao.rewardTrustScore} Trust Score`}
                    </span>
                    <div className="evo-progress-bar missao-progress">
                      <div
                        className="evo-progress-fill"
                        style={{ width: `${missao.progresso}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
