import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import type { TerreiroPerfil } from '@/types/terreiro';
import { HeroSection } from '@/components/terreiro/hero-section';
import { EventosSection } from '@/components/terreiro/eventos-section';
import { CursosSection } from '@/components/terreiro/cursos-section';
import { AcoesSociaisSection } from '@/components/terreiro/acoes-sociais-section';
import { AvaliacoesSection } from '@/components/terreiro/avaliacoes-section';
import { GaleriaSection } from '@/components/terreiro/galeria-section';
import { ProfileCompleteness } from '@/components/terreiro/profile-completeness';
import { QRCodeSection } from '@/components/terreiro/qr-code-section';
import { ClaimButton } from '@/components/terreiro/claim-button';
import { RecommendationCard } from '@/components/home/discovery-cards';
import { ProvenienciaSection } from '@/components/terreiro/proveniencia-section';
import { HistoriaSection } from '@/components/hub/historia-section';
import { LiderancaSection } from '@/components/hub/lideranca-section';
import { TrustPanel } from '@/components/hub/trust-panel';
import { CampanhasSection } from '@/components/hub/campanhas-section';
import { MarketplaceSection } from '@/components/hub/marketplace-section';
import { BibliotecaSection } from '@/components/hub/biblioteca-section';
import { GovernancaSection } from '@/components/hub/governanca-section';
import { ContatoSection } from '@/components/hub/contato-section';
import { ComunidadeSection } from '@/components/hub/comunidade-section';
import { HubSubnav } from '@/components/hub/hub-subnav';
import { ComunidadeAI } from '@/components/hub/comunidade-ai';
import { MapaComoChegar } from '@/components/hub/mapa-como-chegar';
import './profile.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

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

async function getRecomendacoes(terreiroId: string) {
  try {
    const res = await fetch(`${API_URL}/api/v1/recommendation/terreiro/${terreiroId}`, {
      next: { revalidate: 600 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
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

  const recomendacoes = await getRecomendacoes(terreiro.id);

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
        <div style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <ClaimButton terreiroId={terreiro.id} hasDirigente={!!terreiro.dirigente} />
          <Link
            href={`/protecao?tipo=TERREIRO&entidadeId=${encodeURIComponent(slug)}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground underline-offset-2 hover:text-destructive hover:underline"
          >
            Denunciar esta página
          </Link>
        </div>

        <HubSubnav terreiro={terreiro} />

        <div className="profile-grid">
          <div className="profile-main">
            <HistoriaSection terreiro={terreiro} />
            <LiderancaSection terreiro={terreiro} />
            <TrustPanel terreiro={terreiro} />
            <EventosSection eventos={terreiro.eventos} />
            <CursosSection cursos={terreiro.cursos} />
            <AcoesSociaisSection acoes={terreiro.acoesSociais} />
            <CampanhasSection terreiro={terreiro} />
            <MarketplaceSection terreiro={terreiro} />
            <BibliotecaSection terreiro={terreiro} />
            <GaleriaSection terreiro={terreiro} />
            <MapaComoChegar terreiro={terreiro} />
            <AvaliacoesSection
              avaliacoes={terreiro.avaliacoes}
              terreiroId={terreiro.id}
              stats={terreiro.stats}
            />
            <ComunidadeSection terreiro={terreiro} />
            <GovernancaSection terreiro={terreiro} />
            <ProvenienciaSection terreiro={terreiro} />
            <ComunidadeAI terreiro={terreiro} />
            <ContatoSection terreiro={terreiro} />
          </div>
          <aside className="profile-sidebar">
            <ProfileCompleteness completeness={terreiro.completeness} />
            <QRCodeSection
              url={`https://axemap.com.br/t/${slug}`}
              slug={slug}
              nome={terreiro.nome}
            />
          </aside>
        </div>

        {recomendacoes.length > 0 && (
          <section className="px-4 py-8 max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">Você também pode gostar</h2>
                <p className="text-sm text-muted-foreground">Outros terreiros próximos ou da mesma tradição</p>
              </div>
              <Link href={`/tradicao/${terreiro.tradicao.toLowerCase().replace(/_/g, '-')}`} className="text-sm text-primary hover:underline shrink-0">
                Ver todos &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {recomendacoes.map((r: any) => (
                <RecommendationCard key={r.terreiroId} item={r} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
