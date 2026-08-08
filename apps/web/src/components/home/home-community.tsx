import Link from 'next/link';
import { SectionHeading } from './section-heading';
import { Reveal } from './reveal';
import { MessagesSquare, BookOpen, HeartHandshake, Users2, Quote } from 'lucide-react';
import type { HomeData } from './data';

const espacos = [
  {
    icon: MessagesSquare,
    titulo: 'Discussões',
    texto: 'Participe de conversas respeitosas sobre tradições, práticas e saberes.',
    href: '/tradicao',
  },
  {
    icon: BookOpen,
    titulo: 'Histórias',
    texto: 'Conheça os caminhos, as lutas e as memórias das casas e de seus zeladores.',
    href: '/central-evolucao',
  },
  {
    icon: HeartHandshake,
    titulo: 'Projetos culturais',
    texto: 'Ações sociais e projetos que fortalecem o território e a comunidade.',
    href: '/acoes-sociais',
  },
  {
    icon: Users2,
    titulo: 'Conexões',
    texto: 'Encontre pessoas, coletivos e casas que caminham na mesma direção.',
    href: '/busca',
  },
];

export function HomeCommunity({ data }: { data: HomeData }) {
  void data;
  return (
    <section className="container-page py-20 lg:py-28" aria-labelledby="comunidade-titulo">
      <Reveal>
        <SectionHeading
          eyebrow="Comunidade"
          id="comunidade-titulo"
          title="Um território de encontro e pertencimento"
          description="O AxéMap é feito por e para as comunidades de matriz africana. Um espaço onde a memória encontra o futuro."
        />
      </Reveal>

      <div className="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <figure className="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl bg-hero p-8 text-ivory shadow-lg">
            <Quote className="size-8 text-copper" aria-hidden="true" />
            <blockquote className="mt-6 font-display text-2xl font-semibold leading-snug">
              &ldquo;Aqui a minha casa deixa de ser uma página e vira um lugar. Pessoas
              chegam sabendo quem somos, respeitando nossa história e querendo aprender.&rdquo;
            </blockquote>
            <figcaption className="mt-6 text-sm text-ivory/70">
              <span className="font-semibold text-white">Mãe de santo ·</span> Candomblé,
              Recife — PE
            </figcaption>
          </figure>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2">
          {espacos.map((e, i) => (
            <Reveal key={e.titulo} delay={i * 0.05}>
              <Link
                href={e.href}
                className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-[var(--duration-base)] ease-[var(--ease-out)] hover:-translate-y-1 hover:border-copper/40 hover:shadow-md"
              >
                <span className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-copper-soft text-copper-strong">
                  <e.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="font-display text-lg font-semibold text-foreground transition-colors group-hover:text-copper-strong">
                  {e.titulo}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{e.texto}</p>
                <span className="mt-auto pt-4 text-sm font-semibold text-copper">
                  Explorar <span aria-hidden="true">→</span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
