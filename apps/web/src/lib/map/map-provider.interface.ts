import type { MapConfig, MapGeoPoint, MapBounds } from './types';

export type MapProviderFactory = (container: HTMLElement, config: MapConfig) => MapProviderInstance;

export interface MapProviderInstance {
  addMarker(marker: { id: string; position: MapGeoPoint; title: string }): void;
  addMarkers(markers: { id: string; position: MapGeoPoint; title: string }[]): void;
  removeMarker(id: string): void;
  clearMarkers(): void;
  flyTo(position: MapGeoPoint, zoom?: number): void;
  fitBounds(bounds: MapBounds): void;
  getBounds(): MapBounds;
  getCenter(): MapGeoPoint;
  getZoom(): number;
  destroy(): void;
  on(event: string, handler: (...args: any[]) => void): void;
  off(event: string, handler: (...args: any[]) => void): void;
}

export interface MapProviderDefinition {
  name: string;
  create: MapProviderFactory;
}
