import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchDiscovery } from '@/lib/seo/fetch-discovery';
import { JsonLd, websiteSchema } from '@/lib/seo/json-ld';
import { HandCoins, ShieldCheck, Users, TrendingUp } from 'lucide-react';

export const revalidate = 150;

export const metadata: Metadata = {
  title: 'Círculo de Apoiadores — Sustente o Axé Map',
  description:
    'O Axé Map é gratuito para a comunidade. Apoie para manter a plataforma no ar, preservar o patrimônio cultural e fortalecer as casas de axé. Transparência total e nenhuma influência sobre verificação ou reputação.',
  openGraph: {
    title: 'Círculo de Apoiadores — Axé Map',
    description: 'Sustente o Axé Map com um apoio que vale pela comunidade.',
    locale: 'pt_BR',
    siteName: 'AxéMap',
  },
  alternates: { canonical: 'https://axemap.com.br/apoie' },
  robots: { index: true, follow: true },
};

interface NivelApoio {
  nivel: string;
  valor: number;
  titulo: string;
  descricao: string;
  beneficio: string;
}

interface TransparenciaResumo {
  totalArrecadado: number;
  totalContribuicoes: number;
  totalApoiadores: number;
}

interface Transparencia {
  resumo: TransparenciaResumo;
  porNivel: { nivel: string; total: number; contribuicoes: number }[];
  mural: { nivel: string; valor: number; nome: string; pagoEm: string }[];
}

function formatarBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default async function ApoiePage() {
  const niveisRes = await fetchDiscovery<{ data: NivelApoio[] }>('/apoie/niveis', 150);
  const transp = await fetchDiscovery<Transparencia>('/apoie/transparencia', 150);
  const niveis = niveisRes?.data ?? [];
  const resumo = transp?.resumo;

  return (
    <>
      <JsonLd data={websiteSchema()} />
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-turquoise-soft/40 to-card">
        <div className="container-page py-12 md:py-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-turquoise/25 bg-turquoise/10 px-3 py-1 text-xs font-semibold text-turquoise-strong">
            <HandCoins className="size-3.5" /> Círculo de Apoiadores
          </div>
          <h1 className="font-display mt-4 text-3xl font-bold tracking-tight text-card-foreground md:text-5xl">
            Sustente o Axé Map,{' '}
            <span className="bg-gradient-to-r from-turquoise to-turquoise-strong bg-clip-text text-transparent">
              sem comprar confiança
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
            O Axé Map é e continuará <strong>gratuito para a comunidade</strong>. Seu apoio mantém a
            plataforma no ar, preserva o patrimônio cultural e fortalece as casas de axé — mas{' '}
            <strong>nunca</strong> altera verificação, reputação, autoridade ou posição orgânica de
            ninguém. Dinheiro compra serviços e publicidade, nunca confiança.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="#niveis"
              className="inline-flex items-center gap-2 rounded-full bg-turquoise px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-turquoise-strong"
            >
              Quero apoiar
            </Link>
            <Link
              href="/transparencia"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-card-foreground transition hover:bg-muted"
            >
              Ver transparência
            </Link>
          </div>
        </div>
      </section>

      <section className="container-page py-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5">
            <TrendingUp className="size-5 text-turquoise-strong" />
            <p className="mt-3 text-2xl font-bold text-card-foreground">
              {resumo ? formatarBRL(resumo.totalArrecadado) : '—'}
            </p>
            <p className="text-sm text-muted-foreground">total arrecadado com apoios</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <Users className="size-5 text-turquoise-strong" />
            <p className="mt-3 text-2xl font-bold text-card-foreground">{resumo?.totalApoiadores ?? '—'}</p>
            <p className="text-sm text-muted-foreground">pessoas no círculo</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <ShieldCheck className="size-5 text-turquoise-strong" />
            <p className="mt-3 text-2xl font-bold text-card-foreground">{resumo?.totalContribuicoes ?? '—'}</p>
            <p className="text-sm text-muted-foreground">contribuições confirmadas</p>
          </div>
        </div>
      </section>

      <section id="niveis" className="container-page pb-16">
        <h2 className="font-display text-2xl font-bold text-card-foreground">Escolha seu nível de apoio</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Níveis mensais ou avulsos. Em breve, o fluxo de pagamento será integrado a um provedor
          (Pix e cartão). Você pode apoiar de forma anônima.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {niveis.map((n) => (
            <div
              key={n.nivel}
              className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition hover:border-turquoise/40"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-turquoise-strong">{n.titulo}</p>
              <p className="mt-2 text-3xl font-bold text-card-foreground">{formatarBRL(n.valor)}</p>
              <p className="mt-3 text-sm text-muted-foreground">{n.descricao}</p>
              <p className="mt-3 border-t border-border pt-3 text-xs text-card-foreground/80">{n.beneficio}</p>
              <Link
                href="/auth/login"
                className="mt-5 inline-flex items-center justify-center rounded-full border border-turquoise bg-turquoise/10 px-4 py-2 text-sm font-semibold text-turquoise-strong transition hover:bg-turquoise/20"
              >
                Apoiar agora
              </Link>
            </div>
          ))}
        </div>
      </section>

      {transp && transp.mural.length > 0 && (
        <section className="container-page pb-16">
          <h2 className="font-display text-2xl font-bold text-card-foreground">Mural de apoiadores</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Apoios confirmados e não anônimos. Valores individuais de apoiadores anônimos nunca são expostos.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {transp.mural.map((m) => (
              <div key={`${m.nome}-${m.pagoEm}`} className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-turquoise/15 font-bold text-turquoise-strong">
                  {m.nome.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-card-foreground">{m.nome}</p>
                  <p className="text-xs text-muted-foreground">{formatarBRL(m.valor)} · {m.nivel}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
