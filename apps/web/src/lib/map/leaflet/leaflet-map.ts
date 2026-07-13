/// <reference types="leaflet" />

import type { MapConfig, MapGeoPoint, MapBounds } from '../types';
import type { MapProviderInstance } from '../map-provider.interface';

export function createLeafletMap(container: HTMLElement, config: MapConfig): MapProviderInstance {
  const L = (window as any).L;
  if (!L) throw new Error('Leaflet not loaded');

  const map = L.map(container, {
    center: [config.center.lat, config.center.lng],
    zoom: config.zoom,
    minZoom: config.minZoom ?? 3,
    maxZoom: config.maxZoom ?? 18,
  });

  L.tileLayer(
    config.tileUrl || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      attribution: config.attribution || '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    },
  ).addTo(map);

  const markers = new Map<string, any>();

  const api: MapProviderInstance = {
    addMarker(marker) {
      const leafletMarker = L.marker([marker.position.lat, marker.position.lng])
        .addTo(map)
        .bindPopup(`<b>${marker.title}</b>`);
      markers.set(marker.id, leafletMarker);
    },

    addMarkers(markerList) {
      markerList.forEach((m) => api.addMarker(m));
    },

    removeMarker(id) {
      const m = markers.get(id);
      if (m) {
        map.removeLayer(m);
        markers.delete(id);
      }
    },

    clearMarkers() {
      markers.forEach((m) => map.removeLayer(m));
      markers.clear();
    },

    flyTo(position, zoomOverride) {
      map.flyTo([position.lat, position.lng], zoomOverride);
    },

    fitBounds(bounds) {
      map.fitBounds([
        [bounds.south, bounds.west],
        [bounds.north, bounds.east],
      ]);
    },

    getBounds() {
      const b = map.getBounds();
      return { north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest() };
    },

    getCenter() {
      const c = map.getCenter();
      return { lat: c.lat, lng: c.lng };
    },

    getZoom() {
      return map.getZoom();
    },

    destroy() {
      map.remove();
      markers.clear();
    },

    on(event, handler) {
      map.on(event, handler);
    },

    off(event, handler) {
      map.off(event, handler);
    },
  };

  return api;
}
