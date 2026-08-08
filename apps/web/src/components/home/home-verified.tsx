import Link from 'next/link';
import { SectionHeading } from './section-heading';
import { Reveal } from './reveal';
import { Progress } from '@/components/ui/progress';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { terreirosDeCapa, tradicaoLabel, type HomeData } from './data';

function trustColor(score: number) {
  if (score >= 8.5) return 'text-fern';
  if (score >= 7) return 'text-ochre';
  return 'text-clay';
}

export function HomeVerified({ data }: { data: HomeData }) {
  const casas = terreirosDeCapa(data);

  if (!casas.length) return null;

  return (
    <section className="container-page py-20 lg:py-28" aria-labelledby="verificadas-titulo">
      <Reveal>
        <SectionHeading
          eyebrow="Casas verificadas"
          id="verificadas-titulo"
          title="Encontre casas em que você pode confiar"
          description="Perfis com verificação documental confirmada e índices de confiança calculados a partir de avaliações reais da comunidade."
        />
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {casas.slice(0, 6).map((casa, i) => (
          <Reveal key={casa.id ?? i} delay={i * 0.05}>
            <Link
              href={`/terreiro/${casa.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-[var(--duration-base)] ease-[var(--ease-out)] hover:-translate-y-1 hover:border-copper/40 hover:shadow-lg"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                {casa.fotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={casa.fotoUrl}
                    alt={casa.nome}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-brand-gradient/80">
                    <span className="font-display text-4xl font-bold text-white/85">
                      {casa.nome.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" aria-hidden="true" />
                <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-fern px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
                  <ShieldCheck className="size-3.5" aria-hidden="true" />
                  Verificada
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-lg font-semibold leading-tight text-foreground transition-colors group-hover:text-copper-strong">
                  {casa.nome}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {tradicaoLabel(casa.tradicao)} · {casa.cidade}, {casa.estado}
                </p>

                {casa.descricaoCurta && (
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground/80">
                    {casa.descricaoCurta}
                  </p>
                )}

                <div className="mt-auto pt-4">
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Trust Score</span>
                    <span className={`font-display text-base font-bold ${trustColor(casa.trustScore)}`}>
                      {casa.trustScore?.toFixed(1)}
                    </span>
                  </div>
                  <Progress value={(casa.trustScore ?? 0) * 10} />
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-copper">
                    Conhecer casa
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}