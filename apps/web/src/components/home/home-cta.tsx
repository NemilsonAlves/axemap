import Link from 'next/link';
import { Reveal } from './reveal';
import { HousePlus, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';

/**
 * HomeCTA — seção final institucional.
 * "Faça parte do mapa." — convite premium com fundo escuro e elementos gráficos sutis.
 */
export function HomeCTA() {
  return (
    <section className="container-page pb-24 pt-4" aria-labelledby="cta-titulo">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2.5rem] bg-hero px-6 py-20 text-center text-ivory shadow-2xl sm:px-12 lg:py-24">
          <div className="absolute inset-0 bg-fiber opacity-40" aria-hidden="true" />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[3px]"
            style={{
              background: 'linear-gradient(90deg, hsl(var(--verde-floresta)), hsl(var(--acafrao)), hsl(var(--copper)), hsl(var(--terracota)), hsl(var(--roxo-ancestral)), hsl(var(--azul-atlantico)))',
            }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background: [
                'radial-gradient(700px 420px at 50% -10%, hsl(var(--copper) / 0.38), transparent 60%)',
                'radial-gradient(500px 320px at 8% 110%, hsl(var(--verde-floresta) / 0.18), transparent 60%)',
                'radial-gradient(500px 320px at 92% 110%, hsl(var(--roxo-ancestral) / 0.16), transparent 60%)',
              ].join(', '),
            }}
            aria-hidden="true"
          />

          <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-ivory/20 bg-ivory/10 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-ivory/90 backdrop-blur">
              <span className="size-1.5 rounded-full bg-ivory/90" aria-hidden="true" />
              A memória precisa de quem a preserva
            </span>
            <h2
              id="cta-titulo"
              className="font-display text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl"
            >
              Faça parte{' '}
              <span className="text-brand-gradient">do mapa.</span>
            </h2>
            <p className="max-w-xl text-base leading-relaxed text-ivory/85 sm:text-lg">
              Cadastre sua Casa de Axé, conecte sua organização ou ajude a preservar essa
              memória — gratuitamente, com respeito e transparência.
            </p>

            <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row">
              <Link
                href="/auth/cadastro"
                className="group inline-flex w-full items-center justify-center gap-2.5 rounded-2xl px-8 py-4 text-sm font-black text-[hsl(var(--obsidiana-deep))] shadow-lg transition-all hover:brightness-110 hover:scale-[1.02] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--obsidiana))] sm:w-auto"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--acafrao)), hsl(var(--copper)))',
                  boxShadow: '0 8px 30px hsl(var(--copper)/0.4)',
                }}
              >
                <HousePlus className="size-4" aria-hidden="true" />
                Cadastrar Casa de Axé
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>

              <Link
                href="/mapa"
                className="inline-flex w-full items-center justify-center gap-2.5 rounded-2xl border border-ivory/25 bg-ivory/10 px-8 py-4 text-sm font-bold text-ivory backdrop-blur transition-all hover:border-ivory/50 hover:bg-ivory/20 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper sm:w-auto"
              >
                <MapPin className="size-4" aria-hidden="true" />
                Explorar o AxéMap
              </Link>
            </div>

            <p className="flex items-center gap-1.5 text-xs text-ivory/60">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              Gratuito para quem busca. Cadastro nunca afeta Trust Score.
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
