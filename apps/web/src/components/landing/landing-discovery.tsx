import Link from 'next/link';
import type { DiscoveryData } from '@/lib/seo/types';

function MapPinIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
}

export function LandingDiscovery({ discovery }: { discovery?: DiscoveryData | null }) {
  if (!discovery) return null;

  const { cidadesVizinhas, tradicoesRelacionadas } = discovery;
  const hasCidades = cidadesVizinhas && cidadesVizinhas.length > 0;
  const hasTradicoes = tradicoesRelacionadas && tradicoesRelacionadas.length > 0;

  if (!hasCidades && !hasTradicoes) return null;

  return (
    <section className="mb-8 space-y-6">
      {hasCidades && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <MapPinIcon />
            <h3 className="text-lg font-semibold text-foreground">Cidades Vizinhas</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {cidadesVizinhas!.map((cidade) => (
              <Link
                key={cidade.slug}
                href={`/cidade/${cidade.slug}`}
                className="inline-flex items-center gap-1.5 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full text-sm hover:bg-secondary/80 transition-colors"
              >
                {cidade.nome}
                {cidade.distanciaKm != null && (
                  <span className="text-xs text-muted-foreground">~{cidade.distanciaKm}km</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
      {hasTradicoes && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <LayersIcon />
            <h3 className="text-lg font-semibold text-foreground">Tradições Relacionadas</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {tradicoesRelacionadas!.map((trad) => (
              <Link
                key={trad.slug}
                href={`/tradicao/${trad.slug}`}
                className="inline-flex items-center gap-1.5 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full text-sm hover:bg-secondary/80 transition-colors"
              >
                {trad.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
