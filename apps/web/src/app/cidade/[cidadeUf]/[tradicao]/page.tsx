import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { DadosCidade } from '@/lib/seo/types';
import { fetchLanding } from '@/lib/seo/fetch-landing';
import { LandingTemplate } from '@/components/landing/landing-template';
import { TerreiroCard } from '@/components/landing/terreiro-card';

export const revalidate = 3600;

function formatTradicao(slug: string): string {
  return slug.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export async function generateMetadata({ params }: { params: Promise<{ cidadeUf: string; tradicao: string }> }): Promise<Metadata> {
  const { cidadeUf, tradicao } = await params;
  const data = await fetchLanding<DadosCidade>(`/cidade/${encodeURIComponent(cidadeUf)}/${encodeURIComponent(tradicao)}`);
  if (!data) return { title: 'Página não encontrada' };

  const tradNome = formatTradicao(tradicao);
  const title = `Terreiros de ${tradNome} em ${data.cidade.nome}, ${data.cidade.uf} — AxéMap`;
  const description = `Encontre terreiros de ${tradNome} em ${data.cidade.nome}, ${data.cidade.uf}. São ${data.totalTerreiro} terreiros cadastrados.`;

  return {
    title,
    description,
    openGraph: { title, description, locale: 'pt_BR', siteName: 'AxéMap' },
    alternates: { canonical: `https://axemap.com.br/cidade/${cidadeUf}/${tradicao}` },
    robots: { index: !data.seo?.noindex, follow: true },
  };
}

export default async function CidadeTradicaoPage({ params }: { params: Promise<{ cidadeUf: string; tradicao: string }> }) {
  const { cidadeUf, tradicao } = await params;
  const data = await fetchLanding<DadosCidade>(`/cidade/${encodeURIComponent(cidadeUf)}/${encodeURIComponent(tradicao)}`);
  if (!data) notFound();

  const tradNome = formatTradicao(tradicao);

  return (
    <LandingTemplate
      titulo={`Terreiros de ${tradNome} em ${data.cidade.nome}, ${data.cidade.uf}`}
      subtitulo={`Explore terreiros de ${tradNome} em ${data.cidade.nome}, ${data.cidade.uf}. ${data.totalTerreiro} terreiros cadastrados.`}
      breadcrumb={[
        { label: 'Cidade', href: `/cidade/${cidadeUf}` },
        { label: `${data.cidade.nome}, ${data.cidade.uf}`, href: `/cidade/${cidadeUf}` },
        { label: tradNome },
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
