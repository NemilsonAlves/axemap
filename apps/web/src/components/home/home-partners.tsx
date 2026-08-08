import { SectionHeading } from './section-heading';
import { Reveal } from './reveal';
import { Landmark, Microscope, University, HeartHandshake, Network, Plus, ArrowUpRight } from 'lucide-react';

const parceiros = [
  { icon: Landmark, titulo: 'Instituições culturais' },
  { icon: Microscope, titulo: 'Pesquisadores' },
  { icon: University, titulo: 'Universidades' },
  { icon: HeartHandshake, titulo: 'Projetos sociais' },
  { icon: Network, titulo: 'Organizações' },
];

export function HomePartners() {
  return (
    <section className="container-page py-20 lg:py-28" aria-labelledby="parceiros-titulo">
      <Reveal>
        <SectionHeading
          eyebrow="Parceiros"
          id="parceiros-titulo"
          title="Construído em rede, com quem preserva"
          description="Instituições, pesquisadores e coletivos que somam força para proteger e difundir o patrimônio das matrizes africanas."
        />
      </Reveal>

      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {parceiros.map((p, i) => (
          <Reveal key={p.titulo} delay={i * 0.04}>
            <div className="flex h-full flex-col items-center gap-3 rounded-2xl border border-border bg-card px-4 py-7 text-center transition-all duration-[var(--duration-base)] hover:-translate-y-1 hover:border-copper/40 hover:shadow-md">
              <span className="inline-flex size-11 items-center justify-center rounded-xl bg-copper-soft text-copper-strong">
                <p.icon className="size-5" aria-hidden="true" />
              </span>
              <span className="text-sm font-semibold leading-snug text-foreground">{p.titulo}</span>
            </div>
          </Reveal>
        ))}

        <Reveal delay={0.2}>
          <a
            href="mailto:parcerias@axemap.com.br?subject=Parceria%20AxéMap"
            className="group flex h-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-copper/40 bg-copper-soft/30 px-4 py-7 text-center transition-all duration-[var(--duration-base)] hover:-translate-y-1 hover:border-copper/70 hover:bg-copper-soft/60"
          >
            <span className="inline-flex size-11 items-center justify-center rounded-full bg-brand-gradient text-white shadow-md shadow-copper/30">
              <Plus className="size-5" aria-hidden="true" />
            </span>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-copper-strong">
              Seja um parceiro
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
            </span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
