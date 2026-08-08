interface DistributionItem {
  label: string;
  count: number;
}

interface DistributionProps {
  distribuicao: DistributionItem[];
  total: number;
  title?: string;
}

export function LandingDistribution({
  distribuicao,
  total,
  title = 'Distribuição por Tradição',
}: DistributionProps) {
  if (!distribuicao || distribuicao.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-foreground mb-4">{title}</h2>
      <div className="bg-card border rounded-lg p-4 space-y-3">
        {distribuicao.map((item, i) => {
          const percent = total > 0 ? (item.count / total) * 100 : 0;
          return (
            <div key={i} className="flex items-center gap-3">
              <span className="text-sm text-foreground w-32 shrink-0 truncate" title={item.label}>
                {item.label}
              </span>
              <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary/80 rounded-full transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="text-sm text-muted-foreground tabular-nums w-12 text-right shrink-0">
                {item.count}
              </span>
              <span className="text-xs text-muted-foreground w-10 text-right shrink-0">
                {percent.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
