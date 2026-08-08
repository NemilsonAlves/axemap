import type { Metadata } from 'next';
import type { TerreiroBasico } from '@/lib/seo/types';
import { fetchLanding } from '@/lib/seo/fetch-landing';
import { LandingTemplate } from '@/components/landing/landing-template';
import { TerreiroCard } from '@/components/landing/terreiro-card';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Melhores Terreiros — AxéMap',
  description: 'Conheça os terreiros mais bem avaliados de religiões afro-brasileiras no Brasil, classificados por Trust Score.',
  openGraph: {
    title: 'Melhores Terreiros — AxéMap',
    description: 'Conheça os terreiros mais bem avaliados do Brasil.',
    locale: 'pt_BR',
    siteName: 'AxéMap',
  },
  alternates: { canonical: 'https://axemap.com.br/terreiros/top' },
  robots: { index: true, follow: true },
};

export default async function TopTerreirosPage() {
  const data = await fetchLanding<{ terreiros: TerreiroBasico[]; total: number }>('/top');
  const terreiros = data?.terreiros ?? [];

  return (
    <LandingTemplate
      titulo="Melhores Terreiros"
      subtitulo="Conheça os terreiros mais bem avaliados de religiões afro-brasileiras no Brasil, classificados por Trust Score."
      breadcrumb={[
        { label: 'Terreiros', href: '/terreiros' },
        { label: 'Top' },
      ]}
      stats={{
        trustScoreMedio: 0,
        totalTerreiro: terreiros.length,
        totalVerificados: 0,
      }}
      faqs={[
        {
          pergunta: 'Como o Trust Score é calculado?',
          resposta: 'O Trust Score é calculado com base em avaliações de usuários, verificação do terreiro, completude do perfil e outros fatores de credibilidade.',
        },
        {
          pergunta: 'Como avaliar um terreiro?',
          resposta: 'Você precisa criar uma conta no AxéMap e então poderá avaliar terreiros que conhece, contribuindo para o Trust Score deles.',
        },
      ]}
    >
      {terreiros.length > 0 ? terreiros.map(t => (
        <TerreiroCard key={t.id} terreiro={t} />
      )) : (
        <p className="text-muted-foreground col-span-full text-center py-12">
          Nenhum terreiro encontrado.
        </p>
      )}
    </LandingTemplate>
  );
}
