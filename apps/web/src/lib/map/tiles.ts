/**
 * AxéMap — Cartographic Tile Configuration
 *
 * Custom tile styles that match the AxéMap visual identity.
 * Falls back to CartoDB Voyager (default OSM) when custom tiles are unavailable.
 */

export interface TileStyle {
  id: string;
  name: string;
  url: string;
  attribution: string;
  maxZoom: number;
  /** Whether this style is available offline / self-hosted */
  selfHosted: boolean;
}

/**
 * CartoDB Voyager — warm, minimal basemap (default).
 * Used by OpenStreetMap as the default tile layer.
 */
export const TILE_VOYAGER: TileStyle = {
  id: 'voyager',
  name: 'Voyager (Padrão)',
  url: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
  maxZoom: 19,
  selfHosted: false,
};

/**
 * CartoDB Voyager No Labels — cleaner for data overlays.
 */
export const TILE_VOYAGER_NO_LABELS: TileStyle = {
  id: 'voyager-no-labels',
  name: 'Voyager (Sem Rótulos)',
  url: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png',
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
  maxZoom: 19,
  selfHosted: false,
};

/**
 * CartoDB Dark Matter — for dark mode / nighttime aesthetic.
 */
export const TILE_DARK: TileStyle = {
  id: 'dark-matter',
  name: 'Dark Matter',
  url: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/dark_all/{z}/{x}/{y}{r}.png',
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
  maxZoom: 19,
  selfHosted: false,
};

/**
 * CartoDB Positron — light, clean.
 */
export const TILE_LIGHT: TileStyle = {
  id: 'positron',
  name: 'Positron (Claro)',
  url: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/positron/{z}/{x}/{y}{r}.png',
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
  maxZoom: 19,
  selfHosted: false,
};

/**
 * OpenStreetMap Standard — classic OSM.
 */
export const TILE_OSM_STANDARD: TileStyle = {
  id: 'osm-standard',
  name: 'OpenStreetMap',
  url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 19,
  selfHosted: false,
};

/** All available tile styles */
export const TILE_STYLES: TileStyle[] = [
  TILE_VOYAGER,
  TILE_VOYAGER_NO_LABELS,
  TILE_DARK,
  TILE_LIGHT,
  TILE_OSM_STANDARD,
];

/** Default style for the AxéMap */
export const DEFAULT_TILE_STYLE = TILE_VOYAGER;

/** Get style by ID, fallback to default */
export function getTileStyle(id: string): TileStyle {
  return TILE_STYLES.find((s) => s.id === id) ?? DEFAULT_TILE_STYLE;
}
