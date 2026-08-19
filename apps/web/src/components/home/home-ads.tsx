import Link from 'next/link';
import { ArrowRight, Megaphone, ShieldCheck } from 'lucide-react';
import { Reveal } from './reveal';

const FORMATOS = [
  { titulo: 'Banner Home',        desc: 'Posição de destaque na página principal.' },
  { titulo: 'Banner no Mapa',     desc: 'Alcance quem explora comunidades no mapa.' },
  { titulo: 'Card Patrocinado',   desc: 'Identificado como PATROCINADO na listagem.' },
  { titulo: 'Evento Patrocinado', desc: 'Destaque para seu evento cultural.' },
];

/**
 * HomeAds — seção de publicidade na Home.
 *
 * REGRA: publicidade nunca altera Trust Score, verificação ou posição orgânica.
 * Todo anúncio exibe rótulo "PATROCINADO".
 */
export function HomeAds() {
  return (
    <section
      className="relative overflow-hidden border-y border-border/60 bg-muted/20 py-16 lg:py-20"
      aria-labelledby="ads-home-titulo"
    >
      <div className="container-page">
        <Reveal>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
            {/* Texto */}
            <div className="max-w-lg">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                <Megaphone className="size-3" aria-hidden="true" />
                AxéMap ADS
                <span
                  className="ml-1 rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-black tracking-wider text-primary"
                  aria-label="Publicidade"
                >
                  PATROCINADO
                </span>
              </div>

              <h2
                id="ads-home-titulo"
                className="font-display text-2xl font-black tracking-tight lg:text-3xl"
              >
                Anuncie para a comunidade
              </h2>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                Alcance terreiros, casas e toda a comunidade afro-brasileira com publicidade
                transparente e culturalmente relevante.
              </p>

              {/* Garantia */}
              <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-semibold text-muted-foreground">
                <ShieldCheck className="size-4 text-verde-floresta shrink-0" aria-hidden="true" />
                Publicidade nunca afeta Trust Score ou verificação
              </div>
            </div>

            {/* Grid de formatos */}
            <div className="grid grid-cols-2 gap-3 lg:w-[360px] lg:shrink-0">
              {FORMATOS.map((f) => (
                <div
                  key={f.titulo}
                  className="rounded-2xl border border-border bg-card p-4"
                >
                  <p className="text-xs font-bold text-foreground">{f.titulo}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/ads"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              <Megaphone className="size-4" aria-hidden="true" />
              Conhecer o AxéMap ADS
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/ads/anunciar"
              className="inline-flex items-center gap-2 rounded-2xl border border-border px-6 py-3 text-sm font-semibold transition hover:bg-accent"
            >
              Solicitar orçamento
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
