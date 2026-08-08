import { SectionHeading } from './section-heading';
import { Reveal } from './reveal';
import { Quote, Flame } from 'lucide-react';

export function HomeStory() {
  return (
    <section className="container-page py-20 lg:py-28" aria-labelledby="historia-titulo">
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_1fr]">
        <Reveal className="flex flex-col gap-8">
          <SectionHeading
            align="left"
            eyebrow="História e propósito"
            id="historia-titulo"
            title="Nasceu do respeito, cresce pela comunidade"
          />

          <div className="flex flex-col gap-5 text-base leading-relaxed text-muted-foreground">
            <p>
              Por muito tempo, conhecer uma casa de matriz africana dependia de quem você
              conhecia. E, com a chegada da internet, veio também a desinformação, o
              preconceito e a apropriação indevida dos saberes.
            </p>
            <p>
              O AxéMap nasceu para dar às religiões de matriz africana o mesmo cuidado e a
              mesma tecnologia que qualquer produto de ponta oferece ao mundo — colocando o
              território, a memória e a confiança no centro.
            </p>
            <p>
              Aqui, cada casa conta a própria história. Cada tradição é respeitada como é. E
              cada pessoa encontra um caminho seguro para pertencer, aprender e contribuir.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <figure className="relative overflow-hidden rounded-3xl bg-hero p-8 text-ivory shadow-lg lg:p-10">
            <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(500px 300px at 80% 10%, hsl(var(--copper) / 0.4), transparent 60%)' }} aria-hidden="true" />
            <Flame className="relative mb-6 text-copper" aria-hidden="true" />
            <blockquote className="relative font-display text-2xl font-semibold leading-snug">
              &ldquo;O axé não é algo que se explica: é algo que se vive. Nossa missão é
              garantir que o mundo possa viver — e respeitar — cada tradição.&rdquo;
            </blockquote>
            <figcaption className="relative mt-6 text-sm text-ivory/70">
              <span className="font-semibold text-white">O manifesto AxéMap</span>
            </figcaption>
            <Quote className="absolute bottom-6 right-6 size-10 text-ivory/10" aria-hidden="true" />
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
