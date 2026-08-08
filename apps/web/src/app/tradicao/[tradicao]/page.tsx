import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { DadosTradicao } from '@/lib/seo/types';
import { fetchLanding } from '@/lib/seo/fetch-landing';
import { LandingTemplate } from '@/components/landing/landing-template';
import { TerreiroCard } from '@/components/landing/terreiro-card';

export const revalidate = 3600;

function formatTradicao(slug: string): string {
  return slug.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export async function generateMetadata({ params }: { params: Promise<{ tradicao: string }> }): Promise<Metadata> {
  const { tradicao } = await params;
  const data = await fetchLanding<DadosTradicao>(`/tradicao/${encodeURIComponent(tradicao)}`);
  if (!data) return { title: 'Tradição não encontrada' };

  const title = `Terreiros de ${data.tradicao.nome} — AxéMap`;
  const description = `Encontre terreiros de ${data.tradicao.nome} em todo o Brasil. São ${data.totalTerreiro} terreiros cadastrados em ${data.estados.length} estados.`;

  return {
    title,
    description,
    openGraph: { title, description, locale: 'pt_BR', siteName: 'AxéMap' },
    alternates: { canonical: `https://axemap.com.br/tradicao/${tradicao}` },
    robots: { index: !data.seo?.noindex, follow: true },
  };
}

export default async function TradicaoPage({ params }: { params: Promise<{ tradicao: string }> }) {
  const { tradicao } = await params;
  const data = await fetchLanding<DadosTradicao>(`/tradicao/${encodeURIComponent(tradicao)}`);
  if (!data) notFound();

  const nome = data.tradicao.nome;

  return (
    <LandingTemplate
      titulo={`Terreiros de ${nome}`}
      subtitulo={`Explore terreiros da tradição ${nome} em todo o Brasil. ${data.totalTerreiro} terreiros cadastrados em ${data.estados.length} estados.`}
      breadcrumb={[
        { label: 'Tradição', href: '/tradicao' },
        { label: nome },
      ]}
      stats={{
        trustScoreMedio: data.trustScoreMedio,
        totalTerreiro: data.totalTerreiro,
        totalVerificados: data.totalVerificados,
        tradicoes: [{ nome: data.tradicao.nome, count: data.totalTerreiro }],
      }}
      panorama={data.panorama}
      perfilComunidade={data.perfilComunidade}
      estatisticas={data.estatisticas}
      discovery={data.discovery}
      faqs={data.faqs}
    >
      {data.terreiros.map(t => (
        <TerreiroCard key={t.id} terreiro={t} />
      ))}
    </LandingTemplate>
  );
}
