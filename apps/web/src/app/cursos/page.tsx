import type { Metadata } from 'next';
import { GraduationCap, ExternalLink, Gift, Star, BookOpen, Globe } from 'lucide-react';
import { JsonLd, websiteSchema } from '@/lib/seo/json-ld';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Cursos Gratuitos — AxéMap',
  description:
    'Cursos gratuitos do governo e instituições públicas para comunidades de terreiro, lideranças religiosas, pesquisadores e profissionais da cultura afro-brasileira.',
  alternates: { canonical: 'https://axemap.com.br/cursos' },
  openGraph: {
    title: 'Cursos Gratuitos — AxéMap',
    description: 'Educação gratuita para comunidades de matriz africana: cursos do governo, SECADI, SEAD e parceiros.',
    locale: 'pt_BR',
    siteName: 'AxéMap',
  },
  robots: { index: true, follow: true },
};

interface Curso {
  titulo: string;
  instituicao: string;
  plataforma: string;
  href: string;
  descricao: string;
  duracao?: string;
  nivel?: string;
  gratuito: true;
  categoria: string;
  cor: string;
  destaque?: boolean;
}

const CURSOS: Curso[] = [
  {
    titulo: 'Diversidade Religiosa e Direitos Humanos',
    instituicao: 'ENAP — Escola Nacional de Administração Pública',
    plataforma: 'EV.G — Escola Virtual do Governo',
    href: 'https://www.escolavirtual.gov.br',
    descricao: 'Compreenda os marcos legais de proteção à liberdade religiosa e os direitos das comunidades tradicionais no Brasil.',
    duracao: '20h',
    nivel: 'Básico',
    gratuito: true,
    categoria: 'Direitos & Cidadania',
    cor: 'hsl(var(--azul-atlantico))',
    destaque: true,
  },
  {
    titulo: 'Cultura Afro-Brasileira e Indígena — Lei 10.639/11.645',
    instituicao: 'SECADI / MEC',
    plataforma: 'EV.G — Escola Virtual do Governo',
    href: 'https://www.escolavirtual.gov.br',
    descricao: 'Capacitação para aplicação das Leis 10.639/03 e 11.645/08 na educação básica e na valorização das culturas africanas e indígenas.',
    duracao: '40h',
    nivel: 'Intermediário',
    gratuito: true,
    categoria: 'Educação & Cultura',
    cor: 'hsl(var(--acafrao))',
    destaque: true,
  },
  {
    titulo: 'Políticas de Igualdade Racial',
    instituicao: 'Ministério da Igualdade Racial',
    plataforma: 'EV.G — Escola Virtual do Governo',
    href: 'https://www.escolavirtual.gov.br',
    descricao: 'Formação em políticas públicas de combate ao racismo e promoção da igualdade racial para gestores e lideranças comunitárias.',
    duracao: '30h',
    nivel: 'Intermediário',
    gratuito: true,
    categoria: 'Políticas Públicas',
    cor: 'hsl(var(--verde-floresta))',
  },
  {
    titulo: 'Salvaguarda do Patrimônio Cultural Imaterial',
    instituicao: 'IPHAN',
    plataforma: 'EV.G — Escola Virtual do Governo',
    href: 'https://www.escolavirtual.gov.br',
    descricao: 'Metodologias de identificação, documentação e salvaguarda de bens culturais imateriais — essencial para comunidades de terreiro.',
    duracao: '25h',
    nivel: 'Básico',
    gratuito: true,
    categoria: 'Patrimônio & Memória',
    cor: 'hsl(var(--terracota))',
  },
  {
    titulo: 'Gestão de Organizações da Sociedade Civil (OSC)',
    instituicao: 'ENAP',
    plataforma: 'EV.G — Escola Virtual do Governo',
    href: 'https://www.escolavirtual.gov.br',
    descricao: 'Gestão, prestação de contas, captação de recursos e formalização para associações e entidades religiosas.',
    duracao: '20h',
    nivel: 'Básico',
    gratuito: true,
    categoria: 'Gestão Comunitária',
    cor: 'hsl(var(--roxo-ancestral))',
  },
  {
    titulo: 'PRONATEC — Cursos Técnicos Gratuitos',
    instituicao: 'MEC / SENAI / SENAC',
    plataforma: 'Acesso Escola',
    href: 'https://www.gov.br/mec/pt-br/areas-de-atuacao/educacao-basica/pronatec',
    descricao: 'Mais de 250 cursos técnicos gratuitos para jovens e adultos em todo o Brasil, incluindo cursos na área de artes e cultura.',
    nivel: 'Técnico',
    gratuito: true,
    categoria: 'Formação Profissional',
    cor: 'hsl(var(--copper))',
  },
  {
    titulo: 'Liderança Comunitária e Advocacy',
    instituicao: 'SEBRAE / Parceiros',
    plataforma: 'SEBRAE Play',
    href: 'https://play.sebrae.com.br',
    descricao: 'Ferramentas de liderança, mobilização social e advocacy para lideranças de comunidades e organizações tradicionais.',
    duracao: '8h',
    nivel: 'Básico',
    gratuito: true,
    categoria: 'Liderança',
    cor: 'hsl(var(--dourado-sol))',
  },
  {
    titulo: 'Registro e Documentação de Bens Culturais',
    instituicao: 'IPHAN / SECULT',
    plataforma: 'EV.G — Escola Virtual do Governo',
    href: 'https://www.escolavirtual.gov.br',
    descricao: 'Como documentar e registrar elementos culturais de comunidades tradicionais, incluindo liturgias públicas, festas e territórios.',
    duracao: '15h',
    nivel: 'Básico',
    gratuito: true,
    categoria: 'Patrimônio & Memória',
    cor: 'hsl(var(--terracota))',
  },
];

const PLATAFORMAS = [
  { nome: 'EV.G — Escola Virtual do Governo', href: 'https://www.escolavirtual.gov.br', descricao: 'Portal oficial com centenas de cursos gratuitos do governo federal.', cor: 'hsl(var(--azul-atlantico))' },
  { nome: 'PROUNI / SISU', href: 'https://www.gov.br/mec/pt-br', descricao: 'Programas de acesso ao ensino superior gratuito ou com bolsa.', cor: 'hsl(var(--verde-floresta))' },
  { nome: 'Cursa — Cursos Gratuitos', href: 'https://cursa.com.br', descricao: 'Plataforma com cursos gratuitos certificados de diversas áreas.', cor: 'hsl(var(--acafrao))' },
  { nome: 'SENAI Gratuito', href: 'https://www.senai.br', descricao: 'Cursos técnicos gratuitos para comunidades de baixa renda.', cor: 'hsl(var(--terracota))' },
];

export default function CursosPage() {
  const destaques = CURSOS.filter((c) => c.destaque);
  const demais    = CURSOS.filter((c) => !c.destaque);

  return (
    <>
      <JsonLd data={websiteSchema()} />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border" style={{ background: 'hsl(var(--obsidiana))' }}>
        <div className="pointer-events-none absolute inset-0" style={{
          background: [
            'radial-gradient(ellipse 700px 400px at 85% -10%, hsl(var(--acafrao)/0.22), transparent 55%)',
            'radial-gradient(ellipse 500px 350px at -5% 110%, hsl(var(--verde-floresta)/0.18), transparent 55%)',
          ].join(', '),
        }} aria-hidden="true" />
        <div className="absolute inset-x-0 top-0 h-1" style={{
          background: 'linear-gradient(90deg, hsl(var(--verde-floresta)), hsl(var(--acafrao)), hsl(var(--copper)), hsl(var(--azul-atlantico)))',
        }} aria-hidden="true" />
        <div className="container-page relative py-14 md:py-20">
          <div className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider"
            style={{ borderColor: 'hsl(var(--acafrao)/0.40)', color: 'hsl(var(--acafrao))', background: 'hsl(var(--acafrao)/0.10)' }}
          >
            <GraduationCap className="size-3.5" aria-hidden="true" />
            Cursos Gratuitos
          </div>
          <h1 className="mt-4 max-w-3xl font-display text-3xl font-black tracking-tight md:text-5xl" style={{ color: 'hsl(var(--marfim))' }}>
            Educação gratuita para{' '}
            <span style={{
              background: 'linear-gradient(135deg, hsl(var(--acafrao)), hsl(var(--verde-floresta)))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              a comunidade
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed md:text-lg" style={{ color: 'hsl(var(--marfim)/0.72)' }}>
            Cursos 100% gratuitos do governo federal, ENAP, IPHAN, MEC e parceiros — voltados para
            lideranças de terreiro, pesquisadores, educadores e toda a comunidade de matriz africana.
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold"
            style={{ borderColor: 'hsl(var(--verde-floresta)/0.35)', color: 'hsl(var(--verde-floresta))', background: 'hsl(var(--verde-floresta)/0.08)' }}
          >
            <Gift className="size-3.5" aria-hidden="true" />
            Todos os cursos listados aqui são gratuitos
          </div>
        </div>
      </section>

      <div className="container-page py-12">
        {/* Destaques */}
        {destaques.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Star className="size-5 text-copper" aria-hidden="true" />
              <h2 className="font-display text-xl font-bold text-foreground">Recomendados para a comunidade</h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {destaques.map((c) => <CursoCard key={c.titulo} curso={c} destaque />)}
            </div>
          </section>
        )}

        {/* Todos */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="size-5 text-copper" aria-hidden="true" />
            <h2 className="font-display text-xl font-bold text-foreground">Todos os cursos</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {demais.map((c) => <CursoCard key={c.titulo} curso={c} />)}
          </div>
        </section>

        {/* Plataformas */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Globe className="size-5 text-copper" aria-hidden="true" />
            <h2 className="font-display text-xl font-bold text-foreground">Plataformas de cursos gratuitos</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PLATAFORMAS.map((p) => (
              <a key={p.nome} href={p.href} target="_blank" rel="noopener noreferrer"
                className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 transition hover:border-[hsl(var(--copper)/0.40)]"
              >
                <span className="font-semibold text-sm text-card-foreground leading-snug">{p.nome}</span>
                <span className="text-xs text-muted-foreground leading-relaxed">{p.descricao}</span>
                <span className="mt-auto flex items-center gap-1 text-xs font-semibold" style={{ color: p.cor }}>
                  Acessar <ExternalLink className="size-3" aria-hidden="true" />
                </span>
              </a>
            ))}
          </div>
        </section>

        <p className="text-xs text-muted-foreground border-t border-border pt-6">
          Os cursos listados são oferecidos por instituições externas. O AxéMap não é responsável pela
          disponibilidade ou conteúdo dos cursos. Para sugerir um curso:{' '}
          <a href="mailto:contato@axemap.com.br" className="underline underline-offset-2 hover:text-copper-strong">
            contato@axemap.com.br
          </a>
        </p>
      </div>
    </>
  );
}

function CursoCard({ curso, destaque = false }: { curso: Curso; destaque?: boolean }) {
  return (
    <article className={[
      'flex flex-col rounded-3xl border border-border bg-card transition',
      'hover:border-[hsl(var(--copper)/0.35)] hover:shadow-md',
      destaque ? 'ring-1 ring-[hsl(var(--copper)/0.25)]' : '',
    ].join(' ')}>
      <div className="h-1 w-full rounded-t-3xl" style={{ background: curso.cor }} aria-hidden="true" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        {destaque && (
          <span className="inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
            style={{ background: 'hsl(var(--copper)/0.12)', color: 'hsl(var(--copper))' }}
          >
            <Star className="size-2.5" aria-hidden="true" /> Recomendado
          </span>
        )}
        <span className="inline-flex w-fit rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
          style={{ background: `${curso.cor}18`, color: curso.cor }}
        >
          {curso.categoria}
        </span>
        <h3 className="font-display text-sm font-bold leading-snug text-card-foreground">{curso.titulo}</h3>
        <p className="flex-1 text-xs leading-relaxed text-muted-foreground">{curso.descricao}</p>
        <div className="flex items-center gap-2 flex-wrap">
          {curso.duracao && (
            <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">{curso.duracao}</span>
          )}
          {curso.nivel && (
            <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">{curso.nivel}</span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
            style={{ background: 'hsl(var(--verde-floresta)/0.12)', color: 'hsl(var(--verde-floresta))' }}
          >
            <Gift className="size-2.5" aria-hidden="true" /> Gratuito
          </span>
        </div>
        <div className="border-t border-border pt-3">
          <p className="text-[10px] text-muted-foreground mb-2">{curso.plataforma}</p>
          <a href={curso.href} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black transition hover:brightness-110"
            style={{ background: curso.cor, color: 'hsl(var(--obsidiana-deep))' }}
          >
            Acessar curso <ExternalLink className="size-3" aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  );
}
