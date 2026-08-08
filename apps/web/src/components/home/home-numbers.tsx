import { CountUp } from './count-up';
import { Reveal } from './reveal';
import { Building2, ShieldCheck, MapPinned, CalendarDays, GraduationCap, Star } from 'lucide-react';
import type { HomeData } from './data';

export function HomeNumbers({ data }: { data: HomeData }) {
  const stats = data.stats;
  const numeros = [
    { icon: Building2, label: 'Casas cadastradas', value: stats?.totalTerreiro ?? 0 },
    { icon: ShieldCheck, label: 'Casas verificadas', value: stats?.totalVerificados ?? 0 },
    { icon: MapPinned, label: 'Estados presentes', value: stats?.estados?.length ?? 0 },
    { icon: CalendarDays, label: 'Eventos', value: stats?.totalEventos ?? 0 },
    { icon: GraduationCap, label: 'Cursos', value: stats?.totalCursos ?? 0 },
    { icon: Star, label: 'Avaliações verificadas', value: stats?.totalAvaliacoes ?? 0 },
  ];

  return (
    <section
      className="relative overflow-hidden border-y border-border/70 bg-hero py-20 text-ivory lg:py-24"
      aria-labelledby="numeros-titulo"
    >
      <div className="absolute inset-0 bg-fiber opacity-40" aria-hidden="true" />
      <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(800px 400px at 50% -20%, hsl(var(--copper) / 0.35), transparent 60%)' }} aria-hidden="true" />

      <div className="container-page relative">
        <Reveal>
          <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center gap-3 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-ivory/20 bg-ivory/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-ivory/90">
              Números do ecossistema
            </span>
            <h2 id="numeros-titulo" className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              Uma rede que só cresce
            </h2>
            <p className="text-base text-ivory/80">
              Cada número representa uma casa, uma história e uma comunidade sendo
              reconhecida.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-ivory/15 bg-ivory/10 md:grid-cols-3 lg:grid-cols-6">
          {numeros.map((n, i) => (
            <Reveal key={n.label} delay={i * 0.04} className="h-full">
              <div className="flex h-full flex-col items-center gap-2 bg-hero/95 px-4 py-8 text-center transition-colors hover:bg-[hsl(24_30%_10%)]">
                <span className="text-copper" aria-hidden="true">
                  <n.icon className="size-5" />
                </span>
                <CountUp
                  value={n.value}
                  className="font-display text-3xl font-bold text-white sm:text-4xl"
                />
                <span className="text-xs font-medium uppercase tracking-wide text-ivory/70">
                  {n.label}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
