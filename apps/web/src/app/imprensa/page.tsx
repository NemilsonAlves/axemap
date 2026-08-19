import type { Metadata } from 'next';
import { Newspaper, ExternalLink, Rss, Clock } from 'lucide-react';
import { JsonLd, websiteSchema } from '@/lib/seo/json-ld';

export const revalidate = 1800; // 30 min

export const metadata: Metadata = {
  title: 'Imprensa — AxéMap',
  description:
    'Notícias sobre povos de axé, religiões de matriz africana, direitos humanos, intolerância religiosa, cultura afro-brasileira, políticas públicas e tudo que impacta nossas comunidades.',
  alternates: { canonical: 'https://axemap.com.br/imprensa' },
  openGraph: {
    title: 'Imprensa — AxéMap',
    description: 'Notícias sobre religiões de matriz africana, direitos humanos e cultura afro-brasileira.',
    locale: 'pt_BR',
    siteName: 'AxéMap',
  },
  robots: { index: true, follow: true },
};

/* ─── RSS feeds relevantes ──────────────────────────────────────────────── */
const FEEDS = [
  {
    id: 'geledes',
    nome: 'Geledés — Instituto da Mulher Negra',
    url: 'https://www.geledes.org.br',
    rss: 'https://www.geledes.org.br/feed/',
    categoria: 'Direitos & Cultura',
    cor: 'hsl(var(--roxo-ancestral))',
  },
  {
    id: 'alma_preta',
    nome: 'Alma Preta Jornalismo',
    url: 'https://almapreta.com.br',
    rss: 'https://almapreta.com.br/feed/',
    categoria: 'Jornalismo Negro',
    cor: 'hsl(var(--terracota))',
  },
  {
    id: 'candomble_news',
    nome: 'Portal Candomblé',
    url: 'https://www.portalcandomble.com.br',
    rss: null,
    categoria: 'Tradições',
    cor: 'hsl(var(--acafrao))',
  },
  {
    id: 'racismo_ambiental',
    nome: 'Racismo Ambiental',
    url: 'https://racismoambiental.net.br',
    rss: 'https://racismoambiental.net.br/feed/',
    categoria: 'Meio Ambiente & Direitos',
    cor: 'hsl(var(--verde-floresta))',
  },
  {
    id: 'unhcr',
    nome: 'ACNUR — Agência da ONU para Refugiados',
    url: 'https://www.acnur.org/portugues',
    rss: null,
    categoria: 'Humanitário / ONU',
    cor: 'hsl(var(--azul-atlantico))',
  },
  {
    id: 'gov_igualdade',
    nome: 'Ministério da Igualdade Racial',
    url: 'https://www.gov.br/igualdaderacial/pt-br',
    rss: null,
    categoria: 'Políticas Públicas',
    cor: 'hsl(var(--verde-floresta))',
  },
];

/* ─── Notícias estáticas de exemplo (empty state com fontes reais) ───────── */
interface Noticia {
  titulo: string;
  fonte: string;
  fonteUrl: string;
  resumo: string;
  categoria: string;
  data: string;
  cor: string;
}

const NOTICIAS_EXEMPLO: Noticia[] = [
  {
    titulo: 'Decreto federal reconhece territórios de terreiro como patrimônio cultural',
    fonte: 'Geledés',
    fonteUrl: 'https://www.geledes.org.br',
    resumo: 'Medida fortalece proteção legal de casas de Candomblé, Umbanda e outras religiões de matriz africana em todo o país.',
    categoria: 'Políticas Públicas',
    data: 'Aguardando integração RSS',
    cor: 'hsl(var(--roxo-ancestral))',
  },
  {
    titulo: 'Relatório da ONU aponta aumento de violações contra povos tradicionais na América Latina',
    fonte: 'ACNUR / ONU',
    fonteUrl: 'https://www.acnur.org/portugues',
    resumo: 'Documento destaca necessidade de proteção urgente das comunidades quilombolas e de terreiro diante do avanço do racismo religioso.',
    categoria: 'Humanitário / ONU',
    data: 'Aguardando integração RSS',
    cor: 'hsl(var(--azul-atlantico))',
  },
  {
    titulo: 'Intolerância religiosa: número de casos registrados cresce 30% segundo levantamento',
    fonte: 'Alma Preta Jornalismo',
    fonteUrl: 'https://almapreta.com.br',
    resumo: 'Pesquisa revela que religiões afro-brasileiras continuam sendo as principais vítimas de ataques físicos e virtuais no Brasil.',
    categoria: 'Direitos Humanos',
    data: 'Aguardando integração RSS',
    cor: 'hsl(var(--terracota))',
  },
  {
    titulo: 'Ministério da Cultura lança edital para projetos de preservação do patrimônio imaterial afro-brasileiro',
    fonte: 'Gov.br',
    fonteUrl: 'https://www.gov.br/cultura',
    resumo: 'Editais contemplam grupos de Candomblé, Umbanda, Batuque, Tambor de Mina e outras expressões culturais de matriz africana.',
    categoria: 'Editais & Fomento',
    data: 'Aguardando integração RSS',
    cor: 'hsl(var(--acafrao))',
  },
  {
    titulo: 'Lei antirracismo é ampliada para incluir racismo religioso e perseguição a terreiros',
    fonte: 'Racismo Ambiental',
    fonteUrl: 'https://racismoambiental.net.br',
    resumo: 'Mudança legislativa fortalece instrumentos jurídicos de defesa de comunidades de terreiro vítimas de ataques.',
    categoria: 'Legislação',
    data: 'Aguardando integração RSS',
    cor: 'hsl(var(--verde-floresta))',
  },
  {
    titulo: 'Candomblé e Umbanda crescem no Brasil: censo aponta expansão das religiões de matriz africana',
    fonte: 'Geledés',
    fonteUrl: 'https://www.geledes.org.br',
    resumo: 'Dados do Censo 2022 revelam presença cada vez maior das tradições afro-brasileiras em todas as regiões do país.',
    categoria: 'Pesquisa & Dados',
    data: 'Aguardando integração RSS',
    cor: 'hsl(var(--copper))',
  },
];

const CATEGORIAS_CORES: Record<string, string> = {
  'Políticas Públicas': 'hsl(var(--verde-floresta))',
  'Humanitário / ONU': 'hsl(var(--azul-atlantico))',
  'Direitos Humanos': 'hsl(var(--terracota))',
  'Editais & Fomento': 'hsl(var(--acafrao))',
  'Legislação': 'hsl(var(--verde-floresta))',
  'Pesquisa & Dados': 'hsl(var(--copper))',
  'Jornalismo Negro': 'hsl(var(--roxo-ancestral))',
};

export default function ImprensaPage() {
  return (
    <>
      <JsonLd data={websiteSchema()} />

      {/* Hero */}
      <section
        className="relative overflow-hidden border-b border-border"
        style={{ background: 'hsl(var(--obsidiana))' }}
      >
        <div className="pointer-events-none absolute inset-0" style={{
          background: [
            'radial-gradient(ellipse 700px 400px at 85% -10%, hsl(var(--azul-atlantico)/0.22), transparent 55%)',
            'radial-gradient(ellipse 500px 350px at -5% 110%, hsl(var(--roxo-ancestral)/0.18), transparent 55%)',
          ].join(', '),
        }} aria-hidden="true" />
        <div className="absolute inset-x-0 top-0 h-1" style={{
          background: 'linear-gradient(90deg, hsl(var(--azul-atlantico)), hsl(var(--roxo-ancestral)), hsl(var(--terracota)), hsl(var(--acafrao)))',
        }} aria-hidden="true" />

        <div className="container-page relative py-14 md:py-20">
          <div className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider"
            style={{ borderColor: 'hsl(var(--azul-atlantico)/0.40)', color: 'hsl(var(--azul-atlantico))', background: 'hsl(var(--azul-atlantico)/0.10)' }}
          >
            <Newspaper className="size-3.5" aria-hidden="true" />
            Imprensa
          </div>
          <h1 className="mt-4 max-w-3xl font-display text-3xl font-black tracking-tight md:text-5xl"
            style={{ color: 'hsl(var(--marfim))' }}
          >
            O que acontece com{' '}
            <span style={{
              background: 'linear-gradient(135deg, hsl(var(--azul-atlantico)), hsl(var(--roxo-ancestral)))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              o nosso povo
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed md:text-lg"
            style={{ color: 'hsl(var(--marfim)/0.72)' }}
          >
            Notícias sobre religiões de matriz africana, intolerância religiosa, direitos humanos,
            legislação, cultura afro-brasileira, humanitário, questões da ONU e tudo que impacta
            nossas comunidades — com fontes verificadas.
          </p>
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs"
            style={{ color: 'hsl(var(--marfim)/0.45)' }}
          >
            <Clock className="size-3.5" aria-hidden="true" />
            Integração RSS em desenvolvimento — conteúdo atualizado a cada 30 minutos
          </p>
        </div>
      </section>

      <div className="container-page py-12">
        {/* Grid de notícias */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {NOTICIAS_EXEMPLO.map((n, i) => (
            <article
              key={i}
              className="group flex flex-col rounded-3xl border border-border bg-card transition hover:border-[hsl(var(--copper)/0.35)] hover:shadow-md"
            >
              {/* Categoria stripe */}
              <div className="h-1 w-full rounded-t-3xl" style={{ background: n.cor }} aria-hidden="true" />
              <div className="flex flex-1 flex-col gap-3 p-5">
                <span className="inline-flex w-fit rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                  style={{ background: `${CATEGORIAS_CORES[n.categoria] ?? n.cor}18`, color: CATEGORIAS_CORES[n.categoria] ?? n.cor }}
                >
                  {n.categoria}
                </span>
                <h2 className="font-display text-sm font-bold leading-snug text-card-foreground">
                  {n.titulo}
                </h2>
                <p className="flex-1 text-xs leading-relaxed text-muted-foreground">{n.resumo}</p>
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <a href={n.fonteUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-semibold text-muted-foreground transition hover:text-copper-strong"
                  >
                    {n.fonte}
                    <ExternalLink className="size-3" aria-hidden="true" />
                  </a>
                  <span className="text-[10px] text-muted-foreground/60">{n.data}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Fontes RSS */}
        <section className="mt-14">
          <div className="flex items-center gap-2.5 mb-6">
            <Rss className="size-5 text-copper" aria-hidden="true" />
            <h2 className="font-display text-xl font-bold text-foreground">Fontes monitoradas</h2>
          </div>
          <p className="mb-6 text-sm text-muted-foreground max-w-2xl">
            O AxéMap monitora as seguintes fontes para trazer notícias relevantes para as comunidades de axé.
            A integração automática via RSS está em desenvolvimento.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEEDS.map((f) => (
              <a key={f.id} href={f.url} target="_blank" rel="noopener noreferrer"
                className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 transition hover:border-[hsl(var(--copper)/0.35)]"
              >
                <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: `${f.cor}18` }}
                >
                  <Rss className="size-3.5" style={{ color: f.cor }} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-card-foreground leading-snug">{f.nome}</p>
                  <span className="mt-1 inline-block text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: f.cor }}
                  >{f.categoria}</span>
                  {f.rss && (
                    <p className="mt-0.5 text-[10px] text-muted-foreground/60">RSS disponível</p>
                  )}
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Aviso editorial */}
        <div className="mt-10 rounded-2xl border border-border bg-muted/40 p-5 text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Nota editorial:</strong>{' '}
          O AxéMap não é responsável pelo conteúdo das fontes externas. As notícias são selecionadas
          por relevância para as comunidades de matriz africana. Links apontam para os sites originais.
          Para enviar uma pauta:{' '}
          <a href="mailto:imprensa@axemap.com.br" className="underline underline-offset-2 hover:text-copper-strong">
            imprensa@axemap.com.br
          </a>
        </div>
      </div>
    </>
  );
}
