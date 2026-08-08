import { SectionHeading } from './section-heading';
import { Reveal } from './reveal';
import { DonutChart } from '@/components/ui/chart';
import { ShieldCheck, BadgeCheck, Gauge, Scale } from 'lucide-react';
import { terreirosDeCapa, type HomeData } from './data';

const pilares = [
  {
    icon: ShieldCheck,
    titulo: 'Governança comunitária',
    texto:
      'Um conselho de zeladores e referências das tradições orienta critérios e resolução de conflitos dentro do ecossistema.',
  },
  {
    icon: BadgeCheck,
    titulo: 'Perfil verificado',
    texto:
      'Casas passam por verificação documental e presencial, garantindo que o perfil corresponde ao terreiro real.',
  },
  {
    icon: Gauge,
    titulo: 'Índice de Confiança AxéMap',
    texto:
      'Um score transparente, formado por avaliações, atividades e histórico — nunca por pagamento.',
  },
  {
    icon: Scale,
    titulo: 'Mediação e direito de resposta',
    texto:
      'Avaliações são verificadas, e toda casa tem direito a resposta e defesa diante de qualquer contestação.',
  },
];

export function HomeTrust({ data }: { data: HomeData }) {
  const casas = terreirosDeCapa(data);
  const avgTrust =
    casas.length > 0
      ? casas.reduce((s, c) => s + (c.trustScore || 0), 0) / casas.length
      : 8.4;
  const totalAvaliacoes = data.stats?.totalAvaliacoes ?? 0;

  return (
    <section
      className="relative overflow-hidden border-y border-border/70 bg-surface-2/60 py-20 lg:py-28"
      aria-labelledby="confianca-titulo"
    >
      <div className="absolute inset-0 bg-fiber opacity-50" aria-hidden="true" />
      <div className="container-page relative grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <Reveal className="flex flex-col gap-8">
          <SectionHeading
            align="left"
            eyebrow="Confiança e transparência"
            id="confianca-titulo"
            title="A confiança é construída com transparência"
            description="O AxéMap foi desenhado para proteger a integridade dos dados e das histórias de cada casa e de cada comunidade."
          />
          <ul className="grid gap-4 sm:grid-cols-2">
            {pilares.map((p) => (
              <li
                key={p.titulo}
                className="rounded-2xl border border-border bg-card p-5 transition-all duration-[var(--duration-base)] hover:-translate-y-0.5 hover:border-copper/40 hover:shadow-md"
              >
                <span className="mb-3 inline-flex size-10 items-center justify-center rounded-xl bg-copper-soft text-copper-strong">
                  <p.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="font-display text-base font-semibold text-foreground">{p.titulo}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.texto}</p>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="rounded-3xl border border-border bg-card p-8 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Trust Score médio</p>
                <p className="font-display text-sm font-semibold text-foreground">na plataforma</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-fern/10 px-3 py-1 text-xs font-semibold text-fern">
                <ShieldCheck className="size-3.5" aria-hidden="true" />
                Confiável
              </span>
            </div>

            <div className="relative mx-auto my-6 w-fit">
              <DonutChart
                data={[
                  { label: 'Trust Score', value: Math.round(avgTrust) },
                  { label: 'Melhoria', value: Math.round(Math.max(0, 10 - avgTrust)) },
                ]}
                size={200}
                thickness={20}
                ariaLabel="Índice de confiança médio das casas"
              />
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-5xl font-bold text-copper-strong">
                  {avgTrust.toFixed(1)}
                </span>
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  / 10
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-accent/50 px-4 py-3 text-sm">
              <span className="text-muted-foreground">Avaliações verificadas</span>
              <span className="font-display text-lg font-bold text-foreground">
                {new Intl.NumberFormat('pt-BR').format(totalAvaliacoes)}
              </span>
            </div>

            <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground">
              Nenhum pagamento ou influência externa altera a pontuação. O índice vem
              exclusivamente da confiança demonstrada pela comunidade.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}