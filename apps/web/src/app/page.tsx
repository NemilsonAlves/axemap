import type { Metadata } from 'next';
import { Suspense } from 'react';

import { JsonLd, websiteSchema, organizationSchema, datasetSchema } from '@/lib/seo/json-ld';
import { getHomeData } from '@/components/home/data';
import { HomeHero } from '@/components/home/home-hero';
import { HomeSearch } from '@/components/home/home-search';
import { HomeTraditions } from '@/components/home/home-traditions';
import { HomeIfa } from '@/components/home/home-ifa';
import { HomeTrust } from '@/components/home/home-trust';
import { HomeVerified } from '@/components/home/home-verified';
import { HomeEvents } from '@/components/home/home-events';
import { HomeEducation } from '@/components/home/home-education';
import { HomeCommunity } from '@/components/home/home-community';
import { HomeMarketplace } from '@/components/home/home-marketplace';
import { HomeAI } from '@/components/home/home-ai';
import { HomeStory } from '@/components/home/home-story';
import { HomeNumbers } from '@/components/home/home-numbers';
import { HomeCulture } from '@/components/home/home-culture';
import { HomePartners } from '@/components/home/home-partners';
import { HomeCTA } from '@/components/home/home-cta';
import { HomeMapLoader } from '@/components/home/home-map-loader';
import { HeroSkeleton, SectionsSkeleton } from '@/components/home/home-skeletons';

export const metadata: Metadata = {
  metadataBase: new URL('https://axemap.com.br'),
  title: 'AxéMap — Mapa · Memória · Ancestralidade · Conexão',
  description:
    'Infraestrutura digital global para descobrir, conectar e preservar tradições africanas e afro-diaspóricas, comunidades, culturas, conhecimentos e territórios. Ifá, Candomblé, Umbanda, Santería, Vodou, Yorùbá, Akan, Bantu — da África para o mundo.',
  keywords: [
    'tradições africanas', 'afro-diáspora', 'cultura africana', 'ifá', 'candomblé', 'umbanda',
    'santería', 'vodou', 'yorùbá', 'akan', 'bantu', 'kongo', 'igbo', 'fon', 'ewe',
    'religiões de matriz africana', 'axé', 'mapa cultural', 'comunidades africanas',
    'diáspora africana', 'patrimônio africano', 'terreiros', 'casas de santo',
    'cultura afro-brasileira', 'cultura afro-cubana', 'cultura afro-haitiana',
    'african traditions', 'african diaspora', 'afro heritage', 'axemap',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    title: 'AxéMap — Infraestrutura digital global para África e suas diásporas',
    description:
      'Mapa · Memória · Ancestralidade · Conexão. Da África para o mundo: tradições, comunidades, territórios, conhecimento e diásporas.',
    url: 'https://axemap.com.br',
    siteName: 'AxéMap',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AxéMap — Mapa · Memória · Ancestralidade · Conexão',
    description: 'Infraestrutura digital global para tradições africanas e suas diásporas.',
  },
  robots: { index: true, follow: true },
};

export default function Home() {
  return (
    <>
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSection />
      </Suspense>

      <Suspense fallback={<SectionsSkeleton />}>
        <ContentSections />
      </Suspense>
    </>
  );
}

async function HeroSection() {
  const data = await getHomeData();
  return <HomeHero data={data} />;
}

async function ContentSections() {
  const data = await getHomeData();
  return (
    <>
      <HomeSearch explore={data.explore} />
      <HomeTraditions explore={data.explore} />
      <HomeIfa />
      <HomeMapLoader />
      <HomeVerified data={data} />
      <HomeTrust data={data} />
      <HomeEvents data={data} />
      <HomeEducation data={data} />
      <HomeCommunity data={data} />
      <HomeMarketplace />
      <HomeAI />
      <HomeStory />
      <HomeNumbers data={data} />
      <HomeCulture />
      <HomePartners />
      <HomeCTA />

      <JsonLd data={websiteSchema()} />
      <JsonLd data={organizationSchema()} />
      <JsonLd
        data={datasetSchema('Estatísticas do AxéMap', 'Números públicos do ecossistema de religiões de matriz africana', [
          { name: 'Casas cadastradas', value: data.stats?.totalTerreiro ?? 0 },
          { name: 'Casas verificadas', value: data.stats?.totalVerificados ?? 0 },
          { name: 'Eventos', value: data.stats?.totalEventos ?? 0 },
          { name: 'Cursos', value: data.stats?.totalCursos ?? 0 },
        ])}
      />
    </>
  );
}
