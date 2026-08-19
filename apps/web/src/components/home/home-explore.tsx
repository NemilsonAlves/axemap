import Link from 'next/link';
import {
  HousePlus,
  BookOpen,
  CalendarDays,
  Network,
  Building2,
  Sprout,
  ArrowUpRight,
} from 'lucide-react';
import { Reveal } from './reveal';

const atalhos = [
  {
    titulo: 'Casas de Axé',
    desc: 'Terreiros, templos e comunidades no mapa.',
    href: '/terreiros',
    icon: HousePlus,
    cor: 'text-copper bg-copper-soft/60',
    borda: 'hover:border-copper/45',
  },
  {
    titulo: 'Tradições',
    desc: 'Candomblé, Umbanda, Batuque, Jurema e mais.',
    href: '/tradicao',
    icon: BookOpen,
    cor: 'text-acafrao bg-acafrao/10',
    borda: 'hover:border-acafrao/45',
  },
  {
    titulo: 'Eventos',
    desc: 'Giras, festas e celebrações abertas.',
    href: '/eventos',
    icon: CalendarDays,
    cor: 'text-terracota bg-terracota/10',
    borda: 'hover:border-terracota/45',
  },
  {
    titulo: 'Organizações',
    desc: 'Associações, institutos e entidades da rede.',
    href: '/organizacoes',
    icon: Network,
    cor: 'text-roxo-ancestral bg-roxo-ancestral/10',
    borda: 'hover:border-roxo-ancestral/45',
  },
  {
    titulo: 'Federações',
    desc: 'Estruturas de representação e articulação.',
    href: '/federacoes',
    icon: Building2,
    cor: 'text-azul-atlantico bg-azul-atlantico/10',
    borda: 'hover:border-azul-atlantico/45',
  },
  {
    titulo: 'Projetos',
    desc: 'Campanhas e ações culturais da comunidade.',
    href: '/acoes-sociais',
    icon: Sprout,
    cor: 'text-verde-floresta bg-verde-floresta/10',
    borda: 'hover:border-verde-floresta/45',
  },
];

/**
 * HomeExplore — seção de transição logo abaixo do Hero.
 * "EXPLORAR O AXÉMAP": seis atalhos elegantes para os universos do produto.
 * Estética institucional: cards compactos, ícones discretos, sem excesso de sombras.
 */
export function HomeExplore() {
  return (
    <section
      className="relative border-y border-border/50 bg-background"
      aria-labelledby="explorar-titulo"
    >
      <div className="container-page py-12 lg:py-16">
        <Reveal>
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-copper/25 bg-copper-soft/40 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-copper-strong">
              <span className="size-1.5 shrink-0 rounded-full bg-copper" aria-hidden="true" />
              Explore o AxéMap
            </span>
            <h2
              id="explorar-titulo"
              className="max-w-2xl font-display text-2xl font-bold leading-tight tracking-tight text-foreground md:text-3xl"
            >
              Encontre, conheça e conecte-se com as tradições que mantêm o axé vivo.
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {atalhos.map((a, i) => (
            <Reveal key={a.titulo} delay={i * 0.04} className="h-full">
              <Link
                href={a.href}
                className={`group flex h-full flex-col justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all duration-[var(--duration-base)] hover:-translate-y-1 hover:shadow-md ${a.borda}`}
              >
                <span className={`inline-flex size-10 items-center justify-center rounded-xl transition-transform duration-[var(--duration-base)] group-hover:scale-105 ${a.cor}`}>
                  <a.icon className="size-5" aria-hidden="true" />
                </span>
                <span className="flex items-center gap-1">
                  <span className="font-display text-sm font-bold leading-tight text-foreground transition-colors group-hover:text-copper-strong">
                    {a.titulo}
                  </span>
                  <ArrowUpRight
                    className="size-3.5 shrink-0 text-muted-foreground/60 opacity-0 transition-all duration-[var(--duration-base)] group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </span>
                <span className="text-xs leading-relaxed text-muted-foreground">{a.desc}</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
