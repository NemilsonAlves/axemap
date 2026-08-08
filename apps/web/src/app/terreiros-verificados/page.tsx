import type { Metadata } from 'next';
import type { TerreiroBasico } from '@/lib/seo/types';
import { fetchLanding } from '@/lib/seo/fetch-landing';
import { LandingTemplate } from '@/components/landing/landing-template';
import { TerreiroCard } from '@/components/landing/terreiro-card';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Terreiros Verificados — AxéMap',
  description: 'Encontre terreiros verificados de religiões afro-brasileiras em todo o Brasil. Terreiros verificados passaram por nosso processo de validação.',
  openGraph: {
    title: 'Terreiros Verificados — AxéMap',
    description: 'Encontre terreiros verificados de religiões afro-brasileiras em todo o Brasil.',
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
      titulo="Terreiros Verificados"
      subtitulo="Encontre terreiros verificados de religiões afro-brasileiras. Terreiros verificados passaram por nosso processo de validação de autenticidade."
      breadcrumb={[{ label: 'Terreiros Verificados' }]}
      stats={{
        trustScoreMedio: 0,
        totalTerreiro: terreiros.length,
        totalVerificados: terreiros.length,
      }}
      faqs={[
        {
          pergunta: 'O que significa um terreiro verificado?',
          resposta: 'Um terreiro verificado passou pelo processo de validação do AxéMap, confirmando sua autenticidade e informações básicas.',
        },
        {
          pergunta: 'Como verificar meu terreiro?',
          resposta: 'Após cadastrar seu terreiro, você pode solicitar a verificação através da plataforma. Nossa equipe analisará as informações e validará o terreiro.',
        },
      ]}
    >
      {terreiros.length > 0 ? terreiros.map(t => (
        <TerreiroCard key={t.id} terreiro={t} />
      )) : (
        <p className="text-muted-foreground col-span-full text-center py-12">
          Nenhum terreiro verificado encontrado.
        </p>
      )}
    </LandingTemplate>
  );
}
