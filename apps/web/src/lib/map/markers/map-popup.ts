/**
 * AxéMap — Custom Map Popups
 *
 * Rich HTML popups with Trust Score, photo, category badge, and CTA.
 * Uses CSS custom properties for light/dark theming.
 */

import type { MarkerCategory } from './map-markers';

const CATEGORY_LABELS: Record<MarkerCategory, string> = {
  default: 'Casa de Axé',
  verified: 'Verificada',
  traditional: 'Tradicional',
  federation: 'Federação',
  event: 'Evento',
  business: 'Negócio',
};

const TRUST_LABELS: Record<string, { label: string; color: string }> = {
  LENDAIRO: { label: 'Lendário', color: 'hsl(150,42%,36%)' },
  AUTORIDADE: { label: 'Autoridade', color: 'hsl(150,46%,44%)' },
  ESTABELECIDO: { label: 'Estabelecido', color: 'hsl(36,85%,44%)' },
  EMERGENTE: { label: 'Emergente', color: 'hsl(38,90%,40%)' },
  INICIANTE: { label: 'Iniciante', color: 'hsl(18,66%,47%)' },
};

function trustInfo(score: number): { label: string; color: string } {
  if (score >= 80) return TRUST_LABELS.LENDAIRO;
  if (score >= 60) return TRUST_LABELS.AUTORIDADE;
  if (score >= 40) return TRUST_LABELS.ESTABELECIDO;
  if (score >= 20) return TRUST_LABELS.EMERGENTE;
  return TRUST_LABELS.INICIANTE;
}

function scoreToPercent(score: number): number {
  return Math.round(Math.min(100, Math.max(0, score)));
}

export interface PopupData {
  id: string;
  title: string;
  slug?: string | null;
  description?: string | null;
  photoUrl?: string | null;
  trustScore?: number | null;
  trustLevel?: string | null;
  verificationLevel?: string | null;
  category: MarkerCategory;
  endereco?: {
    cidade?: string | null;
    estado?: string | null;
  } | null;
  tradicaoPrincipal?: string | null;
}

export function createPopupHtml(data: PopupData): string {
  const trust = data.trustScore ?? 0;
  const trustPct = scoreToPercent(trust);
  const trustInfo_ = trustInfo(trust);
  const categoryLabel = CATEGORY_LABELS[data.category];
  const location = data.endereco
    ? [data.endereco.cidade, data.endereco.estado].filter(Boolean).join(', ')
    : '';
  const verified = data.verificationLevel === 'VERIFIED' || data.verificationLevel === 'TRUSTED';
  const badgeColor = verified ? 'hsl(150,42%,36%)' : 'hsl(18,66%,47%)';

  const photoHtml = data.photoUrl
    ? `<img src="${data.photoUrl}" alt="${data.title}" style="width:100%;height:100px;object-fit:cover;border-radius:6px 6px 0 0"/>`
    : `<div style="width:100%;height:60px;background:linear-gradient(135deg,hsl(18,66%,47%),hsl(37,79%,53%));border-radius:6px 6px 0 0;display:flex;align-items:center;justify-content:center">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style="opacity:.6"><path d="M12 3l9 8v9a1 1 0 01-1 1h-5v-6H8v6H4a1 1 0 01-1-1v-9l9-8z" fill="white"/></svg>
      </div>`;

  return `
<style>
  .axemap-popup{font-family:'Inter',system-ui,sans-serif;min-width:220px;max-width:260px;border-radius:8px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.15)}
  .axemap-popup .leaflet-popup-content{margin:0;padding:0}
  .axemap-popup .leaflet-popup-tip{box-shadow:0 2px 8px rgba(0,0,0,.12)}
  .axemap-popup-cta{display:block;width:100%;padding:8px 12px;text-align:center;font-weight:600;font-size:13px;text-decoration:none;border:0;border-radius:0 0 6px 6px;transition:background .15s ease}
  .axemap-popup-cta:hover{filter:brightness(.92)}
</style>
<div class="axemap-popup">
  ${photoHtml}
  <div style="padding:10px 12px 8px">
    <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
      <span style="font-size:11px;padding:2px 7px;border-radius:4px;background:${badgeColor};color:white;font-weight:600;letter-spacing:.02em;text-transform:uppercase">${categoryLabel}</span>
      ${verified ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="hsl(150,42%,36%)"><path d="M12 2l7 3v5c0 4.25-2.98 7.73-7 9-4.02-1.27-7-4.75-7-9V5l7-3z"/><path d="M10 12l2 2 4-4" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/></svg>' : ''}
    </div>
    <div style="font-weight:700;font-size:14px;line-height:1.25;color:hsl(24,40%,8%);margin-bottom:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${data.title}</div>
    ${location ? `<div style="font-size:11px;color:hsl(28,14%,50%);margin-bottom:6px;overflow-wrap:break-word">${location}</div>` : ''}
    ${data.tradicaoPrincipal ? `<div style="font-size:11px;color:hsl(28,14%,50%);margin-bottom:6px;font-style:italic;overflow-wrap:break-word">${data.tradicaoPrincipal}</div>` : ''}

    <!-- Trust Score bar -->
    <div style="margin:6px 0 4px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:3px">
        <span style="font-size:10px;color:hsl(28,14%,55%);font-weight:600;text-transform:uppercase;letter-spacing:.05em">Trust Score</span>
        <span style="font-size:12px;font-weight:800;color:${trustInfo_.color}">${trust.toFixed(1)}</span>
      </div>
      <div style="height:5px;background:hsl(30,15%,90%);border-radius:3px;overflow:hidden">
        <div style="height:100%;width:${trustPct}%;background:${trustInfo_.color};border-radius:3px;transition:width .4s ease"></div>
      </div>
      <div style="font-size:9px;color:hsl(28,14%,55%);margin-top:2px;text-align:right">${trustInfo_.label}</div>
    </div>

    ${data.description ? `<div style="font-size:11px;color:hsl(28,14%,50%);line-height:1.4;margin:6px 0 4px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${data.description}</div>` : ''}
  </div>
  ${data.slug ? `<a href="${data.slug}" target="_blank" class="axemap-popup-cta" style="background:hsl(18,66%,47%);color:white">Ver Perfil Completo →</a>` : ''}
</div>`;
}
