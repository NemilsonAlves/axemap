import type { Metadata } from 'next';
import type { TerreiroBasico } from '@/lib/seo/types';
import { fetchLanding } from '@/lib/seo/fetch-landing';
import { LandingTemplate } from '@/components/landing/landing-template';
import { TerreiroCard } from '@/components/landing/terreiro-card';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Novos Terreiros — AxéMap',
  description: 'Conheça os terreiros recém-cadastrados de religiões afro-brasileiras no AxéMap.',
  openGraph: {
    title: 'Novos Terreiros — AxéMap',
    description: 'Conheça os terreiros recém-cadastrados no AxéMap.',
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
      titulo="Novos Terreiros"
      subtitulo="Conheça os terreiros recém-cadastrados de religiões afro-brasileiras no AxéMap."
      breadcrumb={[{ label: 'Novos Terreiros' }]}
      stats={{
        trustScoreMedio: 0,
        totalTerreiro: terreiros.length,
        totalVerificados: 0,
      }}
      faqs={[
        {
          pergunta: 'Com que frequência novos terreiros são adicionados?',
          resposta: 'Novos terreiros são adicionados diariamente por usuários da plataforma. Esta página mostra os cadastros mais recentes.',
        },
        {
          pergunta: 'Como cadastrar meu terreiro?',
          resposta: 'Crie uma conta gratuita no AxéMap e siga o processo de cadastro. Seu terreiro aparecerá nesta listagem após a publicação.',
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
