import type { EvolutionAchievement } from '@/types/evolution';

export function AchievementsSection({
  conquistas, total, obtidas,
}: {
  conquistas: EvolutionAchievement[];
  total: number;
  obtidas: number;
}) {
  return (
    <div className="evo-card">
      <div className="evo-card-title">Conquistas e Selos</div>
      <div className="evo-card-subtitle">
        {obtidas} de {total} conquistas obtidas
      </div>

      <div className="conquistas-grid">
        {conquistas.map((c) => (
          <div
            key={c.id}
            className={`conquista-card ${c.obtida ? 'obtida' : ''}`}
            title={c.descricao}
          >
            <div className="conquista-icone">{c.icone || '🏅'}</div>
            <div className="conquista-titulo">{c.titulo}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
