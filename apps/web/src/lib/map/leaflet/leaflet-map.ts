import type { MapConfig } from '../types';
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
      const href = marker.slug ? `<a href="${marker.slug}" target="_blank" style="display:inline-block;margin-top:6px;font-weight:600;color:#c2410c;">Ver perfil completo &rarr;</a>` : '';
      const desc = marker.description ? `<div style="margin-top:2px;color:#777;font-size:12px">${marker.description}</div>` : '';
      const trust = marker.trustScore != null
        ? `<div style="margin-top:6px;display:flex;align-items:center;gap:6px;"><span style="font-size:11px;color:#888">Trust</span><span style="font-weight:800;color:#4a8d36;font-size:13px">${marker.trustScore.toFixed(1)}</span></div>`
        : '';
      const popupHtml = `<div style="min-width:160px"><b style="font-size:13px">${marker.title}</b>${desc}${trust}${href}</div>`;

      // Cor baseada no Trust Score
      const score = marker.trustScore ?? 0;
      const baseColor = marker.color
        ? marker.color
        : score >= 7 ? '#4a8d36'   // verde — alta confiança
        : score >= 4 ? '#d97706'   // âmbar — confiança média
        : '#c2410c';               // cobre — padrão

      // Pulso animado para casas verificadas ou Trust >= 6
      const pulse = score >= 6 || !marker.color;
      const size = Math.min(24, 14 + Math.round(score * 0.8));

      const pulseHtml = pulse
        ? `<div style="position:absolute;inset:-6px;border-radius:50%;border:1.5px dashed ${baseColor};opacity:0.5;animation:axemap-pulse 2s ease-in-out infinite"></div>`
        : '';

      const icon = L.divIcon({
        className: '',
        iconSize: [size + 12, size + 12],
        iconAnchor: [(size + 12) / 2, (size + 12) / 2],
        html: `<style>@keyframes axemap-pulse{0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(1.35);opacity:.15}}</style>
<div style="position:relative;width:${size + 12}px;height:${size + 12}px;display:flex;align-items:center;justify-content:center">
  ${pulseHtml}
  <div style="width:${size}px;height:${size}px;border-radius:50%;background:${baseColor};border:2.5px solid rgba(255,255,255,0.9);box-shadow:0 2px 8px rgba(0,0,0,.35),0 0 0 1px ${baseColor}30;box-sizing:border-box;z-index:1"></div>
</div>`,
      });

      const leafletMarker = L.marker([marker.position.lat, marker.position.lng], { icon })
        .addTo(map)
        .bindPopup(popupHtml)
        .on('click', () => {
          map.fire('markerclick', { type: 'click', markerId: marker.id });
        });
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
