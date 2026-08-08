'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

/* ════════════════════════════════════════════════════════════════
   Chart — gráficos leves em SVG, sem dependências externas.
   Animação de traçado via framer-motion, acessíveis por aria-label.
   ════════════════════════════════════════════════════════════════ */

const VIEWBOX = { w: 600, h: 220, padX: 8, padY: 12 };

export interface ChartDatum {
  label: string;
  value: number;
}

function normalize(values: number[]) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  return { max, min, range };
}

function buildPoints(data: ChartDatum[], h: number) {
  const values = data.map((d) => d.value);
  const { max } = normalize(values);
  const w = VIEWBOX.w - VIEWBOX.padX * 2;
  const hh = h - VIEWBOX.padY * 2;
  const step = w / Math.max(data.length - 1, 1);
  return data.map((d, i) => ({
    x: VIEWBOX.padX + i * step,
    y: VIEWBOX.padY + hh - (d.value / (max || 1)) * hh,
    ...d,
  }));
}

function smoothPath(points: { x: number; y: number }[]) {
  if (points.length < 2) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

function formatValue(value: number) {
  return new Intl.NumberFormat('pt-BR').format(value);
}

/* ── Line / Area ─────────────────────────────────────────────── */

export interface LineChartProps extends Omit<React.SVGAttributes<SVGSVGElement>, 'fill'> {
  data: ChartDatum[];
  color?: string;
  fill?: boolean;
  showGrid?: boolean;
  showDots?: boolean;
  ariaLabel?: string;
}

export function LineChart({
  data,
  color = 'var(--copper)',
  fill = false,
  showGrid = true,
  showDots = true,
  ariaLabel = 'Gráfico de linhas',
  className,
  ...props
}: LineChartProps) {
  const h = VIEWBOX.h;
  const points = React.useMemo(() => buildPoints(data, h), [data]);
  const line = React.useMemo(() => smoothPath(points), [points]);
  const area = React.useMemo(
    () => `${line} L ${points[points.length - 1]?.x ?? 0} ${h - VIEWBOX.padY} L ${points[0]?.x ?? 0} ${h - VIEWBOX.padY} Z`,
    [line, points, h],
  );
  const baselineY = h - VIEWBOX.padY;

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX.w} ${h}`}
      role="img"
      aria-label={ariaLabel}
      className={cn('h-full w-full', className)}
      preserveAspectRatio="none"
      {...props}
    >
      {showGrid &&
        Array.from({ length: 4 }, (_, i) => {
          const y = VIEWBOX.padY + (i / 3) * (h - VIEWBOX.padY * 2);
          return <line key={i} x1={VIEWBOX.padX} x2={VIEWBOX.w - VIEWBOX.padX} y1={y} y2={y} stroke="var(--border)" strokeDasharray="4 6" strokeWidth={1} />;
        })}
      {fill && (
        <motion.path
          d={area}
          fill={color}
          opacity={0.1}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      )}
      <motion.path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
      {showDots &&
        points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="var(--card)" stroke={color} strokeWidth={2} />
        ))}
      <line x1={VIEWBOX.padX} x2={VIEWBOX.w - VIEWBOX.padX} y1={baselineY} y2={baselineY} stroke="var(--border)" strokeWidth={1} />
    </svg>
  );
}

export function AreaChart(props: LineChartProps) {
  return <LineChart {...props} fill />;
}

/* ── Bar ─────────────────────────────────────────────────────── */

export interface BarChartProps extends React.SVGAttributes<SVGSVGElement> {
  data: ChartDatum[];
  color?: string;
  ariaLabel?: string;
  /** Se definido, projeta a barra com gradiente da marca. */
  gradient?: boolean;
}

export function BarChart({
  data,
  color = 'var(--copper)',
  gradient = true,
  ariaLabel = 'Gráfico de barras',
  className,
  ...props
}: BarChartProps) {
  const h = VIEWBOX.h;
  const w = VIEWBOX.w - VIEWBOX.padX * 2;
  const hh = h - VIEWBOX.padY * 2;
  const slot = w / data.length;
  const barWidth = Math.min(44, slot * 0.56);
  const { max } = normalize(data.map((d) => d.value));

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX.w} ${h}`}
      role="img"
      aria-label={ariaLabel}
      className={cn('h-full w-full', className)}
      preserveAspectRatio="none"
      {...props}
    >
      <defs>
        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={1} />
          <stop offset="100%" stopColor={color} stopOpacity={0.35} />
        </linearGradient>
      </defs>
      {Array.from({ length: 4 }, (_, i) => {
        const y = VIEWBOX.padY + (i / 3) * hh;
        return <line key={i} x1={VIEWBOX.padX} x2={VIEWBOX.w - VIEWBOX.padX} y1={y} y2={y} stroke="var(--border)" strokeDasharray="4 6" strokeWidth={1} />;
      })}
      {data.map((d, i) => {
        const bh = (d.value / (max || 1)) * hh;
        const x = VIEWBOX.padX + i * slot + (slot - barWidth) / 2;
        const y = h - VIEWBOX.padY - bh;
        return (
          <motion.rect
            key={i}
            x={x}
            width={barWidth}
            rx={4}
            fill={gradient ? 'url(#barGradient)' : color}
            initial={{ height: 0, y: h - VIEWBOX.padY }}
            animate={{ height: bh, y }}
            transition={{ duration: 0.7, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
          />
        );
      })}
    </svg>
  );
}

/* ── Donut ───────────────────────────────────────────────────── */

export interface DonutChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: ChartDatum[];
  /** Cor do anel restante. */
  trackColor?: string;
  size?: number;
  thickness?: number;
  ariaLabel?: string;
}

export function DonutChart({
  data,
  trackColor = 'var(--muted)',
  size = 180,
  thickness = 18,
  ariaLabel = 'Gráfico de rosca',
  className,
  ...props
}: DonutChartProps) {
  const total = data.reduce((acc, d) => acc + d.value, 0) || 1;
  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  const palette = ['var(--copper)', 'var(--bronze)', 'var(--clay)', 'var(--fern)', 'var(--sand)'];

  return (
    <div
      className={cn('flex items-center justify-center', className)}
      role="img"
      aria-label={`${ariaLabel}. Total: ${formatValue(total)}`}
      {...props}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={thickness} />
        {data.map((d, i) => {
          const fraction = d.value / total;
          const dash = fraction * circumference;
          const el = (
            <motion.circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={palette[i % palette.length]}
              strokeWidth={thickness}
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            />
          );
          offset += dash;
          return el;
        })}
      </svg>
    </div>
  );
}

/* ── Sparkline ───────────────────────────────────────────────── */

export function Sparkline({
  data,
  color = 'var(--copper)',
  width = 96,
  height = 32,
  fill = false,
  ariaLabel = 'Sparkline',
  className,
}: {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  ariaLabel?: string;
  className?: string;
}) {
  const points = React.useMemo(() => {
    const values = data;
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const range = max - min || 1;
    const step = width / Math.max(values.length - 1, 1);
    return values.map((v, i) => ({
      x: (i * step).toFixed(1),
      y: (height - ((v - min) / range) * height).toFixed(1),
    }));
  }, [data, width, height]);
  const line = points.map((p) => `${p.x},${p.y}`).join(' ');
  const area = `0,${height} ${line} ${width},${height}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={ariaLabel}
      className={className}
      preserveAspectRatio="none"
    >
      {fill && <polygon points={area} fill={color} opacity={0.12} />}
      <motion.polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </svg>
  );
}
