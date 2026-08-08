import type { EstatisticasCompletas } from '@/lib/seo/types';

function SvgIcon({ path, viewBox = '0 0 24 24' }: { path: string; viewBox?: string }) {
  return (
    <svg className="w-4 h-4" viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

const icons = {
  building: 'M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18M6 22H4m2 0h16M6 14h.01M6 10h.01M6 6h.01M18 14h.01M18 10h.01M18 6h.01',
  badgeCheck: 'M9 12l2 2 4-4M7.86 2h8.28L22 5.5v4.64a9.5 9.5 0 0 1-4.3 7.86L12 22l-5.7-4A9.5 9.5 0 0 1 2 10.14V5.5L7.86 2z',
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  messageSquare: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  trendingUp: 'M23 6l-9.5 9.5-5-5L1 18M17 6h6v6',
  calendar: 'M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm-2 0V2M7 4V2M3 10h18',
  graduationCap: 'M22 10v6M2 10l10-5 10 5-10 5zM6 12v5c3 3 9 3 12 0v-5',
  heartHandshake: 'M19 14c1.5-1.5 2-3.5 2-5 0-2.5-2-4.5-4.5-4.5-1.5 0-2.8.7-3.5 1.7-.7-1-2-1.7-3.5-1.7C7 4.5 5 6.5 5 9c0 1.5.5 3.5 2 5l5 5 5-5zM12 22l4-4M9 11l2 2 4-4',
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm6-3.87A4 4 0 0 1 16 7a4 4 0 0 1-1 2.73M22 21v-2a4 4 0 0 0-3-3.87',
};

interface StatCard {
  value: number | string;
  label: string;
  iconPath: string;
  color: string;
}

export function LandingExtendedStats({ estatisticas }: { estatisticas: EstatisticasCompletas }) {
  const cards: StatCard[] = [
    { value: estatisticas.totalTerreiro, label: 'Terreiros cadastrados', iconPath: icons.building, color: 'text-primary' },
    { value: estatisticas.totalVerificados, label: 'Verificados', iconPath: icons.badgeCheck, color: 'text-green-600' },
    { value: estatisticas.trustScoreMedio.toFixed(1), label: 'Trust Score médio', iconPath: icons.star, color: 'text-amber-600' },
    { value: estatisticas.totalAvaliacoes, label: 'Total de avaliações', iconPath: icons.messageSquare, color: 'text-blue-600' },
    { value: estatisticas.mediaAvaliacoes.toFixed(1), label: 'Média de avaliações', iconPath: icons.trendingUp, color: 'text-purple-600' },
    { value: estatisticas.totalEventos, label: 'Eventos realizados', iconPath: icons.calendar, color: 'text-rose-600' },
    { value: estatisticas.totalCursos, label: 'Cursos oferecidos', iconPath: icons.graduationCap, color: 'text-cyan-600' },
    { value: estatisticas.totalAcoesSociais, label: 'Ações sociais', iconPath: icons.heartHandshake, color: 'text-orange-600' },
    { value: estatisticas.totalDirigentes, label: 'Dirigentes cadastrados', iconPath: icons.users, color: 'text-indigo-600' },
  ];

  return (
    <section className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
      {cards.map((card, i) => (
        <div key={i} className="bg-card border rounded-lg p-4 flex flex-col items-center text-center">
          <div className={`${card.color} mb-2`}>
            <SvgIcon path={card.iconPath} />
          </div>
          <div className={`text-2xl font-bold ${card.color} leading-tight`}>{card.value}</div>
          <div className="text-xs text-muted-foreground mt-1 leading-tight">{card.label}</div>
        </div>
      ))}
    </section>
  );
}
