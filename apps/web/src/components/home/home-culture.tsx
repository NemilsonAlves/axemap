import Link from 'next/link';
import { SectionHeading } from './section-heading';
import { Reveal } from './reveal';
import { ScrollText, Mic, Clapperboard, FileText, Microscope, Landmark, ArrowUpRight } from 'lucide-react';

const destaques = [
  { icon: ScrollText, titulo: 'Histórias', destino: 'Memórias e trajetórias das casas.', href: '/central-evolucao' },
  { icon: Mic, titulo: 'Entrevistas', destino: 'Vozes de zeladores e mestres.', href: '/tradicao' },
  { icon: Clapperboard, titulo: 'Documentários', destino: 'A tradição em movimento.', href: '/central-evolucao' },
  { icon: FileText, titulo: 'Artigos', destino: 'Análises e reflexões do ecossistema.', href: '/tradicao' },
  { icon: Microscope, titulo: 'Pesquisas', destino: 'Conhecimento acadêmico e coletivo.', href: '/acoes-sociais' },
  { icon: Landmark, titulo: 'Memória cultural', destino: 'Preservar para as próximas gerações.', href: '/central-evolucao' },
];

const gradientes = [
  'from-bronze to-clay',
  'from-copper to-bronze',
  'from-clay to-soil',
  'from-fern to-soil',
  'from-copper to-clay',
  'from-soil-soft to-soil',
];

export function HomeCulture() {
  return (
    <section className="container-page py-20 lg:py-28" aria-labelledby="cultura-titulo">
      <Reveal>
        <SectionHeading
          eyebrow="Destaques culturais"
          id="cultura-titulo"
          title="Memória viva, contada em voz"
          description="Histórias, entrevistas, documentos e pesquisas que preservam e difundem a riqueza das religiões de matriz africana."
        />
      </Reveal>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {destaques.map((d, i) => (
          <Reveal key={d.titulo} delay={i * 0.04}>
            <Link
              href={d.href}
              className={`group flex h-44 flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br ${gradientes[i % gradientes.length]} p-6 text-white shadow-sm transition-all duration-[var(--duration-base)] ease-[var(--ease-out)] hover:-translate-y-1 hover:shadow-lg`}
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                <d.icon className="size-5" aria-hidden="true" />
              </span>
              <span>
                <span className="flex items-center gap-1.5 font-display text-lg font-semibold">
                  {d.titulo}
                  <ArrowUpRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                </span>
                <span className="mt-0.5 block text-sm text-white/80">{d.destino}</span>
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}