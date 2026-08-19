import { Reveal } from './reveal';
import { ShieldCheck, BadgeCheck, Gauge, Scale, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { HomeData } from './data';

const pilares = [
  {
    icon: ShieldCheck,
    titulo: 'Verificação',
    texto: 'Casas passam por verificação documental e presencial — o perfil corresponde ao terreiro real.',
    cor: 'hsl(var(--verde-floresta))',
    bg: 'hsl(var(--verde-floresta)/0.10)',
    border: 'hsl(var(--verde-floresta)/0.30)',
  },
  {
    icon: BadgeCheck,
    titulo: 'Transparência',
    texto: 'Trust Score transparente, formado por avaliações, atividade e histórico — nunca por pagamento.',
    cor: 'hsl(var(--acafrao))',
    bg: 'hsl(var(--acafrao)/0.10)',
    border: 'hsl(var(--acafrao)/0.30)',
  },
  {
    icon: Scale,
    titulo: 'Mediação',
    texto: 'Avaliações são verificadas. Cada casa tem direito a resposta e defesa diante de qualquer contestação.',
    cor: 'hsl(var(--azul-atlantico))',
    bg: 'hsl(var(--azul-atlantico)/0.10)',
    border: 'hsl(var(--azul-atlantico)/0.30)',
  },
  {
    icon: Gauge,
    titulo: 'Trust',
    texto: 'Índice de Confiança calculado pela comunidade. ADS não afeta Trust, verificação ou ranking.',
    cor: 'hsl(var(--roxo-ancestral))',
    bg: 'hsl(var(--roxo-ancestral)/0.10)',
    border: 'hsl(var(--roxo-ancestral)/0.30)',
  },
];

export function HomeTrust({ data }: { data: HomeData }) {
  void data;
  return (
    <section
      className="relative overflow-hidden py-20 lg:py-28"
      aria-labelledby="confianca-titulo"
      style={{ background: 'hsl(var(--obsidiana))' }}
    >
      {/* Background texture */}
      <div className="absolute inset-0 bg-fiber opacity-30" aria-hidden="true" />
      <div
        className="absolute inset-0 opacity-25"
        style={{
          background: [
            'radial-gradient(700px 400px at 90% -10%, hsl(var(--verde-floresta)/0.25), transparent 55%)',
            'radial-gradient(600px 400px at -5% 110%, hsl(var(--acafrao)/0.15), transparent 55%)',
          ].join(', '),
        }}
        aria-hidden="true"
      />

      {/* Lateral geometric bands */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-1"
        style={{ background: 'linear-gradient(180deg, hsl(var(--verde-floresta)/0.6), hsl(var(--acafrao)/0.4), hsl(var(--terracota)/0.3), transparent)' }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-1"
        style={{ background: 'linear-gradient(180deg, transparent, hsl(var(--roxo-ancestral)/0.4), hsl(var(--azul-atlantico)/0.3), hsl(var(--verde-floresta)/0.2))' }}
        aria-hidden="true"
      />

      <div className="container-page relative">
        <Reveal>
          <div className="flex flex-col items-center gap-4 text-center">
            <span
              className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] backdrop-blur"
              style={{
                color: 'hsl(var(--verde-floresta))',
                borderColor: 'hsl(var(--verde-floresta)/0.30)',
                background: 'hsl(var(--verde-floresta)/0.10)',
              }}
            >
              <span
                className="size-1.5 rounded-full"
                style={{ background: 'hsl(var(--verde-floresta))', boxShadow: '0 0 0 3px hsl(var(--verde-floresta)/0.22)' }}
                aria-hidden="true"
              />
              Confiança e governança
            </span>
            <h2
              id="confianca-titulo"
              className="max-w-2xl font-display text-3xl font-bold leading-tight tracking-tight text-[hsl(var(--marfim))] md:text-4xl"
            >
              Confiança também{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--acafrao)), hsl(var(--copper)))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                faz parte do mapa.
              </span>
            </h2>
            <p className="max-w-xl text-base leading-relaxed text-[hsl(var(--marfim)/0.70)]">
              O AxéMap foi desenhado para proteger a integridade dos dados e das histórias de cada
              casa e de cada comunidade. Pagamento jamais afeta confiança.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {pilares.map((p, i) => (
            <Reveal key={p.titulo} delay={i * 0.06}>
              <div
                className="flex h-full flex-col rounded-2xl p-6 transition-all duration-[var(--duration-base)] hover:-translate-y-1 hover:brightness-110"
                style={{
                  background: `hsl(22 30% 10%)`,
                  border: `1px solid ${p.border}`,
                  boxShadow: `0 4px 24px ${p.bg}`,
                }}
              >
                <span
                  className="mb-4 inline-flex size-11 items-center justify-center rounded-xl"
                  style={{ background: p.bg, color: p.cor }}
                >
                  <p.icon className="size-5" aria-hidden="true" />
                </span>
                <h3
                  className="font-display text-base font-bold"
                  style={{ color: p.cor }}
                >
                  {p.titulo}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--marfim)/0.65)]">
                  {p.texto}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <div className="mt-10 flex flex-col items-center gap-4">
            <p
              className="max-w-md text-center text-sm text-[hsl(var(--marfim)/0.55)]"
            >
              Nenhum pagamento ou influência externa altera a pontuação de confiança. O índice vem
              exclusivamente da confiança demonstrada pela comunidade.
            </p>
            <Link
              href="/transparencia"
              className="inline-flex items-center gap-2 rounded-2xl border px-5 py-3 text-sm font-bold text-[hsl(var(--acafrao))] transition hover:bg-[hsl(var(--acafrao)/0.10)]"
              style={{ borderColor: 'hsl(var(--acafrao)/0.35)' }}
            >
              Ver como funciona a verificação
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
