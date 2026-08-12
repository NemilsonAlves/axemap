import type { Metadata } from 'next';
import Link from 'next/link';
import type { EventoLanding } from '@/lib/seo/types';
import { fetchLanding } from '@/lib/seo/fetch-landing';
import { LandingBreadcrumb } from '@/components/landing/landing-breadcrumb';
import { LandingHero } from '@/components/landing/landing-hero';
import { LandingFaq } from '@/components/landing/landing-faq';
import { JsonLd, websiteSchema } from '@/lib/seo/json-ld';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Eventos das Tradições Africanas e Afro-Diaspóricas — AxéMap',
  description: 'Encontre eventos, festas e celebrações das tradições africanas e afro-diaspóricas na África e nas diásporas.',
  openGraph: {
    title: 'Eventos — AxéMap',
    description: 'Encontre eventos das tradições africanas e afro-diaspóricas.',
    locale: 'pt_BR',
    siteName: 'AxéMap',
  },
  alternates: { canonical: 'https://axemap.com.br/eventos' },
  robots: { index: true, follow: true },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default async function EventosPage() {
  const data = await fetchLanding<{ eventos: EventoLanding[] }>('/eventos');
  const eventos = data?.eventos;

  return (
    <>
      <JsonLd data={websiteSchema()} />
      <LandingBreadcrumb items={[{ label: 'Eventos' }]} />
      <LandingHero
        titulo="Eventos"
        subtitulo="Encontre eventos, festas e celebrações das tradições africanas e afro-diaspóricas na África e nas diásporas."
        totalTerreiro={eventos?.length || 0}
        totalVerificados={0}
      />
      <section className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(!eventos || eventos.length === 0) && (
            <p className="text-muted-foreground col-span-full text-center py-12">
              Nenhum evento encontrado no momento.
            </p>
          )}
          {eventos?.map((evento) => (
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
            pergunta: 'Como encontrar eventos perto de mim?',
            resposta: 'Você pode filtrar eventos por estado acessando a página de eventos e selecionando um estado específico.',
          },
          {
            pergunta: 'Como divulgar meu evento no AxéMap?',
            resposta: 'Cadastre seu terreiro na plataforma e adicione eventos à página do seu terreiro. Eles aparecerão automaticamente nesta listagem.',
          },
        ]}
      />
    </>
  );
}
