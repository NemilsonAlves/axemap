import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import type { EventoLanding } from '@/lib/seo/types';
import { fetchLanding } from '@/lib/seo/fetch-landing';
import { LandingBreadcrumb } from '@/components/landing/landing-breadcrumb';
import { LandingHero } from '@/components/landing/landing-hero';
import { LandingFaq } from '@/components/landing/landing-faq';
import { JsonLd, websiteSchema } from '@/lib/seo/json-ld';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ local: string }> }): Promise<Metadata> {
  const { local } = await params;
  const uf = local.toUpperCase();
  const title = `Eventos em ${uf} — AxéMap`;
  const description = `Encontre eventos de religiões afro-brasileiras no estado de ${uf}.`;

  return {
    title,
    description,
    openGraph: { title, description, locale: 'pt_BR', siteName: 'AxéMap' },
    alternates: { canonical: `https://axemap.com.br/eventos/${local}` },
    robots: { index: true, follow: true },
  };
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default async function EventosLocalPage({ params }: { params: Promise<{ local: string }> }) {
  const { local } = await params;
  const uf = local.toUpperCase();
  const data = await fetchLanding<{ eventos: EventoLanding[] }>(`/eventos?local=${encodeURIComponent(local)}`);
  const eventos = data?.eventos;
  if (!eventos) notFound();

  return (
    <>
      <JsonLd data={websiteSchema()} />
      <LandingBreadcrumb items={[
        { label: 'Eventos', href: '/eventos' },
        { label: uf },
      ]} />
      <LandingHero
        titulo={`Eventos em ${uf}`}
        subtitulo={`Encontre eventos de religiões afro-brasileiras no estado de ${uf}.`}
        totalTerreiro={eventos.length}
        totalVerificados={0}
      />
      <section className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {eventos.length === 0 && (
            <p className="text-muted-foreground col-span-full text-center py-12">
              Nenhum evento encontrado em {uf}.
            </p>
          )}
          {eventos.map((evento) => (
            <Link
              key={evento.id}
              href={`/terreiro/${evento.terreiro.slug}`}
              className="group block bg-card border rounded-lg p-4 hover:shadow-lg transition-shadow"
            >
              <div className="text-xs text-primary font-medium mb-1 uppercase tracking-wide">
                {evento.tipo}
              </div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                {evento.titulo}
              </h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {evento.descricao}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{formatDate(evento.dataInicio)}</span>
                {evento.dataFim && (
                  <>
                    <span>—</span>
                    <span>{formatDate(evento.dataFim)}</span>
                  </>
                )}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {evento.terreiro.nome} — {evento.terreiro.cidade}, {evento.terreiro.estado}
              </div>
            </Link>
          ))}
        </div>
      </section>
      <LandingFaq
        faqs={[
          {
            pergunta: `Quais eventos estão acontecendo em ${uf}?`,
            resposta: `Atualmente há ${eventos.length} eventos cadastrados no estado de ${uf}.`,
          },
          {
            pergunta: 'Como divulgar meu evento no AxéMap?',
            resposta: 'Cadastre sua casa de axé na plataforma e adicione eventos à página da sua casa.',
          },
        ]}
      />
    </>
  );
}
