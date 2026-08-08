/** Painel decorativo do Hero — mapa vivo estilizado em SVG + cards flutuantes. */
export function HeroMapVisual() {
  return (
    <div className="relative">
      <div className="absolute -inset-6 rounded-[2.5rem] bg-brand-gradient opacity-20 blur-3xl" aria-hidden="true" />

      <div className="relative overflow-hidden rounded-[2rem] border border-ivory/15 bg-[hsl(22_45%_9%)] shadow-2xl shadow-black/40">
        <div className="absolute inset-0 opacity-40" style={{ background: 'radial-gradient(600px 400px at 70% 20%, hsl(var(--copper) / 0.3), transparent 60%), radial-gradient(500px 380px at 10% 90%, hsl(var(--bronze) / 0.22), transparent 60%)' }} aria-hidden="true" />

        <svg viewBox="0 0 520 460" className="relative w-full" role="img" aria-label="Ilustração de um mapa vivo de comunidades conectadas">
          <defs>
            <linearGradient id="hm-edge" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="hsl(var(--copper) / 0.55)" />
              <stop offset="100%" stopColor="hsl(var(--bronze) / 0.25)" />
            </linearGradient>
            <radialGradient id="hm-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(var(--copper) / 0.5)" />
              <stop offset="100%" stopColor="hsl(var(--copper) / 0)" />
            </radialGradient>
          </defs>

          {/* malha de pontos */}
          {Array.from({ length: 140 }, (_, n) => {
            const r = Math.floor(n / 10);
            const c = n % 10;
            return (
              <circle key={`${r}-${c}`} cx={30 + c * 52} cy={34 + r * 34} r="1.4" fill="hsl(var(--ivory) / 0.18)" />
            );
          })}

          {/* linhas de conexão */}
          <path d="M60 120 L150 80 L240 140 L330 90 L450 150" stroke="url(#hm-edge)" strokeWidth="1.4" fill="none" strokeDasharray="3 6" />
          <path d="M80 300 L170 250 L280 320 L400 260 L480 330" stroke="url(#hm-edge)" strokeWidth="1.4" fill="none" strokeDasharray="3 6" />
          <path d="M150 80 L180 210 L170 250" stroke="hsl(var(--ivory) / 0.16)" strokeWidth="1" fill="none" />
          <path d="M240 140 L280 320 L330 90" stroke="hsl(var(--ivory) / 0.16)" strokeWidth="1" fill="none" />
          <path d="M400 260 L450 150 L480 330" stroke="hsl(var(--ivory) / 0.16)" strokeWidth="1" fill="none" />

          {/* glow central */}
          <circle cx="280" cy="300" r="120" fill="url(#hm-glow)" />

          {/* nós */}
          <circle cx="150" cy="80" r="5" fill="hsl(var(--copper))" stroke="hsl(var(--ivory) / 0.4)" strokeWidth="1.5" />
          <circle cx="240" cy="140" r="4" fill="hsl(var(--bronze))" stroke="hsl(var(--ivory) / 0.4)" strokeWidth="1.5" />
          <circle cx="330" cy="90" r="4" fill="hsl(var(--clay))" stroke="hsl(var(--ivory) / 0.4)" strokeWidth="1.5" />
          <circle cx="450" cy="150" r="4" fill="hsl(var(--fern))" stroke="hsl(var(--ivory) / 0.4)" strokeWidth="1.5" />
          <circle cx="170" cy="250" r="4" fill="hsl(var(--sand))" stroke="hsl(var(--ivory) / 0.4)" strokeWidth="1.5" />
          <circle cx="400" cy="260" r="4" fill="hsl(var(--fern))" stroke="hsl(var(--ivory) / 0.4)" strokeWidth="1.5" />

          {/* marcador "você" com anel pulsante */}
          <circle cx="280" cy="300" r="10" fill="none" stroke="hsl(var(--copper))" strokeWidth="1.5" className="animate-pulse-ring" />
          <circle cx="280" cy="300" r="6" fill="hsl(var(--copper))" stroke="hsl(var(--ivory) / 0.6)" strokeWidth="2" />
          <circle cx="280" cy="300" r="2.5" fill="hsl(var(--ivory))" />

          {/* rótulos de cidade */}
          <text x="132" y="70" fill="hsl(var(--ivory) / 0.7)" fontSize="11" fontFamily="var(--font-sans)" fontWeight="600">Salvador</text>
          <text x="310" y="78" fill="hsl(var(--ivory) / 0.55)" fontSize="11" fontFamily="var(--font-sans)" fontWeight="600">Recife</text>
          <text x="425" y="145" fill="hsl(var(--ivory) / 0.7)" fontSize="11" fontFamily="var(--font-sans)" fontWeight="600">São Paulo</text>
          <text x="180" y="238" fill="hsl(var(--ivory) / 0.55)" fontSize="11" fontFamily="var(--font-sans)" fontWeight="600">Rio</text>
        </svg>

        {/* card: selo verificado */}
        <div className="animate-hero-float absolute left-5 top-6 flex items-center gap-2.5 rounded-2xl border border-ivory/15 bg-[hsl(24_35%_12%_/_0.9)] px-3.5 py-2.5 shadow-xl shadow-black/30 backdrop-blur">
          <span className="flex size-8 items-center justify-center rounded-full bg-fern/20 text-fern">
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <div>
            <p className="text-xs font-semibold text-white">Casa verificada</p>
            <p className="text-[10px] text-ivory/60">Documentação confirmada</p>
          </div>
        </div>

        {/* card: trust score */}
        <div className="animate-hero-float-slow absolute bottom-6 right-5 w-44 rounded-2xl border border-ivory/15 bg-[hsl(24_35%_12%_/_0.9)] p-3.5 shadow-xl shadow-black/30 backdrop-blur">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-medium text-ivory/70">Trust Score</p>
            <p className="font-display text-sm font-bold text-ochre">9.2</p>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-ivory/15">
            <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-bronze to-copper" />
          </div>
        </div>

        {/* card: eventos */}
        <div className="animate-hero-float-slower absolute right-6 top-8 rounded-2xl border border-ivory/15 bg-[hsl(24_35%_12%_/_0.9)] px-3.5 py-2 shadow-xl shadow-black/30 backdrop-blur">
          <p className="text-[11px] font-medium text-ivory/70">Eventos</p>
          <p className="text-xs font-bold text-white">hoje e nesta semana</p>
        </div>
      </div>
    </div>
  );
}
