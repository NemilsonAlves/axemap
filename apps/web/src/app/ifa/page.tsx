import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Landmark,
  Library,
  MapPin,
  ScrollText,
  Sparkles,
  Users,
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { slugTradicao } from '@/lib/tradicoes';

export const metadata: Metadata = {
  title: 'Ifá — Sistema de conhecimento yorùbá | AxéMap',
  description:
    'Ifá é um sistema de conhecimento e adivinhação de tradição yorùbá: os 256 Odù, a filosofia de Orúnmìlà, literatura oral e divinação dos babalaôs. Patrimônio da UNESCO desde 2008. Conheça história, comunidades, instituições e pesquisa na África e na diáspora.',
  alternates: { canonical: 'https://axemap.com.br/ifa' },
  openGraph: {
    title: 'Ifá — Sistema de conhecimento yorùbá | AxéMap',
    description:
      'História, conhecimento e comunidades do sistema de conhecimento yorùbá Ifá na África e em suas diásporas.',
    locale: 'pt_BR',
    siteName: 'AxéMap',
  },
  robots: { index: true, follow: true },
};

export default async function IfaPage() {
  let totalComunidades = 0;
  try {
    const explore = await api.get<{ tradicoes?: Array<{ nome: string; count: number }> }>('/discovery/explore');
    totalComunidades = (explore?.tradicoes ?? []).find((t) => t.nome === 'IFA')?.count ?? 0;
  } catch {}

  const secoes = [
    { icon: ScrollText, titulo: 'História', texto: 'Orúnmìlà, a tradição oral e o corpus dos 256 Odù.', href: `/tradicao/${slugTradicao('IFA')}` },
    { icon: BookOpen, titulo: 'Odù e conhecimento', texto: 'Os Odù como literatura, filosofia e sistema de pensamento.', href: `/tradicao/${slugTradicao('IFA')}` },
    { icon: Library, titulo: 'Biblioteca', texto: 'Livros, artigos e pesquisas sobre Ifá.', href: '/busca?q=Ifá' },
    { icon: GraduationCap, titulo: 'Pesquisadores', texto: 'Acadêmicos e estudiosos da tradição.', href: '/busca?q=pesquisadores Ifá' },
    { icon: Users, titulo: 'Comunidades', texto: 'Casas e comunidades de Ifá na África e na diáspora.', href: `/tradicao/${slugTradicao('IFA')}` },
    { icon: Landmark, titulo: 'Instituições', texto: 'Instituições e organizações dedicadas a Ifá.', href: '/busca?q=instituições Ifá' },
  ];

  return (
    <main className="relative bg-background">
      <section className="relative overflow-hidden bg-ancestral text-nevoa">
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

        <div className="container-page relative px-4 py-16 lg:py-24">
          <nav className="mb-8 text-sm text-nevoa/70" aria-label="Trilha">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href="/" className="transition hover:text-white">Início</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/tradicao" className="transition hover:text-white">Tradições</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-nevoa" aria-current="page">Ifá</li>
            </ol>
          </nav>

          <div className="max-w-3xl">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-dourado-sol/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-dourado-sol ring-1 ring-inset ring-dourado-sol/40">
                <Sparkles className="size-3.5" aria-hidden="true" />
                Sistema de conhecimento yorùbá
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-nevoa/10 px-3 py-1 text-xs font-semibold text-nevoa/85">
                Patrimônio da UNESCO desde 2008
              </span>
            </div>

            <h1 className="text-balance font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Ifá: sistema de conhecimento e adivinhação{' '}
              <span className="text-dourado-sol">de tradição yorùbá</span>
            </h1>

            <p className="mt-6 max-w-2xl text-pretty leading-relaxed text-nevoa/85 lg:text-lg">
              Ifá não é uma religião entre outras: é um sistema de conhecimento e adivinhação da tradição yorùbá — o corpus
              dos 256 Odù, a filosofia e a literatura oral em torno de Orúnmìlà, e a prática divinatória conduzida pelos
              babalaôs (Awo). Reconhecido pela UNESCO como Patrimônio Cultural Imaterial da Humanidade desde 2008, é vivo na
              África Ocidental e nas diásporas das Américas e do Caribe.
            </p>

            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-nevoa/60">
              Esta classificação é editorial e revisável por especialistas e pela governança cultural do AxéMap. Não
              publicamos segredos iniciáticos, informações ritualísticas privadas ou conteúdos fornecidos sob expectativa de
              confidencialidade. Em divergências conceituais, apresentamos fontes e contextos diferentes.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href={`/tradicao/${slugTradicao('IFA')}`}
                className="inline-flex items-center gap-2 rounded-2xl bg-dourado-sol px-6 py-3.5 text-sm font-bold text-ancestral-deep shadow-lg shadow-dourado-sol/25 transition hover:brightness-110"
              >
                Explorar comunidades de Ifá
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/eventos"
                className="inline-flex items-center gap-2 rounded-2xl border border-nevoa/30 px-6 py-3.5 text-sm font-semibold text-nevoa/90 transition hover:border-nevoa/60 hover:text-white"
              >
                Eventos públicos
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page px-4 py-14 lg:py-20" aria-label="Áreas de Ifá">
        <div className="mb-10 max-w-2xl">
          <p className="mb-3 text-xs font-bold tracking-[0.2em] text-copper uppercase">Conhecimento, pesquisa e memória</p>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground lg:text-4xl">
            Conheça Ifá em sua profundidade
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {secoes.map((s) => (
            <Link
              key={s.titulo}
              href={s.href}
              className="group flex flex-col rounded-3xl border border-border bg-card p-6 transition hover:-translate-y-0.5 hover:border-dourado-sol/60 hover:shadow-lg hover:shadow-dourado-sol/10"
            >
              <s.icon className="size-6 text-copper" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-bold text-foreground">{s.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.texto}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-copper-strong transition group-hover:translate-x-0.5">
                Explorar <ArrowRight className="size-3.5" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center rounded-3xl border border-border bg-card p-6 lg:p-8">
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Comunidades cadastradas no AxéMap</p>
            <p className="mt-1 text-3xl font-extrabold text-brand-gradient">{totalComunidades}</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4 text-copper" aria-hidden="true" />
              África Ocidental · Brasil · Cuba · Caribe · América do Norte · Europa
            </p>
          </div>
          <Link
            href={`/tradicao/${slugTradicao('IFA')}`}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-copper px-6 py-3 text-sm font-bold text-white shadow-lg shadow-copper/25 transition hover:brightness-110"
          >
            Ver comunidades de Ifá
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="container-page px-4 pb-20 lg:pb-28" aria-label="Sobre esta informação">
        <div className="rounded-3xl border border-border bg-muted/40 p-6 lg:p-8">
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Library className="size-5 text-copper" aria-hidden="true" />
            Sobre esta informação
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Esta página é um verbete editorial do AxéMap sobre Ifá, elaborado a partir de fontes comunitárias, institucionais
            e acadêmicas públicas. Não é uma autoridade religiosa nem substitui a palavra das comunidades yorùbá, dos Awo ou
            das instituições de Ifá. Conteúdos restritos ou iniciáticos não são divulgados. Divergências conceituais podem
            ser sinalizadas pelo canal de governança cultural.
          </p>
          <Link
            href="/governanca"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-copper-strong underline-offset-4 transition hover:underline"
          >
            Conheça a governança cultural do AxéMap
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
