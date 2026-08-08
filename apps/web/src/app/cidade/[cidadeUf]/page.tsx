import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { DadosCidade } from '@/lib/seo/types';
import { fetchLanding } from '@/lib/seo/fetch-landing';
import { LandingTemplate } from '@/components/landing/landing-template';
import { TerreiroCard } from '@/components/landing/terreiro-card';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ cidadeUf: string }> }): Promise<Metadata> {
  const { cidadeUf } = await params;
  const data = await fetchLanding<DadosCidade>(`/cidade/${encodeURIComponent(cidadeUf)}`);
  if (!data) return { title: 'Cidade não encontrada' };

  const title = `Terreiros em ${data.cidade.nome}, ${data.cidade.uf} — AxéMap`;
  const description = `Encontre terreiros de religiões afro-brasileiras em ${data.cidade.nome}, ${data.cidade.uf}. São ${data.totalTerreiro} terreiros cadastrados.`;

  return {
    title,
    description,
    openGraph: { title, description, locale: 'pt_BR', siteName: 'AxéMap' },
    alternates: { canonical: `https://axemap.com.br/cidade/${cidadeUf}` },
    robots: { index: !data.seo?.noindex, follow: true },
  };
}

export default async function CidadePage({ params }: { params: Promise<{ cidadeUf: string }> }) {
  const { cidadeUf } = await params;
  const data = await fetchLanding<DadosCidade>(`/cidade/${encodeURIComponent(cidadeUf)}`);
  if (!data) notFound();

  return (
    <LandingTemplate
      titulo={`Terreiros em ${data.cidade.nome}, ${data.cidade.uf}`}
      subtitulo={`Explore terreiros de religiões afro-brasileiras em ${data.cidade.nome}, ${data.cidade.uf}. ${data.totalTerreiro} terreiros cadastrados.`}
      breadcrumb={[
        { label: `Cidade`, href: `/cidade` },
        { label: `${data.cidade.nome}, ${data.cidade.uf}` },
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
