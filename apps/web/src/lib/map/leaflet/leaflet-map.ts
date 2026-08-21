import type { MapConfig } from '../types';
import type { MapProviderInstance } from '../map-provider.interface';
import { createMarkerIcon, createClusterIcon, resolveMarkerCategory, type MarkerCategory } from '../markers';
import { createPopupHtml, type PopupData } from '../markers';
import { DEFAULT_TILE_STYLE, getTileStyle } from '../tiles';

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
  await import('leaflet.markercluster');
  await import('leaflet.markercluster/dist/MarkerCluster.css');
  await import('leaflet.markercluster/dist/MarkerCluster.Default.css');

  if (containerMapRegistry.get(container)) return containerMapRegistry.get(container)!;

  const map = L.map(container, {
    center: [config.center.lat, config.center.lng],
    zoom: config.zoom,
    minZoom: config.minZoom ?? 3,
    maxZoom: config.maxZoom ?? 18,
    zoomControl: false,
  });

  L.control.zoom({ position: 'topright' }).addTo(map);

  const tileStyle = config.tileUrl ? getTileStyle(config.tileUrl) : DEFAULT_TILE_STYLE;

  L.tileLayer(tileStyle.url, {
    attribution: config.attribution || tileStyle.attribution,
    maxZoom: tileStyle.maxZoom,
    subdomains: 'abcd',
  }).addTo(map);

  // Marker cluster group with AxéMap styling
  const clusterGroup = L.markerClusterGroup({
    chunkedLoading: true,
    maxClusterRadius: 50,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    iconCreateFunction(cluster) {
      const count = cluster.getChildCount();
      return L.divIcon({
        html: createClusterIcon(count),
        className: '',
        iconSize: L.point(60, 60),
        iconAnchor: L.point(30, 30),
      });
    },
  });
  map.addLayer(clusterGroup);

  const markers = new Map<string, any>();

  const api: MapProviderInstance = {
    addMarker(marker) {
      const category: MarkerCategory = resolveMarkerCategory({
        verificationLevel: (marker as any).verificationLevel,
        tipo: (marker as any).tipo,
        isFederation: (marker as any).isFederation,
        hasEvents: (marker as any).hasEvents,
        hasMarketplace: (marker as any).hasMarketplace,
      });

      const trust = marker.trustScore ?? 0;
      const isVerified = (marker as any).verificationLevel === 'VERIFIED' || (marker as any).verificationLevel === 'TRUSTED';
      const shouldPulse = isVerified || trust >= 6;

      const iconHtml = createMarkerIcon(category, {
        size: 38,
        pulse: shouldPulse,
      });

      const icon = L.divIcon({
        className: '',
        iconSize: [54, 54],
        iconAnchor: [27, 42],
        html: iconHtml,
      });

      const popupData: PopupData = {
        id: marker.id,
        title: marker.title,
        slug: marker.slug,
        description: marker.description,
        photoUrl: (marker as any).photoUrl,
        trustScore: marker.trustScore,
        trustLevel: (marker as any).trustLevel,
        verificationLevel: (marker as any).verificationLevel,
        category,
        endereco: (marker as any).endereco,
        tradicaoPrincipal: (marker as any).tradicaoPrincipal,
      };

      const leafletMarker = L.marker([marker.position.lat, marker.position.lng], { icon })
        .bindPopup(createPopupHtml(popupData), {
          maxWidth: 280,
          minWidth: 220,
          className: 'axemap-popup-container',
        })
        .on('click', () => {
          map.fire('markerclick', { type: 'click', markerId: marker.id });
        });

      clusterGroup.addLayer(leafletMarker);
      markers.set(marker.id, leafletMarker);
    },

    addMarkers(markerList) {
      markerList.forEach((m) => api.addMarker(m));
    },

    removeMarker(id) {
      const m = markers.get(id);
      if (m) {
        clusterGroup.removeLayer(m);
        markers.delete(id);
      }
    },

    clearMarkers() {
      clusterGroup.clearLayers();
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
