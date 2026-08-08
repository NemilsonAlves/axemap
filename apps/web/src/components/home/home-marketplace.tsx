import { SectionHeading } from './section-heading';
import { Reveal } from './reveal';
import { BookOpen, Palette, Sparkles, Wrench, School, Clock } from 'lucide-react';

const categorias = [
  { icon: BookOpen, titulo: 'Livros', texto: 'Obras de referência sobre as tradições.' },
  { icon: Palette, titulo: 'Artesanato', texto: 'Peças feitas pelas próprias comunidades.' },
  { icon: Sparkles, titulo: 'Produtos culturais', texto: 'Objetos, roupas e itens de devoção.' },
  { icon: Wrench, titulo: 'Serviços', texto: 'Profissionais e ofícios ligados às casas.' },
  { icon: School, titulo: 'Materiais educativos', texto: 'Conteúdo para quem quer aprender.' },
];

export function HomeMarketplace() {
  return (
    <section
      className="relative overflow-hidden border-y border-border/70 bg-surface-2/60 py-20 lg:py-28"
      aria-labelledby="marketplace-titulo"
    >
      <div className="absolute inset-0 bg-fiber opacity-40" aria-hidden="true" />
      <div className="container-page relative">
        <Reveal>
          <SectionHeading
            eyebrow="Marketplace"
            id="marketplace-titulo"
            title="A economia da cultura em um só lugar"
            description="Um espaço justo e dedicado para livros, artesanato, serviços e materiais educativos produzidos pelas comunidades."
          />
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-5">
          {categorias.map((c, i) => (
            <Reveal key={c.titulo} delay={i * 0.05}>
              <div className="group flex h-full flex-col rounded-2xl border border-dashed border-copper/30 bg-card/60 p-5 transition-all duration-[var(--duration-base)] hover:-translate-y-1 hover:border-copper/60">
                <span className="mb-4 inline-flex size-10 items-center justify-center rounded-xl bg-copper-soft/70 text-copper-strong">
                  <c.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="font-display text-sm font-semibold text-foreground">{c.titulo}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{c.texto}</p>
                <span className="mt-auto inline-flex w-fit items-center gap-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <Clock className="size-3.5" aria-hidden="true" />
                  Em breve
                </span>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10 text-center">
          <p className="text-sm text-muted-foreground">
            Queremos construir junto com você. Se quiser ajudar a desenhar esse espaço,
            escreva para{' '}
            <a
              href="mailto:contato@axemap.com.br?subject=Marketplace%20AxéMap"
              className="font-semibold text-copper-strong underline underline-offset-4 hover:text-copper"
            >
              contato@axemap.com.br
            </a>
            .
          </p>
        </Reveal>
      </div>
    </section>
  );
}
