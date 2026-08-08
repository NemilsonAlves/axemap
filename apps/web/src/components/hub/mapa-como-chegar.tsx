'use client';

import type { TerreiroPerfil } from '@/types/terreiro';
import { MapProviderWrapper, MapView, leafletProvider } from '@/lib/map';
import { MapPin, Accessibility, Car, BusFront, Navigation } from 'lucide-react';

export function MapaComoChegar({ terreiro }: { terreiro: TerreiroPerfil }) {
  const hasCoords = terreiro.latitude && terreiro.longitude;
  const mapsUrl = hasCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${terreiro.latitude},${terreiro.longitude}`
    : null;

  const estacionamento =
    terreiro.estacionamento === 'GRATUITO'
      ? 'Estacionamento gratuito'
      : terreiro.estacionamento === 'PAGO'
        ? 'Estacionamento pago'
        : terreiro.estacionamento
          ? terreiro.estacionamento
          : 'Consulte estacionamento nas proximidades';

  const itens = [
    { icon: MapPin, text: `${terreiro.cidade}, ${terreiro.estado}` },
    { icon: Car, text: estacionamento },
    { icon: BusFront, text: 'Transporte público disponível na região' },
    {
      icon: Accessibility,
      text: terreiro.acessibilidade
        ? 'Acessível a pessoas com mobilidade reduzida'
        : 'Acessibilidade: não informado',
    },
  ];

  return (
    <section className="section-card" id="como-chegar">
      <div className="flex items-center gap-2">
        <MapPin className="size-5 text-copper" />
        <h2 className="section-title">Localização & Como Chegar</h2>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
        {hasCoords ? (
          <div className="min-h-[280px] overflow-hidden rounded-2xl border border-border">
            <MapProviderWrapper provider={leafletProvider}>
              <MapView
                center={{ lat: terreiro.latitude, lng: terreiro.longitude }}
                zoom={15}
                markers={[
                  {
                    id: terreiro.id,
                    position: { lat: terreiro.latitude, lng: terreiro.longitude },
                    title: terreiro.nome,
                    color: '#0d9488',
                  },
                ]}
              />
            </MapProviderWrapper>
          </div>
        ) : (
          <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 text-sm text-muted-foreground">
            Localização não informada.
          </div>
        )}

        <div className="space-y-3">
          {itens.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.text} className="flex items-start gap-2 rounded-xl border border-border bg-card p-3 text-sm text-muted-foreground">
                <Icon className="mt-0.5 size-4 shrink-0 text-copper" />
                {item.text}
              </div>
            );
          })}

          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-copper px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-copper-strong"
            >
              <Navigation className="size-4" /> Traçar rota
            </a>
          )}
        </div>
      </div>
    </section>
  );
}