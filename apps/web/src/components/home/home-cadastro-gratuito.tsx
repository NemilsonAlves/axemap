import Link from 'next/link';
import { ArrowRight, MapPin, ShieldCheck, Tv2 } from 'lucide-react';
import { Reveal } from './reveal';

const BENEFICIOS = [
  { icon: MapPin,       txt: 'Apareça no mapa para todo o Brasil', cor: 'text-copper bg-copper/10' },
  { icon: ShieldCheck,  txt: 'Verificação gratuita disponível',    cor: 'text-verde-floresta bg-verde-floresta/10' },
  { icon: Tv2,          txt: 'Envie conteúdo para a TV AxéMap',    cor: 'text-roxo-ancestral bg-roxo-ancestral/10' },
];

/**
 * HomeCadastroGratuito — seção dedicada ao CTA de cadastro de casa.
 * Posicionamento: "Cadastre sua casa gratuitamente".
 * O cadastro gratuito não reduz nem afeta Trust Score.
 */
export function HomeCadastroGratuito() {
  return (
    <section
      className="relative overflow-hidden border-y border-border/60 py-16 lg:py-20"
      aria-labelledby="cadastro-gratuito-titulo"
      style={{
        background: 'linear-gradient(135deg, hsl(var(--obsidiana)/0.03), hsl(var(--copper)/0.05))',
      }}
    >
      <div className="container-page">
        <div className="flex flex-col items-center gap-8 text-center lg:flex-row lg:gap-16 lg:text-left">

          {/* Texto */}
          <Reveal className="flex-1">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-copper">
              Gratuito para a comunidade
            </p>
            <h2
              id="cadastro-gratuito-titulo"
              className="font-display text-3xl font-black leading-tight tracking-tight lg:text-4xl"
            >
              Cadastre sua casa.{' '}
              <span className="text-brand-gradient">É gratuito.</span>
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
              Coloque sua casa de axé no maior mapa de tradições afro-brasileiras do Brasil.
              Gratuito para sempre — para toda a comunidade.
            </p>

            {/* Benefícios */}
            <ul className="mt-6 flex flex-col gap-3" role="list">
              {BENEFICIOS.map((b) => (
                <li key={b.txt} className="flex items-center gap-3 text-sm font-medium text-foreground">
                  <span className={`inline-flex size-8 shrink-0 items-center justify-center rounded-lg ${b.cor}`}>
                    <b.icon className="size-4" aria-hidden="true" />
                  </span>
                  {b.txt}
                </li>
              ))}
            </ul>
          </Reveal>

          {/* CTA card */}
          <Reveal delay={0.1} className="w-full max-w-sm shrink-0 lg:w-auto">
            <div className="rounded-3xl border border-border bg-card p-8 shadow-lg shadow-border/50">
              <p className="font-display text-lg font-black text-foreground">
                Comece agora mesmo
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Sem cartão de crédito. Sem cobrança. Sem prazo.
              </p>

              <Link
                href="/auth/cadastro"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-black text-[hsl(var(--obsidiana-deep))] shadow-lg transition hover:brightness-110"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--acafrao)), hsl(var(--copper)))',
                  boxShadow: '0 4px 20px hsl(var(--copper)/0.35)',
                }}
              >
                Cadastrar minha casa — Grátis
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>

              <Link
                href="/mapa"
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-border px-6 py-3 text-sm font-semibold transition hover:bg-accent"
              >
                Ver o mapa primeiro
              </Link>

              <p className="mt-4 text-center text-[11px] text-muted-foreground">
                Cadastro gratuito não afeta Trust Score ou verificação.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
