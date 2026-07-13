import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { TerreiroPerfil } from '@/types/terreiro';
import { HeroSection } from '@/components/terreiro/hero-section';
import { SobreSection } from '@/components/terreiro/sobre-section';
import { LocalizacaoSection } from '@/components/terreiro/localizacao-section';
import { FuncionamentoSection } from '@/components/terreiro/funcionamento-section';
import { GaleriaSection } from '@/components/terreiro/galeria-section';
import { EventosSection } from '@/components/terreiro/eventos-section';
import { CursosSection } from '@/components/terreiro/cursos-section';
import { AcoesSociaisSection } from '@/components/terreiro/acoes-sociais-section';
import { AvaliacoesSection } from '@/components/terreiro/avaliacoes-section';
import { TrustScoreSection } from '@/components/terreiro/trust-score-section';
import { ProfileCompleteness } from '@/components/terreiro/profile-completeness';
import './profile.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function getPerfil(slug: string): Promise<TerreiroPerfil | null> {
  try {
    const res = await fetch(`${API_URL}/api/v1/terreiros/${slug}/perfil`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const terreiro = await getPerfil(slug);
  if (!terreiro) return { title: 'Terreiro não encontrado' };

  const title = `${terreiro.nome} — AxéMap`;
  const description = terreiro.descricaoCurta || `${terreiro.tradicao} em ${terreiro.cidade}, ${terreiro.estado}`;
  const imageUrl = terreiro.fotoUrl || 'https://axemap.com.br/og-default.jpg';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      locale: 'pt_BR',
      siteName: 'AxéMap',
      images: [{ url: imageUrl, width: 1200, height: 630, alt: terreiro.nome }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    alternates: { canonical: `https://axemap.com.br/terreiro/${slug}` },
    robots: { index: true, follow: true },
  };
}

export default async function TerreiroPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const terreiro = await getPerfil(slug);

  if (!terreiro) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: terreiro.nome,
    description: terreiro.descricaoCurta,
    image: terreiro.fotoUrl,
    address: {
      '@type': 'PostalAddress',
      addressLocality: terreiro.cidade,
      addressRegion: terreiro.estado,
      addressCountry: 'BR',
    },
    geo: terreiro.latitude && terreiro.longitude ? {
      '@type': 'GeoCoordinates',
      latitude: terreiro.latitude,
      longitude: terreiro.longitude,
    } : undefined,
    telephone: terreiro.telefone,
    url: `https://axemap.com.br/terreiro/${slug}`,
    ...(terreiro.anoFundacao && { foundingDate: terreiro.anoFundacao.toString() }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="profile-page">
        <HeroSection terreiro={terreiro} />
        <div className="profile-grid">
          <div className="profile-main">
            <SobreSection terreiro={terreiro} />
            <LocalizacaoSection terreiro={terreiro} />
            <FuncionamentoSection terreiro={terreiro} />
            <GaleriaSection terreiro={terreiro} />
            <EventosSection eventos={terreiro.eventos} />
            <CursosSection cursos={terreiro.cursos} />
            <AcoesSociaisSection acoes={terreiro.acoesSociais} />
            <AvaliacoesSection
              avaliacoes={terreiro.avaliacoes}
              terreiroId={terreiro.id}
              stats={terreiro.stats}
            />
          </div>
          <aside className="profile-sidebar">
            <TrustScoreSection trustScoreInfo={terreiro.trustScoreInfo} />
            <ProfileCompleteness completeness={terreiro.completeness} />
          </aside>
        </div>
      </div>
    </>
  );
}
