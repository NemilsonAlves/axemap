import type { Metadata } from 'next';
import type { TerreiroBasico } from '@/lib/seo/types';
import { fetchLanding } from '@/lib/seo/fetch-landing';
import { LandingTemplate } from '@/components/landing/landing-template';
import { TerreiroCard } from '@/components/landing/terreiro-card';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Casas de Axé Verificadas — AxéMap',
  description: 'Encontre casas de axé verificadas das tradições africanas e afro-diaspóricas. Casas verificadas passaram por nosso processo de validação.',
  openGraph: {
    title: 'Casas de Axé Verificadas — AxéMap',
    description: 'Encontre casas de axé verificadas das tradições africanas e afro-diaspóricas.',
    locale: 'pt_BR',
    siteName: 'AxéMap',
  },
  alternates: { canonical: 'https://axemap.com.br/terreiros-verificados' },
  robots: { index: true, follow: true },
};

export default async function TerreirosVerificadosPage() {
  const data = await fetchLanding<{ terreiros: TerreiroBasico[]; total: number }>('/verificados');
  const terreiros = data?.terreiros ?? [];

  return (
    <LandingTemplate
      titulo="Casas de Axé Verificadas"
      subtitulo="Encontre casas de axé / asé verificadas de tradições africanas e afro-diaspóricas. Casas verificadas passaram por nosso processo de validação de autenticidade."
      breadcrumb={[{ label: 'Casas de Axé Verificadas' }]}
      stats={{
        trustScoreMedio: 0,
        totalTerreiro: terreiros.length,
        totalVerificados: terreiros.length,
      }}
      faqs={[
        {
          pergunta: 'O que significa uma casa de axé verificada?',
          resposta: 'Uma casa de axé verificada passou pelo processo de validação do AxéMap, confirmando sua autenticidade e informações básicas.',
        },
        {
          pergunta: 'Como verificar minha Casa de Axé?',
          resposta: 'Após cadastrar sua casa de axé, você pode solicitar a verificação através da plataforma. Nossa equipe analisará as informações e validará a casa.',
        },
      ]}
    >
      {terreiros.length > 0 ? terreiros.map(t => (
        <TerreiroCard key={t.id} terreiro={t} />
      )) : (
        <p className="text-muted-foreground col-span-full text-center py-12">
          Nenhuma casa de axé verificada encontrada.
        </p>
      )}
    </LandingTemplate>
  );
}
