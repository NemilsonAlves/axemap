interface TimelinePoint {
  mes: string;
  count: number;
}

export function LandingTimeline({ evolucaoCadastros }: { evolucaoCadastros: TimelinePoint[] }) {
  if (!evolucaoCadastros || evolucaoCadastros.length < 2) return null;

  const maxCount = Math.max(...evolucaoCadastros.map((p) => p.count));

  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-foreground mb-4">Evolução de Cadastros</h2>
      <div className="bg-card border rounded-lg p-4">
        <div className="h-32 flex items-end gap-1">
          {evolucaoCadastros.map((point, i) => {
            const height = maxCount > 0 ? (point.count / maxCount) * 100 : 0;
            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center justify-end h-full"
              >
                <span className="text-[10px] font-medium text-muted-foreground mb-1">
                  {point.count}
                </span>
                <div
                  className="w-full bg-primary/80 rounded-t hover:bg-primary transition-colors cursor-default"
                  style={{ height: `${height}%`, minHeight: point.count > 0 ? '4px' : '0' }}
                />
                <span className="text-[10px] text-muted-foreground mt-1 truncate w-full text-center">
                  {point.mes}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
