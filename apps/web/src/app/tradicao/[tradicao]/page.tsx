import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { DadosTradicao } from '@/lib/seo/types';
import { fetchLanding } from '@/lib/seo/fetch-landing';
import { LandingTemplate } from '@/components/landing/landing-template';
import { TerreiroCard } from '@/components/landing/terreiro-card';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ tradicao: string }> }): Promise<Metadata> {
  const { tradicao } = await params;
  const data = await fetchLanding<DadosTradicao>(`/tradicao/${encodeURIComponent(tradicao)}`);
  if (!data) return { title: 'Tradição não encontrada' };

  const label = data.tradicao.label;
  const title = `Terreiros de ${label} — AxéMap`;
  const description = `Encontre terreiros e comunidades de ${label} no Brasil e nas diásporas. São ${data.totalTerreiro} comunidades cadastradas em ${data.estados.length} estados.`;

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
  const label = data.tradicao.label;
  const descricao = data.tradicao.descricao;

  return (
    <LandingTemplate
      titulo={`Terreiros de ${label}`}
      subtitulo={
        descricao
          ? `${descricao} Explore comunidades de ${label} no Brasil e nas diásporas. ${data.totalTerreiro} comunidades cadastradas em ${data.estados.length} estados.`
          : `Explore comunidades da tradição ${label} no Brasil e nas diásporas. ${data.totalTerreiro} comunidades cadastradas em ${data.estados.length} estados.`
      }
      breadcrumb={[
        { label: 'Tradição', href: '/tradicao' },
        { label },
      ]}
      stats={{
        trustScoreMedio: data.trustScoreMedio,
        totalTerreiro: data.totalTerreiro,
        totalVerificados: data.totalVerificados,
        tradicoes: [{ nome, count: data.totalTerreiro }],
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
