import type { Metadata } from 'next';
import type { TerreiroBasico } from '@/lib/seo/types';
import { fetchLanding } from '@/lib/seo/fetch-landing';
import { LandingTemplate } from '@/components/landing/landing-template';
import { TerreiroCard } from '@/components/landing/terreiro-card';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Novas Casas de Axé — AxéMap',
  description: 'Conheça as casas de axé recém-cadastradas de tradições africanas e afro-diaspóricas no AxéMap.',
  openGraph: {
    title: 'Novas Casas de Axé — AxéMap',
    description: 'Conheça as casas de axé recém-cadastradas no AxéMap.',
    locale: 'pt_BR',
    siteName: 'AxéMap',
  },
  alternates: { canonical: 'https://axemap.com.br/novos-terreiros' },
  robots: { index: true, follow: true },
};

export default async function NovosTerreirosPage() {
  const data = await fetchLanding<{ terreiros: TerreiroBasico[]; total: number }>('/recentes');
  const terreiros = data?.terreiros ?? [];

  return (
    <LandingTemplate
      titulo="Novas Casas de Axé"
      subtitulo="Conheça as casas de axé / asé recém-cadastradas de tradições africanas e afro-diaspóricas no AxéMap."
      breadcrumb={[{ label: 'Novas Casas de Axé' }]}
      stats={{
        trustScoreMedio: 0,
        totalTerreiro: terreiros.length,
        totalVerificados: 0,
      }}
      faqs={[
        {
          pergunta: 'Com que frequência novas casas são adicionadas?',
          resposta: 'Novas casas de axé são adicionadas diariamente por usuários da plataforma. Esta página mostra os cadastros mais recentes.',
        },
        {
          pergunta: 'Como cadastrar minha Casa de Axé?',
          resposta: 'Crie uma conta gratuita no AxéMap e siga o processo de cadastro. Sua casa de axé aparecerá nesta listagem após a publicação.',
        },
      ]}
    >
      {terreiros.length > 0 ? terreiros.map(t => (
        <TerreiroCard key={t.id} terreiro={t} />
      )) : (
        <p className="text-muted-foreground col-span-full text-center py-12">
          Nenhuma casa de axé encontrada.
        </p>
      )}
    </LandingTemplate>
  );
}
