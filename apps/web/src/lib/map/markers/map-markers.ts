/**
 * AxéMap — Proprietary SVG Markers
 *
 * Each category has a unique pin shape + icon for instant recognition.
 * All markers use CSS custom properties (--map-marker-*) for theming.
 */

export type MarkerCategory =
  | 'default'
  | 'verified'
  | 'traditional'
  | 'federation'
  | 'event'
  | 'business';

/** HSL values extracted from CSS vars — used in inline SVGs (no CSS var access in L.divIcon HTML). */
const MARKER_COLORS: Record<MarkerCategory, string> = {
  default: 'hsl(18,66%,47%)',
  verified: 'hsl(150,42%,36%)',
  traditional: 'hsl(37,79%,53%)',
  federation: 'hsl(268,45%,52%)',
  event: 'hsl(12,90%,62%)',
  business: 'hsl(206,72%,42%)',
};

const MARKER_COLORS_LIGHT: Record<MarkerCategory, string> = {
  default: 'hsl(18,70%,92%)',
  verified: 'hsl(150,40%,90%)',
  traditional: 'hsl(37,80%,92%)',
  federation: 'hsl(268,50%,92%)',
  event: 'hsl(12,85%,92%)',
  business: 'hsl(206,65%,92%)',
};

const ICON_PATHS: Record<MarkerCategory, string> = {
  // Casa de Axé — simple house / terreiro
  default: '<path d="M12 3l9 8v9a1 1 0 01-1 1h-5v-6H8v6H4a1 1 0 01-1-1v-9l9-8z" fill="currentColor"/>',
  // Shield check — verified
  verified:
    '<path d="M12 2l7 3v5c0 4.25-2.98 7.73-7 9-4.02-1.27-7-4.75-7-9V5l7-3z" fill="currentColor"/><path d="M10 12l2 2 4-4" stroke="white" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  // Afro comb (axé symbol) — traditional
  traditional:
    '<circle cx="12" cy="12" r="4" fill="currentColor"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  // Star — federation
  federation:
    '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>',
  // Calendar pulse — event
  event:
    '<rect x="3" y="5" width="18" height="16" rx="2" fill="currentColor"/><path d="M3 10h18" stroke="white" stroke-width="1.5"/><circle cx="12" cy="15" r="2" fill="white"/>',
  // Storefront — business
  business:
    '<path d="M3 21V8l9-5 9 5v13" fill="currentColor"/><rect x="7" y="13" width="4" height="5" rx="0.5" fill="white" opacity="0.85"/><rect x="13" y="13" width="4" height="5" rx="0.5" fill="white" opacity="0.85"/>',
};

export function resolveMarkerCategory(terreiro: {
  verificationLevel?: string | null;
  tipo?: string | null;
  isFederation?: boolean;
  hasEvents?: boolean;
  hasMarketplace?: boolean;
}): MarkerCategory {
  if (terreiro.isFederation) return 'federation';
  if (terreiro.hasEvents) return 'event';
  if (terreiro.hasMarketplace) return 'business';
  if (terreiro.verificationLevel === 'VERIFIED' || terreiro.verificationLevel === 'TRUSTED') return 'verified';
  if (terreiro.tipo === 'TRADICIONAL') return 'traditional';
  return 'default';
}

/**
 * Returns the HSL color string for a marker category.
 */
export function getMarkerColor(category: MarkerCategory): string {
  return MARKER_COLORS[category];
}

/**
 * Generates an HTML string for a Leaflet DivIcon with the proprietary SVG pin.
 */
export function createMarkerIcon(
  category: MarkerCategory,
  opts?: { size?: number; selected?: boolean; pulse?: boolean },
): string {
  const size = opts?.size ?? 38;
  const selected = opts?.selected ?? false;
  const pulse = opts?.pulse ?? false;
  const color = MARKER_COLORS[category];
  const light = MARKER_COLORS_LIGHT[category];
  const icon = ICON_PATHS[category];
  const stroke = selected ? 3 : 2;
  const ring = selected ? 5 : 0;

  const pulseHtml = pulse
    ? `<div style="position:absolute;inset:-8px;border-radius:50%;border:2px dashed ${color};opacity:0.45;animation:axemap-pulse 2.2s ease-in-out infinite"></div>`
    : '';

  return `
<style>
@keyframes axemap-pulse{0%,100%{transform:scale(1);opacity:.45}50%{transform:scale(1.4);opacity:.12}}
@keyframes axemap-marker-enter{0%{transform:scale(0) translateY(8px);opacity:0}100%{transform:scale(1) translateY(0);opacity:1}}
</style>
<div style="position:relative;width:${size + 16}px;height:${size + 16}px;display:flex;align-items:center;justify-content:center;overflow:hidden;animation:axemap-marker-enter .3s cubic-bezier(.34,1.56,.64,1) both">
  ${pulseHtml}
  <svg width="${size}" height="${size + 8}" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 2px 4px rgba(0,0,0,.28));position:relative;z-index:1">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 18 12 18s12-9 12-18C24 5.37 18.63 0 12 0z"
      fill="${color}" stroke="white" stroke-width="${stroke}"/>
    ${ring ? `<circle cx="12" cy="12" r="${ring}" fill="none" stroke="${color}" stroke-width="1" opacity="0.4"/>` : ''}
    <g transform="translate(6,4) scale(0.5)" style="color:${light}">
      ${icon}
    </g>
  </svg>
</div>`;
}

/**
 * Returns cluster icon HTML for markercluster.
 */
export function createClusterIcon(clusterCount: number): string {
  const size = clusterCount < 10 ? 40 : clusterCount < 100 ? 50 : 60;
  const fontSize = clusterCount < 10 ? 14 : clusterCount < 100 ? 13 : 12;

  return `
<style>
@keyframes axemap-cluster-in{0%{transform:scale(.6);opacity:0}100%{transform:scale(1);opacity:1}}
</style>
<div style="
  width:${size}px;height:${size}px;
  border-radius:50%;
  background:radial-gradient(circle at 35% 35%, hsl(18,72%,55%), hsl(18,66%,42%));
  border:2.5px solid white;
  box-shadow:0 2px 8px rgba(0,0,0,.3), 0 0 0 1.5px hsl(18,66%,47%,0.2);
  display:flex;align-items:center;justify-content:center;
  font-family:'Inter',system-ui,sans-serif;
  font-weight:700;font-size:${fontSize}px;
  color:white;letter-spacing:-.02em;
  animation:axemap-cluster-in .25s cubic-bezier(.34,1.56,.64,1) both;
  cursor:pointer;
  transition:transform .15s ease;
" onmouseover="this.style.transform='scale(1.12)'" onmouseout="this.style.transform='scale(1)'">
  ${clusterCount}
</div>`;
}
