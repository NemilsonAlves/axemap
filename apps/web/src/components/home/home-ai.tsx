import Link from 'next/link';
import { SectionHeading } from './section-heading';
import { Reveal } from './reveal';
import { Sparkles, MessageSquareText, SearchCheck, MapPinned, CalendarDays, BookOpen, HeartHandshake, ArrowRight } from 'lucide-react';

const funcoes = [
  { icon: MessageSquareText, texto: 'Responder dúvidas sobre tradições e práticas' },
  { icon: SearchCheck, texto: 'Ajudar em pesquisas e recomendações' },
  { icon: MapPinned, texto: 'Encontrar casas próximas e verificadas' },
  { icon: CalendarDays, texto: 'Descobrir eventos e cursos para você' },
  { icon: BookOpen, texto: 'Explicar conteúdos culturais com respeito' },
];

export function HomeAI() {
  return (
    <section
      className="relative overflow-hidden border-y border-border/70 bg-surface-2/60 py-20 lg:py-28"
      aria-labelledby="ia-titulo"
    >
      <div className="absolute inset-0 bg-fiber opacity-40" aria-hidden="true" />
      <div className="container-page relative grid items-center gap-14 lg:grid-cols-2">
        <Reveal className="flex flex-col gap-8">
          <SectionHeading
            align="left"
            eyebrow="Inteligência artificial"
            id="ia-titulo"
            title="O Assistente AxéMap entende a sua busca"
            description="Pergunte do seu jeito, como numa conversa. O assistente interpreta a intenção e respeita a diversidade de cada tradição."
          />

          <ul className="flex flex-col gap-3">
            {funcoes.map((f) => (
              <li key={f.texto} className="flex items-center gap-3 text-sm font-medium text-foreground">
                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-copper-soft text-copper-strong">
                  <f.icon className="size-4" aria-hidden="true" />
                </span>
                {f.texto}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/busca"
              className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-copper/30 transition hover:brightness-110"
            >
              Experimentar a busca semântica
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-fern/10 px-3 py-1.5 text-xs font-semibold text-fern">
              <HeartHandshake className="size-4" aria-hidden="true" />
              Respeita a diversidade das tradições
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="relative">
            <div className="absolute -inset-5 rounded-[2.5rem] bg-brand-gradient opacity-15 blur-3xl" aria-hidden="true" />
            <div className="relative rounded-3xl border border-border bg-card p-5 shadow-xl sm:p-6">
              <div className="mb-5 flex items-center gap-3 border-b border-border pb-4">
                <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand-gradient text-white">
                  <Sparkles className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-display text-sm font-semibold text-foreground">Assistente AxéMap</p>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="size-1.5 rounded-full bg-fern" aria-hidden="true" />
                    Online · respostas com respeito
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-accent px-4 py-3 text-sm text-foreground">
                  Quero encontrar uma casa perto de mim que tenha eventos abertos.
                </div>
                <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-copper-soft/50 px-4 py-3 text-sm text-copper-strong">
                  Encontrei 3 casas verificadas a menos de 5 km com eventos nesta semana. A
                  primeira delas é o Ilê Axé Oyá, no Recife.
                </div>
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-accent px-4 py-3 text-sm text-foreground">
                  Qual a diferença entre Candomblé e Umbanda?
                </div>
                <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-copper-soft/50 px-4 py-3 text-sm text-copper-strong">
                  São tradições distintas, com origens e práticas próprias. Posso te
                  recomendar cursos introdutórios de cada uma, ministrados por suas casas.
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 rounded-2xl border border-border bg-accent/40 px-4 py-3">
                <Sparkles className="size-4 shrink-0 text-copper" aria-hidden="true" />
                <span className="text-sm text-muted-foreground">Fale com a tradição, do seu jeito…</span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
