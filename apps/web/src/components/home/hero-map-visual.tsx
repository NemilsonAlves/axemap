'use client';

import * as React from 'react';

/**
 * HeroMapVisual — mapa SVG vivo do Brasil com efeitos premium:
 * halo giratório, scan-line animado, partículas, marcadores pulsantes,
 * linhas de conexão tracejadas e cards flutuantes glassmorphism.
 */
export function HeroMapVisual() {
  const markers = [
    { x: 185, y: 118, color: 'hsl(var(--acafrao))',        delay: 0.0 },
    { x: 218, y: 135, color: 'hsl(var(--verde-floresta))', delay: 0.3 },
    { x: 360, y: 128, color: 'hsl(var(--acafrao))',        delay: 0.6 },
    { x: 390, y: 160, color: 'hsl(var(--verde-floresta))', delay: 0.9 },
    { x: 355, y: 178, color: 'hsl(var(--verde-floresta))', delay: 1.2 },
    { x: 330, y: 165, color: 'hsl(var(--terracota))',      delay: 0.4 },
    { x: 250, y: 215, color: 'hsl(var(--acafrao))',        delay: 0.8 },
    { x: 230, y: 245, color: 'hsl(var(--azul-atlantico))', delay: 1.5 },
    { x: 310, y: 270, color: 'hsl(var(--acafrao))',        delay: 0.2 },
    { x: 295, y: 255, color: 'hsl(var(--verde-floresta))', delay: 0.7 },
    { x: 325, y: 258, color: 'hsl(var(--terracota))',      delay: 1.1 },
    { x: 335, y: 280, color: 'hsl(var(--roxo-ancestral))', delay: 1.8 },
    { x: 320, y: 285, color: 'hsl(var(--verde-floresta))', delay: 0.5 },
    { x: 308, y: 292, color: 'hsl(var(--acafrao))',        delay: 1.4 },
    { x: 290, y: 280, color: 'hsl(var(--terracota))',      delay: 0.1 },
    { x: 270, y: 325, color: 'hsl(var(--acafrao))',        delay: 1.0 },
    { x: 280, y: 308, color: 'hsl(var(--verde-floresta))', delay: 1.6 },
    { x: 268, y: 345, color: 'hsl(var(--roxo-ancestral))', delay: 2.0 },
  ];

  const connections = [
    [{ x: 355, y: 178 }, { x: 390, y: 160 }],
    [{ x: 355, y: 178 }, { x: 310, y: 270 }],
    [{ x: 390, y: 160 }, { x: 360, y: 128 }],
    [{ x: 310, y: 270 }, { x: 320, y: 285 }],
    [{ x: 320, y: 285 }, { x: 280, y: 308 }],
    [{ x: 280, y: 308 }, { x: 270, y: 325 }],
    [{ x: 250, y: 215 }, { x: 310, y: 270 }],
    [{ x: 218, y: 135 }, { x: 185, y: 118 }],
    [{ x: 185, y: 118 }, { x: 355, y: 178 }],
  ];

  // Partículas flutuantes no fundo
  const particles = Array.from({ length: 22 }, (_, i) => ({
    cx: 30 + ((i * 73) % 460),
    cy: 20 + ((i * 59) % 420),
    r: 0.8 + (i % 3) * 0.5,
    delay: (i * 0.4) % 6,
    dur: 4 + (i % 4),
  }));

  return (
    <div className="relative" aria-hidden="true">

      {/* ── Halo giratório atrás do painel ── */}
      <div
        className="animate-halo-rotate pointer-events-none absolute -inset-6 rounded-[3.5rem] opacity-30"
        style={{
          background: 'conic-gradient(from 0deg, hsl(var(--copper)/0), hsl(var(--acafrao)/0.6), hsl(var(--verde-floresta)/0.4), hsl(var(--roxo-ancestral)/0.3), hsl(var(--copper)/0))',
          filter: 'blur(20px)',
        }}
      />

      {/* ── Glow externo estático ── */}
      <div
        className="pointer-events-none absolute -inset-8 rounded-[3rem] opacity-20 blur-3xl"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, hsl(var(--copper)), hsl(var(--terracota)), transparent 70%)',
        }}
      />

      {/* ── Painel principal ── */}
      <div
        className="relative overflow-hidden rounded-[2rem] shadow-2xl shadow-black/60"
        style={{
          background: 'hsl(22 38% 7%)',
          border: '1px solid hsl(var(--acafrao)/0.22)',
        }}
      >
        {/* Faixa colorida topo */}
        <div
          className="absolute inset-x-0 top-0 z-10 h-[3px]"
          style={{
            background: 'linear-gradient(90deg, hsl(var(--verde-floresta)), hsl(var(--acafrao)), hsl(var(--copper)), hsl(var(--terracota)), hsl(var(--roxo-ancestral)), hsl(var(--azul-atlantico)))',
            boxShadow: '0 0 12px 1px hsl(var(--copper)/0.6)',
          }}
        />

        {/* Scan-line animado descendente */}
        <div
          className="animate-scan-line pointer-events-none absolute inset-x-0 z-[6] h-[2px] opacity-20"
          style={{
            background: 'linear-gradient(90deg, transparent, hsl(var(--acafrao)/0.9), transparent)',
            boxShadow: '0 0 16px 4px hsl(var(--acafrao)/0.4)',
          }}
        />

        {/* Glow radial interno */}
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background: [
              'radial-gradient(600px 450px at 62% 55%, hsl(var(--copper)/0.16), transparent 60%)',
              'radial-gradient(350px 280px at 18% 88%, hsl(var(--verde-floresta)/0.10), transparent 60%)',
              'radial-gradient(280px 200px at 82% 8%, hsl(var(--roxo-ancestral)/0.08), transparent 60%)',
            ].join(', '),
          }}
        />

        {/* SVG do mapa */}
        <svg
          viewBox="0 0 520 460"
          className="relative z-[2] w-full"
          role="img"
          aria-label="Mapa vivo do Brasil — comunidades de tradições de axé"
        >
          <defs>
            <linearGradient id="brazil-fill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stopColor="hsl(var(--copper)/0.16)" />
              <stop offset="50%"  stopColor="hsl(var(--bronze)/0.10)" />
              <stop offset="100%" stopColor="hsl(var(--verde-floresta)/0.08)" />
            </linearGradient>
            <linearGradient id="edge-line" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stopColor="hsl(var(--copper)/0.65)" />
              <stop offset="100%" stopColor="hsl(var(--acafrao)/0.40)" />
            </linearGradient>
            <radialGradient id="center-glow" cx="60%" cy="58%" r="42%">
              <stop offset="0%"   stopColor="hsl(var(--copper)/0.28)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <filter id="marker-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="map-glow" x="-5%" y="-5%" width="110%" height="110%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Partículas de fundo flutuantes */}
          {particles.map((p, i) => (
            <circle
              key={`p${i}`}
              cx={p.cx} cy={p.cy} r={p.r}
              fill="hsl(var(--copper)/0.35)"
              className="animate-particle-drift"
              style={{ animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s` }}
            />
          ))}

          {/* Grid de pontos */}
          {Array.from({ length: 120 }, (_, n) => (
            <circle
              key={`d${n}`}
              cx={40 + (n % 12) * 38}
              cy={40 + Math.floor(n / 12) * 38}
              r="1"
              fill="hsl(var(--ivory)/0.07)"
            />
          ))}

          {/* Contorno do Brasil */}
          <path
            filter="url(#map-glow)"
            d={`M 145 68 C 155 58,175 55,200 60 C 225 55,255 52,280 56 C 310 50,340 54,365 62
                C 390 58,415 72,425 88 C 432 95,428 108,420 118 C 412 128,400 132,390 140
                C 398 150,402 162,395 170 C 388 182,375 188,362 195 C 370 205,372 218,365 228
                C 358 240,345 248,335 258 C 342 268,348 280,345 292 C 340 305,328 312,318 318
                C 308 326,295 330,285 338 C 275 348,268 360,260 370 C 252 382,244 392,238 400
                C 228 408,215 410,205 405 C 195 400,188 390,182 380 C 175 368,172 355,168 342
                C 162 328,154 315,148 302 C 140 288,132 275,125 262 C 116 248,110 235,105 222
                C 98 208,95 194,92 180 C 88 165,86 150,88 135 C 90 120,98 108,108 98
                C 118 88,132 75,145 68 Z`}
            fill="url(#brazil-fill)"
            stroke="url(#edge-line)"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <ellipse cx="278" cy="238" rx="132" ry="122" fill="url(#center-glow)" />

          {/* Linhas de conexão */}
          {connections.map((pts, i) => (
            <line
              key={`c${i}`}
              x1={pts[0].x} y1={pts[0].y}
              x2={pts[1].x} y2={pts[1].y}
              stroke="url(#edge-line)"
              strokeWidth="0.9"
              strokeDasharray="4 6"
              opacity="0.50"
            />
          ))}

          {/* Marcadores com halo pulsante */}
          {markers.map((m, i) => (
            <g key={`m${i}`} filter="url(#marker-glow)">
              {/* Anel externo pulsante */}
              <circle cx={m.x} cy={m.y} r="11" fill="none"
                stroke={m.color} strokeWidth="0.8" opacity="0.25"
                className="animate-pulse-ring"
                style={{ animationDelay: `${m.delay}s` }}
              />
              {/* Anel médio */}
              <circle cx={m.x} cy={m.y} r="7" fill="none"
                stroke={m.color} strokeWidth="1" opacity="0.40"
                className="animate-pulse-ring"
                style={{ animationDelay: `${m.delay + 0.4}s` }}
              />
              {/* Ponto central */}
              <circle cx={m.x} cy={m.y} r="3.5"
                fill={m.color}
                stroke="hsl(var(--ivory)/0.55)"
                strokeWidth="1.2"
              />
            </g>
          ))}

          {/* Labels */}
          <text x="338" y="173" fill="hsl(var(--ivory)/0.70)" fontSize="9" fontFamily="var(--font-sans)" fontWeight="600">Salvador</text>
          <text x="298" y="263" fill="hsl(var(--ivory)/0.70)" fontSize="9" fontFamily="var(--font-sans)" fontWeight="600">São Paulo</text>
          <text x="325" y="293" fill="hsl(var(--ivory)/0.55)" fontSize="9" fontFamily="var(--font-sans)" fontWeight="600">Rio de Janeiro</text>
          <text x="362" y="148" fill="hsl(var(--ivory)/0.55)" fontSize="9" fontFamily="var(--font-sans)" fontWeight="600">Recife</text>

          {/* Watermark BRASIL */}
          <text x="226" y="230" fill="hsl(var(--ivory)/0.06)" fontSize="34"
            fontFamily="var(--font-display)" fontWeight="900" letterSpacing="-0.02em">
            BRASIL
          </text>
        </svg>

        {/* ── Card flutuante: Casa verificada ── */}
        <div
          className="animate-hero-float absolute left-5 top-6 z-20 flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5 shadow-xl shadow-black/40 backdrop-blur-md"
          style={{ background: 'hsl(22 35% 8% / 0.88)', border: '1px solid hsl(var(--verde-floresta)/0.45)' }}
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full" style={{ background: 'hsl(var(--verde-floresta)/0.20)' }}>
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="hsl(var(--verde-floresta))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <div>
            <p className="text-xs font-semibold text-white">Casa verificada</p>
            <p className="text-[10px] text-[hsl(var(--areia)/0.70)]">Documentação confirmada</p>
          </div>
        </div>

        {/* ── Card flutuante: Eventos ── */}
        <div
          className="animate-hero-float-slower absolute right-5 top-6 z-20 rounded-2xl px-3.5 py-2.5 shadow-xl shadow-black/40 backdrop-blur-md"
          style={{ background: 'hsl(22 35% 8% / 0.88)', border: '1px solid hsl(var(--terracota)/0.40)' }}
        >
          <p className="text-[11px] font-semibold text-[hsl(var(--terracota))]">Eventos</p>
          <p className="text-xs font-bold text-white">Esta semana</p>
        </div>

        {/* ── Card flutuante: Legenda ── */}
        <div
          className="animate-hero-float-slow absolute bottom-6 right-5 z-20 rounded-2xl p-3.5 shadow-xl shadow-black/40 backdrop-blur-md"
          style={{ background: 'hsl(22 35% 8% / 0.88)', border: '1px solid hsl(var(--copper)/0.30)' }}
        >
          <p className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--areia)/0.70)]">Legenda</p>
          <ul className="flex flex-col gap-1.5">
            {[
              { color: 'hsl(var(--acafrao))',        label: 'Casas de Axé' },
              { color: 'hsl(var(--verde-floresta))', label: 'Verificadas' },
              { color: 'hsl(var(--terracota))',      label: 'Eventos' },
              { color: 'hsl(var(--roxo-ancestral))', label: 'Federações' },
              { color: 'hsl(var(--azul-atlantico))', label: 'Comunidades' },
            ].map((item) => (
              <li key={item.label} className="flex items-center gap-2 text-[10px] text-white/80">
                <span className="size-2.5 shrink-0 rounded-full" style={{ background: item.color, boxShadow: `0 0 6px ${item.color}` }} />
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
