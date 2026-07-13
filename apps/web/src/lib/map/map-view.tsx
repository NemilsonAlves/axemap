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
    if (!containerRef.current || !provider) return;

    const config: MapConfig = {
      center,
      zoom,
      tileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
    };

    mapRef.current = provider.create(containerRef.current, config);

    if (onClick) {
      mapRef.current.on('click', (interaction: any) => {
        if (interaction.position) onClick(interaction.position);
      });
    }

    if (onBoundsChange) {
      const handleBoundsChange = () => {
        if (mapRef.current) onBoundsChange(mapRef.current.getBounds());
      };
      mapRef.current.on('dragend', handleBoundsChange);
      mapRef.current.on('zoomend', handleBoundsChange);
    }

    return () => {
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
