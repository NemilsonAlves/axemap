'use client';

import * as React from 'react';
import Link from 'next/link';
import { MapProviderWrapper, MapView, leafletProvider } from '@/lib/map';
import type { MapMarker } from '@/lib/map';
import { SectionHeading } from './section-heading';
import { Reveal } from './reveal';
import { ShieldCheck, MapPin, Loader2, Landmark, MapPinned } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';

interface TerreiroNoMapa {
  id: string;
  nome: string;
  slug: string;
  trustScore: number;
  isVerified: boolean;
  cidade: string;
  estado: string;
  latitude: number;
  longitude: number;
}

export function HomeMap() {
  const { formatNumber } = useI18n();
  const [terreiros, setTerreiros] = React.useState<TerreiroNoMapa[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filtrarVerificados, setFiltrarVerificados] = React.useState(false);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
    let active = true;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/terreiros?limit=150`);
        const json = await res.json();
        if (!active) return;
        const dados: TerreiroNoMapa[] = (json?.data ?? [])
          .filter((t: any) => typeof t.latitude === 'number' && typeof t.longitude === 'number')
          .slice(0, 120);
        setTerreiros(dados);
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const visiveis = filtrarVerificados ? terreiros.filter((t) => t.isVerified) : terreiros;
  const topos = [...visiveis].sort((a, b) => b.trustScore - a.trustScore).slice(0, 3);

  const estados = new Set(visiveis.map((t) => t.estado));
  const cidades = new Set(visiveis.map((t) => t.cidade));
  const verificadas = visiveis.filter((t) => t.isVerified).length;

  const indicadores = [
    { icon: MapPin,      valor: visiveis.length,    rotulo: 'Casas mapeadas' },
    { icon: ShieldCheck, valor: verificadas,       rotulo: 'Verificadas' },
    { icon: MapPinned,   valor: estados.size,      rotulo: 'Estados' },
    { icon: Landmark,    valor: cidades.size,      rotulo: 'Cidades' },
  ];

  const markers: MapMarker[] = visiveis.map((t) => ({
    id: t.id,
    position: { lat: t.latitude, lng: t.longitude },
    title: t.nome,
    slug: t.slug,
    trustScore: t.trustScore,
    color: t.isVerified ? 'var(--fern)' : 'var(--copper)',
  }));

  return (
    <section className="relative py-20 lg:py-28" aria-labelledby="mapa-titulo">
      <div className="absolute inset-0 bg-fiber opacity-40" aria-hidden="true" />
      <div className="container-page relative flex flex-col gap-10">
        <Reveal>
          <SectionHeading
            eyebrow="Território e presença"
            id="mapa-titulo"
            title={
              <>
                O axé está{' '}
                <span className="text-brand-gradient">em movimento.</span>
              </>
            }
            description="Veja as casas, eventos e comunidades distribuídos pelo Brasil. Filtre por casas verificadas e comece sua jornada."
          />
        </Reveal>

        <Reveal delay={0.05}>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {indicadores.map((ind) => (
              <div
                key={ind.rotulo}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 shadow-sm"
              >
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-copper-soft/60 text-copper-strong">
                  <ind.icon className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <dt className="sr-only">{ind.rotulo}</dt>
                  <dd className="font-display text-xl font-black leading-none text-foreground">
                    {ind.valor > 0 ? formatNumber(ind.valor) : '—'}
                  </dd>
                  <p className="mt-1 truncate text-xs font-medium text-muted-foreground">{ind.rotulo}</p>
                </div>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-lg">
              <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    aria-pressed={!filtrarVerificados}
                    onClick={() => setFiltrarVerificados(false)}
                    className="rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors data-[pressed=true]:bg-copper-soft data-[pressed=true]:text-copper-strong"
                    data-pressed={!filtrarVerificados}
                  >
                    Todas as casas
                  </button>
                  <button
                    type="button"
                    aria-pressed={filtrarVerificados}
                    onClick={() => setFiltrarVerificados(true)}
                    className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors data-[pressed=true]:bg-fern/15 data-[pressed=true]:text-fern"
                    data-pressed={filtrarVerificados}
                  >
                    <ShieldCheck className="size-4" aria-hidden="true" />
                    Verificadas
                  </button>
                </div>

                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="size-4 text-copper" aria-hidden="true" />
                  <span className="flex items-center gap-1.5">
                    <strong className="font-semibold text-foreground">{visiveis.length}</strong>
                    {visiveis.length === 1 ? 'casa no mapa' : 'casas no mapa'}
                  </span>
                </p>
              </div>

              <div className="relative">
                {loading ? (
                  <div className="flex h-[420px] items-center justify-center gap-2 text-muted-foreground sm:h-[520px]">
                    <Loader2 className="size-5 animate-spin text-copper" aria-hidden="true" />
                    Carregando casas…
                  </div>
                ) : error ? (
                  <div className="flex h-[420px] items-center justify-center sm:h-[520px]">
                    <p className="text-sm text-muted-foreground">Não foi possível carregar o mapa agora.</p>
                  </div>
                ) : (
                  <HomeMapView markers={markers} />
                )}

                {!loading && !error && (
                  <div className="pointer-events-none absolute right-4 top-4 z-[1000] hidden w-60 flex-col gap-2 overflow-hidden rounded-2xl border border-border bg-card/95 p-3 shadow-lg backdrop-blur md:flex">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {filtrarVerificados ? 'Casas verificadas em destaque' : 'Em destaque por Trust Score'}
                    </p>
                    {topos.map((t, i) => (
                      <Link
                        key={t.id}
                        href={`/terreiro/${t.slug}`}
                        className="pointer-events-auto group flex items-center gap-2.5 rounded-xl p-1.5 transition-colors hover:bg-accent"
                      >
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-copper-soft/60 text-xs font-bold text-copper-strong">
                          {i + 1}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-foreground">{t.nome}</span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {t.cidade}, {t.estado}
                          </span>
                        </span>
                        <span className="shrink-0 text-sm font-bold text-ochre">{t.trustScore?.toFixed(1)}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function HomeMapView({ markers }: { markers: MapMarker[] }) {
  return (
    <MapProviderWrapper provider={leafletProvider}>
      <MapView
        center={{ lat: -14.235, lng: -51.9253 }}
        zoom={4}
        markers={markers}
        style={{ height: 'clamp(420px, 55vh, 560px)', width: '100%' }}
        className="w-full"
      />
    </MapProviderWrapper>
  );
}