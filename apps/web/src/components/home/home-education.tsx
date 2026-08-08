import Link from 'next/link';
import { SectionHeading } from './section-heading';
import { Reveal } from './reveal';
import { GraduationCap, Clock, ArrowRight } from 'lucide-react';
import { blocoDe, tradicaoLabel, type HomeData } from './data';

export function HomeEducation({ data }: { data: HomeData }) {
  const bloco = blocoDe(data.blocos, 'cursos');
  const cursos = (bloco?.itens ?? []) as Array<{
    id: string;
    titulo: string;
    modalidade: string | null;
    dataInicio: string | null;
    terreiroNome: string;
    terreiroSlug: string;
    cidade: string;
    estado: string;
  }>;

  if (!cursos.length) return null;

  return (
    <section
      className="relative overflow-hidden border-y border-border/70 bg-surface-2/60 py-20 lg:py-28"
      aria-labelledby="cursos-titulo"
    >
      <div className="absolute inset-0 bg-fiber opacity-40" aria-hidden="true" />
      <div className="container-page relative">
        <Reveal>
          <SectionHeading
            eyebrow="Educação e formação"
            id="cursos-titulo"
            title="Aprenda com quem vive a tradição"
            description="Cursos e formações conduzidos por dirigentes e mestres de cada casa. Conhecimento que se transmite de geração em geração."
          />
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cursos.slice(0, 6).map((curso, i) => (
            <Reveal key={curso.id ?? i} delay={i * 0.05}>
              <Link
                href={`/terreiro/${curso.terreiroSlug}`}
                className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-[var(--duration-base)] ease-[var(--ease-out)] hover:-translate-y-1 hover:border-copper/40 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <GraduationCap className="size-6" aria-hidden="true" />
                  </span>
                  {curso.modalidade && (
                    <span className="rounded-full border border-border bg-accent px-2.5 py-1 text-[11px] font-semibold capitalize text-muted-foreground">
                      {tradicaoLabel(curso.modalidade)}
                    </span>
                  )}
                </div>

                <h3 className="mt-4 font-display text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-copper-strong line-clamp-2">
                  {curso.titulo}
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {curso.terreiroNome} · {curso.cidade}, {curso.estado}
                </p>

                <p className="mt-auto pt-4 text-xs text-muted-foreground/70">
                  {curso.dataInicio ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="size-3.5" aria-hidden="true" />
                      Início em {new Date(curso.dataInicio).toLocaleDateString('pt-BR')}
                    </span>
                  ) : (
                    'Inscrições abertas'
                  )}
                </p>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10 flex justify-center">
          <Link
            href="/cursos"
            className="inline-flex items-center gap-2 rounded-full border border-copper/30 bg-copper-soft/40 px-5 py-2.5 text-sm font-semibold text-copper-strong transition-colors hover:bg-copper-soft/70"
          >
            Ver todos os cursos
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}