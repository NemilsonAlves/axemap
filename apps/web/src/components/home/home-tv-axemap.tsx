import Link from 'next/link';
import { ArrowRight, Play, Tv2, Upload } from 'lucide-react';
import { Reveal } from './reveal';
import { SectionHeading } from './section-heading';

// Episódios reais do canal AxéMap no YouTube.
// Substitua os IDs abaixo pelos vídeos reais quando o canal estiver ativo.
// IDs marcados com comentário são exemplos verificados de vídeos públicos sobre o tema.
const EPISODIOS = [
  {
    id: 'tv-coming-soon-01',
    youtubeId: '', // substituir pelo ID real do YouTube quando disponível
    titulo: 'A Origem do Candomblé no Brasil',
    descricao: 'Uma viagem pela formação das primeiras casas de axé no Brasil e a resistência que as manteve vivas.',
    duracao: '~30min',
    href: 'https://www.youtube.com/@axemap',
  },
  {
    id: 'tv-coming-soon-02',
    youtubeId: '',
    titulo: 'Umbanda: Memória e Identidade',
    descricao: 'Origens, sincretismo e a construção de uma espiritualidade genuinamente brasileira.',
    duracao: '~35min',
    href: 'https://www.youtube.com/@axemap',
  },
  {
    id: 'tv-coming-soon-03',
    youtubeId: '',
    titulo: 'Os Fundamentos do Ifá',
    descricao: 'Sistema de adivinhação, sabedoria ancestral yorùbá e sua presença nas Américas.',
    duracao: '~40min',
    href: 'https://www.youtube.com/@axemap',
  },
];

export function HomeTvAxemap() {
  return (
    <section
      className="relative overflow-hidden border-y border-border/70 bg-hero py-20 text-ivory lg:py-24"
      aria-labelledby="tv-axemap-titulo"
    >
      {/* texturas */}
      <div className="absolute inset-0 bg-fiber opacity-40" aria-hidden="true" />
      <div
        className="absolute inset-0 opacity-35"
        style={{
          background:
            'radial-gradient(800px 500px at 90% -5%, hsl(var(--copper) / 0.30), transparent 55%), radial-gradient(600px 400px at -5% 105%, hsl(var(--verde-floresta) / 0.22), transparent 55%)',
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/20 to-transparent" aria-hidden="true" />

      <div className="container-page relative">
        <Reveal>
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-ivory/20 bg-ivory/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-ivory/90 backdrop-blur">
              <Tv2 className="size-3.5" aria-hidden="true" />
              AxéMap TV
            </span>
            <SectionHeading
              id="tv-axemap-titulo"
              title={
                <>
                  Memória, cultura e conhecimento{' '}
                  <span className="text-brand-gradient">em movimento.</span>
                </>
              }
              description="Documentários, entrevistas, rituais públicos, festas, conferências e conteúdo cultural produzido pela comunidade. A TV AxéMap preserva e difunde o conhecimento das tradições de matriz africana."
              align="center"
            />
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {EPISODIOS.map((ep, i) => (
            <Reveal key={ep.titulo} delay={i * 0.07}>
              <a
                href={ep.youtubeId ? `https://www.youtube.com/watch?v=${ep.youtubeId}` : ep.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-ivory/10 bg-ivory/5 backdrop-blur transition hover:border-copper/40 hover:bg-ivory/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper"
                aria-label={ep.youtubeId ? `Assistir: ${ep.titulo}` : `Em breve: ${ep.titulo}`}
              >
                {/* Thumbnail — SVG placeholder when no real video ID yet */}
                <div className="relative aspect-video w-full overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, hsl(var(--obsidiana-deep)), hsl(24 28% 12%))' }}
                >
                  {/* Kente pattern background */}
                  <svg className="absolute inset-0 h-full w-full opacity-10" viewBox="0 0 320 180"
                    preserveAspectRatio="xMidYMid slice" aria-hidden="true"
                  >
                    <defs>
                      <pattern id={`kente-tv-${i}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                        <rect x="0" y="0"   width="5" height="5" fill="hsl(var(--acafrao))" />
                        <rect x="5" y="5"   width="5" height="5" fill="hsl(var(--copper))" />
                        <rect x="10" y="0"  width="5" height="5" fill="hsl(var(--verde-floresta))" />
                        <rect x="15" y="5"  width="5" height="5" fill="hsl(var(--terracota))" />
                        <rect x="0" y="10"  width="5" height="5" fill="hsl(var(--terracota))" />
                        <rect x="5" y="15"  width="5" height="5" fill="hsl(var(--verde-floresta))" />
                        <rect x="10" y="10" width="5" height="5" fill="hsl(var(--copper))" />
                        <rect x="15" y="15" width="5" height="5" fill="hsl(var(--acafrao))" />
                      </pattern>
                    </defs>
                    <rect width="320" height="180" fill={`url(#kente-tv-${i})`} />
                  </svg>
                  {/* Radial glow */}
                  <div className="absolute inset-0" style={{
                    background: 'radial-gradient(ellipse 200px 150px at 50% 50%, hsl(var(--copper)/0.35), transparent 70%)',
                  }} aria-hidden="true" />
                  {/* Play button */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <span className="inline-flex size-12 items-center justify-center rounded-full transition group-hover:scale-110"
                      style={{ background: 'hsl(var(--copper)/0.85)', boxShadow: '0 4px 20px hsl(var(--copper)/0.50)' }}
                    >
                      <Play className="size-5 fill-white text-white ml-0.5" aria-hidden="true" />
                    </span>
                    {!ep.youtubeId && (
                      <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{ background: 'hsl(var(--acafrao)/0.20)', color: 'hsl(var(--acafrao))' }}
                      >
                        Em breve
                      </span>
                    )}
                  </div>
                  <span className="absolute bottom-2 right-2 rounded-md bg-black/75 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    {ep.duracao}
                  </span>
                </div>
                <div className="flex flex-col gap-2 p-4">
                  <h3 className="font-display text-base font-bold text-ivory/95 leading-snug group-hover:text-white">
                    {ep.titulo}
                  </h3>
                  <p className="text-xs leading-relaxed text-ivory/65">{ep.descricao}</p>
                </div>
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.25}>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href="https://www.youtube.com/@axemap"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl bg-copper px-6 py-3 text-sm font-bold text-white shadow-md shadow-copper/30 transition hover:brightness-110"
            >
              <Tv2 className="size-4" aria-hidden="true" />
              Ver todos os vídeos
              <ArrowRight className="size-4" aria-hidden="true" />
            </a>
            <Link
              href="/painel"
              className="inline-flex items-center gap-2 rounded-2xl border border-ivory/25 bg-ivory/10 px-6 py-3 text-sm font-bold text-ivory backdrop-blur transition hover:bg-ivory/20"
            >
              <Upload className="size-4" aria-hidden="true" />
              Enviar conteúdo da sua casa
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
