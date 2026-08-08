import type { MapConfig, MapGeoPoint, MapBounds } from '../types';
import type { MapProviderInstance } from '../map-provider.interface';

/**
 * Registro por container: garante que um único mapa Leaflet é criado por nó DOM,
 * mesmo quando o StrictMode (dev) monta/desmonta o efeito e dispara chamadas
 * assíncronas concorrentes — evita o erro "Map container is already initialized".
 */
const containerMapRegistry = new WeakMap<HTMLElement, MapProviderInstance>();

export async function createLeafletMap(container: HTMLElement, config: MapConfig): Promise<MapProviderInstance> {
  const existing = containerMapRegistry.get(container);
  if (existing) return existing;

  const L = await import('leaflet');
  await import('leaflet/dist/leaflet.css');

  if (containerMapRegistry.get(container)) return containerMapRegistry.get(container)!;

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
      const href = marker.slug ? `<a href="${marker.slug}" target="_blank" style="display:inline-block;margin-top:6px;font-weight:600;">Ver detalhes &rarr;</a>` : '';
      const desc = marker.description ? `<div style="margin-top:2px;color:#666">${marker.description}</div>` : '';
      const popupHtml = `<b>${marker.title}</b>${desc}${href}`;

      const icon = L.divIcon({
        className: '',
        iconSize: [22, 22],
        iconAnchor: [11, 11],
        html: `<div style="width:20px;height:20px;border-radius:50%;background:${marker.color || 'var(--copper, #c2410c)'};border:2px solid #fff;box-shadow:0 1px 6px rgba(0,0,0,.35);box-sizing:border-box"></div>`,
      });

      const leafletMarker = L.marker([marker.position.lat, marker.position.lng], { icon })
        .addTo(map)
        .bindPopup(popupHtml);
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
      if (containerMapRegistry.get(container) === api) {
        containerMapRegistry.delete(container);
      }
    },

    on(event, handler) {
      map.on(event, handler);
    },

    off(event, handler) {
      map.off(event, handler);
    },
  };

  containerMapRegistry.set(container, api);

  return api;
}
