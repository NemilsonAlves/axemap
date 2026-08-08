import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import type { CursoLanding } from '@/lib/seo/types';
import { fetchLanding } from '@/lib/seo/fetch-landing';
import { LandingBreadcrumb } from '@/components/landing/landing-breadcrumb';
import { LandingHero } from '@/components/landing/landing-hero';
import { LandingFaq } from '@/components/landing/landing-faq';
import { JsonLd, websiteSchema } from '@/lib/seo/json-ld';

export const revalidate = 3600;

function formatTradicao(slug: string): string {
  return slug.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export async function generateMetadata({ params }: { params: Promise<{ tradicao: string }> }): Promise<Metadata> {
  const { tradicao } = await params;
  const tradNome = formatTradicao(tradicao);
  const title = `Cursos de ${tradNome} — AxéMap`;
  const description = `Encontre cursos, oficinas e formações sobre ${tradNome} em todo o Brasil.`;

  return {
    title,
    description,
    openGraph: { title, description, locale: 'pt_BR', siteName: 'AxéMap' },
    alternates: { canonical: `https://axemap.com.br/cursos/${tradicao}` },
    robots: { index: true, follow: true },
  };
}

export default async function CursosTradicaoPage({ params }: { params: Promise<{ tradicao: string }> }) {
  const { tradicao } = await params;
  const tradNome = formatTradicao(tradicao);
  const data = await fetchLanding<{ cursos: CursoLanding[] }>(`/cursos?tradicao=${encodeURIComponent(tradicao)}`);
  const cursos = data?.cursos;
  if (!cursos) notFound();

  return (
    <>
      <JsonLd data={websiteSchema()} />
      <LandingBreadcrumb items={[
        { label: 'Cursos', href: '/cursos' },
        { label: tradNome },
      ]} />
      <LandingHero
        titulo={`Cursos de ${tradNome}`}
        subtitulo={`Encontre cursos, oficinas e formações sobre ${tradNome} em todo o Brasil.`}
        totalTerreiro={cursos.length}
        totalVerificados={0}
      />
      <section className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cursos.length === 0 && (
            <p className="text-muted-foreground col-span-full text-center py-12">
              Nenhum curso de {tradNome} encontrado no momento.
            </p>
          )}
          {cursos.map((curso) => (
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
            pergunta: `Quais cursos de ${tradNome} estão disponíveis?`,
            resposta: `Atualmente há ${cursos.length} cursos de ${tradNome} cadastrados no AxéMap.`,
          },
          {
            pergunta: 'Como divulgar meu curso no AxéMap?',
            resposta: 'Cadastre seu terreiro na plataforma e adicione cursos à página do seu terreiro.',
          },
        ]}
      />
    </>
  );
}
