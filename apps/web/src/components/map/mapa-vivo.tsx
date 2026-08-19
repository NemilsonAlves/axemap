'use client';

/**
 * MapaVivo — Visualização estilo constelação do ecossistema AxéMap.
 *
 * Inspirado na imagem de referência: nós pulsantes, linhas de conexão animadas,
 * gradiente radial quente (cobre/âmbar), labels de cidade, painel de Trust Score.
 *
 * Regra: exibe somente dados reais da API. Nenhum dado fictício.
 * Regra: nunca exibe coordenadas de casas com visibilidade PRIVADA.
 */

import * as React from 'react';
import { cn } from '@/lib/cn';
import { ShieldCheck } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MapaVivoNode {
  id: string;
  nome: string;
  cidade?: string | null;
  estado?: string | null;
  latitude: number;
  longitude: number;
  trustScore?: number | null;
  isVerified?: boolean | null;
  tipo: 'terreiro' | 'campanha' | 'federacao';
  slug?: string;
  fotoUrl?: string | null;
}

interface Props {
  nodes: MapaVivoNode[];
  selecionadoId?: string | null;
  onSelect?: (id: string) => void;
  className?: string;
  /** Centro geográfico para projeção (padrão: centro do Brasil) */
  centerLat?: number;
  centerLng?: number;
}

// ─── Projection ───────────────────────────────────────────────────────────────

/** Mercator simplificado: mapeia coordenadas geográficas para espaço SVG [0..1] */
function project(lat: number, lng: number, bounds: GeoBounds) {
  const x = (lng - bounds.minLng) / (bounds.maxLng - bounds.minLng);
  const y = 1 - (lat - bounds.minLat) / (bounds.maxLat - bounds.minLat);
  return { x, y };
}

interface GeoBounds {
  minLat: number; maxLat: number;
  minLng: number; maxLng: number;
}

function calcBounds(nodes: MapaVivoNode[], padding = 2): GeoBounds {
  if (nodes.length === 0) return { minLat: -33, maxLat: 5, minLng: -73, maxLng: -34 };
  const lats = nodes.map((n) => n.latitude);
  const lngs = nodes.map((n) => n.longitude);
  return {
    minLat: Math.min(...lats) - padding,
    maxLat: Math.max(...lats) + padding,
    minLng: Math.min(...lngs) - padding,
    maxLng: Math.max(...lngs) + padding,
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SVG_W = 800;
const SVG_H = 520;
const PADDING = 60; // px de margem interna

function toSvg(x: number, y: number) {
  return {
    cx: PADDING + x * (SVG_W - PADDING * 2),
    cy: PADDING + y * (SVG_H - PADDING * 2),
  };
}

function trustColor(score: number | null | undefined) {
  if (score == null) return 'hsl(var(--copper))';
  if (score >= 7) return 'hsl(var(--fern))';
  if (score >= 4) return 'hsl(var(--acafrao))';
  return 'hsl(var(--terracota))';
}

function trustRadius(score: number | null | undefined, isVerified: boolean | null | undefined) {
  const base = 7;
  const bonus = score ? Math.min(score * 0.6, 5) : 0;
  return base + bonus + (isVerified ? 2 : 0);
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function MapaVivo({
  nodes,
  selecionadoId,
  onSelect,
  className,
}: Props) {
  const svgRef = React.useRef<SVGSVGElement>(null);
  const [hovered, setHovered] = React.useState<string | null>(null);
  const [tick, setTick] = React.useState(0);
  const [mounted, setMounted] = React.useState(false);

  // Pulse animation tick
  React.useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setTick((t) => t + 1), 50);
    return () => clearInterval(id);
  }, []);

  const bounds = React.useMemo(() => calcBounds(nodes), [nodes]);

  const projected = React.useMemo(
    () =>
      nodes.map((n) => {
        const { x, y } = project(n.latitude, n.longitude, bounds);
        const { cx, cy } = toSvg(x, y);
        return { ...n, cx, cy };
      }),
    [nodes, bounds],
  );

  // Build connection lines between nearby nodes (closest 2-3 per node)
  const connections = React.useMemo(() => {
    const lines: { key: string; x1: number; y1: number; x2: number; y2: number; strength: number }[] = [];
    const seen = new Set<string>();
    projected.forEach((a, i) => {
      const dists = projected
        .map((b, j) => ({ j, d: Math.hypot(b.cx - a.cx, b.cy - a.cy) }))
        .filter((e) => e.j !== i)
        .sort((x, y) => x.d - y.d)
        .slice(0, 2);

      dists.forEach(({ j, d }) => {
        const b = projected[j];
        const key = [Math.min(i, j), Math.max(i, j)].join('-');
        if (!seen.has(key) && d < 220) {
          seen.add(key);
          lines.push({ key, x1: a.cx, y1: a.cy, x2: b.cx, y2: b.cy, strength: 1 - d / 220 });
        }
      });
    });
    return lines;
  }, [projected]);

  // Selected node
  const selectedNode = projected.find((n) => n.id === selecionadoId);

  if (!mounted || nodes.length === 0) {
    return (
      <div className={cn('flex items-center justify-center rounded-3xl bg-[hsl(var(--obsidiana))]', className)}
        style={{ minHeight: 340 }}>
        <p className="text-xs text-white/30">
          {nodes.length === 0 ? 'Carregando dados do ecossistema...' : ''}
        </p>
      </div>
    );
  }

  // Pulse phase: slow breathing (period ~3s = 60 ticks)
  const phase = (tick % 60) / 60; // 0..1
  const pulseScale = 1 + 0.15 * Math.sin(phase * Math.PI * 2);
  const pulseOpacity = 0.3 + 0.2 * Math.sin(phase * Math.PI * 2);

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl',
        className,
      )}
      style={{
        background: 'hsl(var(--obsidiana-deep))',
        border: '1px solid hsl(var(--copper)/0.15)',
      }}
    >
      {/* ── Radial glow background ── */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            'radial-gradient(ellipse 500px 350px at 55% 45%, hsl(var(--copper)/0.22), transparent 60%)',
            'radial-gradient(ellipse 300px 300px at 15% 80%, hsl(var(--terracota)/0.12), transparent 55%)',
            'radial-gradient(ellipse 250px 200px at 90% 10%, hsl(var(--acafrao)/0.10), transparent 55%)',
          ].join(', '),
        }}
        aria-hidden="true"
      />

      {/* ── Dot grid texture ── */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04]"
        aria-hidden="true"
      >
        <defs>
          <pattern id="dotgrid" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="hsl(var(--areia))" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotgrid)" />
      </svg>

      {/* ── SVG Constellation ── */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="relative h-full w-full"
        style={{ minHeight: 320 }}
        role="img"
        aria-label="Mapa vivo das tradições de axé — constelação de comunidades"
      >
        <defs>
          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Radial glow for selected node */}
          <filter id="glow-strong">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Center burst gradient */}
          <radialGradient id="burst" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--copper))" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(var(--copper))" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ── Center burst (axé pulse) ── */}
        <ellipse
          cx={SVG_W / 2}
          cy={SVG_H / 2}
          rx={120 * pulseScale}
          ry={90 * pulseScale}
          fill="url(#burst)"
          opacity={pulseOpacity}
        />
        <circle
          cx={SVG_W / 2}
          cy={SVG_H / 2}
          r={8}
          fill="hsl(var(--copper))"
          filter="url(#glow)"
          opacity={0.9}
        />
        {/* Bullseye rings */}
        <circle cx={SVG_W / 2} cy={SVG_H / 2} r={18} fill="none" stroke="hsl(var(--copper)/0.5)" strokeWidth="1" />
        <circle cx={SVG_W / 2} cy={SVG_H / 2} r={4} fill="hsl(var(--acafrao))" />

        {/* ── Connection lines ── */}
        {connections.map((line) => (
          <line
            key={line.key}
            x1={line.x1} y1={line.y1}
            x2={line.x2} y2={line.y2}
            stroke="hsl(var(--copper))"
            strokeOpacity={0.08 + line.strength * 0.10}
            strokeWidth={0.6}
            strokeDasharray="3 6"
          />
        ))}

        {/* ── Nodes ── */}
        {projected.map((node) => {
          const isSelected = node.id === selecionadoId;
          const isHov = node.id === hovered;
          const r = trustRadius(node.trustScore, node.isVerified);
          const color = trustColor(node.trustScore);
          const active = isSelected || isHov;

          return (
            <g
              key={node.id}
              style={{ cursor: 'pointer' }}
              onClick={() => onSelect?.(node.id)}
              onMouseEnter={() => setHovered(node.id)}
              onMouseLeave={() => setHovered(null)}
              aria-label={`${node.nome}${node.cidade ? ` — ${node.cidade}` : ''}`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSelect?.(node.id)}
            >
              {/* Outer pulse ring (verified + selected) */}
              {(node.isVerified || isSelected) && (
                <circle
                  cx={node.cx}
                  cy={node.cy}
                  r={r * (1.8 + (isSelected ? 0.4 * pulseScale : 0.2))}
                  fill="none"
                  stroke={isSelected ? 'hsl(var(--fern))' : color}
                  strokeWidth={isSelected ? 1.2 : 0.8}
                  strokeOpacity={isSelected ? 0.7 : 0.35}
                  strokeDasharray={isSelected ? undefined : '2 4'}
                />
              )}

              {/* Glow halo */}
              {active && (
                <circle
                  cx={node.cx}
                  cy={node.cy}
                  r={r * 2.5}
                  fill={color}
                  opacity={0.12}
                />
              )}

              {/* Dashed ring for all nodes */}
              <circle
                cx={node.cx}
                cy={node.cy}
                r={r * 1.5}
                fill="none"
                stroke={color}
                strokeWidth={0.5}
                strokeOpacity={active ? 0.5 : 0.2}
                strokeDasharray="2 4"
              />

              {/* Main node dot */}
              <circle
                cx={node.cx}
                cy={node.cy}
                r={r}
                fill={color}
                opacity={active ? 1 : 0.82}
                filter={active ? 'url(#glow-strong)' : 'url(#glow)'}
              />

              {/* White center dot */}
              <circle
                cx={node.cx}
                cy={node.cy}
                r={Math.max(2, r * 0.35)}
                fill="white"
                opacity={0.9}
              />

              {/* City label */}
              {(node.cidade || node.nome) && (
                <text
                  x={node.cx}
                  y={node.cy - r - 7}
                  textAnchor="middle"
                  fontSize={active ? 11 : 9.5}
                  fontWeight={active ? '700' : '500'}
                  fill="white"
                  opacity={active ? 0.95 : 0.55}
                  style={{ pointerEvents: 'none', fontFamily: 'var(--font-plus-jakarta, system-ui)' }}
                >
                  {node.cidade ?? node.nome.split(' ').slice(0, 2).join(' ')}
                </text>
              )}
            </g>
          );
        })}

        {/* ── Selected node radial lines to edges ── */}
        {selectedNode &&
          projected
            .filter((n) => n.id !== selectedNode.id)
            .slice(0, 4)
            .map((n) => (
              <line
                key={`sel-${n.id}`}
                x1={selectedNode.cx} y1={selectedNode.cy}
                x2={n.cx} y2={n.cy}
                stroke="hsl(var(--fern))"
                strokeOpacity={0.15}
                strokeWidth={0.8}
                strokeDasharray="4 8"
              />
            ))}
      </svg>

      {/* ── Trust Score overlay (bottom-right) ── */}
      {selectedNode && selectedNode.trustScore != null && (
        <div
          className="pointer-events-none absolute bottom-4 right-4 flex flex-col gap-1.5 rounded-2xl p-3.5"
          style={{
            background: 'hsl(var(--obsidiana)/0.90)',
            border: '1px solid hsl(var(--copper)/0.25)',
            backdropFilter: 'blur(8px)',
            minWidth: 140,
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/50">
              Trust Score
            </span>
            <span
              className="font-display text-lg font-black"
              style={{ color: trustColor(selectedNode.trustScore) }}
            >
              {selectedNode.trustScore.toFixed(1)}
            </span>
          </div>
          {/* Animated bar */}
          <div className="h-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(100, (selectedNode.trustScore / 10) * 100)}%`,
                background: `linear-gradient(90deg, ${trustColor(selectedNode.trustScore)}, hsl(var(--acafrao)))`,
              }}
            />
          </div>
          {selectedNode.isVerified && (
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="size-3 text-[hsl(var(--fern))]" />
              <span className="text-[10px] font-semibold text-[hsl(var(--fern))]">
                Casa verificada
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Verified badge (top-left) ── */}
      {selectedNode?.isVerified && (
        <div
          className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-2xl px-3 py-2"
          style={{
            background: 'hsl(var(--fern)/0.15)',
            border: '1px solid hsl(var(--fern)/0.3)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <ShieldCheck className="size-3.5 text-[hsl(var(--fern))]" aria-hidden="true" />
          <div>
            <p className="text-[10px] font-black text-[hsl(var(--fern))]">Casa verificada</p>
            <p className="text-[9px] text-white/40">Documentação confirmada</p>
          </div>
        </div>
      )}

      {/* ── Events badge (top-right) ── */}
      {selectedNode && (
        <div
          className="pointer-events-none absolute right-4 top-4 rounded-2xl px-3 py-2 text-right"
          style={{
            background: 'hsl(var(--obsidiana)/0.80)',
            border: '1px solid hsl(var(--copper)/0.15)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Eventos</p>
          <p className="text-xs font-black text-white/80">hoje e nesta semana</p>
        </div>
      )}

      {/* ── Node count ── */}
      <div
        className="pointer-events-none absolute bottom-4 left-4 rounded-full px-3 py-1.5"
        style={{
          background: 'hsl(var(--obsidiana)/0.70)',
          backdropFilter: 'blur(8px)',
          border: '1px solid hsl(var(--copper)/0.12)',
        }}
      >
        <p className="text-[10px] font-semibold text-white/50">
          {nodes.length} comunidade{nodes.length !== 1 ? 's' : ''} no ecossistema
        </p>
      </div>
    </div>
  );
}
