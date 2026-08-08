interface StatsProps {
  trustScoreMedio: number;
  totalTerreiro: number;
  totalVerificados: number;
  tradicoes?: Array<{ nome: string; count: number }>;
}

export function LandingStats({ trustScoreMedio, totalTerreiro, totalVerificados, tradicoes }: StatsProps) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-card border rounded-lg p-4">
        <div className="text-3xl font-bold text-primary">{totalTerreiro}</div>
        <div className="text-sm text-muted-foreground">Terreiros cadastrados</div>
      </div>
      <div className="bg-card border rounded-lg p-4">
        <div className="text-3xl font-bold text-green-600">{totalVerificados}</div>
        <div className="text-sm text-muted-foreground">Verificados</div>
      </div>
      <div className="bg-card border rounded-lg p-4">
        <div className="text-3xl font-bold text-amber-600">{trustScoreMedio}</div>
        <div className="text-sm text-muted-foreground">Trust Score médio</div>
      </div>
      <div className="bg-card border rounded-lg p-4">
        <div className="text-3xl font-bold text-purple-600">{tradicoes?.length || 0}</div>
        <div className="text-sm text-muted-foreground">Tradições representadas</div>
      </div>
    </section>
  );
}
