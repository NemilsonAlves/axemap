import type { Metadata } from 'next';
import Link from 'next/link';
import type { CursoLanding } from '@/lib/seo/types';
import { fetchLanding } from '@/lib/seo/fetch-landing';
import { LandingBreadcrumb } from '@/components/landing/landing-breadcrumb';
import { LandingHero } from '@/components/landing/landing-hero';
import { LandingFaq } from '@/components/landing/landing-faq';
import { JsonLd, websiteSchema } from '@/lib/seo/json-ld';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Cursos das Tradições Africanas e Afro-Diaspóricas — AxéMap',
  description: 'Encontre cursos, oficinas e formações sobre as tradições africanas e afro-diaspóricas na África e nas diásporas.',
  openGraph: {
    title: 'Cursos — AxéMap',
    description: 'Encontre cursos das tradições africanas e afro-diaspóricas.',
    locale: 'pt_BR',
    siteName: 'AxéMap',
  },
  alternates: { canonical: 'https://axemap.com.br/cursos' },
  robots: { index: true, follow: true },
};

export default async function CursosPage() {
  const data = await fetchLanding<{ cursos: CursoLanding[] }>('/cursos');
  const cursos = data?.cursos;

  return (
    <>
      <JsonLd data={websiteSchema()} />
      <LandingBreadcrumb items={[{ label: 'Cursos' }]} />
      <LandingHero
        titulo="Cursos"
        subtitulo="Encontre cursos, oficinas e formações sobre as tradições africanas e afro-diaspóricas na África e nas diásporas."
        totalTerreiro={cursos?.length || 0}
        totalVerificados={0}
      />
      <section className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(!cursos || cursos.length === 0) && (
            <p className="text-muted-foreground col-span-full text-center py-12">
              Nenhum curso encontrado no momento.
            </p>
          )}
          {cursos?.map((curso) => (
            <Link
              key={curso.id}
              href={`/terreiro/${curso.terreiro.slug}`}
              className="group block bg-card border rounded-lg p-4 hover:shadow-lg transition-shadow"
            >
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                {curso.titulo}
              </h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {curso.descricao}
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {curso.modalidade && (
                  <span className="bg-secondary px-2 py-0.5 rounded">{curso.modalidade}</span>
                )}
                {curso.cargaHoraria && (
                  <span>{curso.cargaHoraria}h</span>
                )}
                {curso.dataInicio && (
                  <span>{new Date(curso.dataInicio).toLocaleDateString('pt-BR')}</span>
                )}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {curso.terreiro.nome} — {curso.terreiro.cidade}, {curso.terreiro.estado}
              </div>
            </Link>
          ))}
        </div>
      </section>
      <LandingFaq
        faqs={[
          {
            pergunta: 'Como encontrar cursos na minha região?',
            resposta: 'Você pode filtrar cursos por tradição acessando a página de cursos e selecionando uma tradição específica.',
          },
          {
            pergunta: 'Como divulgar meu curso no AxéMap?',
            resposta: 'Cadastre sua casa de axé na plataforma e adicione cursos à página da sua casa. Eles aparecerão automaticamente nesta listagem.',
          },
        ]}
      />
    </>
  );
}
