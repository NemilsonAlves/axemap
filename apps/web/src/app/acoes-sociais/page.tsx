import type { Metadata } from 'next';
import Link from 'next/link';
import type { AcaoSocialLanding } from '@/lib/seo/types';
import { fetchLanding } from '@/lib/seo/fetch-landing';
import { LandingBreadcrumb } from '@/components/landing/landing-breadcrumb';
import { LandingHero } from '@/components/landing/landing-hero';
import { LandingFaq } from '@/components/landing/landing-faq';
import { JsonLd, websiteSchema } from '@/lib/seo/json-ld';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Ações Sociais das Tradições Africanas e Afro-Diaspóricas — AxéMap',
  description: 'Conheça ações sociais realizadas por comunidades das tradições africanas e afro-diaspóricas.',
  openGraph: {
    title: 'Ações Sociais — AxéMap',
    description: 'Conheça ações sociais realizadas por comunidades das tradições de matriz africana.',
    locale: 'pt_BR',
    siteName: 'AxéMap',
  },
  alternates: { canonical: 'https://axemap.com.br/acoes-sociais' },
  robots: { index: true, follow: true },
};

export default async function AcoesSociaisPage() {
  const data = await fetchLanding<{ acoes: AcaoSocialLanding[] }>('/acoes-sociais');
  const acoes = data?.acoes;

  return (
    <>
      <JsonLd data={websiteSchema()} />
      <LandingBreadcrumb items={[{ label: 'Ações Sociais' }]} />
      <LandingHero
        titulo="Ações Sociais"
        subtitulo="Conheça ações sociais realizadas por comunidades das tradições africanas e afro-diaspóricas."
        totalTerreiro={acoes?.length || 0}
        totalVerificados={0}
      />
      <section className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(!acoes || acoes.length === 0) && (
            <p className="text-muted-foreground col-span-full text-center py-12">
              Nenhuma ação social encontrada no momento.
            </p>
          )}
          {acoes?.map((acao) => (
            <Link
              key={acao.id}
              href={`/terreiro/${acao.terreiro.slug}`}
              className="group block bg-card border rounded-lg p-4 hover:shadow-lg transition-shadow"
            >
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                {acao.nome}
              </h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {acao.descricao}
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {acao.tipo && (
                  <span className="bg-secondary px-2 py-0.5 rounded">{acao.tipo}</span>
                )}
                {acao.data && (
                  <span>{new Date(acao.data).toLocaleDateString('pt-BR')}</span>
                )}
                {acao.alcance !== null && acao.alcance !== undefined && (
                  <span>Alcance: {acao.alcance} pessoas</span>
                )}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {acao.terreiro.nome} — {acao.terreiro.cidade}, {acao.terreiro.estado}
              </div>
            </Link>
          ))}
        </div>
      </section>
      <LandingFaq
        faqs={[
          {
            pergunta: 'O que são ações sociais de casas de axé?',
            resposta: 'Terreiros frequentemente realizam ações sociais como distribuição de alimentos, assistência comunitária, atividades culturais e educacionais para suas comunidades.',
          },
          {
            pergunta: 'Como divulgar uma ação social no AxéMap?',
            resposta: 'Cadastre sua casa de axé na plataforma e adicione ações sociais à página da sua casa.',
          },
        ]}
      />
    </>
  );
}
