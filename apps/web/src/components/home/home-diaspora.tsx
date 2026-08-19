import Link from 'next/link';
import {
  ArrowRight,
  Compass,
  Globe2,
  Anchor,
  Palmtree,
  Map as MapIcon,
  Flag,
  Landmark,
  Globe,
  Waves,
} from 'lucide-react';
import { slugTradicao, labelTradicao } from '@/lib/tradicoes';

const TERRITORIOS = [
  {
    nome: 'Brasil',
    icon: MapIcon,
    tradicoes: ['CANDOMBLE_KETU', 'CANDOMBLE_ANGOLA', 'UMBANDA', 'BATUQUE', 'TAMBOR_DE_MINA', 'TERECO', 'XANGO'],
  },
  {
    nome: 'Cuba',
    icon: Flag,
    tradicoes: ['REGLA_DE_OCHA', 'PALO', 'ABAKUA', 'IFA'],
  },
  {
    nome: 'Haiti',
    icon: Anchor,
    tradicoes: ['VODOU'],
  },
  {
    nome: 'Caribe',
    icon: Palmtree,
    tradicoes: ['VODOU', 'REGLA_DE_OCHA', 'PALO', 'ABAKUA'],
  },
  {
    nome: 'Estados Unidos',
    icon: Landmark,
    tradicoes: ['IFA', 'VODOU', 'REGLA_DE_OCHA'],
  },
  {
    nome: 'América Latina',
    icon: Globe2,
    tradicoes: ['VODOU', 'REGLA_DE_OCHA', 'PALO', 'UMBANDA'],
  },
  {
    nome: 'Europa',
    icon: Globe,
    tradicoes: ['IFA', 'VODOU', 'REGLA_DE_OCHA', 'PALO'],
  },
  {
    nome: 'Outros territórios',
    icon: Compass,
    tradicoes: ['IFA', 'VODUN_DAOME'],
  },
];

const TRADICOES_DIASPORA = [
  'CANDOMBLE_KETU',
  'CANDOMBLE_ANGOLA',
  'UMBANDA',
  'BATUQUE',
  'TAMBOR_DE_MINA',
  'TERECO',
  'XANGO',
  'VODOU',
  'REGLA_DE_OCHA',
  'PALO',
  'ABAKUA',
  'IFA',
];

export function HomeDiaspora() {
  return (
    <section className="relative overflow-hidden border-y border-border/70 bg-surface-2/60" aria-labelledby="diaspora-titulo">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(780px 420px at 10% -10%, hsl(var(--turquesa) / 0.16), transparent 55%), radial-gradient(640px 380px at 95% 110%, hsl(var(--dourado-sol) / 0.14), transparent 55%)',
        }}
        aria-hidden="true"
      />
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-25"
        viewBox="0 0 400 200"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <g fill="none" stroke="hsl(var(--copper) / 0.35)" strokeWidth="1">
          <path d="M0 140 Q100 80 200 120 T400 90" />
          <path d="M0 160 Q120 100 240 140 T400 110" />
          <path d="M0 180 Q140 120 260 160 T400 130" />
        </g>
      </svg>

      <div className="container-page relative py-20 lg:py-24">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-turquesa/40 bg-turquesa/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-turquesa">
            <Waves className="size-3.5" aria-hidden="true" />
            Diáspora Africana
          </div>
          <h2 id="diaspora-titulo" className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Do outro lado do Atlântico:{' '}
            <span className="text-brand-gradient">história viva, não cópia</span>
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            Da África para o mundo, as tradições se transformaram, se adaptaram e criaram expressões soberanas no Brasil, em
            Cuba, no Haiti, no Caribe, nas Américas e na Europa. Cada diáspora é uma história própria: continuidade,
            transformação, adaptação, criação, memória e intercâmbio.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TERRITORIOS.map((terr) => (
            <div
              key={terr.nome}
              className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-5 transition hover:border-turquesa/40 hover:shadow-lg hover:shadow-turquesa/5"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex size-10 items-center justify-center rounded-xl bg-turquesa/10 text-turquesa">
                  <terr.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="font-display text-lg font-bold text-foreground">{terr.nome}</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {terr.tradicoes.map((t) => (
                  <Link
                    key={t}
                    href={`/tradicao/${slugTradicao(t)}`}
                    className="rounded-full border border-border bg-background/60 px-2.5 py-1 text-xs text-muted-foreground transition hover:border-turquesa/40 hover:text-turquesa"
                  >
                    {labelTradicao(t)}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-3xl border border-copper/25 bg-copper-soft/25 p-6 lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h3 className="font-display text-lg font-bold tracking-tight text-foreground">
                Tradições e expressões afro-diaspóricas
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Cada expressão possui identidade, terminologia e território próprios. No AxéMap, nenhuma tradição diaspórica é
                apresentada como &quot;filha&quot; automática de outra — todas têm relações verificáveis e autônomas.
              </p>
            </div>
            <Link
              href="/tradicao"
              className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-brand-gradient px-5 py-3 text-sm font-bold text-white shadow-md shadow-copper/25 transition hover:brightness-105"
            >
              Explorar a diáspora
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {TRADICOES_DIASPORA.map((t) => (
              <Link
                key={t}
                href={`/tradicao/${slugTradicao(t)}`}
                className="inline-flex items-center rounded-full border border-copper/30 bg-card px-4 py-2 text-sm font-semibold text-copper-strong transition hover:border-copper/60 hover:bg-copper-soft/60"
              >
                {labelTradicao(t)}
                <ArrowRight className="ml-1.5 size-3" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
