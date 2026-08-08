import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { DadosEstado } from '@/lib/seo/types';
import { fetchLanding } from '@/lib/seo/fetch-landing';
import { LandingTemplate } from '@/components/landing/landing-template';
import { TerreiroCard } from '@/components/landing/terreiro-card';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ uf: string }> }): Promise<Metadata> {
  const { uf } = await params;
  const data = await fetchLanding<DadosEstado>(`/estado/${encodeURIComponent(uf)}`);
  if (!data) return { title: 'Estado não encontrado' };

  const ufUpper = uf.toUpperCase();
  const title = `Terreiros em ${ufUpper} — AxéMap`;
  const description = `Encontre terreiros de religiões afro-brasileiras em ${ufUpper}. São ${data.totalTerreiro} terreiros cadastrados, ${data.totalVerificados} verificados.`;

  return {
    title,
    description,
    openGraph: { title, description, locale: 'pt_BR', siteName: 'AxéMap' },
    alternates: { canonical: `https://axemap.com.br/estado/${uf}` },
    robots: { index: !data.seo?.noindex, follow: true },
  };
}

export default async function EstadoPage({ params }: { params: Promise<{ uf: string }> }) {
  const { uf } = await params;
  const data = await fetchLanding<DadosEstado>(`/estado/${encodeURIComponent(uf)}`);
  if (!data) notFound();

  const ufUpper = uf.toUpperCase();

  return (
    <LandingTemplate
      titulo={`Terreiros em ${ufUpper}`}
      subtitulo={`Explore terreiros de religiões afro-brasileiras no estado de ${ufUpper}. ${data.totalTerreiro} terreiros cadastrados.`}
      breadcrumb={[
        { label: `Estado ${ufUpper}`, href: `/estado/${uf}` },
        { label: ufUpper },
      ]}
      stats={{
        trustScoreMedio: data.trustScoreMedio,
        totalTerreiro: data.totalTerreiro,
        totalVerificados: data.totalVerificados,
        tradicoes: data.tradicoes,
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
