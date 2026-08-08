'use client';

import { useEffect, useRef } from 'react';
import { useMapProvider } from './map-provider';
import type { MapGeoPoint, MapBounds, MapMarker, MapConfig } from './types';
import type { MapProviderInstance } from './map-provider.interface';

interface MapViewProps {
  center: MapGeoPoint;
  zoom?: number;
  markers?: MapMarker[];
  className?: string;
  style?: React.CSSProperties;
  onClick?: (position: MapGeoPoint) => void;
  onBoundsChange?: (bounds: MapBounds) => void;
}

export function MapView({
  center,
  zoom = 13,
  markers = [],
  className,
  style,
  onClick,
  onBoundsChange,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapProviderInstance | null>(null);
  const provider = useMapProvider();

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !provider) return;

    let cancelled = false;

    async function init() {
      if (!provider || !container) return;

      const config: MapConfig = {
        center,
        zoom,
        tileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
      };

      const instance = provider.create(container, config);
      const resolved = instance instanceof Promise ? await instance : instance;
      mapRef.current = resolved;

      if (cancelled) {
        // StrictMode (dev) monta/desmonta o efeito de forma concorrente. O mapa
        // recém-criado é reutilizado pela re-execucao do efeito (registro do
        // provider evita duplicar a instância), entao não destruímos aqui.
        return;
      }

      if (onClick) {
        resolved.on('click', (interaction: any) => {
          if (interaction.position) onClick(interaction.position);
        });
      }

      if (onBoundsChange) {
        const handleBoundsChange = () => {
          if (mapRef.current) onBoundsChange(mapRef.current.getBounds());
        };
        resolved.on('dragend', handleBoundsChange);
        resolved.on('zoomend', handleBoundsChange);
      }
    }

    init();

    return () => {
      cancelled = true;
      mapRef.current?.destroy();
      mapRef.current = null;
    };
  }, [provider]);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.clearMarkers();
    if (markers.length > 0) mapRef.current.addMarkers(markers);
  }, [markers]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height: '400px', ...style }}
    />
  );
}
