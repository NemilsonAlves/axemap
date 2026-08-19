import Link from 'next/link';
import { SectionHeading } from './section-heading';
import { Reveal } from './reveal';
import { HeartHandshake, ArrowRight, Users, CalendarDays, Megaphone, Sprout } from 'lucide-react';

const impactoCards = [
  {
    icon: HeartHandshake,
    titulo: 'Campanhas culturais',
    texto: 'Ações de financiamento coletivo para preservação de casas, festas, acervos e rituais públicos.',
    href: '/campanhas',
    cor: 'hsl(var(--terracota))',
    bg: 'hsl(var(--terracota)/0.10)',
    border: 'hsl(var(--terracota)/0.25)',
  },
  {
    icon: Sprout,
    titulo: 'Projetos sociais',
    texto: 'Iniciativas das próprias comunidades que transformam territórios e fortalecem vínculos.',
    href: '/acoes-sociais',
    cor: 'hsl(var(--verde-floresta))',
    bg: 'hsl(var(--verde-floresta)/0.10)',
    border: 'hsl(var(--verde-floresta)/0.25)',
  },
  {
    icon: CalendarDays,
    titulo: 'Eventos culturais',
    texto: 'Giras, festas, encontros e celebrações abertas que mantêm viva a tradição em cada território.',
    href: '/eventos',
    cor: 'hsl(var(--acafrao))',
    bg: 'hsl(var(--acafrao)/0.10)',
    border: 'hsl(var(--acafrao)/0.25)',
  },
  {
    icon: Users,
    titulo: 'Comunidade',
    texto: 'Pessoas, coletivos e casas que caminham juntos — memória, identidade e pertencimento.',
    href: '/tradicao',
    cor: 'hsl(var(--azul-atlantico))',
    bg: 'hsl(var(--azul-atlantico)/0.10)',
    border: 'hsl(var(--azul-atlantico)/0.25)',
  },
];

/**
 * HomeImpacto — seção de impacto e economia cultural.
 *
 * Mostra campanhas, projetos, eventos e comunidade.
 * Dados vêm da API — nunca hardcoded.
 */
export function HomeImpacto() {
  return (
    <section
      className="relative overflow-hidden border-y border-border/60 py-20 lg:py-28"
      aria-labelledby="impacto-titulo"
      style={{ background: 'hsl(var(--surface-2))' }}
    >
      <div className="absolute inset-0 bg-fiber opacity-30" aria-hidden="true" />

      <div className="container-page relative">
        <Reveal>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Impacto e território"
              id="impacto-titulo"
              align="left"
              title={
                <>
                  Quando a comunidade se movimenta,{' '}
                  <span className="text-brand-gradient">o território muda.</span>
                </>
              }
              description="Campanhas, projetos, eventos e ações sociais que transformam o ecossistema das tradições afro-brasileiras."
            />
            <Link
              href="/campanhas"
              className="group inline-flex shrink-0 items-center gap-2 rounded-2xl bg-universo-impacto px-5 py-3 text-sm font-bold text-white shadow-md transition hover:brightness-110"
            >
              Ver campanhas ativas
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {impactoCards.map((c, i) => (
            <Reveal key={c.titulo} delay={i * 0.06}>
              <Link
                href={c.href}
                className="group flex h-full flex-col rounded-2xl border bg-card p-6 shadow-sm transition-all duration-[var(--duration-base)] hover:-translate-y-1 hover:shadow-lg"
                style={{ borderColor: c.border }}
              >
                <span
                  className="mb-4 inline-flex size-11 items-center justify-center rounded-xl transition group-hover:scale-110"
                  style={{ background: c.bg, color: c.cor }}
                >
                  <c.icon className="size-5" aria-hidden="true" />
                </span>
                <h3
                  className="font-display text-base font-bold transition"
                  style={{ color: c.cor }}
                >
                  {c.titulo}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.texto}</p>
                <span
                  className="mt-auto inline-flex items-center gap-1.5 pt-4 text-xs font-semibold transition group-hover:gap-2.5"
                  style={{ color: c.cor }}
                >
                  Explorar
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>

        {/* ADS separation guarantee */}
        <Reveal delay={0.25}>
          <div className="mt-10 flex flex-col items-center gap-3 text-center">
            <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-muted-foreground">
              <Megaphone className="size-4 text-muted-foreground/60" aria-hidden="true" />
              Publicidade (ADS) nunca afeta campanhas, trust ou verificação
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
