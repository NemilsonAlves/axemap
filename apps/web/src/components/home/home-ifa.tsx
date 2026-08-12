import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Landmark,
  Library,
  ScrollText,
  Sparkles,
  Users,
} from 'lucide-react';
import { slugTradicao } from '@/lib/tradicoes';

const ifaLinks = [
  { label: 'História', icon: ScrollText, href: `/tradicao/${slugTradicao('IFA')}` },
  { label: 'Odù e conhecimento', icon: BookOpen, href: `/tradicao/${slugTradicao('IFA')}` },
  { label: 'Literatura oral', icon: Library, href: '/busca?q=Ifá' },
  { label: 'Pesquisadores', icon: GraduationCap, href: '/busca?q=pesquisadores Ifá' },
  { label: 'Comunidades', icon: Users, href: `/tradicao/${slugTradicao('IFA')}` },
  { label: 'Instituições', icon: Landmark, href: '/busca?q=instituições Ifá' },
  { label: 'Eventos', icon: Sparkles, href: '/eventos' },
  { label: 'Biblioteca', icon: Library, href: '/busca?q=livros Ifá' },
];

export function HomeIfa() {
  return (
    <section className="relative overflow-hidden bg-ancestral text-nevoa" aria-labelledby="ifa-titulo">
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background:
            'radial-gradient(820px 480px at 88% -10%, hsl(var(--dourado-sol) / 0.28), transparent 60%), radial-gradient(700px 420px at -10% 110%, hsl(var(--verde-floresta) / 0.3), transparent 55%)',
        }}
        aria-hidden="true"
      />
      <svg
        className="absolute inset-0 h-full w-full opacity-20"
        viewBox="0 0 400 200"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <g fill="none" stroke="hsl(var(--nevoa) / 0.5)" strokeWidth="1.5">
          {[40, 80, 120, 160].map((r) => (
            <circle key={r} cx="360" cy="100" r={r} />
          ))}
          {[30, 60].map((r) => (
            <circle key={r} cx="40" cy="60" r={r} />
          ))}
        </g>
      </svg>

      <div className="container-page relative py-16 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-dourado-sol/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-dourado-sol ring-1 ring-inset ring-dourado-sol/40">
                <Sparkles className="size-3.5" aria-hidden="true" />
                Patrimônio da UNESCO desde 2008
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-nevoa/10 px-3 py-1 text-xs font-semibold text-nevoa/85">
                África · Diáspora
              </span>
            </div>

            <h2 id="ifa-titulo" className="font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              Ifá: um sistema de conhecimento yorùbá{' '}
              <span className="text-dourado-sol">presente na África e na diáspora</span>
            </h2>

            <p className="mt-5 max-w-2xl text-pretty leading-relaxed text-nevoa/85">
              Mais do que uma religião, Ifá é um sistema de conhecimento e adivinhação da tradição yorùbá: o corpus dos 256
              Odù, a filosofia de Orúnmìlà, a literatura oral e a divinação conduzida pelos babalaôs. Reconhecido pela UNESCO
              como Patrimônio Cultural Imaterial da Humanidade desde 2008, é praticado entre comunidades yorùbá e na diáspora
              das Américas e do Caribe.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-nevoa/80 sm:grid-cols-2">
              <p>· História e tradição de Orúnmìlà</p>
              <p>· Os 256 Odù e sua literatura oral</p>
              <p>· Divinação e sistemas de conhecimento</p>
              <p>· Comunidades, instituições e pesquisa</p>
            </div>

            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-nevoa/60">
              Conteúdos restritos ou iniciáticos não são revelados. O AxéMap é uma plataforma de descoberta e conhecimento —
              respeitando os limites e a autoridade das próprias comunidades.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href={`/tradicao/${slugTradicao('IFA')}`}
                className="inline-flex items-center gap-2 rounded-2xl bg-dourado-sol px-6 py-3.5 text-sm font-bold text-ancestral-deep shadow-lg shadow-dourado-sol/25 transition hover:brightness-110"
              >
                Explorar Ifá
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/tradicao"
                className="inline-flex items-center gap-2 text-sm font-semibold text-nevoa/90 underline-offset-4 transition hover:text-white hover:underline"
              >
                Ver todas as tradições
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {ifaLinks.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="group flex items-center gap-3 rounded-2xl border border-nevoa/15 bg-nevoa/[0.06] p-4 transition hover:border-dourado-sol/50 hover:bg-nevoa/[0.1]"
              >
                <l.icon className="size-5 shrink-0 text-dourado-sol" aria-hidden="true" />
                <span className="text-sm font-semibold text-nevoa/90 transition group-hover:text-white">{l.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}