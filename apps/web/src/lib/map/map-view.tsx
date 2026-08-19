'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { useMapProvider } from './map-provider';
import type { MapGeoPoint, MapBounds, MapMarker, MapConfig } from './types';
import type { MapProviderInstance } from './map-provider.interface';

export interface MapViewHandle {
  flyTo(position: MapGeoPoint, zoom?: number): void;
  getBounds(): MapBounds;
  getCenter(): MapGeoPoint;
  getZoom(): number;
}

interface MapViewProps {
  center: MapGeoPoint;
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  markers?: MapMarker[];
  className?: string;
  style?: React.CSSProperties;
  onClick?: (position: MapGeoPoint) => void;
  onMarkerClick?: (markerId: string) => void;
  onBoundsChange?: (bounds: MapBounds) => void;
  /** Quando true, ajusta automaticamente os limites do mapa aos marcadores. */
  autoFit?: boolean;
}

export const MapView = forwardRef<MapViewHandle, MapViewProps>(function MapView(
  {
    center,
    zoom = 13,
    minZoom,
    maxZoom,
    markers = [],
    className,
    style,
onClick,
  onMarkerClick,
  onBoundsChange,
  autoFit = false,
},
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapProviderInstance | null>(null);
  const provider = useMapProvider();

  const onClickRef = useRef(onClick);
  const onMarkerClickRef = useRef(onMarkerClick);
  const onBoundsChangeRef = useRef(onBoundsChange);
  const centerRef = useRef(center);
  const zoomRef = useRef(zoom);
  const minZoomRef = useRef(minZoom);
  const maxZoomRef = useRef(maxZoom);
  const autoFitRef = useRef(autoFit);
  useEffect(() => {
    onClickRef.current = onClick;
    onMarkerClickRef.current = onMarkerClick;
    onBoundsChangeRef.current = onBoundsChange;
    centerRef.current = center;
    zoomRef.current = zoom;
    minZoomRef.current = minZoom;
    maxZoomRef.current = maxZoom;
    autoFitRef.current = autoFit;
  }, [onClick, onMarkerClick, onBoundsChange, center, zoom, minZoom, maxZoom, autoFit]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !provider) return;

    let cancelled = false;

    async function init() {
      if (!provider || !container) return;

      const config: MapConfig = {
        center: centerRef.current,
        zoom: zoomRef.current,
        minZoom: minZoomRef.current,
        maxZoom: maxZoomRef.current,
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

      if (onClickRef.current) {
        resolved.on('click', (interaction: any) => {
          if (interaction.position) onClickRef.current?.(interaction.position);
        });
      }

      if (onMarkerClickRef.current) {
        resolved.on('markerclick', (interaction: any) => {
          if (interaction.markerId) onMarkerClickRef.current?.(interaction.markerId);
        });
      }

      if (onBoundsChangeRef.current) {
        const handleBoundsChange = () => {
          if (mapRef.current) onBoundsChangeRef.current?.(mapRef.current.getBounds());
        };
        resolved.on('dragend', handleBoundsChange);
        resolved.on('zoomend', handleBoundsChange);
      }

      if (autoFitRef.current && markersRef.current.length > 0) {
        resolved.fitBounds(boundsFromMarkers(markersRef.current));
      }
    }

    init();

    return () => {
      cancelled = true;
      mapRef.current?.destroy();
      mapRef.current = null;
    };
  }, [provider]);

  const markersRef = useRef(markers);
  markersRef.current = markers;

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo(center, zoom);
  }, [center, zoom]);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.clearMarkers();
    if (markers.length > 0) mapRef.current.addMarkers(markers);
    if (autoFit && markers.length > 0) {
      mapRef.current.fitBounds(boundsFromMarkers(markers));
    }
  }, [markers, autoFit]);

  useImperativeHandle(
    ref,
    () => ({
      flyTo(position, z) {
        mapRef.current?.flyTo(position, z);
      },
      getBounds() {
        return mapRef.current?.getBounds() ?? { north: 0, south: 0, east: 0, west: 0 };
      },
      getCenter() {
        return mapRef.current?.getCenter() ?? center;
      },
      getZoom() {
        return mapRef.current?.getZoom() ?? zoom;
      },
    }),
    [center, zoom],
  );

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height: '400px', ...style }}
    />
  );
});

function boundsFromMarkers(markers: MapMarker[]): MapBounds {
  const lats = markers.map((m) => m.position.lat);
  const lngs = markers.map((m) => m.position.lng);
  const south = Math.min(...lats);
  const north = Math.max(...lats);
  const west = Math.min(...lngs);
  const east = Math.max(...lngs);
  return { north, south, east, west };
}
