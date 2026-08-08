import Link from 'next/link';
import { Reveal } from './reveal';
import { Search, HousePlus, Users, GraduationCap, ArrowRight } from 'lucide-react';

const acoes = [
  { icon: Search, titulo: 'Encontrar uma casa', texto: 'Comece sua busca pelo mapa ou pela tradição.', href: '/busca', destaque: false },
  { icon: HousePlus, titulo: 'Cadastrar um terreiro', texto: 'Coloque sua casa no mapa, com respeito e cuidado.', href: '/onboarding', destaque: true },
  { icon: Users, titulo: 'Participar da comunidade', texto: 'Participe de discussões, histórias e projetos.', href: '/tradicao', destaque: false },
  { icon: GraduationCap, titulo: 'Conhecer os cursos', texto: 'Aprenda com quem vive a tradição todos os dias.', href: '/cursos', destaque: false },
];

export function HomeCTA() {
  return (
    <section className="container-page pb-24 pt-4" aria-labelledby="cta-titulo">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2.5rem] bg-hero px-6 py-16 text-center text-ivory shadow-2xl sm:px-12 lg:py-20">
          <div className="absolute inset-0 bg-fiber opacity-40" aria-hidden="true" />
          <div className="absolute inset-0 opacity-40" style={{ background: 'radial-gradient(700px 420px at 50% 0%, hsl(var(--copper) / 0.35), transparent 60%)' }} aria-hidden="true" />

          <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-ivory/20 bg-ivory/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-ivory/90 backdrop-blur">
              Comece agora
            </span>
            <h2
              id="cta-titulo"
              className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl"
            >
              O axé conecta. O AxéMap aproxima.
            </h2>
            <p className="max-w-xl text-lg text-ivory/85">
              Encontre seu lugar, cadastre sua casa ou fortaleça a comunidade. A tradição
              está a um clique de distância.
            </p>

            <div className="mt-2 grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
              {acoes.map((a) => (
                <Link
                  key={a.titulo}
                  href={a.href}
                  className={`group flex items-center gap-4 rounded-2xl p-4 text-left transition-all duration-[var(--duration-base)] ${
                    a.destaque
                      ? 'bg-brand-gradient text-white shadow-lg shadow-copper/30 hover:brightness-110'
                      : 'border border-ivory/20 bg-ivory/10 text-ivory backdrop-blur hover:bg-ivory/20'
                  }`}
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
                    <a.icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 font-display text-base font-semibold">
                      {a.titulo}
                      <ArrowRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                    </span>
                    <span className={`block text-sm ${a.destaque ? 'text-white/85' : 'text-ivory/75'}`}>
                      {a.texto}
                    </span>
                  </span>
                </Link>
              ))}
            </div>

            <p className="text-xs text-ivory/60">
              Gratuito para quem busca. Construído em parceria com as comunidades.
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
