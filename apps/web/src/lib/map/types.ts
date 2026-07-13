export interface MapGeoPoint {
  lat: number;
  lng: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapMarker {
  id: string;
  position: MapGeoPoint;
  title: string;
  description?: string;
  slug?: string;
  trustScore?: number;
  icon?: string;
  color?: string;
}

export interface MapCluster {
  id: string;
  position: MapGeoPoint;
  count: number;
  markers: MapMarker[];
}

export interface MapConfig {
  center: MapGeoPoint;
  zoom: number;
  minZoom?: number;
  maxZoom?: number;
  bounds?: MapBounds;
  tileUrl?: string;
  attribution?: string;
}

export interface MapInteraction {
  type: 'click' | 'hover' | 'drag' | 'zoom';
  position?: MapGeoPoint;
  zoom?: number;
  markerId?: string;
}

export type MapEventHandler = (interaction: MapInteraction) => void;

export interface MapProvider {
  render(config: MapConfig): HTMLElement;
  addMarker(marker: MapMarker): void;
  addMarkers(markers: MapMarker[]): void;
  removeMarker(id: string): void;
  clearMarkers(): void;
  flyTo(position: MapGeoPoint, zoom?: number): void;
  fitBounds(bounds: MapBounds): void;
  getBounds(): MapBounds;
  getCenter(): MapGeoPoint;
  getZoom(): number;
  destroy(): void;
  on(event: string, handler: MapEventHandler): void;
  off(event: string, handler: MapEventHandler): void;
}
